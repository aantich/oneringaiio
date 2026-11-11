# Quickstart

Install the v2 beta, register a connector, and run an agent.

## Install

Requires Node.js **22.13+ or 24+**. ESM, CommonJS, and TypeScript declarations are included.

```bash
npm install oneringai
```

Published version: **`oneringai@{{version}}`**. Both `latest` and `next` select this beta. Pin the version for reproducible installs.

Agents use the same API in Node.js, modern browsers, and dedicated Workers.
For browser TypeScript settings, supplied storage/auth, compatible tools, and
host boundaries, follow [Browser Agents](library/docs/BROWSER_AGENTS.md).

This beta refreshes LLM, image, video, voice and embedding catalogs. Read the
[November model audit](library/docs/MODEL_REGISTRY_REFRESH_2026_11_11.md) for
retirements, promotional pricing dates and adapter limits. Catalog metadata does
not establish account entitlement.

Eligible local applications can opt in to [ChatGPT plan access](library/docs/CHATGPT_PLAN_ACCESS.md).
The host owns OAuth, registration and rotating credentials; ordinary API-key setup
below remains supported. Production OAuth/account admission has not been live-verified.
When supplying a `context` configuration object, include its required `model` field.

## Run an agent

Set `OPENAI_API_KEY` in your environment. Load `.env` in your application if needed; OneRingAI does not load it automatically. Calls use your provider account.

```typescript
import { Agent, Connector, Vendor } from "oneringai";

Connector.create({
  name: "openai-main",
  vendor: Vendor.OpenAI,
  auth: { type: "api_key", apiKey: process.env.OPENAI_API_KEY! },
});

const agent = Agent.create({
  connector: "openai-main",
  model: "gpt-5.6-terra",
  instructions: "Be accurate and concise.",
});

try {
  const response = await agent.run("Explain connector-first architecture.");
  console.log(response.output_text);
} finally {
  agent.destroy();
}
```

Run with your TypeScript toolchain. To switch providers, register another connector and change `connector` and `model`. Supported capabilities vary by model and endpoint.

## Add capabilities

- [Connectors and tools](library/docs/CONNECTOR_TOOL_CATALOG.md): authenticated external APIs.
- [Memory](library/docs/MEMORY_GUIDE.md): entities, facts, relationships, and retrieval.
- [V2 controls](library/docs/VERSION_2_GUIDE.md): evidence, task state, model budgets, and recovery.
- [Agent runtime](library/USER_GUIDE.md#agent-runtime-preview): switch complete harnesses. External drivers are preview.
- [AMOS cookbook](library/apps/amos/docs/AGENT_RUNTIME.md): configure a host and test all five drivers.
- [Examples](library/examples/README.md): offline demonstrations and opt-in live runs.

## Upgrade from v1

Replace `@everworker/oneringai` with `oneringai` and update imports. Review optional SDK dependencies and enabled features. Existing `Agent.create()` defaults remain supported where documented.

[Migration guide](library/docs/PACKAGE_MIGRATION.md) · [Beta.4 release notes](library/CHANGELOG.md#200-beta4--2026-11-11)
