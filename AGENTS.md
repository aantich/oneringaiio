# Website agent guide

Read [README.md](README.md) before modifying this site.

- Keep the website independent of framework runtimes and provider credentials; browser examples are illustrations, not live model calls.
- Use the shared CSS tokens and page shell. Preserve keyboard access, light/dark themes, reduced-motion support, responsive layouts, and readable documentation.
- Source documentation from the recorded library commit. Correct canonical docs in `oneringai`, commit them, then run `npm run docs:sync -- <library-checkout>`. Never hand-edit generated API documentation or the snapshot cache.
- Keep internal links local and branch independent. Resolve canonical Markdown references in the generator, including split-guide fragments and source lines.
- Distinguish the published v2 beta from a stable release and external runtime previews. Host controls do not automatically govern vendor harnesses.
- Comparison claims need current official sources, a review date, and clear scope. Give alternatives credit; do not infer unsupported capabilities from missing docs or claim unmeasured performance advantages.
- Run `npm run check`, then inspect representative desktop/mobile pages in a real browser. Never use API keys or billable model calls to test this static site.
- Preserve the existing custom domain and GitHub Pages deployment. No new hosting accounts or paid services are needed.
- Preserve Google Analytics property `G-0DH6CTK91N` through the shared page shell. Load it once on the production domain; keep local previews untracked. Run the Analytics regression checks when changing scripts or templates.
