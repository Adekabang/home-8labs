import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import {
  docsCollection,
  withNimbusMarkdown,
} from "@cloudflare/nimbus-docs/content";

const schemaFields = {
  contentId: z.string().optional(),
  owner: z.string().optional(),
  reviewedVersion: z.string().optional(),
  reviewedDate: z.coerce.date().optional(),
  translationStatus: z.enum(["original", "translated", "reviewed"]).optional(),
  date: z.coerce.date().optional(),
  authors: z.union([z.string(), z.array(z.string())]).optional(),
  tags: z.array(z.string()).optional(),
  cover: z.object({ image: z.string(), alt: z.string().optional() }).optional(),
};
const markdownFields = [
  "contentId",
  "owner",
  "reviewedVersion",
  "reviewedDate",
  "translationStatus",
  "date",
  "authors",
  "tags",
] as const;
const pageCollection = (base: string) =>
  defineCollection(docsCollection({ base, schemaFields, markdownFields }));

// Fallbacks share the original files, not competing translated content copies.
// The loader marks their data before Nimbus prepares search and agent indexes.
function localizedCollection(
  base: string,
  pattern: string | string[],
  mixed = false,
) {
  const original = glob({
    base,
    pattern,
    generateId: ({ entry, data }) =>
      String(
        data.slug ??
          entry.replace(/\.mdx?$/, "").replace(/^(?:id\/)?docs\//, ""),
      ),
  });
  const loader = {
    ...original,
    name: `8labs-localized-${base}`,
    async load(context: Parameters<typeof original.load>[0]) {
      const store = new Proxy(context.store, {
        get(target, key) {
          if (key === "set")
            return (entry: Parameters<typeof target.set>[0]) =>
              target.set({
                ...entry,
                data: {
                  ...entry.data,
                  ...(!mixed || !entry.filePath?.includes("/id/docs/")
                    ? { noindex: true, searchable: false }
                    : {}),
                },
              });
          const value = Reflect.get(target, key);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
      await original.load({ ...context, store });
    },
  };
  return defineCollection({
    ...docsCollection({ schemaFields, markdownFields }),
    loader: withNimbusMarkdown(loader),
  });
}
export const collections = {
  customer: pageCollection("docs/docs"),
  customerId: localizedCollection(
    "./src/content/docs",
    [
      "id/docs/**/*.{md,mdx}",
      "docs/getting-started/{install-qemu-guest-agent,install-docker-ipv6,ipv6-github-dockerhub,hermes-agent-ipv6}.mdx",
      "docs/getting-started/panel/aapanel-installation.mdx",
    ],
    true,
  ),
  guides: pageCollection("docs/guides"),
  guidesId: localizedCollection("./src/content/docs/guides", "**/*.{md,mdx}"),
  blog: pageCollection("docs/blog"),
  blogId: localizedCollection("./src/content/docs/blog", "**/*.{md,mdx}"),
  legal: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/legal" }),
    schema: z.object({
      draft: z.boolean(),
      type: z.string(),
      title: z.string(),
      language: z.string(),
    }),
  }),
};
