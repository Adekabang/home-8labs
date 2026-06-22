import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";
import { sitePages } from "../../og-pages";

// One generated OG card per docs/guides/blog entry plus the landing pages.
// Blog posts that set a `cover` use that instead (handled in the Head
// override), but we still generate cards for everything so non-cover pages
// have a branded preview.
const entries = await getCollection("docs");

const pages = {
  ...Object.fromEntries(
    entries.map((entry) => [entry.id, { data: entry.data }]),
  ),
  ...Object.fromEntries(
    Object.entries(sitePages).map(([slug, p]) => [slug, { data: p.data }]),
  ),
};

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "slug",
  pages,
  getImageOptions: (_path, page: (typeof pages)[string]) => ({
    title: page.data.title,
    // CTA appended to the rendered card only (meta og:description is separate)
    description: `${page.data.description ?? "8Labs Docs"}\n\nRead the full guide at 8labs.id`,
    bgGradient: [
      [255, 255, 255],
      [250, 250, 250],
    ],
    border: { color: [194, 14, 80], width: 24, side: "inline-start" },
    padding: 60,
    font: {
      title: { color: [10, 10, 10], weight: "Bold" },
      description: { color: [87, 87, 94] },
    },
  }),
});
