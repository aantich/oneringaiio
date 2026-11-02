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
