# ⚡ Claude Code Power Pack

> A full-lifecycle Claude Code plugin that automatically manages context usage, intelligently routes tasks to the right model tier, enforces compaction before context saturation, and bundles essential MCP servers and companion tools.

**📖 New here? Read the [Beginner's Guide](GUIDE.md) for step-by-step setup instructions.**

## Features

### 🧠 Intelligent Model Routing
Every prompt is scored using a weighted keyword and structural analysis system:
- **Opus** (heavy): Architecture, refactors, multi-file rewrites, schema migrations
- **Sonnet** (balanced): Standard implementation, debugging, features, tests
- **Haiku** (quick): Typos, formatting, renames, one-liner fixes

The plugin recommends the tier transparently in the prompt — no silent configuration hacking.

### 📊 Tool-Aware Context Tracking
Instead of counting turns (which is inaccurate), the `PostToolUse` hook fires after **every tool call** and estimates consumed tokens based on tool output size:
- File reads: `chars / 4`
- Bash output: `stdout + stderr / 4`
- Search results: flat ~2000 tokens
- Edits/Writes: diff-based estimation

This gives a realistic picture of how full your context window actually is.

### 🛡️ Auto-Compact Enforcement
When estimated tokens exceed 50% of 200K (100,000 tokens):
1. The **UserPromptSubmit** hook soft-warns Claude in the prompt
2. The **Stop** hook hard-blocks Claude from completing its response (exit code 2)
3. Claude is forced to ask you to run `/compact` before continuing

### 🔄 Session Memory
The **SessionStart** hook reads state from the previous session and injects it as context:
- Previous turn count and token usage
- Last model recommendation
- Recent task log (last 5 items)
- Compact count

### 🤖 Pinned-Model Subagents
Three custom agents with model fields that **actually work** (unlike settings.json which is snapshotted at startup):

| Agent | Model | Use Case |
|-------|-------|----------|
| `opus-heavy` | Opus | Complex architectural work |
| `sonnet-default` | Sonnet | General purpose coding |
| `haiku-quick` | Haiku | Quick fixes and simple tasks |

Claude auto-delegates to these based on the router's recommendation and the agent description matching.

### 🔌 MCP Servers (Auto-registered via CLI)
Registered in your user-level settings by `node setup.js` using `claude mcp add`:

| Server | Package | Purpose |
|--------|---------|---------|
| `sequential-thinking` | `@modelcontextprotocol/server-sequential-thinking` | Structured step-by-step reasoning |
| `context7` | `@upstash/context7-mcp` (free tier) | Live, version-specific library docs |

Verify with `claude mcp list` or `/mcp` inside Claude Code.

### 🛠️ Companion Plugins (Installed from authors' official marketplaces)
All plugins are fetched from their original authors' marketplaces — nothing is redistributed here:

| Plugin | Author | What It Does |
|--------|--------|-------------|
| 🪨 [Caveman](https://github.com/JuliusBrussee/caveman) | [@JuliusBrussee](https://github.com/JuliusBrussee) | Cuts ~75% of output tokens — same accuracy, way fewer words |
| 🔧 [/simplify](https://docs.anthropic.com/en/docs/claude-code/overview) | Native | Built-in command — multi-agent refactoring pipeline |
| ✨ [Superpowers](https://github.com/obra/superpowers-marketplace) | [@obra](https://github.com/obra) | Structured planning and workflow methodology |
| ☕ [double-shot-latte](https://github.com/obra/double-shot-latte) | [@obra](https://github.com/obra) | Zero-interruption mode — automatically continues working |
| 🚀 [CLI-Anything](https://github.com/HKUDS/CLI-Anything) | [@HKUDS](https://github.com/HKUDS) | "CLI over MCP" — 30x token savings via lean harnesses |
| ✂️ [RTK](https://github.com/rtk-ai/rtk) | [@rtk-ai](https://github.com/rtk-ai) | Rust Token Killer — prune 60-90% of output noise |
| 🎯 [Karpathy Skills](https://github.com/forrestchang/andrej-karpathy-skills) | [@forrestchang](https://github.com/forrestchang) | Disciplined coding: think first, surgical changes, no over-engineering |

## Installation

### ⚡ Quick Start (Automated)
The easiest way to set up the Power Pack is using the included `setup.js` script.

**Option A: Global (Recommended)**
Registers hooks and agents globally so they are available in every project automatically.
```bash
node setup.js --global-hooks
```

**Option B: Local**
Registers hooks and agents for the current project only.
```bash
node setup.js --register-hooks
```

### Manual Installation (Optional)
If you prefer manual control, copy the `agents/` and `hooks/` directories into your project's `.claude/` folder and add the hook configuration to your `.claude/settings.json` pointing to those files.

### Companion Tools Setup

#### Automatic (ccstatusline)
```bash
node setup.js           # Full setup — writes ccstatusline config to ~/.claude/settings.json
node setup.js --dry-run # Preview changes without writing
```

#### Manual (Claude Code Plugins)
Run these commands **inside Claude Code**:
```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
/plugin install code-simplifier@superpowers-marketplace
/plugin install double-shot-latte@superpowers-marketplace
/reload-plugins
```

## Architecture

```
Plugin
├── plugin.json ────────► Plugin manifest (hooks config)
├── setup.js ───────────► One-time setup: registers MCP servers via CLI,
│                          configures ccstatusline, prints plugin install commands
├── SessionStart ───────► session-start.js ───► Injects memory + tool list into context
├── UserPromptSubmit ───► router.js ──────────► Scores prompt, recommends tier, warns if high
├── PostToolUse ────────► context-tracker.js ─► Estimates tokens from every tool output
├── Stop ───────────────► stop-guard.js ──────► Blocks completion if context > 50%
├── Skills
│   └── context-controller/SKILL.md ─────────► Governs context behavior + MCP usage guidance
└── Agents
    ├── opus-heavy.md ──── Pinned to Opus model
    ├── sonnet-default.md ── Pinned to Sonnet model
    └── haiku-quick.md ──── Pinned to Haiku model
```

## Configuration

### Tuning the Context Threshold
Edit `CONTEXT_THRESHOLD` in both `router.js` and `context-tracker.js`:
const CONTEXT_THRESHOLD = 160000; // Default: 80% of 200K. Adjust as needed.

### Tuning Model Scoring
Edit the `SCORING` object in `router.js` to add/remove/reweight keywords for your workflow.

### Adjusting Turn History
The task log in `state.json` keeps the last 20 entries. Adjust in `router.js`:
```javascript
if (state.taskLog.length > 20) {
  state.taskLog = state.taskLog.slice(-20);
}
```

## Requirements
- **Node.js** (v16+) — Required for all hook scripts
- **Claude Code** with plugin/hooks support
- API access to desired model tiers (Opus, Sonnet, Haiku)

## State File
All plugin state is stored in `hooks/state.json`:
```json
{
  "turns": 0,
  "estimatedTokens": 0,
  "contextWarning": false,
  "lastModel": "sonnet",
  "taskLog": [],
  "sessionId": "session_...",
  "compactCount": 0,
  "lastSessionSummary": ""
}
```

Reset by deleting this file or running: `echo '{}' > hooks/state.json`

---

## 🙏 Credits

This plugin integrates and automates setup for the following excellent community tools.
**All plugins are installed from their authors' official marketplaces — nothing is redistributed here.**

| Tool | Author | License |
|------|--------|---------|
| [ccstatusline](https://github.com/sirmalloc/ccstatusline) | [@sirmalloc](https://github.com/sirmalloc) (Matthew Breedlove) | MIT |
| [Sequential Thinking MCP](https://github.com/modelcontextprotocol/servers) | Anthropic / MCP team | MIT |
| [Context7 MCP](https://github.com/upstash/context7) | [Upstash](https://upstash.com) | MIT |
| [Caveman](https://github.com/JuliusBrussee/caveman) | [@JuliusBrussee](https://github.com/JuliusBrussee) (Julius Brussee) | MIT |
| [Superpowers](https://github.com/obra/superpowers-marketplace) | [@obra](https://github.com/obra) (Jesse Vincent) | See repo |
| [double-shot-latte](https://github.com/obra/double-shot-latte) | [@obra](https://github.com/obra) (Jesse Vincent) | See repo |
| [CLI-Anything](https://github.com/HKUDS/CLI-Anything) | [@HKUDS](https://github.com/HKUDS) | Apache-2.0 |
| [RTK](https://github.com/rtk-ai/rtk) | [@rtk-ai](https://github.com/rtk-ai) | MIT |
| [Karpathy Skills](https://github.com/forrestchang/andrej-karpathy-skills) | [@forrestchang](https://github.com/forrestchang) (Forrest Chang) | See repo |

> See [CREDITS.md](CREDITS.md) for full attribution with repository links, license details, and how each tool is used.

## 📄 License

The original code in this repository is released under the [MIT License](LICENSE).
