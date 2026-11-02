import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import GithubSlugger from "github-slugger";
import { parseContent, reviewSentences } from "./content-prose.mjs";
import YAML from "yaml";

const root = process.cwd();
const content = path.join(root, "src/content/docs");
const errors = [];
const warnings = [];
const pages = new Map();
const external = new Set();
const migration = JSON.parse(
  await readFile("src/content/customer-migration.json", "utf8"),
);
async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await files(name)));
    else result.push(name);
  }
  return result;
}
function text(node) {
  return node.value ?? (node.children ?? []).map(text).join("");
}
function walk(node, visit) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}
function routeKey(route) {
  return decodeURI(route).replace(/\/(?:index\.html)?$/, "") || "/";
}
function sourceRoute(file, data) {
  const relative = path
    .relative(content, file)
    .replaceAll(path.sep, "/")
    .replace(/\.mdx?$/, "")
    .replace(/\/index$/, "");
  return routeKey("/" + (data.slug ?? relative));
}
const assetManifestPath = path.join(
  root,
  "src/assets/docs/capture-manifest.json",
);
let captures = [];
try {
  captures = JSON.parse(await readFile(assetManifestPath, "utf8")).captures;
} catch (error) {
  if (error.code !== "ENOENT")
    errors.push(`Capture manifest: ${error.message}`);
}
const approvedAssets = new Set();
for (const capture of captures) {
  const file = path.resolve(path.dirname(assetManifestPath), capture.file);
  if (!file.startsWith(path.dirname(assetManifestPath) + path.sep)) {
    errors.push(`Unsafe capture path: ${capture.id}`);
    continue;
  }
  try {
    const bytes = await readFile(file);
    if (createHash("sha256").update(bytes).digest("hex") !== capture.sha256)
      errors.push(`Capture hash mismatch: ${capture.id}`);
    for (const field of [
      "domSanitizedBeforeCapture",
      "metadataStripped",
      "ocrReviewed",
      "fullResolutionReviewed",
    ]) {
      if (capture.privacy?.[field] !== true)
        errors.push(`Capture ${capture.id}: ${field} is not complete`);
    }
    const review = capture.privacy?.independentReview;
    if (
      review?.status !== "approved" ||
      !review.reviewer ||
      !review.reviewerRole ||
      !Array.isArray(review.evidence) ||
      review.evidence.length === 0
    ) {
      const message = `Capture ${capture.id}: independent privacy review with recorded evidence is pending`;
      (process.argv.includes("--publish") ? errors : warnings).push(message);
    }
    for (const locale of ["en", "id"])
      if (!capture.alt?.[locale] || !capture.caption?.[locale])
        errors.push(`Capture ${capture.id}: missing ${locale} description`);
    approvedAssets.add(file);
  } catch (error) {
    errors.push(`Capture ${capture.id}: ${error.message}`);
  }
}
for (const file of await files(content)) {
  if (!/\.mdx?$/.test(file)) continue;
  const source = await readFile(file, "utf8");
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  let data;
  try {
    data = frontmatter ? YAML.parse(frontmatter[1]) : {};
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
    continue;
  }
  const body = source.slice(frontmatter?.[0].length ?? 0);
  let tree;
  try {
    tree = parseContent(body, file.endsWith(".mdx"));
  } catch (error) {
    errors.push(`${file}: Markdown parse failure: ${error.message}`);
    continue;
  }
  const route = sourceRoute(file, data);
  if (pages.has(route)) errors.push(`Duplicate route ${route}`);
  const anchors = new Set();
  const links = [];
  const images = [];
  const definitions = new Map();
  const references = [];
  const slugger = new GithubSlugger();
  walk(tree, (node) => {
    if (node.type === "heading") anchors.add(slugger.slug(text(node)));
    if (node.type === "link") links.push(node.url);
    if (node.type === "image") images.push({ url: node.url, alt: node.alt });
    if (node.type === "definition")
      definitions.set(node.identifier.toLowerCase(), node.url);
    if (node.type === "linkReference" || node.type === "imageReference")
      references.push(node);
    if (
      node.type === "mdxJsxFlowElement" ||
      node.type === "mdxJsxTextElement"
    ) {
      for (const attr of node.attributes ?? []) {
        if (attr.name === "id" && typeof attr.value === "string")
          anchors.add(attr.value);
        if (attr.name === "href" && typeof attr.value === "string")
          links.push(attr.value);
        if (attr.name === "src" && typeof attr.value === "string")
          images.push({
            url: attr.value,
            alt: node.attributes.find((a) => a.name === "alt")?.value,
          });
      }
    }
    if (node.type === "html") {
      for (const match of node.value.matchAll(/\bid=["']([^"']+)["']/g))
        anchors.add(match[1]);
      for (const match of node.value.matchAll(/\bhref=["']([^"']+)["']/g))
        links.push(match[1]);
      for (const match of node.value.matchAll(
        /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g,
      ))
        images.push({
          url: match[1],
          alt: match[0].match(/\balt=["']([^"']*)["']/)?.[1],
        });
    }
    if (data.contentId && !file.includes("/id/"))
      for (const finding of reviewSentences(node)) {
        warnings.push(
          `${route}: review a ${finding.kind} sentence longer than ${finding.max} words (${finding.words}): ${finding.sentence}`,
        );
      }
  });
  for (const node of references) {
    const url = definitions.get(node.identifier.toLowerCase());
    if (!url) errors.push(`${route}: unresolved reference ${node.identifier}`);
    else if (node.type === "imageReference")
      images.push({ url, alt: node.alt });
    else links.push(url);
  }
  if (data.contentId) {
    for (const key of [
      "owner",
      "reviewedVersion",
      "reviewedDate",
      "translationStatus",
    ])
      if (!data[key]) errors.push(`${route}: missing ${key}`);
    const unsafe = [
      /\b(?:VirtFusion|Pterodactyl)\b/i,
      /123\.321\.123\.321/,
      /PermitRootLogin\s+yes/,
      /StrictHostKeyChecking[=\s]+no/,
      /-----BEGIN (?:OPENSSH |RSA |EC )?PRIVATE KEY-----/,
      /\beyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/,
    ];
    for (const pattern of unsafe)
      if (pattern.test(source))
        errors.push(
          `${route}: unsafe credential, instruction, or legacy first-party terminology (${pattern})`,
        );
    if (/coming soon|TODO:|TBD\b/i.test(body))
      errors.push(`${route}: unfinished customer guidance`);
  }
  pages.set(route, { file, data, anchors, links, images });
}
for (const [route, page] of pages) {
  if (page.data.contentId) {
    const isId = route.startsWith("/id/");
    const pair = pages.get(isId ? route.slice(3) : "/id" + route);
    if (!pair || pair.data.contentId !== page.data.contentId)
      errors.push(
        `${route}: missing equivalent locale with matching contentId`,
      );
    if (isId && page.data.translationStatus === "original")
      errors.push(`${route}: Indonesian page marked original English`);
  }
  for (const image of page.images) {
    if (!image.alt?.trim())
      errors.push(`${route}: image missing useful alt text (${image.url})`);
    if (/^https?:/.test(image.url)) continue;
    const file = image.url.startsWith("/")
      ? path.join(root, "public", image.url)
      : path.resolve(
          path.dirname(page.file),
          decodeURI(image.url.split("#")[0]),
        );
    try {
      await stat(file);
    } catch {
      errors.push(`${route}: missing image ${image.url}`);
    }
    if (page.data.contentId && !approvedAssets.has(file))
      errors.push(
        `${route}: customer image lacks a reviewed capture manifest entry (${image.url})`,
      );
  }
  for (const link of page.links) {
    if (/^https?:/.test(link)) {
      if (link.startsWith("https://8labs.id/"))
        page.links.push(new URL(link).pathname + new URL(link).hash);
      else external.add(link);
      continue;
    }
    if (/^(?:mailto:|tel:|javascript:)/.test(link)) {
      if (link.startsWith("javascript:")) errors.push(`${route}: unsafe link`);
      continue;
    }
    const url = new URL(link, `https://8labs.id${route}/`);
    const target = routeKey(url.pathname);
    const destination = pages.get(target);
    if (destination) {
      if (
        url.hash &&
        !destination.anchors.has(decodeURIComponent(url.hash.slice(1)))
      )
        errors.push(`${route}: broken anchor ${link}`);
      continue;
    }
    if (
      target.startsWith("/docs") ||
      target.startsWith("/id/docs") ||
      target.startsWith("/guides")
    )
      errors.push(`${route}: unknown content route ${link}`);
    // Other marketing pages, generated blog tags, and public assets are checked against dist after build.
  }
}
for (const [source, suffix] of Object.entries(migration.articles)) {
  for (const prefix of Object.values(migration.locales))
    if (!pages.has(routeKey(prefix + suffix)))
      errors.push(`Migration ${source}: missing ${prefix + suffix}`);
}
if (Object.keys(migration.articles).length !== 13)
  errors.push("Customer migration must cover all 13 source articles");
if (process.argv.includes("--external")) {
  // Explicit opt-in: two finite attempts, 8-second timeout, GET (many providers reject HEAD).
  for (const link of external) {
    let failure;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(link, {
          signal: AbortSignal.timeout(8000),
          redirect: "follow",
        });
        await response.body?.cancel();
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        failure = undefined;
        break;
      } catch (error) {
        failure = error.message;
        if (attempt === 0)
          await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    if (failure)
      errors.push(
        `External link unresolved after two attempts: ${link}: ${failure}`,
      );
  }
}
for (const warning of new Set(warnings)) console.warn(`REVIEW ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
console.log(
  `${pages.size} content routes; ${Object.keys(migration.articles).length} migration sources; ${captures.length} reviewed-asset records; ${errors.length} errors.`,
);
if (errors.length) process.exitCode = 1;
