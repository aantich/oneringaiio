import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseHTML } from "linkedom";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const files = [];
async function walk(dir) {
  for (const f of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) await walk(p);
    else files.push(p);
  }
}
await walk(dist);
const known = new Set(files);
const pages = new Map();
const semantics = [];
const analyticsCoverage = [];
for (const p of files.filter(
  (p) => p.endsWith(".html") && !p.includes("/raw/"),
)) {
  const html = await readFile(p, "utf8");
  const { document } = parseHTML(html);
  const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
  const refs = [
    ...document.querySelectorAll("a[href],img[src],link[href],script[src]"),
  ].map((el) => el.getAttribute("href") ?? el.getAttribute("src"));
  pages.set(p, { ids: new Set(ids), refs });
  if (!document.querySelector('meta[http-equiv="refresh"]')) {
    analyticsCoverage.push({
      page: p,
      count: document.querySelectorAll('script[src$="assets/analytics.js"]')
        .length,
    });
    if (document.querySelectorAll("h1").length !== 1)
      semantics.push(`${p}: requires one h1`);
    if (
      !document.querySelector("main#main") ||
      !document.querySelector('html[lang="en"]') ||
      !document.querySelector('link[rel="canonical"]') ||
      !document.querySelector(".skip-link")
    )
      semantics.push(`${p}: incomplete semantic shell`);
    if (
      !(
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content").length > 30
      )
    )
      semantics.push(`${p}: missing description`);
    if (new Set(ids).size !== ids.length) semantics.push(`${p}: duplicate IDs`);
    for (const b of document.querySelectorAll("button"))
      if (!b.textContent.trim() && !b.getAttribute("aria-label"))
        semantics.push(`${p}: unnamed button`);
  }
}
const json = async (f) =>
  JSON.parse(await readFile(path.join(dist, f), "utf8"));
test("all internal URLs and fragments resolve, including chapters and source lines", () => {
  const errors = [];
  for (const [file, { refs }] of pages)
    for (const raw of refs) {
      if (!raw || /^(https?:|mailto:|data:|tel:|\/\/)/.test(raw)) continue;
      const url = new URL(
        raw,
        "https://site.test/" + path.relative(dist, file),
      );
      let target = path.join(dist, decodeURIComponent(url.pathname));
      if (url.pathname.endsWith("/")) target = path.join(target, "index.html");
      if (!known.has(target)) {
        errors.push(`${path.relative(dist, file)} → missing ${raw}`);
        continue;
      }
      if (
        url.hash &&
        pages.has(target) &&
        !pages.get(target).ids.has(decodeURIComponent(url.hash.slice(1)))
      )
        errors.push(`${path.relative(dist, file)} → missing anchor ${raw}`);
    }
  assert.equal(errors.length, 0, errors.slice(0, 60).join("\n"));
});
test("search results resolve and do not recommend historical designs or internal APIs", async () => {
  const data = await json("search.json");
  assert(data.length > 200);
  for (const item of data) {
    const url = new URL(item.url, "https://site.test/");
    const p = path.join(dist, decodeURIComponent(url.pathname));
    assert(pages.has(p), item.url);
    if (url.hash)
      assert(
        pages.get(p).ids.has(decodeURIComponent(url.hash.slice(1))),
        item.url,
      );
    assert(!item.url.includes("/designs/"));
  }
  assert(data.some((d) => d.title.toLowerCase().includes("amos")));
  assert(data.some((d) => d.title.toLowerCase().includes("memory")));
});
test("homepage presents v2 beta, correct package, cookbook, and five harness examples", async () => {
  const html = await readFile(path.join(dist, "index.html"), "utf8");
  const { document } = parseHTML(html);
  assert.match(document.querySelector("h1").textContent, /AI agents/);
  for (const term of [
    "npm install oneringai",
    "2.0.0-beta.1",
    "External harnesses are preview",
  ])
    assert(html.includes(term), term);
  assert(document.querySelector('a[href*="amos-cookbook"]'));
  for (const bad of [
    "Buy Template",
    "Everworker.ai",
    "uni-core",
    "jquery",
    "enterprise grade",
    "v1.1.3",
  ])
    assert(!html.includes(bad), bad);
  assert.equal(document.querySelectorAll("[data-harness]").length, 5);
});
test("all non-redirect pages have accessible semantic shells and descriptive metadata", () =>
  assert.deepEqual(semantics, []));
