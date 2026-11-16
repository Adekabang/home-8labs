import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";
import { sitePages } from "../../og-pages";

// Preserve the public OG endpoints across all collection mounts.
const mounts = {
  customer: "docs",
  customerId: "id/docs",
  guides: "guides",
  guidesId: "id/guides",
  blog: "blog",
  blogId: "id/blog",
} as const;
const entries = (
  await Promise.all(
    Object.entries(mounts).map(async ([collection, mount]) =>
      (await getCollection(collection as keyof typeof mounts)).map((entry) => ({
        ...entry,
        id: `${mount}/${entry.id.replace(/\/index$/, "")}`,
      })),
    ),
  )
).flat();

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
    description: page.data.description ?? "8Labs Docs",
    // Crimson "READ THE GUIDE" CTA button rendered on every card.
    logo: { path: "./public/og-cta.png", size: [240] },
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
