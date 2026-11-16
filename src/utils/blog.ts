import { getCollection } from "astro:content";
import { slug } from "github-slugger";
export const tagSlug = (tag: string) => slug(tag);
export async function blogPosts() {
  return (await getCollection("blog"))
    .filter((entry) => !entry.data.draft)
    .sort(
      (a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0),
    );
}
export function blogHref(id: string) {
  return `/blog/${id.replace(/\/index$/, "")}/`;
}