test("snapshot references, static hosting and machine-readable documentation are ready", async () => {
  const report = await json("build-report.json");
  assert.deepEqual(report.warnings, []);
  assert(report.documents >= 50);
  assert.match(
    await readFile(path.join(dist, "sitemap.xml"), "utf8"),
    /https:\/\/oneringai.io\/docs\//,
  );
  assert.equal(
    (await readFile(path.join(dist, "CNAME"), "utf8")).trim(),
    "oneringai.io",
  );
  assert.match(
    await readFile(path.join(dist, "robots.txt"), "utf8"),
    /sitemap/i,
  );
  assert.match(await readFile(path.join(dist, "llms.txt"), "utf8"), /beta/);
});
test("comparison credits alternatives, cites official sources, and states limitations", async () => {
  const { document } = parseHTML(
    await readFile(path.join(dist, "compare/index.html"), "utf8"),
  );
  const text = document.body.textContent;
  for (const term of [
    "2 November 2026",
    "HarnessAgent",
    "LangGraph",
    "Mastra",
    "Claude",
    "not a performance benchmark",
    "preview",
  ])
    assert(text.includes(term), term);
  const links = [...document.querySelectorAll('article a[href^="https"]')].map(
    (a) => a.href,
  );
  for (const domain of [
    "docs.langchain.com",
    "mastra.ai",
    "ai-sdk.dev",
    "developers.openai.com",
    "platform.claude.com",
    "docs.crewai.com",
    "docs.openclaw.ai",
  ])
    assert(
      links.some((h) => h.includes(domain)),
      domain,
    );
});

test("API chapters follow generated categories rather than embedded comment headings", () => {
  assert(pages.has(path.join(dist, "docs/api-reference/core/index.html")));
  assert(
    pages.has(path.join(dist, "docs/api-reference/agent-runtime/index.html")),
  );
  assert(pages.has(path.join(dist, "docs/api-reference/other/index.html")));
  assert(
    !pages.has(
      path.join(
        dist,
        "docs/api-reference/how-to-implement-a-custom-crud-plugin/index.html",
      ),
    ),
  );
});

// Track the existing property once per page. Exercise the provider bootstrap
// offline so tests do not send synthetic traffic to the live Analytics property.
test("every rendered page includes the shared Analytics loader once", () => {
  for (const item of analyticsCoverage) assert.equal(item.count, 1, item.page);
});
test("Analytics configures the original property once, only on production hosts", async () => {
  const source = await readFile(path.join(dist, "assets/analytics.js"), "utf8");
  for (const hostname of [
    "oneringai.io",
    "www.oneringai.io",
    "localhost",
    "127.0.0.1",
    "aantich.github.io",
    "example.com",
  ]) {
    const tags = [];
    const window = { location: { hostname } };
    const document = {
      getElementById: (id) => tags.find((t) => t.id === id),
      createElement: (name) => ({ nodeName: name }),
      head: { appendChild: (tag) => tags.push(tag) },
    };
    const sandbox = { window, document };
    runInNewContext(source, sandbox);
    runInNewContext(source, sandbox);
    if (["oneringai.io", "www.oneringai.io"].includes(hostname)) {
      assert.equal(tags.length, 1);
      assert.equal(
        tags[0].src,
        "https://www.googletagmanager.com/gtag/js?id=G-0DH6CTK91N",
      );
      assert.equal(tags[0].async, true);
      const commands = Array.from(window.dataLayer, (args) => Array.from(args));
      assert.equal(commands.length, 2);
      assert.equal(commands[0][0], "js");
      assert.equal(commands[1][0], "config");
      assert.equal(commands[1][1], "G-0DH6CTK91N");
    } else {
      assert.equal(tags.length, 0);
      assert.equal(window.dataLayer, undefined);
    }
  }
});
