import { render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import mdxRenderer from "@astrojs/mdx/server.js";
import { parseFragment, serialize, type DefaultTreeAdapterMap } from "parse5";
import { components } from "@/components";
import { blogPosts, blogHref } from "@/utils/blog";

const site = "https://8labs.id";
const xml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[char]!,
  );

// Feed readers have no page URL against which to resolve article links or assets.
function absoluteContent(html: string, articleUrl: string) {
  const fragment = parseFragment(html);
  function removeRuntimeNodes(parent: DefaultTreeAdapterMap["parentNode"]) {
    parent.childNodes = parent.childNodes.filter(
      (node) =>
        !(
          "tagName" in node &&
          (["script", "style", "link"].includes(node.tagName) ||
            node.attrs.some(
              (attr) => attr.name === "role" && attr.value === "tablist",
            ))
        ),
    );
    for (const node of parent.childNodes) {
      if ("childNodes" in node) removeRuntimeNodes(node);
    }
  }
  removeRuntimeNodes(fragment);
  function visit(node: DefaultTreeAdapterMap["childNode"]) {
    if (!("tagName" in node)) return;
    const label = node.attrs.find(
      (attr) => attr.name === "data-nb-tab-label",
    )?.value;
    if (label) {
      const heading = parseFragment(`<h3>${xml(label)}</h3>`).childNodes[0];
      heading.parentNode = node;
      node.childNodes.unshift(heading);
      node.attrs = node.attrs.filter(
        (attr) => !["hidden", "role", "aria-labelledby"].includes(attr.name),
      );
    }
    for (const attr of node.attrs) {
      if (["href", "src", "poster"].includes(attr.name)) {
        attr.value = new URL(attr.value, articleUrl).href;
      } else if (attr.name === "srcset") {
        // Match a candidate URL and its optional width/density descriptor. A
        // data URL may contain commas, so only candidate-separating commas split.
        attr.value = attr.value.replace(
          /(^|,\s+)(\S+)(\s+\d+(?:\.\d+)?[wx])?(?=,\s+|$)/g,
          (_, separator: string, url: string, descriptor = "") =>
            `${separator}${new URL(url, articleUrl).href}${descriptor}`,
        );
      }
    }
    for (const child of node.childNodes) visit(child);
  }
  for (const child of fragment.childNodes) visit(child);
  return serialize(fragment);
}

export async function blogFeed() {
  const posts = await blogPosts();
  const container = await AstroContainer.create();
  container.addServerRenderer({ renderer: mdxRenderer });
  const items: string[] = [];
  for (const post of posts) {
    const articleUrl = new URL(blogHref(post.id), site).href;
    // Use the same Nimbus-prepared Astro content and MDX component registry as
    // the article page, rather than compiling raw Markdown through another path.
    const { Content } = await render(post);
    const html = await container.renderToString(Content, {
      props: { components },
      request: new Request(articleUrl),
    });
    const body = absoluteContent(html, articleUrl);
    items.push(
      `<item><title>${xml(post.data.title)}</title><link>${xml(articleUrl)}</link><guid>${xml(articleUrl)}</guid><description>${xml(post.data.description ?? "")}</description>${post.data.date ? `<pubDate>${post.data.date.toUTCString()}</pubDate>` : ""}${(post.data.tags ?? []).map((tag) => `<category>${xml(tag)}</category>`).join("")}<content:encoded>${xml(body)}</content:encoded></item>`,
    );
  }
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>8Labs Blog</title><link>${site}/blog/</link><description>Infrastructure notes, practical guides, and updates from 8Labs.</description><language>en</language>${items.join("")}</channel></rss>`,
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
  );
}
