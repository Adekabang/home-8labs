import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "parse5";

export function inspectHtml(html) {
  const doc = parse(html);
  const result = {
    ids: new Set(),
    links: [],
    images: [],
    language: "",
    canonical: "",
    alternates: [],
    noindex: false,
  };
  function visit(node) {
    const attrs = Object.fromEntries(
      (node.attrs ?? []).map(({ name, value }) => [name, value]),
    );
    if (attrs.id) result.ids.add(attrs.id);
    if (node.tagName === "html") result.language = attrs.lang;
    if (node.tagName === "a" && attrs.href) result.links.push(attrs.href);
    if (node.tagName === "img")
      result.images.push({ src: attrs.src, alt: attrs.alt });
    if (node.tagName === "link" && attrs.rel === "canonical")
      result.canonical = attrs.href;
    if (node.tagName === "link" && attrs.rel === "alternate")
      result.alternates.push(attrs);
    if (
      node.tagName === "meta" &&
      attrs.name === "robots" &&
      attrs.content?.includes("noindex")
    )
      result.noindex = true;
    for (const child of node.childNodes ?? []) visit(child);
  }
  visit(doc);
  return result;
}
export function validateLocale(route, page, counterpart) {
  const errors = [];
  const expected = `https://8labs.id${route}`;
  if (route.startsWith("/id/") && !counterpart) {
    if (
      page.language !== "en" ||
      !page.noindex ||
      page.canonical !== expected.replace("/id/", "/")
    )
      errors.push(
        `${route}: fallback must be English, noindex, and canonical to the original`,
      );
    if (page.alternates.some((a) => a.hreflang === "id"))
      errors.push(`${route}: fallback advertised as Indonesian translation`);
  } else {
    const lang = route.startsWith("/id/") ? "id" : "en";
    if (page.language !== lang) errors.push(`${route}: expected lang=${lang}`);
    if (page.canonical !== expected)
      errors.push(
        `${route}: expected canonical ${expected}, got ${page.canonical}`,
      );
    if (
      counterpart &&
      !page.alternates.some(
        (a) =>
          a.hreflang === (lang === "id" ? "en" : "id") &&
          a.href === `https://8labs.id${counterpart}`,
      )
    )
      errors.push(`${route}: missing actual equivalent-page hreflang`);
  }
  return errors;
}
async function list(dir, prefix = "") {
  const names = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = path.posix.join(prefix, entry.name);
    if (entry.isDirectory())
      names.push(...(await list(path.join(dir, entry.name), name)));
    else names.push(name);
  }
  return names;
}
async function main() {
  const all = await list("dist");
  const assets = new Set(all.map((name) => "/" + name));
  const pages = new Map();
  const errors = [];
  for (const name of all.filter((name) => name.endsWith(".html"))) {
    const route =
      "/" + name.replace(/index\.html$/, "").replace(/\.html$/, "/");
    pages.set(
      route,
      inspectHtml(await readFile(path.join("dist", name), "utf8")),
    );
  }
  const registry = JSON.parse(
    await readFile("src/content/customer-migration.json", "utf8"),
  );
  // Actual source content, not generated fallback HTML, determines equivalence.
  const source = await list("src/content/docs");
  const realRoutes = new Set(
    source
      .filter((name) => /\.mdx?$/.test(name))
      .map(
        (name) =>
          "/" + name.replace(/\.mdx?$/, "").replace(/\/index$/, "") + "/",
      ),
  );
  for (const [route, page] of pages) {
    if (
      route.startsWith("/docs/") ||
      route.startsWith("/id/docs/") ||
      route.startsWith("/guides/") ||
      route.startsWith("/id/guides/")
    ) {
      const alternate = route.startsWith("/id/")
        ? route.slice(3)
        : "/id" + route;
      const counterpart =
        realRoutes.has(route) && realRoutes.has(alternate)
          ? alternate
          : undefined;
      errors.push(...validateLocale(route, page, counterpart));
    }
    for (const href of page.links) {
      if (/^(?:mailto:|tel:|javascript:)/.test(href)) continue;
      const url = new URL(href, `https://8labs.id${route}`);
      if (url.origin !== "https://8labs.id") continue;
      const target = url.pathname.endsWith("/")
        ? url.pathname
        : url.pathname + "/";
      const destination = pages.get(target);
      // Redirected historical paths are retained in _redirects, not rewritten by content checks.
      if (!destination && !assets.has(url.pathname)) {
        const redirects = await readFile("public/_redirects", "utf8");
        const hasRedirect = redirects.split("\n").some((line) => {
          const pattern = line.trim().split(/\s+/)[0];
          if (!pattern || pattern.startsWith("#")) return false;
          const escaped = pattern
            .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
            .replace(/\*/g, ".*")
            .replace(/:[\w]+/g, "[^/]+");
          return new RegExp(`^${escaped}/?$`).test(url.pathname);
        });
        if (!hasRedirect) errors.push(`${route}: broken built link ${href}`);
      } else if (
        destination &&
        url.hash &&
        !destination.ids.has(decodeURIComponent(url.hash.slice(1)))
      )
        errors.push(`${route}: broken built anchor ${href}`);
    }
    for (const image of page.images) {
      if (image.alt === undefined)
        errors.push(`${route}: image has no alt attribute`);
      if (!image.src || /^(?:https?:|data:)/.test(image.src)) continue;
      if (!assets.has(new URL(image.src, `https://8labs.id${route}`).pathname))
        errors.push(`${route}: missing built image ${image.src}`);
    }
  }
  for (const suffix of Object.values(registry.articles))
    for (const prefix of Object.values(registry.locales))
      if (!pages.has(prefix + suffix + "/"))
        errors.push(`Missing built migration destination ${prefix + suffix}/`);
  if (!all.some((name) => name.startsWith("pagefind/") && name.endsWith(".js")))
    errors.push("Pagefind search bundle missing");
  if (!all.some((name) => name.startsWith("_astro/") && /\.css$/.test(name)))
    errors.push("Astro stylesheet assets missing");
  for (const error of errors) console.error(`ERROR ${error}`);
  console.log(
    `${pages.size} built HTML pages; ${assets.size} assets; ${errors.length} errors.`,
  );
  if (errors.length) process.exitCode = 1;
}
if (import.meta.main) await main();
