import { describe, expect, test } from "bun:test";
import { inspectHtml, validateLocale } from "./check-built.mjs";
import { parseContent, reviewSentences } from "./content-prose.mjs";

describe("publication HTML contracts", () => {
  test("reads real rendered anchors, assets, language, and canonical", () => {
    const result = inspectHtml(
      '<html lang="id"><head><link rel="canonical" href="https://8labs.id/id/docs/servers/console/"></head><body><h2 id="koneksi">Koneksi</h2><a href="#koneksi">Buka</a><img src="/_astro/console.webp" alt="Konsol"></body></html>',
    );
    expect(result.ids.has("koneksi")).toBe(true);
    expect(result.links).toEqual(["#koneksi"]);
    expect(result.images).toEqual([
      { src: "/_astro/console.webp", alt: "Konsol" },
    ]);
    expect(
      validateLocale(
        "/id/docs/servers/console/",
        result,
        "/docs/servers/console/",
      ),
    ).toContain(
      "/id/docs/servers/console/: missing actual equivalent-page hreflang",
    );
  });
  test("rejects a fake Indonesian fallback translation", () => {
    const result = inspectHtml(
      '<html lang="id"><head><link rel="canonical" href="https://8labs.id/id/guides/example/"><link rel="alternate" hreflang="id" href="https://8labs.id/id/guides/example/"></head></html>',
    );
    expect(validateLocale("/id/guides/example/", result).length).toBe(2);
  });
  test("accepts an honest English fallback without translation claims", () => {
    const result = inspectHtml(
      '<html lang="en"><head><link rel="canonical" href="https://8labs.id/guides/example/"><meta name="robots" content="noindex,follow"></head></html>',
    );
    expect(validateLocale("/id/guides/example/", result)).toEqual([]);
  });
  test("accepts equivalent localized routes with self canonical and alternate", () => {
    const result = inspectHtml(
      '<html lang="id"><head><link rel="canonical" href="https://8labs.id/id/docs/servers/console/"><link rel="alternate" hreflang="en" href="https://8labs.id/docs/servers/console/"></head></html>',
    );
    expect(
      validateLocale(
        "/id/docs/servers/console/",
        result,
        "/docs/servers/console/",
      ),
    ).toEqual([]);
  });
});

describe("structured Markdown sentence review", () => {
  function findings(markdown) {
    const results = [];
    function visit(node) {
      results.push(...reviewSentences(node));
      for (const child of node.children ?? []) visit(child);
    }
    visit(parseContent(markdown));
    return results;
  }
  test("does not count separate table cells as one prose sentence", () => {
    const cell = Array(12).fill("word").join(" ");
    expect(
      findings(
        `| First | Second | Third |\n| --- | --- | --- |\n| ${cell} | ${cell} | ${cell} |`,
      ),
    ).toEqual([]);
  });
  test("reports an actual overlong sentence within a table cell", () => {
    const sentence = Array(26).fill("word").join(" ") + ".";
    const results = findings(
      `| Task | Explanation |\n| --- | --- |\n| Restore | ${sentence} |`,
    );
    expect(results).toEqual([
      { kind: "description", max: 25, words: 26, sentence },
    ]);
  });
  test("retains the stricter procedure target for ordered instructions", () => {
    const sentence = Array(21).fill("word").join(" ") + ".";
    expect(findings(`1. ${sentence}`)).toContainEqual({
      kind: "procedure",
      max: 20,
      words: 21,
      sentence,
    });
  });
});
