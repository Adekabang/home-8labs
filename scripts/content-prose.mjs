import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkGfm from "remark-gfm";

export function parseContent(body, mdx = false) {
  const parser = unified().use(remarkParse).use(remarkGfm);
  if (mdx) parser.use(remarkMdx);
  return parser.parse(body);
}
function text(node) {
  return node.value ?? (node.children ?? []).map(text).join("");
}
function sentences(node, max, kind) {
  return text(node)
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.trim().split(/\s+/).length > max)
    .map((sentence) => ({
      kind,
      max,
      words: sentence.trim().split(/\s+/).length,
      sentence,
    }));
}
export function reviewSentences(node) {
  if (node.type === "paragraph" || node.type === "tableCell")
    return sentences(node, 25, "description");
  if (node.type === "list" && node.ordered)
    return node.children.flatMap((item) => sentences(item, 20, "procedure"));
  return [];
}
