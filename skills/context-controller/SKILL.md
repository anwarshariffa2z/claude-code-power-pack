---
name: context-controller
description: Proactively manages the chat context window, recommends model tiers, enforces compaction, and provides a context dashboard. Activates when context usage is high or when the user asks about context status.
---

# Context Management Protocol v2

This skill governs how you manage your context window and interact with the Context & Model Manager plugin.

## Context Dashboard

When the user asks about context status (e.g., "how's the context?", "context status", "how full are we?"), provide a dashboard:

```
📊 Context Dashboard
────────────────────
  Turns:     [from plugin data]
  Est. Tokens: [from plugin data] / 200,000
  Usage:     [percentage]%
  Model Tier: [current recommendation]
  Compacts:  [count]
  Status:    🟢 Healthy / 🟡 Moderate / 🔴 High
```

## Responding to Plugin Directives

### Model Router Recommendations
When your prompt contains `[PLUGIN: Context & Model Manager v2.0]` with a model recommendation:

1. **Opus recommended:** Say something like: "This looks like a complex task — I'll delegate it to my opus-heavy specialist agent for deeper analysis." Then use the `opus-heavy` subagent.
2. **Haiku recommended:** Say: "This is a quick fix — I'll hand it to my haiku-quick agent for fast execution." Then use the `haiku-quick` subagent.
3. **Sonnet recommended:** Proceed normally. You ARE the sonnet-tier agent in most cases.

### Context Alerts
When your prompt contains `[⚠️ CONTEXT ALERT]`:

1. **Stop** before addressing the user's actual request.
2. Inform the user: "Our context window is getting full (~X% estimated). To keep my responses accurate and prevent me from losing track of our work..."
3. Ask them to run `/compact`.
4. Provide a brief summary of what's been accomplished so far, so the compaction preserves the important context.
5. **Do not** proceed with new work until the user confirms they've compacted or explicitly overrides.

### Stop Guard Blocking
If you receive feedback from the Stop Guard hook (via stderr) that says "Estimated context usage" is high:

1. You are being forced to continue your response. Use this continuation to:
   - Summarize the current task state
   - List key decisions and architectural context worth preserving
   - Ask the user to run `/compact`
2. This is a hard-stop mechanism — take it seriously.

## Subagent Delegation Protocol

You have three specialist subagents available:

| Agent | Model | Best For |
|-------|-------|----------|
| `opus-heavy` | Opus | Architecture, refactors, multi-file rewrites, security audits |
| `sonnet-default` | Sonnet | Standard features, debugging, tests, general coding |
| `haiku-quick` | Haiku | Typos, formatting, renames, one-liners, comments |

**Rules:**
- Delegate when the plugin recommends a non-sonnet tier.
- Each subagent runs in its own isolated context window — this is a superpower for preserving your main context.
- The subagent's result comes back as a summary, not raw tool calls — so delegation actually **saves** your context budget.
- If a task is ambiguous, default to handling it yourself (sonnet behavior).

## Post-Compact Behavior

After the user runs `/compact`:
- The SessionStart hook will re-bootstrap with session memory on the next prompt.
- Acknowledge the compaction: "Context has been freed up. I can see from the session bootstrap that we previously worked on [X]. Let's continue."

## Bundled MCP Servers

### Sequential Thinking
The `sequential-thinking` MCP server is bundled and starts automatically. Use it for:
- **Complex problem decomposition** — Break multi-step tasks into logical phases
- **Architecture planning** — Structure your reasoning before writing code
- **Debugging** — Methodically trace through cause-and-effect chains

**How to invoke:** When facing a complex task, tell the user: "Let me use sequential thinking to break this down step by step." The server provides a `sequentialthinking` tool that documents each reasoning step.

**When NOT to use:** Simple fixes, one-liners, or tasks that are clearly straightforward. Don't add overhead for trivial work.

### Context7
The `context7` MCP server provides live, version-specific documentation for libraries and frameworks. Use it when:
- The user asks about a specific library API and you're not 100% sure of the current syntax
- You need to verify that a method/function still exists in the latest version
- Working with less common libraries where your training data may be stale

**How to invoke:** Use the `resolve-library-id` tool to find the library, then `get-library-docs` to fetch the relevant documentation.

**When NOT to use:** For well-known, stable APIs (e.g., Node.js core, basic HTML/CSS). Only invoke when version-specific accuracy matters.

## Enhanced Tools (If Installed)

### code-simplifier (`/simplify`)
If the code-simplifier plugin is installed, suggest running `/simplify` when:
- A file has grown complex after multiple iterative edits
- You notice deeply nested conditionals, repetitive patterns, or unclear variable names
- Before a pull request or code review — as a cleanup pass
- After a long AI-assisted coding session to clean up "entropy"

**Guidance:** Say something like: "This module has gotten complex after our changes. You might want to run `/simplify` to clean it up before committing."

### Superpowers
If the Superpowers plugin is installed, its structured workflow skills (brainstorming, planning, testing) are automatically available. These complement your existing model routing by providing methodology on top of model selection.

