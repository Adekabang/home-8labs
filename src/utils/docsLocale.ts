import { getCollection } from "astro:content";
import type { HeadElement } from "@cloudflare/nimbus-docs/types";

export async function docsLocale(pathname: string) {
  const inIndonesian = pathname.startsWith("/id/");
  const original = pathname.replace(/^\/id(?=\/)/, "").replace(/\/?$/, "/");
  const translated = await getCollection("customerId");
  const key = original.replace(/^\/docs\/?/, "").replace(/\/$/, "") || "index";
  const actual =
    original.startsWith("/docs/") &&
    translated.some(
      (entry) =>
        entry.id.replace(/\/index$/, "") === key && !entry.data.noindex,
    );
  const fallback = inIndonesian && !actual;
  const locale = inIndonesian && actual ? "id" : "en";
  const canonical = `https://8labs.id${fallback ? original : pathname.replace(/\/?$/, "/")}`;
  const head: HeadElement[] = [
    { tag: "link", attrs: { rel: "canonical", href: canonical } },
  ];
  if (actual) {
    head.push(
      ...["en", "id"].map((lang) => ({
        tag: "link" as const,
        attrs: {
          rel: "alternate",
          hreflang: lang,
          href: `https://8labs.id${lang === "id" ? "/id" : ""}${original}`,
        },
      })),
    );
  }
  return {
    locale,
    fallback,
    head,
    switchHref: inIndonesian ? original : `/id${original}`,
  };
}
