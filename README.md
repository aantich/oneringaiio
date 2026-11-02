# OneRingAI website v2

The source for [oneringai.io](https://oneringai.io). A small static site with a shared monochrome design system, searchable documentation, a sourced comparison, and application guides. No client framework, hosted search, account system, or model calls are needed.

## Run locally

Use Node.js 22.13+ or 24+. Clone the library beside this repository, then:

```bash
npm ci
npm run docs:sync -- ../oneringai
npm run dev
```

Open the printed local URL (normally `http://localhost:3000`). Source changes rebuild the site; refresh the browser to see them. `PORT=3001 npm run dev` chooses another port. Ctrl+C stops the owned preview server.

`npm run docs:sync` requires a clean, committed library checkout. It records that checkout's commit/version/date in `content/library.json` and creates a gitignored local documentation cache. It never loads `.env`, credentials, or the library's node_modules. It does not change the library or make provider requests.

To reproduce the recorded snapshot rather than adopt a newer commit:

```bash
git clone https://github.com/aantich/oneringai.git .library-source
git -C .library-source checkout <commit-from-content/library.json>
npm run docs:sync -- .library-source --frozen
npm run check
npm run preview
```

CI performs these steps using the exact recorded commit. The documentation source is not duplicated in this repository. Documentation-only corrections may postdate the published npm tarball; version and source revision are shown separately.

## Content and design

- `src/home.html`: landing page; `{{doc:relative/library/path.md#anchor}}` links resolve at build time.
- `src/pages/`: quickstart, comparison, and applications content. `library/` links refer to the recorded library source. Other relative Markdown links refer to these authored pages.
- `src/assets/site.css`: shared color, spacing, typography, responsive, dark-theme, and documentation styles. Fonts use the system stack; no remote font requests.
- `src/assets/analytics.js`: restores the existing Google Analytics property `G-0DH6CTK91N` on `oneringai.io` and `www.oneringai.io`; local previews and other hosts do not send traffic. The standard `config` command sends one page view per document load.
- `src/assets/site.js`: local search, keyboard navigation, copy buttons, color theme, mobile navigation, and the illustrative harness selector.
- `src/assets/mark.svg`: original ring mark and favicon. `social.svg` is the editable social card; `social.png` is its raster export. Regenerate the PNG with an SVG rasterizer after changing the SVG.
- `scripts/`: static generation, snapshot synchronization, shared shell, and local server.
- `tests/site.test.mjs`: generated links/fragments, source line anchors, semantic structure, metadata, search routes, comparison sources, and hosting checks.

The user guide is split at real Markdown h2 tokens; the generated API is split at its declared table-of-contents categories. Inline and cross-document anchors are rewritten to the corresponding chapter. Public usage guides, AMOS, hosea, examples, and release notes are rendered from the same source. Referenced historical design/evaluation records remain available as source references, outside the integration search index. Raw HTML in documentation is sanitized. Source code is escaped and reference line anchors are retained.

Do not edit the gitignored snapshot or generated `dist/`. Correct library documentation in the library, commit it, then refresh the snapshot manifest. Do not hand-edit its generated API reference. Keep internal documentation links local and independent of Git branch names.

## Comparison policy

The comparison at `src/pages/compare.md` was researched against official documentation on 2 November 2026. Preserve the source links and review date, credit the alternatives' capabilities, and describe concrete adoption tradeoffs. Do not invent speed/cost rankings, popularity statistics, or unsupported-feature claims. Keep the published beta and external-harness preview boundaries explicit.

The [validation record](content/VALIDATION.md) records the delivered scope and checks.

## Typography and copy

Reading text uses 18px, secondary text and controls 16px, metadata 13px, and code 14px at the default browser scale. Shared rem-based tokens preserve browser zoom and text scaling. Keep headings descriptive and copy specific to documented APIs.

## Verify and deploy

```bash
npm run check
```

This builds the complete output and checks every generated internal link and fragment, including source lines and search results. Also use a browser to verify desktop/mobile layouts, the menu, all harness choices, search/keyboard behavior, copy buttons, dark/light persistence, representative guide chapters, comparison scrolling, and the 404 page. No API key is needed.

GitHub Actions checks pull requests. A push to `main` checks and deploys to the existing **GitHub Pages** site at **oneringai.io**. `CNAME`, `.nojekyll`, sitemap, robots policy, Open Graph metadata, `llms.txt`, and the custom 404 page are generated. Older `/main/index.html`, `/main/comparison.html`, and `/comparison.html` URLs redirect to v2. The old purchased theme and demo pages are no longer built or shipped.

A deployment does not publish an npm version, change v1 maintenance, or distribute desktop installers.

## Social previews

Every rendered page includes explicit Open Graph and X card titles, descriptions,
image URLs, and image alt text. The 1200×630 PNG is copied to a content-hashed
filename during the build, so changing the image also changes its public URL.
Keep `social.svg` and `social.png` in sync; `npm run check` validates the generated
metadata and image contract across all rendered pages.

Social platforms cache page metadata separately from the deployed site. If a new
post still shows the old site, remove its preview and link, then paste a fresh
URL such as `https://oneringai.io/?v=2`. This serves the same homepage with the
same canonical URL. A fresh URL can trigger a new crawl; the website cannot purge
X's cache or guarantee when existing cards refresh. Verify the title and image
in the composer before publishing.

MIT © 2025–2026 Anton Antic · anton.antich@gmail.com
