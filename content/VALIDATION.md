# Website v2 validation — 2026-11-02

## Documentation reading experience — 2026-11-09

Publication follow-up — 2026-11-09: the current snapshot is
`cee8993d23c23696b81dc123fff5ae3f2a0bf3fd` (`oneringai@2.0.0-beta.2`). That
documentation-only library commit adds the required website handoff for every
v2 npm release to AGENTS, RELEASING, release readiness and the Version 2 Guide.
The library documentation check passes for 160 Markdown files, 500 TypeScript
blocks and 12 complete examples. Registry verification confirms beta.2 under
both `latest` and `next`; no new npm package is published by this update.

The homepage now introduces browser/Node portability and links prominently to
the browser setup guide. The quickstart covers browser/Worker setup, resolves
its package version from the shared snapshot and links to the current changelog.
Both website agent/release guides require docs **and** authored main-page review
and deployment for every v2 publication, including prereleases. A new regression
check ensures homepage/quickstart versions match the recorded snapshot and both
link to browser setup. All 16 checks pass; the final build emits 824 pages from
73 source documents, with 3,236 search records and zero reference warnings.
Desktop and 320px mobile QA confirms the new release highlight and quickstart
fit without horizontal page overflow, including the dark theme.

The initial documentation implementation used library commit
`7bb88ebdaeec9b47a8c6351d37986281bbde3c63` (`oneringai@2.0.0-beta.2`).
The library checkout was clean; no canonical library files were changed.
`npm run docs:sync -- ../oneringai` copied 1,397 tracked documentation and
reference files. The deterministic HTML generator, also exposed as
`npm run docs:generate`, emits 824 pages from 73 rendered source documents,
with 3,244 searchable records and zero reference warnings. Source viewers
account for most pages; these counts do not represent separately authored guides.

User Guide, Examples, API Reference, and AMOS cookbook are linked directly
below the homepage introduction, on the documentation hub, and above every
documentation page. Contents are extracted from Markdown tokens into a left
sidebar. The User Guide has 69 chapters; the API has its 19 declared categories.
Current-chapter sections expand in the sidebar, and chapter headings become
page titles without duplication. Markdown contents lists no longer occupy the
reading column. Existing contents links and the User Guide's old contents page
remain resolvable. Other references remain local, including source-line links.

Fifteen offline checks cover token-based outline extraction, duplicate heading
IDs, fenced samples, contents detection, local entry points, chapter navigation,
original source text after syntax highlighting, all generated links/fragments,
search, semantic shells, metadata, Analytics, and existing hosting contracts.
Browser QA covered the desktop layout, 390px and 320px widths with no document
overflow, mobile contents opening/closing, section navigation and highlighting,
light/dark themes, User Guide and AMOS, API deep links revealing closed details,
clipboard copying with a success toast, and a search for “browser agents”
returning 15 local results. The mobile contents control stays accessible while
scrolling. No credentials, model calls, or new hosting services were used.

The existing GitHub Pages workflow and `oneringai.io` custom domain are preserved.
The deployment run for the website commit containing this record is the
publication evidence. Local checks alone do not establish a live deployment;
verify that run and the public version/snapshot before completing the handoff.

## Original website delivery

The website uses documentation snapshot `bebdcd173f01977d48b83a4d58614ac0c788c795`
(`oneringai@2.0.0-beta.1`). That commit corrects availability/installation text in
standalone library guides after the separately verified npm beta publication.
The library documentation checker passed: 154 Markdown files, 512 TypeScript
blocks, and 10 complete examples checked against built public declarations.
No model requests or new npm publication were made for the website rebuild.

Website `npm run check` passes all seven generated-artifact checks: internal files
and fragments (including source lines and split chapters), search destinations,
v2 package/beta presentation, semantic HTML/metadata, snapshot/hosting outputs,
and comparison scope/official-source links. The build emits 813 pages from 70
rendered source documents, with 3,231 searchable records and no reference warnings.
Referenced source views are included in the page count; this is not 813 separately
authored guides. Historical design/evaluation records are source references, not
recommended integration documentation.

