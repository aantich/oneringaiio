# AMOS and hosea

MIT-licensed terminal and desktop apps built with OneRingAI. Run both from source; v2 desktop installers have not been published.

These recipes use the documentation snapshot for `oneringai@{{version}}`.
The [shared coding-agent guide](library/AGENTS.md) covers current v2 APIs, plugin
registration, and host boundaries when adapting these applications.

## AMOS: terminal agent

Configure connectors, tools, permissions, and saved sessions. Native mode exposes context, routing, helpers, task state, and evidence controls. Runtime mode supports five harness bindings; external drivers remain preview.

The **[AMOS runtime cookbook](library/apps/amos/docs/AGENT_RUNTIME.md)** covers an offline host, setup, commands, files, recovery, and opt-in live runs.

```bash
# From the OneRingAI repository root
npm install
npm run build
npm install --prefix apps/amos
npm run --prefix apps/amos build
npm run --prefix apps/amos start
```

Configure a connector before making model calls. Runtime mode requires the host setup and optional SDK dependencies described in the cookbook.

[AMOS setup](library/apps/amos/README.md) · [AMOS user guide](library/apps/amos/docs/USER_GUIDE.md)

## hosea: desktop workspace

An Electron app for conversations, models, tools, and media. Supports light, dark, and system themes, plus adjustable text size.

The beta.4 source adds **Continue with ChatGPT** in first-run setup and shared
account management. It loads the selected account's available models before
creating the first agent. Eligible accounts and host OAuth consent are required;
production sign-in has not been live-verified. Signing out or hitting a plan limit
does not automatically switch billing to API keys. Media, embeddings and realtime
voice still require their own API-key connectors. Read the
[plan-access setup and boundaries](library/docs/CHATGPT_PLAN_ACCESS.md).

Run the isolated UI preview without an API key:

```bash
# From the OneRingAI repository root
npm install
npm run build
cd apps/hosea
npm install
npm run design
```

The preview uses separate data and makes no model calls by itself. Calls you initiate use your configured provider. Optional backend authentication and proxying are retained and disabled by default.

[hosea setup](library/apps/hosea/README.md) · [Design system](library/apps/hosea/docs/DESIGN_SYSTEM.md)

## Library integration

[Quickstart](start.md) · [Examples](library/examples/README.md) · [User guide](library/USER_GUIDE.md)
