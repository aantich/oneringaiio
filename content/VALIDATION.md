# Website v2 validation — 2026-11-02

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
