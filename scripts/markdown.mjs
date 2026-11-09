import GithubSlugger from "github-slugger";

// Work with Markdown tokens: code samples, nested lists and embedded HTML must
// never accidentally become chapter boundaries or table-of-contents entries.
export function parseDocument(md, source, sourcePath) {
  const tokens = md.parse(source, {});
  const slugger = new GithubSlugger();
  const headings = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== "heading_open") continue;
    const inline = tokens[i + 1];
    const text = (inline.children || [])
      .filter((t) => ["text", "code_inline", "image", "softbreak"].includes(t.type))
      .map((t) => t.type === "softbreak" ? " " : t.content)
      .join("");
    const id = slugger.slug(text);
    tokens[i].attrSet("id", id);
    headings.push({ id, text, level: Number(tokens[i].tag.slice(1)), index: i });
  }
  const title = headings.find((h) => h.level === 1)?.text ||
    sourcePath.split("/").at(-1).replace(/\.md$/, "").replaceAll("_", " ");
  const contents = headings.filter((h) => /^(table of contents|contents)$/i.test(h.text));
  const omitted = new Set();
  const contentsAnchors = [];
  const categories = new Set();
  for (const h of contents) {
    const end = headings.find((next) => next.index > h.index && next.level <= h.level)?.index ?? tokens.length;
    if (!tokens.slice(h.index + 3, end).some((t) => t.type === "bullet_list_open" || t.type === "ordered_list_open")) continue;
    const links = tokens.slice(h.index + 3, end)
      .flatMap((t) => t.children || [])
      .filter((t) => t.type === "link_open" && t.attrGet("href")?.startsWith("#"));
    if (!links.length) continue;
    contentsAnchors.push(h.id);
    for (const link of links) categories.add(decodeURIComponent(link.attrGet("href").slice(1)));
    for (let i = h.index; i < end; i++) omitted.add(i);
  }
  const kept = tokens.filter((_, i) => !omitted.has(i));
  const positions = new Map(kept.map((t, i) => [t, i]));
  return {
    sourcePath, source, title, tokens: kept, contentsAnchors, categories,
    headings: headings.filter((h) => !omitted.has(h.index))
      .map((h) => ({ ...h, index: positions.get(tokens[h.index]) })),
  };
}
