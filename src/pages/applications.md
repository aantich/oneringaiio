# See the library at work.

Two open-source applications show how OneRingAI fits into a useful product. Both are MIT licensed and live alongside the library. They are source applications; the library's npm publication does not imply a signed desktop release or complete live validation of every runtime.

## AMOS — your terminal agent

AMOS combines named connectors, tools, permissions, context, and saved sessions in a terminal application. Native mode exposes OneRingAI's context, routing, helpers, presets, task state, and evidence controls. Runtime mode hosts the same logical assistant through different harness bindings.

**Start with the [AMOS runtime cookbook](library/apps/amos/docs/AGENT_RUNTIME.md).** It includes a ready-to-run offline host, exact setup, five driver profiles, activity inspection, files, recovery, and explicitly opt-in live execution.

```bash
# In a OneRingAI source checkout
npm install
npm run build
npm run --prefix apps/amos build
npm run --prefix apps/amos start
```

Configure a connector in AMOS before making real model calls. Runtime mode has additional setup, optional SDK peers, host configuration, and platform constraints documented in the cookbook.

[AMOS application guide](library/apps/amos/README.md) · [Complete AMOS user guide](library/apps/amos/docs/USER_GUIDE.md)

## hosea — a desktop workspace

hosea is the Electron application for conversations, agents, model connections, tools, and media. Its monochrome design system supports light, dark, and system themes with adjustable text size. The interface lives in the app itself.

You can explore its isolated design preview without an API key:

```bash
# In a OneRingAI source checkout
npm install
npm run build
cd apps/hosea
npm install
npm run design
```

The preview uses isolated data and does not make model calls by itself. Calls you initiate use the provider and billing you configure. Optional backend auth/proxy infrastructure is preserved and disabled by default for future integration. New installers have not been published as part of this redesign.

[hosea setup and application guide](library/apps/hosea/README.md) · [Design system](library/apps/hosea/docs/DESIGN_SYSTEM.md)

## Build your own

Applications use public APIs and host-owned credentials and authorization. Start with the [quickstart](start.md), choose a [runnable example](library/examples/README.md), or browse the [complete user guide](library/USER_GUIDE.md).
