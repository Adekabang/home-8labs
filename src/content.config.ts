import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { blogSchema } from "starlight-blog/schema";

const docsCollection = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({
    extend: (context) => blogSchema(context),
  }),
});

const legalCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/legal" }),
  schema: z.object({
    draft: z.boolean(),
    type: z.string(),
    title: z.string(),
    language: z.string(),
  }),
});

export const collections = {
  docs: docsCollection,
  legal: legalCollection,
};
