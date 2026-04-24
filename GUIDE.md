# 🪨⚡ Claude Code Power Pack — Complete Guide

> **For beginners and power users alike.** This guide explains what each part of the plugin does, why it matters, and exactly how to use it in your daily coding workflow.

---

## 📋 Table of Contents

1. [What Is This?](#1-what-is-this)
2. [Prerequisites](#2-prerequisites)
3. [Installation](#3-installation)
4. [What Each Feature Does — In Plain English](#4-what-each-feature-does--in-plain-english)
5. [Real-World Usage Scenarios](#5-real-world-usage-scenarios)
6. [The Status Bar Explained](#6-the-status-bar-explained)
7. [Asking Claude the Right Way](#7-asking-claude-the-right-way)
17. [Tips & Tricks](#17-tips--tricks)
18. [Troubleshooting](#18-troubleshooting)
19. [Credits](#19-credits)

---

## 1. What Is This?

Claude Code is a powerful AI coding assistant. But out of the box it has some limitations:

- **It forgets** — Claude has a finite memory (called a "context window"). Once it's full, responses get worse and Claude starts forgetting earlier parts of your conversation.
- **It's verbose** — Claude often uses many words when a few would do, burning through your API budget.
- **It doesn't know which model to use** — Opus is smarter but more expensive; Haiku is cheap and fast. Picking manually every time is a chore.
- **It doesn't remember between sessions** — Each time you start Claude Code fresh, it has no idea what you were working on.

**The Claude Code Power Pack fixes all of this automatically.** It's a collection of hooks, agents, skills, and companion tool integrations that wrap around Claude Code and make it dramatically more productive, efficient, and predictable.

---

## 2. Prerequisites

You need these installed before starting:

| Tool | Why | Download |
|------|-----|----------|
| **Node.js v16+** | Runs the plugin hooks | [nodejs.org](https://nodejs.org/) |
| **Claude Code** | The AI assistant this runs on top of | [Install guide](https://docs.anthropic.com/en/docs/claude-code/overview) |
| **Git** (optional) | For cloning the repo | [git-scm.com](https://git-scm.com/) |

**Check you have them:**
```bash
node --version    # Must show v16.x.x or higher
claude --version  # Must show Claude Code version
```

---

## 3. Installation

### Step 1 — Get the plugin
```bash
git clone https://github.com/anwarshariffa2z/claude-code-power-pack.git
cd claude-code-power-pack
```

### Step 2 — Run the setup script
```bash
# Option A: Global (Recommended) — available in every project
node setup.js --global-hooks

# Option B: Local — this project only
node setup.js --register-hooks
```

This single command:
- Registers the Sequential Thinking and Context7 MCP servers
- Configures the ccstatusline terminal HUD
- Installs Caveman, Superpowers, Karpathy Skills, and double-shot-latte from their official marketplaces
- **Automatically registers hooks** in your project's `.claude/settings.json` (if `--register-hooks` is used)

> [!NOTE]
> If you use `--register-hooks`, you still need to copy the `hooks/` and `agents/` directories to your `.claude/` folder as shown in Step 3.

> **Preview first?** Run `node setup.js --dry-run` to see exactly what it would do without changing anything.

### Step 3 — Load the plugin

**Option A: Global (all projects)**
```bash
claude --plugin-dir /path/to/claude-code-power-pack
```

**Option B: Per project** — copy into your project's `.claude/` folder:
```bash
mkdir -p .claude/hooks
mkdir -p .claude/agents
cp agents/* .claude/agents/
cp hooks/* .claude/hooks/
```

If you didn't use `node setup.js --register-hooks`, you'll need to manually update `.claude/settings.json`:
```json
{
  "hooks": {
    "SessionStart":      [{ "hooks": [{ "type": "command", "command": "node .claude/hooks/session-start.js" }] }],
    "UserPromptSubmit":  [{ "hooks": [{ "type": "command", "command": "node .claude/hooks/router.js" }] }],
    "PostToolUse":       [{ "hooks": [{ "type": "command", "command": "node .claude/hooks/context-tracker.js" }] }],
    "Stop":              [{ "hooks": [{ "type": "command", "command": "node .claude/hooks/stop-guard.js" }] }]
  }
}
```

### Step 4 — Reload plugins
Inside Claude Code, run:
```
/reload-plugins
```

---

## 4. What Each Feature Does — In Plain English

### 🧠 Intelligent Model Routing (Automatic)

**What it does:** Every time you type a message to Claude, the plugin secretly scores your prompt for complexity. It then recommends the right model tier:

| Tier | When used | Examples |
|------|-----------|----------|
| **Opus** | Complex, deep work | "Refactor the entire auth system", "Design a new database schema", "Audit this code for security issues" |
| **Sonnet** | Everyday coding | "Add a login page", "Fix this bug", "Write tests for this function" |
| **Haiku** | Quick, trivial tasks | "Fix this typo", "Rename this variable", "Add a comment here" |

**Why it matters:** Opus is ~15x more expensive than Haiku. Using the right model for each task saves money without sacrificing quality.

**How you see it:** Every response starts with something like:
```
[Model Router] Task complexity score: heavy=7, light=1 → Recommended: opus
```

---

### 📊 Tool-Aware Context Tracking (Automatic)

**What it does:** Claude has a 200,000 token context window — think of it like RAM. Every file you read, every command you run, every response Claude gives costs tokens. When the window fills up, Claude's responses degrade.

This plugin tracks token usage **after every single tool call** (not just every message), so the estimate is far more accurate than turn-counting. It uses these estimates:
- A file read: characters ÷ 4
- A bash command: stdout + stderr ÷ 4
- A web search: ~2,000 tokens flat
- An edit: diff size × 0.6

**Why it matters:** Without tracking, you don't know you're at 90% until Claude starts giving strange answers. With tracking, you get warned at 50% and can act before things go wrong.

**How you see it:** Ask Claude: _"How's the context?"_ and you'll get:
```
📊 Context Dashboard
────────────────────
  Turns:       12
  Est. Tokens: 87,400 / 200,000
  Usage:       44%
  Model Tier:  sonnet
  Status:      🟡 Moderate
```

---

### 🛡️ Auto-Compaction Guard (Automatic)

**What it does:** When estimated token usage crosses 80% (160,000 tokens), the plugin takes two actions:

1. **Soft warning** — The next prompt you send includes a hidden directive telling Claude to warn you before doing more work.
2. **Hard block** — The Stop hook fires with exit code 2, which forces Claude to deliver a message asking you to run `/compact` instead of continuing.

**Why it matters:** `/compact` tells Claude Code to summarize the entire conversation into a shorter form, freeing up context while keeping the important context. Without a guard, you'd only notice the problem after Claude starts hallucinating or losing track of your codebase.

**What to do when it fires:**
```
# Just run this in Claude Code:
/compact
```

After compacting, Claude will re-read the session summary and continue as if nothing happened.

---

### 🔄 Session Memory (Automatic)

**What it does:** Every time Claude Code starts (or resumes), the `SessionStart` hook fires and injects a summary of your previous session:

```
📋 Previous Session Summary:
  • Turns completed: 23
  • Estimated tokens used: 145.2K / 200K
  • Last model tier: opus
  • Times compacted: 1

📝 Recent Task Log:
  • [opus] Refactored authentication middleware...
  • [sonnet] Added unit tests for user service...
  • [haiku] Fixed typo in README...
```

**Why it matters:** Normally, every new Claude session starts completely blank. With session memory, Claude knows what you were building, what models you were using, and what was recently accomplished — even after you close and reopen your terminal.

---

### 🤖 Pinned-Model Subagents (Available on demand)

**What it does:** Three specialist agents are available that are permanently locked to specific models:

| Agent | Model | Use when |
|-------|-------|---------|
| `opus-heavy` | Claude Opus | Architectural decisions, complex multi-file refactors, security audits |
| `sonnet-default` | Claude Sonnet | Standard features, debugging, writing tests |
| `haiku-quick` | Claude Haiku | Formatting, typos, one-line changes |

**Why they exist:** When you use `settings.json` to change models, it only applies at startup — you can't switch mid-session. These subagents run in completely separate context windows pinned to their model, so the switch actually works.

**How to use them:** Just ask Claude naturally:
> _"Delegate this refactor to your opus-heavy agent."_

Or when the Model Router recommends Opus, Claude will automatically suggest using it.

---

### 🔌 Sequential Thinking MCP Server (Available on demand)

**What it does:** Gives Claude a structured "chain of thought" tool that breaks problems into numbered steps before acting. Instead of just diving in, Claude documents its reasoning process explicitly.

**Why it matters:** For complex problems (architectural decisions, debugging tricky race conditions, designing APIs), unstructured thinking leads to mistakes. Sequential thinking forces a methodical approach.

**How to use it:** Just ask:
> _"Use sequential thinking to plan this refactor."_
> _"Think through this step by step before writing any code."_

Claude will then use the `sequentialthinking` tool to document each reasoning step before producing code.

---

### 📚 Context7 MCP Server (Available on demand)

**What it does:** Gives Claude access to live, version-specific documentation for any library or framework. Instead of relying on training data (which can be months or years old), Claude fetches the actual current docs.

**Why it matters:** APIs change. A method that existed in React 17 might be deprecated in React 19. Context7 ensures Claude's code uses the APIs that actually exist in your version.

**How to use it:** Add "use context7" to your prompt:
> _"Use context7 to look up the latest Next.js App Router docs before answering."_
> _"How do I configure Prisma 5 migrations? use context7."_

---

### 🪨 Caveman (Plugin — 75% token reduction)

**What it does:** Makes Claude respond in ultra-concise caveman-speak — same technical accuracy, dramatically fewer words. Cuts ~75% of output tokens.

**Before Caveman:**
> "The reason your React component is re-rendering is likely because you're creating a new object reference on each render cycle. When you pass an inline object as a prop, React's shallow comparison sees it as a different object every time, which triggers a re-render. I'd recommend using useMemo to memoize the object."

**After Caveman:**
> "New object ref each render. Inline prop = new ref = re-render. Wrap in useMemo."

Same fix. 75% fewer tokens. 3x faster.

**How to use it:**
```
/caveman         # Standard caveman mode
/caveman ultra   # Maximum compression
/caveman off     # Back to normal mode
```

Or always-on for your whole session: Caveman auto-activates based on your configuration after install.

---

### ✨ Superpowers (Plugin — structured planning)

**What it does:** Adds structured workflow skills to Claude — guided brainstorming, planning phases, and systematic task execution. Instead of just asking Claude to build something and hoping for the best, Superpowers gives Claude a methodology.

**How to use it:**
> _"Use the planning skill to design this feature before coding."_

Claude will walk through: problem framing → solution options → decision → implementation plan → execution.

---

### 🔧 /simplify (Native Command)

**What it does:** Analyzes your current code for unnecessary complexity — deeply nested conditionals, repeated patterns, unclear variable names — and refactors it cleanly without changing what it does. This is a built-in feature of Claude Code v2+.

**How to use it:** At the end of a long coding session:
```
/simplify
```

Run it before committing, before code review, or whenever a file starts feeling messy after many iterations.

---

### 🎯 Karpathy Skills (Plugin — disciplined coding principles)

**What it does:** Applies Andrej Karpathy's guidelines for disciplined AI-assisted coding:
1. **Think before coding** — State assumptions, present options, ask if confused
2. **Simplicity first** — Don't add unrequested features or abstractions
3. **Surgical changes** — Only modify what's needed; don't refactor unrelated code
4. **Goal-driven execution** — Turn vague tasks into verifiable goals with success criteria

**Why it matters:** Without guardrails, AI coding assistants tend to over-engineer, over-explain, and modify code they weren't asked to touch. Karpathy Skills keeps Claude focused and disciplined.

**How to use it:** It's always on once installed. Claude will automatically apply these principles. You'll notice Claude:
- Asks for clarification when your request is ambiguous instead of guessing
- Avoids touching files that aren't relevant to your request
- States its assumptions before acting

---

### ☕ double-shot-latte (Plugin — Zero Interruptions)

**What it does:** Claude Code often stops to ask "Would you like me to continue?" or "Should I proceed with the next file?". This plugin uses a secondary evaluation loop to automatically decide if it should continue working on the task you gave it.

**Why it matters:** It turns "Semi-Auto" mode into "Full-Auto" mode. You can walk away for a coffee and come back to a finished feature instead of a "Continue?" prompt.

**How to use it:** It works automatically in the background. If you want to force Claude to stop, you can still use `Ctrl+C`.

---

## 5. Real-World Usage Scenarios

### Scenario A: Starting a New Feature

You sit down to add a user authentication system to your app.

```
You: "Add JWT authentication to my Express API"
```

**What happens automatically:**
1. The **Model Router** scores "add JWT authentication" as medium complexity → recommends **Sonnet**
2. **Context Tracker** notes this is a fresh session — no warnings
3. **Session Memory** tells Claude what you were building in your last session
4. **Karpathy Skills** ensures Claude asks: "Should this be a new middleware module, or integrated into the existing auth file?"
5. **Context7** can be invoked to fetch current `jsonwebtoken` docs: _"Use context7 for jsonwebtoken v9"_

---

### Scenario B: Big Architectural Refactor

You want to refactor your entire database layer from raw SQL to Prisma.

```
You: "Migrate the entire database layer to use Prisma ORM"
```

**What happens:**
1. **Model Router** scores this very high (migrate + entire + database) → recommends **Opus**
2. Claude says: _"This is a complex migration — I'll delegate to my opus-heavy agent."_
3. The **opus-heavy subagent** handles it in an isolated context window (not consuming your main context)
4. You ask it to **think step by step**: Claude uses Sequential Thinking to map out: schema analysis → model generation → query migration → testing strategy
5. After several large file reads, the **Context Tracker** warns at 80%: _"Context is getting full — run /compact before continuing"_
6. You run `/compact`, Claude summarizes, and continues fresh

---

### Scenario C: Quick Fix During a Code Review

Your colleague spotted a typo and two small formatting issues.

```
You: "Fix typo 'recieve' → 'receive' in user.service.ts, and fix the indentation in lines 45-52"
```

**What happens:**
1. **Model Router** scores this as trivial (typo, fix) → recommends **Haiku**
2. Claude delegates to the **haiku-quick agent** — fast and cheap
3. **Caveman mode** (if on) keeps the response brief: _"Fixed. 3 chars changed."_
4. The fix takes 2 seconds and costs ~$0.001

Without the Power Pack: Claude Opus would have written 3 paragraphs explaining what a typo is.

---

### Scenario D: Long Working Session

You've been working with Claude for 3 hours. The context is getting heavy.

The **Stop Guard** fires:
```
⚠️ Context usage: ~163,000 tokens (81% of 200K window)

Before completing this response, I need to let you know our context 
window is getting full. Here's what we've accomplished so far:
- ✅ Migrated auth layer to Prisma
- ✅ Added JWT middleware
- ✅ Updated 12 controller files

I recommend running /compact to summarize and free up context.
```

You run `/compact`. Claude Code compresses the conversation. Next session, **Session Memory** picks it back up:
```
📋 Previous Session Summary:
  • Turns: 34 | Tokens: 143K | Compacts: 1
  • Recent: [opus] Migrated auth, added JWT, updated controllers
```

You continue exactly where you left off.

---

### Scenario E: Learning a New Library

You're trying to use the latest version of TanStack Query.

```
You: "How do I use the new infinite scroll query pattern in TanStack Query v5? use context7"
```

**What happens:**
1. **Context7 MCP** fetches the actual TanStack Query v5 docs — not cached training data
2. Claude gives you code using the APIs that exist right now, in v5 specifically
3. No more deprecated patterns from v4 being suggested

---

## 6. The Status Bar Explained

After setup, the bottom of your terminal shows a live status bar from **ccstatusline**:

```
⚡ main  |  🪙 $0.12  |  📊 23K tokens (11%)  |  🤖 sonnet  |  ⏱ 14m
```

| Icon | Meaning |
|------|---------|
| `⚡ main` | Current git branch |
| `🪙 $0.12` | Session cost so far |
| `📊 23K tokens (11%)` | Estimated context usage |
| `🤖 sonnet` | Current model tier |
| `⏱ 14m` | Session duration |

The token percentage turns **yellow at 50%** and **red at 75%** — matching the plugin's warning thresholds.

**Customize it:**
```bash
npx ccstatusline@latest
```
Opens an interactive TUI to pick themes, reorder widgets, change colors.

---

## 7. Triggering Models & Agents

The Power Pack's **Model Router** automatically analyzes your prompts to recommend the best model tier.

### 🧠 Triggering Opus-Heavy (Complex)
Use these keywords to trigger an Opus recommendation for deep reasoning:
*   **Keywords:** `architect`, `refactor`, `migrate`, `rewrite`, `security audit`, `performance`, `optimize`, `database schema`, `multi-file`, `design system`, `overhaul`.
*   **Structural Triggers:** Long prompts (>500 chars) or multiple code blocks.

### ⚡ Triggering Haiku-Quick (Fast)
Use these keywords for simple, low-cost tasks:
*   **Keywords:** `typo`, `formatting`, `spell check`, `rename`, `add a comment`, `quick fix`, `simple`, `remove line`, `grammar`.
*   **Structural Triggers:** Very short prompts (<80 chars).

### 🤖 Direct Subagent Spawning
You can bypass the router and spawn a sub-session directly by starting your prompt with the agent's name:
*   *"**opus-heavy**, design the database schema for X."*
*   *"**haiku-quick**, fix the typos in the README."*

---

## 8. Asking Claude the Right Way

### Use MCP servers explicitly

```
# Sequential Thinking
"Think through this step by step before writing any code."
"Use sequential thinking to plan the migration."

# Context7
"use context7 — how do I use useFormState in React 19?"
"Fetch the latest Express 5 docs via context7 before answering."
```

### Switch Caveman modes

```
/caveman        # Concise mode
/caveman ultra  # Maximum brevity
/caveman off    # Normal mode
```

### Check context health

```
"How's the context?"
"Context status"
"How full are we?"
```

### Ask Claude to delegate

```
"Delegate this to your opus-heavy agent."
"Use the haiku-quick agent for this — it's a simple rename."
"Run the native /simplify command on this file."
```

---

## 🗑️ The Zero-Waste Stack (Token Efficiency)

One of the biggest challenges in AI-assisted coding is "token bloat." Raw CLI output and verbose MCP integrations can quickly exhaust your context window. The Power Pack solves this with a multi-layered approach:

### 1. CLI over MCP (CLI-Anything)
While MCP is powerful, it often requires loading large tool schemas into the context. **CLI-Anything** advocates for a leaner approach: use specialized CLI harnesses that communicate in a concise, stateful way.
- **Benefit:** Up to 30x fewer tokens vs. equivalent MCP servers.
- **Usage:** Install the plugin, then use `/cli-anything <repo>` to build a harness. Use `npx skills add HKUDS/CLI-Anything --skill <name>` to add pre-built agent guidelines.

### 2. Output Pruning (RTK)
**RTK (Rust Token Killer)** acts as a transparent proxy that sits between Claude and your shell. It intercepts command output and prunes noise (like `npm install` progress bars, boilerplate logs, and redundant whitespace) before it reaches the model.
- **Benefit:** 60-90% token savings on common developer commands.
- **Setup:** Download the binary from [rtk-ai/rtk](https://github.com/rtk-ai/rtk) and run `rtk init --global`.

### 3. Concise Communication (Caveman)
The **Caveman** plugin enforces a "less is more" rule for Claude's own responses. By stripping away polite filler and conversational fluff, you save hundreds of tokens per turn without losing accuracy.

---

## 17. Tips & Tricks

### The "Auto-Mode" Stack
For the best automated experience, ensure you have **double-shot-latte** and **Karpathy Skills** enabled. This combination keeps Claude working autonomously while ensuring it stays disciplined and doesn't wander off-task.

### Combine /caveman and /compact
If you are in a very long session, use `/caveman ultra` to minimize future token usage, then run `/compact` to summarize what's already happened. This "resets" your context window with the most efficient possible baseline.

### Model-Specific Delegation
Don't wait for the router to suggest a model if you already know the task is complex. Starting a prompt with _"Using your opus-heavy agent, refactor..."_ ensures the right level of "brainpower" is applied from the very first turn.

---

## 18. Troubleshooting

### "MCP server not found" / Context7 not working
Run `node setup.js` again. Make sure Node.js is installed. The servers download via `npx` on first use — this requires internet access.

Verify: `claude mcp list` — you should see `sequential-thinking` and `context7`.

### Model Router always recommends Sonnet
Sonnet is the default for ambiguous prompts. It only switches to Opus for strong keywords (refactor, architect, migrate, entire, overhaul) or Haiku for trivial keywords (typo, rename, formatting). The system is conservative by design — it won't switch unless confident.

You can always delegate manually: _"Use the opus-heavy agent for this."_

### Context shows 0% even after heavy work
The tracker only counts tokens from **tool calls** (file reads, bash commands, searches), not from plain conversation. After Claude does its first `Read` or `Bash` call, the counter will start accumulating.

### Caveman mode responding normally
Caveman requires the plugin to be installed and activated. Run `/caveman` explicitly in your session, or check that the plugin is enabled: `/plugins`.

### Stop Guard firing too often
The 50% threshold is conservative. Raise it by editing `CONTEXT_THRESHOLD` in both `hooks/router.js` and `hooks/context-tracker.js`:
```javascript
const CONTEXT_THRESHOLD = 150000; // 75% instead of 50%
```

### Reset everything
Delete the state file to clear all tracked history:
```bash
# Windows
del hooks\state.json

# macOS / Linux
rm hooks/state.json
```

---

## 9. Credits

This plugin integrates the following excellent community tools — all installed from their authors' official sources:

| Tool | Author | What it does |
|------|--------|-------------|
| [ccstatusline](https://github.com/sirmalloc/ccstatusline) | [@sirmalloc](https://github.com/sirmalloc) | Terminal status bar |
| [Sequential Thinking](https://github.com/modelcontextprotocol/servers) | Anthropic / MCP team | Structured reasoning |
| [Context7](https://github.com/upstash/context7) | [Upstash](https://upstash.com) | Live library docs |
| [Caveman](https://github.com/JuliusBrussee/caveman) | [@JuliusBrussee](https://github.com/JuliusBrussee) | 75% token reduction |
| [Superpowers](https://github.com/obra/superpowers-marketplace) | [@obra](https://github.com/obra) | Planning methodology |
| [/simplify](https://docs.anthropic.com/en/docs/claude-code/overview) | Native | Built-in refactoring command |
| [Karpathy Skills](https://github.com/forrestchang/andrej-karpathy-skills) | [@forrestchang](https://github.com/forrestchang) | Disciplined coding principles |

See [CREDITS.md](CREDITS.md) for full attribution details.

---

*Built with ❤️ for the Claude Code community.*
*Plugin code by [@anwarshariffa2z](https://github.com/anwarshariffa2z) — MIT licensed.*
