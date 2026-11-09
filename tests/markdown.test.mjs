import test from "node:test";
import assert from "node:assert/strict";
import MarkdownIt from "markdown-it";
import { parseDocument } from "../scripts/markdown.mjs";

const md = new MarkdownIt({ html: true });
test("contents become navigation metadata without removing chapters or fenced samples", () => {
  const source = "# Guide\n\nIntro.\n\n## Table of Contents\n\n- [First](#first)\n- [Second](#second)\n\n---\n\n## First\n\n```md\n## Fake chapter\n## Table of Contents\n```\n\n### Detail\n\nKeep this.\n\n## Second\n\nKeep this too.";
  const doc = parseDocument(md, source, "guide.md");
  assert.deepEqual(doc.contentsAnchors, ["table-of-contents"]);
  assert.deepEqual([...doc.categories], ["first", "second"]);
  assert.deepEqual(doc.headings.map((h) => h.id), ["guide", "first", "detail", "second"]);
  assert(doc.tokens.some((t) => t.type === "fence" && t.content.includes("## Fake chapter")));
  assert(doc.tokens.some((t) => t.type === "inline" && t.content === "Keep this too."));
  for (const h of doc.headings) assert.equal(doc.tokens[h.index].attrGet("id"), h.id);
});
test("heading labels use rendered text and retain GitHub duplicate anchors", () => {
  const doc = parseDocument(md, "# Guide\n\n## **Using** `Agent` & [tools](tools.md)\n\n## Repeat\n\n## Repeat", "guide.md");
  assert.equal(doc.headings[1].text, "Using Agent & tools");
  assert.deepEqual(doc.headings.map((h) => h.id), ["guide", "using-agent--tools", "repeat", "repeat-1"]);
});
test("a prose section called Contents is preserved when it is not a navigation list", () => {
  const doc = parseDocument(md, "# Guide\n\n## Contents\n\nThis describes the contents of an archive. See [next](#next).\n\n## Next\n\nText.", "guide.md");
  assert.deepEqual(doc.contentsAnchors, []);
  assert(doc.headings.some((h) => h.id === "contents"));
});
