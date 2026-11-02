# A first agent. Then your application.

Install the published **v2 beta**, configure a named connector, and run a managed agent. You can add tools, memory, and execution controls as your application needs them.

## Install

Use Node.js **22.13+ or 24+**. ESM, CommonJS, and TypeScript declarations are included.

```bash
npm install oneringai
```

The package is **`oneringai@2.0.0-beta.1`**, without a scope. Both `latest` and `next` currently select this beta. Pin the version for reproducible deployments. This is not a stable 2.0.0 release.

## Configure and run

Set `OPENAI_API_KEY` in your environment. Load your application's environment configuration before this code; the library does not load `.env` automatically. Model requests use the provider's billing.

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

This is TypeScript: run it with your normal TypeScript toolchain. Replace the connector and model to use another supported provider; capability and endpoint constraints still apply.

## Pick your next step

- **Connect business systems:** use a named service connector and [connector tools](library/docs/CONNECTOR_TOOL_CATALOG.md).
- **Remember more than a conversation:** explore the [entity/fact memory system](library/docs/MEMORY_GUIDE.md).
- **Control long tasks:** start with [v2 adoption guidance](library/docs/VERSION_2_GUIDE.md), [evidence](library/docs/DURABLE_EVIDENCE.md), and [helper budgets](library/docs/MODEL_TASKS_AND_HELPERS.md).
- **Switch whole harnesses:** read the [runtime chapter](library/USER_GUIDE.md#agent-runtime-preview) and run the [AMOS cookbook](library/apps/amos/docs/AGENT_RUNTIME.md).
- **Try without provider calls:** the [examples index](library/examples/README.md) identifies deterministic offline examples and separately opt-in live modes.

## Upgrading from v1

V1's `@everworker/oneringai` and v2's `oneringai` are different npm packages. Upgrading requires changing the dependency and imports, checking optional SDK peers, and reviewing enabled features. Existing `Agent.create()` defaults remain supported wherever documented. Most new policies are opt-in.

[Follow the package migration guide](library/docs/PACKAGE_MIGRATION.md) · [Read the v2 release notes](library/CHANGELOG.md#200-beta1--2026-11-02)
