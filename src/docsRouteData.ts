import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import { getCollection } from "astro:content";

// Native Starlight creates fallback routes. Keep them readable, but never
// advertise an English tutorial as an Indonesian translation or search result.
export const onRequest = defineRouteMiddleware(
  async ({ locals, site, url }) => {
    const route = locals.starlightRoute;
    const entries = await getCollection("docs");
    const paths = new Set(
      entries.map((entry) => entry.id.replace(/\/index$/, "")),
    );
    const base = url.pathname.replace(/^\/id(?=\/)/, "").replace(/\/$/, "");
    const hasIndonesian = paths.has(`id${base}`.replace(/^\//, ""));
    route.head = route.head.filter(
      ({ tag, attrs }) =>
        !(
          tag === "link" &&
          attrs?.rel === "alternate" &&
          attrs?.hreflang === "id" &&
          !hasIndonesian
        ),
    );
    if (route.isFallback) {
      route.lang = "en";
      route.entry = { ...route.entry, data: { ...route.entry.data } };
      route.entry.data.pagefind = false;
      route.head = route.head.filter(
        ({ tag, attrs }) =>
          !(tag === "link" && attrs?.rel === "canonical") &&
          !(
            tag === "meta" &&
            (attrs?.property === "og:url" || attrs?.property === "og:locale")
          ),
      );
      const canonical = new URL(`${base}/`, site).href;
      route.head.push(
        { tag: "link", attrs: { rel: "canonical", href: canonical } },
        { tag: "meta", attrs: { property: "og:url", content: canonical } },
        { tag: "meta", attrs: { property: "og:locale", content: "en" } },
        { tag: "meta", attrs: { name: "robots", content: "noindex,follow" } },
      );
    }
  },
);
