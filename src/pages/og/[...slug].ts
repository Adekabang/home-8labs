import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";
import { sitePages } from "../../og-pages";

// One generated OG card per docs/guides/blog entry plus the landing pages.
// Blog posts that set a `cover` use that instead (handled in the Head
// override), but we still generate cards for everything so non-cover pages
// have a branded preview.
const entries = await getCollection("docs");

const pages = {
  ...Object.fromEntries(entries.map((entry) => [entry.id, { data: entry.data }])),
  ...Object.fromEntries(
    Object.entries(sitePages).map(([slug, p]) => [slug, { data: p.data }]),
  ),
};

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "slug",
  pages,
  getImageOptions: (_path, page: (typeof pages)[string]) => ({
    title: page.data.title,
    description: page.data.description ?? "8Labs Docs",
    bgGradient: [
      [10, 10, 11],
      [24, 24, 27],
    ],
    border: { color: [230, 0, 34], width: 24, side: "inline-start" },
    padding: 60,
    font: {
      title: { color: [250, 250, 250], weight: "Bold" },
      description: { color: [161, 161, 170] },
    },
  }),
});
