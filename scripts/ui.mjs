import path from "node:path";
export const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const relative = (from, to) => {
  const [base, hash] = to.split("#");
  const value =
    path.posix.relative(path.posix.dirname(from), base || from) ||
    path.posix.basename(from);
  return value + (hash ? "#" + hash : "");
};
export const arrow = '<span aria-hidden="true">↗</span>';
export const mark =
  '<svg class="brand-mark" aria-hidden="true" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1.8"/><path d="M16 8a8 8 0 1 0 8 8M16 2v10h10" stroke="currentColor" stroke-width="1.8"/></svg>';
export function layout({
  page,
  title,
  description,
  content,
  active = "",
  bodyClass = "",
  metadata,
  socialImage,
  noindex = false,
}) {
  const url = (p) => (page === "404.html" ? "/" + p : relative(page, p));
  const canonical = `https://oneringai.io/${page === "index.html" ? "" : page.replace(/index.html$/, "")}`;
  const socialTitle = `${title} · OneRingAI`;
  const imageAlt =
    "OneRingAI — AI agents in TypeScript. Tools, memory, and harnesses.";
  const socialMetadata = `<meta property="og:type" content="website"><meta property="og:site_name" content="OneRingAI"><meta property="og:url" content="${canonical}"><meta property="og:title" content="${escape(socialTitle)}"><meta property="og:description" content="${escape(description)}"><meta property="og:image" content="${escape(socialImage)}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escape(imageAlt)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(socialTitle)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${escape(socialImage)}"><meta name="twitter:image:alt" content="${escape(imageAlt)}">`;
  const navLink = (label, p, id) =>
    `<a href="${url(p)}"${active === id ? ' aria-current="page"' : ""}>${label}</a>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script defer src="${url("assets/analytics.js")}"></script><script>try{document.documentElement.dataset.theme=localStorage.getItem('oneringai-theme')||'light'}catch{}</script><title>${escape(title)} · OneRingAI</title><meta name="description" content="${escape(description)}"><meta name="theme-color" content="#f8f9f6"><link rel="canonical" href="${canonical}">${noindex ? '<meta name="robots" content="noindex">' : ""}${socialMetadata}<link rel="icon" type="image/svg+xml" href="${url("assets/mark.svg")}"><link rel="stylesheet" href="${url("assets/site.css")}"><script type="module" src="${url("assets/site.js")}"></script></head><body class="${bodyClass}" data-search="${url("search.json")}"><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="header-inner"><a class="brand" href="${url("index.html")}" aria-label="OneRingAI home">${mark}<span>oneringai</span><span class="brand-version">v2</span></a><nav aria-label="Main navigation" class="main-nav" id="main-nav">${navLink("Documentation", "docs/index.html", "docs")}${navLink("Compare", "compare/index.html", "compare")}${navLink("Applications", "applications/index.html", "applications")}<a href="https://github.com/aantich/oneringai">GitHub ${arrow}</a></nav><div class="header-tools"><button class="search-trigger" data-open-search aria-label="Search documentation"><svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span>Search docs</span><kbd>⌘ K</kbd></button><button class="icon-button theme-toggle" aria-label="Switch to dark theme" title="Toggle color theme">◐</button><button class="icon-button menu-toggle" aria-controls="main-nav" aria-expanded="false" aria-label="Open navigation">☰</button></div></div></header>${content}<footer class="site-footer"><div class="container"><div class="footer-top"><a class="brand" href="${url("index.html")}">${mark} oneringai</a><p>Open-source TypeScript library.<br>Agents, tools, and memory.</p><div><a href="${url("docs/start/index.html")}">Get started</a><a href="${url("docs/index.html")}">Documentation</a><a href="https://www.npmjs.com/package/oneringai">npm ${arrow}</a></div><div><a href="${url("applications/index.html")}">AMOS & hosea</a><a href="${url("compare/index.html")}">Compare</a><a href="https://github.com/aantich/oneringai/issues">Report an issue ${arrow}</a></div></div><div class="footer-bottom"><span>© 2025–${metadata.syncedAt.slice(0, 4)} Anton Antic · MIT</span><span>v${metadata.version} <span class="footer-sep">/</span> Documentation snapshot ${metadata.commit.slice(0, 7)}</span><a href="mailto:anton.antich@gmail.com">Contact ${arrow}</a></div></div></footer><dialog class="search-dialog" aria-labelledby="search-title"><div class="search-heading"><h2 id="search-title">Search documentation</h2><button class="icon-button" data-close-search aria-label="Close search">×</button></div><label class="sr-only" for="docs-search">Search guides, examples, and API reference</label><input type="search" id="docs-search" maxlength="180" placeholder="Guides, APIs, examples…" autocomplete="off"><p class="search-status" role="status">Type to search the v2 documentation.</p><div class="search-results"></div><div class="search-footer">↑ ↓ to navigate <span>Esc to close</span></div></dialog><div class="toast" role="status" aria-live="polite"></div></body></html>`;
}