Browser QA covered the complete homepage, desktop/mobile layout, 390px comparison
scroll containment, mobile main/docs menus, harness bindings, search, keyboard
access, clipboard actions, persistent themes, representative documentation
chapters, source references, and the custom 404. The homepage's HTML/CSS/JS is
approximately 68 KB uncompressed; documentation search loads on demand. Fonts
use the system stack. Installation audits reported zero known vulnerabilities
in the website dependency tree. This is a scoped website result, not an audit
claim about the whole library monorepo or vendor integrations.

Comparison sources were opened and reviewed on 2 November 2026. The page gives
alternatives credit for current capabilities, including AI SDK harness adapters,
and makes no measured speed, cost, popularity, or security-superiority claims.

Publishing uses the existing GitHub Actions → GitHub Pages workflow and
`oneringai.io` custom domain. It does not change npm tags, legacy v1 maintenance,
provider entitlement, runtime preview status, or desktop distribution.

## Readability and Analytics follow-up — 2026-11-02

Reading text is now 18px, lead text 20px, secondary controls/text generally 16px,
and code 14px through shared rem tokens. Headings and authored homepage, quickstart,
application, comparison, hub, footer, and metadata copy were shortened. Verified
claims include all five runtime driver IDs, 50 authentication templates, memory's
six read/six write tools, published beta status, and provider/driver boundaries.
The AMOS source setup now installs its app dependencies explicitly. Canonical
library documentation remains sourced from the same recorded commit; its
154-file/512-block/10-example check passed again without model calls.

The previous rebuild omitted the original Google Analytics integration. This
follow-up restores property `G-0DH6CTK91N`, verified against the old homepage, in
the shared shell for every rendered page. The loader runs only on `oneringai.io`
and `www.oneringai.io`, queues the standard Google tag configuration, and guards
against duplicate loading. Local tests do not send synthetic Analytics traffic.
Two regression checks cover page-shell inclusion and production-host/duplicate
behavior. `npm run check` now passes nine checks with the same 813 pages, 70 source
documents, 3,231 search records, and zero reference warnings.

Browser checks covered desktop and 390px/320px layouts, 18px documentation text,
14px code, mobile menus, contained comparison table scrolling, light/dark themes,
and all five harness bindings. A 320px homepage overflow found during QA was
fixed without reducing reading text. These checks verify the static site and
illustrative code; they do not execute vendor integrations or prove Analytics
dashboard ingestion.

## Social preview follow-up — 2026-11-02

The reported X draft showed the old site's exact title and screenshot. A live
Twitterbot request received the current homepage and 1200×630 PNG with HTTP 200;
robots.txt allows both. This supports a stale platform card-cache diagnosis.
The shared shell now emits explicit X metadata matching Open Graph, including
the title, description, image, and alt text. Open Graph includes the canonical
page URL, site name, and image dimensions/type. The build gives social images a
content-hashed URL so image changes cannot reuse a previous image URL. The
generated-artifact checks cover every rendered page and the actual PNG bytes.
All ten website checks pass with zero reference warnings.
Refreshing an existing X card remains controlled by X; no post is published by
these checks.

## Beta.4 release website update — 2026-11-11

The homepage, quickstart, application guide and homepage metadata now describe
`oneringai@2.0.0-beta.4`: refreshed LLM/image/video/voice/embedding catalogs and
opt-in host-managed ChatGPT plan access. The model audit links explain lifecycle,
promotional pricing and adapter limits. Hosea's source instructions cover the
account model catalog, explicit billing switch and separate media credentials;
production OAuth/account eligibility remains unverified. V2 installers and
external harness previews retain their existing boundaries.

The documentation manifest pins the exact library revision and beta version.
The local build produced 830 pages, 75 source documents and 3,241 search records,
with zero reference warnings. All 16 website checks passed, including internal
links/fragments, source links, Analytics and social metadata. Chromium QA passed
at 1440px, 390px and 320px: light/dark persistence, mobile navigation, all five
harness examples, install/code copying, keyboard search, guide contents,
Examples/API/AMOS links, comparison overflow and the custom 404 page. Desktop
and mobile screenshots were visually inspected. No model calls were made.

The library's `docs/evaluations/BETA4_RELEASE_VALIDATION_2026_11_11.json` records
the verified npm publication, exact documentation snapshot, website commit,
GitHub Pages workflow and public-site verification separately.
