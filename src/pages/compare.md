# Framework comparison

Compare execution, integrations, and memory models. **Reviewed 2 November 2026** against official documentation. This is an architectural comparison, not a performance benchmark.

## Overview

| Project                   | Main APIs                                                                          | Choose it for                                                                               | Check before adoption                                                                                                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OneRingAI v2 beta**     | Named connectors, agents, context plugins, entity/fact memory, and harness drivers | A TypeScript library combining authentication, tools, memory, media, and agent execution    | External drivers are preview. Native Agent controls do not automatically govern vendor loops.                                                                                                       |
| **LangChain / LangGraph** | Agent abstractions and stateful graphs                                             | Checkpointed workflows combining deterministic steps, agent decisions, and human interrupts | Choose the appropriate layer: LangChain, LangGraph, or Deep Agents. [1](https://docs.langchain.com/oss/javascript/langgraph/overview)                                                               |
| **Mastra**                | TypeScript agents, workflows, memory, and Studio                                   | An integrated agent application framework and workflow tooling                              | Review its memory modes, storage, and workflow runners. [2](https://mastra.ai/docs/workflows/overview) [3](https://mastra.ai/docs/memory/overview)                                                  |
| **Vercel AI SDK**         | Model APIs, UI streaming, `ToolLoopAgent`, and `HarnessAgent`                      | Web UI integration, tool loops, and established harness adapters                            | Harness adapters are also available here; compare their contracts and integration requirements. [4](https://ai-sdk.dev/docs/agents/overview) [5](https://ai-sdk.dev/docs/ai-sdk-harnesses/overview) |
| **OpenAI Agents SDK**     | Agent harness, tools, approvals, and compute options                               | Direct integration with OpenAI's agent SDK                                                  | Distinct from the Codex SDK; choose execution and continuation boundaries. [6](https://developers.openai.com/cookbook/examples/agents_sdk/migrate-from-claude-agent-sdk/readme)                     |
| **Claude Agent SDK**      | Claude Code's loop, tools, permissions, and sessions                               | A Claude workspace agent running in a process you operate                                   | The SDK, direct API, and Managed Agents have different execution ownership. [7](https://platform.claude.com/docs/en/agent-sdk/overview)                                                             |
| **CrewAI**                | Python agents, crews, tasks, and event-driven Flows                                | Python applications organized around crews and workflows                                    | Review state, persistence, branching, and deployment needs. [8](https://docs.crewai.com/en/concepts/flows)                                                                                          |
| **OpenClaw**              | Assistant Gateway, channels, and plugins                                           | A configured assistant for messaging channels                                               | Primarily a runnable product, rather than a comparable developer library. [9](https://docs.openclaw.ai/)                                                                                            |

## OneRingAI APIs

### Authentication

Named connectors share provider and service credentials across the application. Multiple accounts can coexist. Templates configure authentication; selected services add specialized tools. Your host controls access.

[Connector catalog](library/docs/CONNECTOR_TOOL_CATALOG.md) · [Execution profiles](library/docs/ENHANCED_CONNECTORS.md)

### Memory

The standalone memory system stores entities, facts, relationships, provenance, and temporal data, with graph and semantic retrieval. Compare this data model with conversation history, summaries, and semantic recall. Mastra, for example, documents observational memory, working memory, and semantic recall. [3](https://mastra.ai/docs/memory/overview)

[Memory guide](library/docs/MEMORY_GUIDE.md) · [Permissions](library/docs/MEMORY_PERMISSIONS.md)

### Task controls

V2 adds opt-in evidence storage, protected task state, loop recovery, helper models, and process-local model budgets. Usage can be unknown; cost figures are estimates. Cancellation does not prove a remote action was rolled back.

[Evidence](library/docs/DURABLE_EVIDENCE.md) · [Task state](library/docs/TASK_STATE.md) · [Budgets](library/docs/MODEL_TASKS_AND_HELPERS.md)

### Harnesses

Define an agent once, then bind a session to OneRingAI, local Codex or Claude SDKs, or managed OpenAI or Anthropic APIs. External drivers remain preview, with driver-specific capability and recovery limits. Vercel AI SDK also supports harness adapters. [5](https://ai-sdk.dev/docs/ai-sdk-harnesses/overview)

[Runtime guide](library/USER_GUIDE.md#agent-runtime-preview) · [AMOS cookbook](library/apps/amos/docs/AGENT_RUNTIME.md)

## When to choose another option

- **LangGraph:** explicit graphs, checkpointing, and interrupts. OneRingAI routines are not a general durable workflow engine. [1](https://docs.langchain.com/oss/javascript/langgraph/overview)
- **Mastra:** integrated TypeScript development tooling and workflows. [2](https://mastra.ai/docs/workflows/overview)
- **AI SDK:** frontend streaming and its model, tool-loop, and harness APIs. [4](https://ai-sdk.dev/docs/agents/overview) [5](https://ai-sdk.dev/docs/ai-sdk-harnesses/overview)
- **Vendor SDKs:** direct access to the chosen harness's native behavior. [6](https://developers.openai.com/cookbook/examples/agents_sdk/migrate-from-claude-agent-sdk/readme) [7](https://platform.claude.com/docs/en/agent-sdk/overview)
- **OpenClaw:** an assistant to configure and run. [9](https://docs.openclaw.ai/)

## Sources

Documentation was reviewed on **2 November 2026**. These summaries do not rank speed, cost, security, or popularity. Check current provider access and deployment requirements before adopting a framework. [Report a correction](https://github.com/aantich/oneringaiio/issues).

1. [LangGraph overview](https://docs.langchain.com/oss/javascript/langgraph/overview)
2. [Mastra workflows](https://mastra.ai/docs/workflows/overview)
3. [Mastra memory](https://mastra.ai/docs/memory/overview)
4. [AI SDK agents](https://ai-sdk.dev/docs/agents/overview)
5. [AI SDK harnesses](https://ai-sdk.dev/docs/ai-sdk-harnesses/overview)
6. [OpenAI SDK comparison and migration](https://developers.openai.com/cookbook/examples/agents_sdk/migrate-from-claude-agent-sdk/readme)
7. [Claude Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview)
8. [CrewAI Flows](https://docs.crewai.com/en/concepts/flows)
9. [OpenClaw overview](https://docs.openclaw.ai/)
