import { readFile, writeFile, mkdir, readdir, rm, cp } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import MarkdownIt from "markdown-it";
import GithubSlugger from "github-slugger";
import hljs from "highlight.js";
import sanitizeHtml from "sanitize-html";
import { escape as e, relative, layout, mark } from "./ui.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist");
const lib = path.join(root, "content/library");
const metadata = JSON.parse(
  await readFile(path.join(root, "content/library.json"), "utf8"),
);
const md = new MarkdownIt({ html: true, linkify: true, typographer: false });
const files = [];
async function walk(dir, base = "") {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const f = path.posix.join(base, entry.name);
    if (entry.isDirectory()) await walk(path.join(dir, entry.name), f);
    else files.push(f);
  }
}
await walk(lib);
const known = new Set(files);
const docFiles = files.filter(
  (f) =>
    f.endsWith(".md") &&
    !f.startsWith("src/") &&
    !f.startsWith("apps/amos/data/") &&
    !/^docs\/(designs|evaluations|architecture)\//.test(f) &&
    f !== "docs/INTERNAL_API.md",
);
const docs = new Map();
const allPages = [];
const search = [];
const warnings = new Set();
function parse(source, sourcePath) {
  const tokens = md.parse(source, {});
  const slugger = new GithubSlugger();
  const headings = [];
  for (let i = 0; i < tokens.length; i++)
    if (tokens[i].type === "heading_open") {
      const text = tokens[i + 1].content;
      const id = slugger.slug(text.replace(/`/g, ""));
      tokens[i].attrSet("id", id);
      headings.push({
        id,
        text,
        level: Number(tokens[i].tag.slice(1)),
        index: i,
      });
    }
  const title =
    headings.find((h) => h.level === 1)?.text.replace(/`/g, "") ||
    sourcePath.split("/").at(-1).replace(/\.md$/, "").replaceAll("_", " ");
  return { sourcePath, source, tokens, headings, title };
}
const special = new Map([
  ["USER_GUIDE.md", "user-guide"],
  ["API_REFERENCE.md", "api-reference"],
  ["README.md", "overview"],
  ["CHANGELOG.md", "changelog"],
  ["examples/README.md", "examples"],
  ["apps/amos/docs/AGENT_RUNTIME.md", "amos-cookbook"],
  ["apps/amos/README.md", "amos"],
  ["apps/amos/docs/USER_GUIDE.md", "amos-user-guide"],
  ["apps/hosea/README.md", "hosea"],
  ["docs/PACKAGE_MIGRATION.md", "migration"],
  ["docs/VERSION_2_GUIDE.md", "version-2"],
]);
function docBase(f) {
  return (
    special.get(f) ||
    f
      .replace(/^docs\//, "")
      .replace(/\.md$/, "")
      .split("/")
      .map((s) => s.toLowerCase().replaceAll("_", "-"))
      .join("/")
  );
}
for (const f of docFiles) {
  if (f === "docs/COMPETITIVE_ANALYSIS.md") continue; // Superseded by the dated, sourced comparison.
  const d = parse(await readFile(path.join(lib, f), "utf8"), f);
  const base = `docs/${docBase(f)}`;
  d.path = `${base}/index.html`;
  d.anchors = new Map();
  d.parts = [];
  // Split the two exhaustive references at real h2 tokens, never headings inside code fences.
  if (f === "USER_GUIDE.md" || f === "API_REFERENCE.md") {
    let start = 0;
    let currentPath = d.path;
    let currentTitle = d.title;
    let cuts = d.headings.filter((h) => h.level === 2);
    if (f === "API_REFERENCE.md") {
      // Generated API comments can contain their own h2 headings. Only the
      // generator's declared table-of-contents categories are chapter boundaries.
      const toc = cuts[0];
      const end = cuts[1]?.index ?? d.tokens.length;
      const categories = new Set(
        d.tokens
          .slice(toc.index, end)
          .flatMap((t) => t.children || [])
          .filter(
            (t) => t.type === "link_open" && t.attrGet("href")?.startsWith("#"),
          )
          .map((t) => t.attrGet("href").slice(1)),
      );
      cuts = cuts.filter((h) => categories.has(h.id));
    }
    for (const h of cuts) {
      if (h.index > start)
        d.parts.push({
          path: currentPath,
          title: currentTitle,
          start,
          end: h.index,
        });
      currentPath = `${base}/${h.id || "section"}/index.html`;
      currentTitle = h.text;
      start = h.index;
    }
    d.parts.push({
      path: currentPath,
      title: currentTitle,
      start,
      end: d.tokens.length,
    });
  } else
    d.parts = [
      { path: d.path, title: d.title, start: 0, end: d.tokens.length },
    ];
  for (const p of d.parts) {
    p.doc = d;
    p.headings = d.headings.filter(
      (h) => h.index >= p.start && h.index < p.end,
    );
    for (const h of p.headings) d.anchors.set(h.id, p.path);
  }
  docs.set(f, d);
}
const sourcePages = new Map();
const sourceAnchors = new Map();
const directoryPages = new Map();
function sourcePage(f) {
  if (!sourcePages.has(f)) sourcePages.set(f, `source/${f}.html`);
  return sourcePages.get(f);
}
function resolveReference(href, fromSource, fromPage) {
  if (!href) return href;
  if (href.startsWith("https://github.com/aantich/oneringai/blob/main/"))
    return resolveReference(
      "library/" +
        href.slice("https://github.com/aantich/oneringai/blob/main/".length),
      "@site/reference.md",
      fromPage,
    );
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
  if (href.startsWith("//")) return href;
  const [raw, hash = ""] = href.split("#");
  if (!raw) {
    const d = docs.get(fromSource);
    const anchor = d?.anchors.get(decodeURIComponent(hash));
    return anchor ? relative(fromPage, `${anchor}#${hash}`) : `#${hash}`;
  }
  // Curated site pages use library/ for canonical repository sources.
  let target = fromSource.startsWith("@site/")
    ? raw.startsWith("library/")
      ? raw.slice(8)
      : `@site/${raw}`
    : path.posix.normalize(
        path.posix.join(
          path.posix.dirname(fromSource),
          decodeURIComponent(raw),
        ),
      );
  const curated = {
    "@site/start.md": "docs/start/index.html",
    "@site/applications.md": "applications/index.html",
    "@site/compare.md": "compare/index.html",
  };
  if (curated[target])
    return relative(fromPage, curated[target] + (hash ? "#" + hash : ""));
  if (target === "docs/COMPETITIVE_ANALYSIS.md")
    return relative(fromPage, "compare/index.html");
  if (target.endsWith("/")) target = target.slice(0, -1);
  if (docs.has(`${target}/README.md`)) target = `${target}/README.md`;
  if (docs.has(target)) {
    const d = docs.get(target);
    const anchor = hash ? d.anchors.get(decodeURIComponent(hash)) : null;
    if (hash && !anchor)
      warnings.add(`${fromSource}: unknown anchor ${target}#${hash}`);
    return relative(fromPage, `${anchor || d.path}${hash ? "#" + hash : ""}`);
  }
  if (known.has(target)) {
    if (/\.(png|jpe?g|svg|webp)$/i.test(target))
      return relative(fromPage, `raw/${target}`);
    if (hash) {
      if (!sourceAnchors.has(target)) sourceAnchors.set(target, new Set());
      sourceAnchors.get(target).add(decodeURIComponent(hash));
    }
    return relative(fromPage, sourcePage(target) + (hash ? "#" + hash : ""));
  }
  const children = files.filter((f) => f.startsWith(target + "/"));
  if (children.length) {
    const p = `source/${target}/index.html`;
    directoryPages.set(target, p);
    return relative(fromPage, p);
  }
  // Never invent a working link for a source that is absent from this recorded revision.
  warnings.add(`${fromSource}: missing reference ${href}`);
  return null;
}
function renderTokens(tokens, env) {
  const rendered = md.renderer.render(tokens, md.options, env);
  return sanitizeHtml(rendered, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "details",
      "summary",
      "button",
    ],
    allowedAttributes: {
      "*": ["id", "class"],
      a: ["href", "title", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      button: ["class", "aria-label"],
      th: ["align", "scope"],
      td: ["align"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
for (const type of ["html_inline", "html_block"])
  md.renderer.rules[type] = (tokens, index, options, env) =>
    tokens[index].content.replace(
      /\b(href|src)=(['"])(.*?)\2/g,
      (_, name, quote, value) =>
        `${name}=${quote}${e(resolveReference(value, env.sourcePath, env.page) || "")}${quote}`,
    );
const originalLink =
  md.renderer.rules.link_open ||
  ((ts, i, o, env, self) => self.renderToken(ts, i, o));
md.renderer.rules.link_open = (ts, i, o, env, self) => {
  const t = ts[i];
  const original = t.attrGet("href");
  const value = resolveReference(original, env.sourcePath, env.page);
  if (value === null) {
    t.attrSet("href", relative(env.page, "docs/reference-status/index.html"));
    t.attrSet(
      "title",
      "This source reference is not present in the recorded snapshot. See reference status.",
    );
  } else t.attrSet("href", value);
  if (/^https?:/.test(value || "")) t.attrSet("rel", "noreferrer");
  return originalLink(ts, i, o, env, self);
};
const originalImage = md.renderer.rules.image;
md.renderer.rules.image = (ts, i, o, env, self) => {
  const t = ts[i];
  const src = t.attrGet("src");
  if (!/^(https?:|data:)/.test(src))
    t.attrSet("src", resolveReference(src, env.sourcePath, env.page) || "");
  t.attrSet("loading", "lazy");
  return originalImage(ts, i, o, env, self);
};
md.renderer.rules.fence = (ts, i) => {
  const t = ts[i];
  const lang = t.info.trim().split(/\s+/)[0];
  const highlighted =
    lang && hljs.getLanguage(lang)
      ? hljs.highlight(t.content, { language: lang, ignoreIllegals: true })
          .value
      : e(t.content);
  return `<div class="code-block"><div class="code-bar"><span>${e(lang || "text")}</span><button class="copy-code" aria-label="Copy code">Copy</button></div><pre><code${lang ? ' class="language-' + e(lang) + '"' : ""}>${highlighted}</code></pre></div>\n`;
};
const navGroups = [
  [
    "Start here",
    [
      ["Quickstart", "@start"],
      ["V2 adoption guide", "docs/VERSION_2_GUIDE.md"],
      ["User guide", "USER_GUIDE.md"],
      ["API reference", "API_REFERENCE.md"],
      ["Examples", "examples/README.md"],
      ["Upgrade from v1", "docs/PACKAGE_MIGRATION.md"],
    ],
  ],
  [
    "Agent execution",
    [
      ["Agent runtime", "USER_GUIDE.md#agent-runtime-preview"],
      ["AMOS cookbook", "apps/amos/docs/AGENT_RUNTIME.md"],
      ["Loop policies", "docs/AGENT_LOOP_POLICIES.md"],
      ["Presets", "docs/AGENT_PRESETS.md"],
      ["Model routing", "docs/MODEL_ROUTING.md"],
      ["Helpers & budgets", "docs/MODEL_TASKS_AND_HELPERS.md"],
    ],
  ],
  [
    "Context & tools",
    [
      ["Context preparation", "docs/CONTEXT_PREPARATION.md"],
      ["Durable evidence", "docs/DURABLE_EVIDENCE.md"],
      ["Protected task state", "docs/TASK_STATE.md"],
      ["Context strategies", "docs/CONTEXT_STRATEGIES.md"],
      ["Native compaction", "docs/NATIVE_CONTEXT_COMPACTION.md"],
      ["Tool outcomes", "docs/TOOL_OUTCOMES_AND_CANCELLATION.md"],
      ["Connector catalog", "docs/CONNECTOR_TOOL_CATALOG.md"],
    ],
  ],
  [
    "Knowledge & applications",
    [
      ["Memory guide", "docs/MEMORY_GUIDE.md"],
      ["Memory permissions", "docs/MEMORY_PERMISSIONS.md"],
      ["AMOS", "apps/amos/README.md"],
      ["hosea", "apps/hosea/README.md"],
      ["Release notes", "CHANGELOG.md"],
    ],
  ],
];
function docHref(f, page) {
  if (f === "@start") return relative(page, "docs/start/index.html");
  const [file, hash] = f.split("#");
  const d = docs.get(file);
  if (!d) throw new Error(`Unknown navigation document ${file}`);
  return relative(
    page,
    `${hash ? d.anchors.get(hash) || d.path : d.path}${hash ? "#" + hash : ""}`,
  );
}
function sideNav(page) {
  return `<aside class="docs-sidebar"><button class="sidebar-toggle" aria-expanded="false" aria-controls="docs-navigation">Documentation menu <span>⌄</span></button><nav id="docs-navigation" aria-label="Documentation">${navGroups
    .map(
      ([title, links]) =>
        `<div class="nav-group"><p>${title}</p>${links
          .map(([label, f]) => {
            const url = docHref(f, page);
            return `<a href="${url}"${url.split("#")[0] === path.posix.basename(page) ? ' aria-current="page"' : ""}>${label}</a>`;
          })
          .join("")}</div>`,
    )
    .join("")}</nav></aside>`;
}
function documentShell({
  page,
  title,
  html,
  headings = [],
  doc,
  section = "Documentation",
  chapters = "",
}) {
  const toc = headings.filter((h) => h.level <= 3);
  return `<div class="docs-container">${sideNav(page)}<main id="main" class="doc-main"><div class="doc-breadcrumb"><a href="${relative(page, "docs/index.html")}">${e(section)}</a><span>/</span><span>${e(title)}</span></div>${doc ? `<div class="doc-version"><span>v${metadata.version}</span><span>Snapshot ${metadata.commit.slice(0, 7)}</span><a href="${relative(page, `raw/${doc.sourcePath}`)}" download>Markdown ↗</a></div>` : ""}<article class="prose">${html}</article>${chapters}<div class="doc-end"><span>Documentation snapshot · ${metadata.syncedAt}</span><a href="https://github.com/aantich/oneringai/issues">Suggest a correction ↗</a></div></main><aside class="doc-toc">${toc.length ? "<p>ON THIS PAGE</p>" : ""}<nav aria-label="On this page">${toc.map((h) => `<a class="level-${h.level}" href="#${e(h.id)}">${e(h.text.replace(/`/g, ""))}</a>`).join("")}</nav></aside></div>`;
}
async function emit(page, title, html, opts = {}) {
  const full = layout({
    page,
    title,
    description: opts.description || `${title} — OneRingAI v2 documentation.`,
    content: html,
    metadata,
    socialImage: `https://oneringai.io/${socialImagePath}`,
    ...opts,
  });
  await mkdir(path.dirname(path.join(out, page)), { recursive: true });
  await writeFile(path.join(out, page), full);
  allPages.push(page);
}
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(path.join(root, "src/assets"), path.join(out, "assets"), {
  recursive: true,
});
// Social crawlers cache images independently of the page. New image bytes
// receive a new URL, even when the editable source filename stays the same.
const socialImageData = await readFile(
  path.join(root, "src/assets/social.png"),
);
const socialImagePath = `assets/social-${createHash("sha256").update(socialImageData).digest("hex").slice(0, 12)}.png`;
await writeFile(path.join(out, socialImagePath), socialImageData);
// Original Markdown and referenced source are downloadable, keeping links local and branch independent.
await cp(lib, path.join(out, "raw"), { recursive: true });
for (const d of docs.values())
  for (const p of d.parts) {
    const html = renderTokens(d.tokens.slice(p.start, p.end), {
      sourcePath: d.sourcePath,
      page: p.path,
    });
    const hasH1 = p.headings.some((h) => h.level === 1);
    const body = hasH1 ? html : `<h1>${e(p.title)}</h1>${html}`;
    let chapters = "";
    if (d.parts.length > 1) {
      const at = d.parts.indexOf(p);
      chapters = `<nav class="chapter-nav" aria-label="Guide chapters">${at > 0 ? `<a href="${relative(p.path, d.parts[at - 1].path)}"><small>Previous</small>${e(d.parts[at - 1].title)} ←</a>` : "<span></span>"}${at < d.parts.length - 1 ? `<a href="${relative(p.path, d.parts[at + 1].path)}"><small>Next</small>${e(d.parts[at + 1].title)} →</a>` : ""}</nav>`;
      if (at === 0 && d.sourcePath !== "API_REFERENCE.md")
        chapters =
          `<div class="chapter-list"><h2>Browse chapters</h2>${d.parts
            .slice(1)
            .map(
              (c) =>
                `<a href="${relative(p.path, c.path)}">${e(c.title)} <span>→</span></a>`,
            )
            .join("")}</div>` + chapters;
    }
    await emit(
      p.path,
      p.title,
      documentShell({
        page: p.path,
        title: p.title,
        html: body,
        headings: p.headings,
        doc: d,
        chapters,
      }),
      {
        active: "docs",
        bodyClass: "documentation",
        noindex: /docs\/(designs|evaluations)\//.test(d.sourcePath),
      },
    );
    search.push({
      title: p.title,
      category:
        d.sourcePath === "USER_GUIDE.md"
          ? "User guide"
          : d.sourcePath === "API_REFERENCE.md"
            ? "API reference"
            : "Documentation",
      url: p.path,
      text: d.tokens
        .slice(p.start, p.end)
        .filter((t) => t.type === "inline")
        .map((t) => t.content)
        .join(" ")
        .replace(/[`*_\[\]#]/g, "")
        .slice(0, 1600),
    });
    for (const h of p.headings.filter((h) => h.level === 3))
      search.push({
        title: h.text.replace(/`/g, ""),
        category: p.title,
        url: `${p.path}#${h.id}`,
        text: h.text,
      });
  }
for (const [file, page] of [
  ["start.md", "docs/start/index.html"],
  ["compare.md", "compare/index.html"],
  ["applications.md", "applications/index.html"],
]) {
  const d = parse(
    await readFile(path.join(root, "src/pages", file), "utf8"),
    "@site/" + file,
  );
  const html = renderTokens(d.tokens, { sourcePath: d.sourcePath, page });
  await emit(
    page,
    d.title,
    documentShell({
      page,
      title: d.title,
      html,
      headings: d.headings,
      section:
        file === "compare.md"
          ? "Comparison"
          : file === "applications.md"
            ? "Applications"
            : "Documentation",
    }),
    {
      active:
        file === "compare.md"
          ? "compare"
          : file === "applications.md"
            ? "applications"
            : "docs",
      bodyClass: "documentation",
    },
  );
  search.unshift({
    title: d.title,
    category: file === "compare.md" ? "Compare" : "Start here",
    url: page,
    text: d.source.replace(/[#*`]/g, "").slice(0, 1600),
  });
}
const docPage = "docs/index.html";
const groups = [
  [
    "Get started",
    [
      ["Quickstart", "@start", "Install the beta and run a first agent."],
      [
        "User guide",
        "USER_GUIDE.md",
        "Agent setup, tools, context, and persistence.",
      ],
      [
        "API reference",
        "API_REFERENCE.md",
        "Public types and method signatures.",
      ],
      [
        "Examples",
        "examples/README.md",
        "Runnable recipes with offline and live modes.",
      ],
    ],
  ],
  [
    "V2 controls",
    [
      [
        "V2 adoption guide",
        "docs/VERSION_2_GUIDE.md",
        "Features, defaults, support, and limitations.",
      ],
      [
        "Durable evidence",
        "docs/DURABLE_EVIDENCE.md",
        "Retained results, projections, and recovery.",
      ],
      [
        "Task state",
        "docs/TASK_STATE.md",
        "Host-confirmed constraints and action receipts.",
      ],
      [
        "Helpers & budgets",
        "docs/MODEL_TASKS_AND_HELPERS.md",
        "Helper models and shared execution limits.",
      ],
    ],
  ],
  [
    "Integrations",
    [
      [
        "Connector catalog",
        "docs/CONNECTOR_TOOL_CATALOG.md",
        "Authentication templates and tool packs.",
      ],
      [
        "Memory system",
        "docs/MEMORY_GUIDE.md",
        "Entities, facts, relationships, and retrieval.",
      ],
      [
        "Agent runtime",
        "USER_GUIDE.md#agent-runtime-preview",
        "Definitions, sessions, harnesses, and events.",
      ],
      [
        "Upgrade from v1",
        "docs/PACKAGE_MIGRATION.md",
        "Move to the unscoped oneringai package.",
      ],
    ],
  ],
];
await emit(
  docPage,
  "Documentation",
  documentShell({
    page: docPage,
    title: "Documentation",
    html: `<p class="eyebrow">ONERINGAI V2</p><h1>Documentation</h1><p class="doc-intro">Guides, API reference, and examples for oneringai v2.</p><a class="cookbook-callout" href="${docHref("apps/amos/docs/AGENT_RUNTIME.md", docPage)}"><span class="eyebrow">RUNTIME WALKTHROUGH</span><h2>AMOS cookbook <span>↗</span></h2><p>Set up a host, run each driver, inspect activity, and resume sessions.</p></a><p class="doc-note">Beta <strong>${metadata.version}</strong> · Docs <code>${metadata.commit.slice(0, 7)}</code> · Updated ${metadata.syncedAt}. External harnesses are preview; provider access is required.</p>${groups.map(([name, links]) => `<h2>${name}</h2><div class="doc-card-grid">${links.map(([title, f, desc]) => `<a href="${docHref(f, docPage)}"><h3>${title} <span>↗</span></h3><p>${desc}</p></a>`).join("")}</div>`).join("")}<h2>All guides</h2><div class="all-guides">${[
      ...docs.values(),
    ]
      .filter(
        (d) =>
          d.sourcePath.startsWith("docs/") &&
          !/docs\/(designs|evaluations|architecture)\//.test(d.sourcePath) &&
          !d.sourcePath.endsWith("INTERNAL_API.md"),
      )
      .map((d) => `<a href="${relative(docPage, d.path)}">${e(d.title)}</a>`)
      .join("")}</div>`,
  }),
  {
    active: "docs",
    bodyClass: "documentation",
    description:
      "Search the OneRingAI v2 user guide, API reference, examples, AMOS cookbook, memory system, connectors, and migration documentation.",
  },
);
const runtimeCode = `const agent = runtime.createAgent({\n  id: 'researcher', instructions: 'Cite sources.',\n});\nconst options = {\n  ...hostSessionOptions,\n  execution: {\n    driver: 'oneringai.agent',\n    connector: 'openai-main',\n    model: 'gpt-5.6-terra',\n  },\n};\nawait agent.inspect(options);\nconst session = await agent.openSession(options);`;
let home = await readFile(path.join(root, "src/home.html"), "utf8");
home = home
  .replaceAll("{{mark}}", mark)
  .replaceAll("{{version}}", e(metadata.version))
  .replace(
    "{{runtime-code}}",
    hljs.highlight(runtimeCode, { language: "typescript" }).value,
  )
  .replace(/\{\{doc:([^}]+)\}\}/g, (_, f) => docHref(f, "index.html"));
await emit("index.html", "TypeScript agents, tools and memory", home, {
  description:
    "Open-source TypeScript library for AI agents, authenticated API tools, entity/fact memory, multimodal APIs, and swappable agent harnesses.",
});
function sourceWithAnchors(file, source) {
  const lines = source.split("\n");
  const at = new Map();
  const headings = file.endsWith(".md") ? parse(source, file).headings : [];
  for (const hash of sourceAnchors.get(file) || []) {
    const number = /^L(\d+)$/.exec(hash);
    let line = number ? Number(number[1]) - 1 : null;
    if (line === null) {
      const h = headings.find((h) => h.id === hash);
      if (h) {
        const parsed = md.parse(source, {});
        const token = parsed[h.index];
        line = token.map?.[0] ?? null;
      }
    }
    if (line === null || line < 0 || line >= lines.length) {
      warnings.add(`${file}: unavailable source anchor #${hash}`);
      continue;
    }
    if (!at.has(line)) at.set(line, []);
    at.get(line).push(hash);
  }
  return lines
    .map(
      (line, i) =>
        (at.get(i) || [])
          .map((id) => `<span class="source-anchor" id="${e(id)}"></span>`)
          .join("") + e(line),
    )
    .join("\n");
}
// Source viewers are created only for references actually used by the documentation.
for (const [f, page] of sourcePages) {
  const source = await readFile(path.join(lib, f), "utf8");
  const lang = f.endsWith(".ts")
    ? "typescript"
    : f.endsWith(".json")
      ? "json"
      : "text";
  const html = `<h1>${e(path.posix.basename(f))}</h1><p class="source-path">${e(f)}</p><p><a href="${relative(page, `raw/${f}`)}" download>Download original source ↗</a> · Snapshot <code>${metadata.commit.slice(0, 7)}</code></p><div class="code-block"><div class="code-bar"><span>${e(lang)}</span><button class="copy-code" aria-label="Copy source code">Copy</button></div><pre><code>${sourceWithAnchors(f, source)}</code></pre></div>`;
  await emit(
    page,
    path.posix.basename(f),
    documentShell({ page, title: f, html, section: "Source reference" }),
    { bodyClass: "documentation", active: "docs", noindex: true },
  );
}
for (const [dir, page] of directoryPages) {
  const children = files.filter((f) => f.startsWith(dir + "/"));
  await emit(
    page,
    dir,
    documentShell({
      page,
      title: dir,
      html: `<h1>${e(dir)}</h1><p>Files in the recorded library snapshot. Downloads preserve original source.</p><ul>${children.map((f) => `<li><a href="${relative(page, `raw/${f}`)}">${e(f.slice(dir.length + 1))}</a></li>`).join("")}</ul>`,
    }),
    { bodyClass: "documentation", active: "docs", noindex: true },
  );
}
const statusPage = "docs/reference-status/index.html";
await emit(
  statusPage,
  "Source reference status",
  documentShell({
    page: statusPage,
    title: "Source reference status",
    html: `<h1>Source reference status</h1><p>This source reference is absent from the recorded revision. Use the current guides and API reference for integration.</p><p><a href="${relative(statusPage, "docs/index.html")}">Return to documentation →</a></p><details><summary>Snapshot reference warnings (${warnings.size})</summary><ul>${[...warnings].map((w) => `<li>${e(w)}</li>`).join("")}</ul></details>`,
  }),
  { bodyClass: "documentation", active: "docs", noindex: true },
);
await emit(
  "404.html",
  "Page not found",
  `<main id="main" class="container not-found"><p class="eyebrow">404</p><h1>Page not found</h1><p>Search the guides or open the documentation.</p><a class="button primary" href="/docs/">Documentation →</a><button class="button secondary" data-open-search>Search docs</button></main>`,
  { noindex: true },
);
// Retain meaningful historical public URLs without shipping the old theme.
for (const [page, target] of [
  ["main/index.html", "index.html"],
  ["main/comparison.html", "compare/index.html"],
  ["comparison.html", "compare/index.html"],
]) {
  const href = relative(page, target);
  await mkdir(path.dirname(path.join(out, page)), { recursive: true });
  await writeFile(
    path.join(out, page),
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${href}"><link rel="canonical" href="https://oneringai.io/${target.replace("index.html", "")}"><title>Page moved · OneRingAI</title><a href="${href}">Continue to OneRingAI v2</a></html>`,
  );
}
await writeFile(path.join(out, "search.json"), JSON.stringify(search));
await writeFile(
  path.join(out, "build-report.json"),
  JSON.stringify(
    {
      metadata,
      pages: allPages.length,
      documents: docs.size,
      searchEntries: search.length,
      warnings: [...warnings],
    },
    null,
    2,
  ),
);
await writeFile(path.join(out, "CNAME"), "oneringai.io\n");
await writeFile(path.join(out, ".nojekyll"), "");
await writeFile(
  path.join(out, "robots.txt"),
  "User-agent: *\nAllow: /\nDisallow: /raw/\nDisallow: /source/\nSitemap: https://oneringai.io/sitemap.xml\n",
);
const sitemap = allPages
  .filter(
    (p) =>
      !p.startsWith("source/") &&
      !/docs\/docs\/(designs|evaluations|architecture)\//.test(p) &&
      p !== "404.html" &&
      p !== statusPage,
  )
  .map(
    (p) =>
      `<url><loc>https://oneringai.io/${p === "index.html" ? "" : p.replace(/index.html$/, "")}</loc><lastmod>${metadata.syncedAt}</lastmod></url>`,
  )
  .join("");
await writeFile(
  path.join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap}</urlset>`,
);
await writeFile(
  path.join(out, "llms.txt"),
  `# OneRingAI v2\n\nOpen-source TypeScript agents, authenticated tools, knowledge memory, and agent harnesses.\n\nPublished beta: ${metadata.version}. Snapshot: ${metadata.commit}. External harnesses are preview.\n\n## Documentation\n${navGroups
    .flatMap(([, links]) => links)
    .filter(([, f]) => f !== "@start")
    .map(
      ([label, f]) =>
        `- [${label}](https://oneringai.io/raw/${f}): Canonical v2 source documentation.`,
    )
    .join("\n")}\n`,
);
console.log(
  `Built ${allPages.length} pages, ${docs.size} source documents, ${search.length} search records. Reference warnings: ${warnings.size}.`,
);
