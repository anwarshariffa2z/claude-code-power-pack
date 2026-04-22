# 🚀 Beginner's Guide: Claude Code Power Pack

Welcome! This guide will take you from zero to a fully supercharged Claude Code setup. No prior experience needed.

---

## 📋 What You're Getting

This plugin gives Claude Code **7 superpowers** out of the box:

| # | Feature | What It Does |
|---|---------|-------------|
| 1 | **Context Tracking** | Monitors how much of Claude's memory (context window) you've used |
| 2 | **Auto-Compaction** | Forces a cleanup when memory gets too full, so Claude stays accurate |
| 3 | **Model Routing** | Automatically picks the right Claude model (Opus/Sonnet/Haiku) for each task |
| 4 | **Session Memory** | Remembers what you were working on between sessions |
| 5 | **Sequential Thinking** | Gives Claude a structured "think step by step" tool for complex problems |
| 6 | **Context7 Docs** | Gives Claude access to live, up-to-date library documentation |
| 7 | **Status Bar** | Shows token usage, cost, git branch, and more at the bottom of your terminal |

---

## 🛠️ Prerequisites

Before you start, make sure you have:

- [ ] **Node.js** (v16 or higher) — [Download here](https://nodejs.org/)
- [ ] **Claude Code** installed — [Install guide](https://docs.anthropic.com/en/docs/claude-code/overview)
- [ ] **Git** (optional, for cloning) — [Download here](https://git-scm.com/)

### How to check if you have them:
```bash
node --version    # Should show v16.x.x or higher
claude --version  # Should show Claude Code version
git --version     # Should show git version (optional)
```

---

## 📥 Step 1: Get the Plugin

### Option A: Clone from GitHub (Recommended)
```bash
git clone https://github.com/anwarshariffa2z/claude-code-power-pack.git
cd claude-code-power-pack
```

### Option B: Download ZIP
1. Go to https://github.com/anwarshariffa2z/claude-code-power-pack
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract it somewhere you'll remember

---

## ⚡ Step 2: Run the Setup Script

Open a terminal in the plugin folder and run:

```bash
node setup.js
```

This will automatically:
- ✅ Register the **Sequential Thinking** MCP server
- ✅ Register the **Context7** MCP server  
- ✅ Configure **ccstatusline** (if not already set up)
- 📋 Print commands you need to run for the remaining plugins

### What you'll see:
```
╔══════════════════════════════════════════════════════════════╗
║     Context & Model Manager — Plugin Setup v2.1             ║
╚══════════════════════════════════════════════════════════════╝

Step 1: MCP Servers (via CLI)
  ✔ sequential-thinking — Structured step-by-step reasoning
  ✔ context7 — Live library documentation lookup

Step 2: ccstatusline (Terminal Status Bar)
  ✔ statusLine configured

Step 3: Claude Code Plugins (Manual)
  Run these inside Claude Code...
```

> **💡 Tip:** Run `node setup.js --dry-run` first if you want to preview what it does without making changes.

---

## 🔌 Step 3: Load the Plugin in Claude Code

Start Claude Code with the plugin directory:

```bash
claude --plugin-dir /path/to/claude-code-power-pack
```

**Or** copy the files into your project:
```bash
# From inside your project folder:
cp -r /path/to/claude-code-power-pack/agents .claude/agents
cp -r /path/to/claude-code-power-pack/skills .claude/skills
cp -r /path/to/claude-code-power-pack/hooks .claude/hooks
```

Then add hooks to your project's `.claude/settings.json`:
```json
{
  "hooks": {
    "SessionStart": [{ "hooks": [{ "type": "command", "command": "node .claude/hooks/session-start.js" }] }],
    "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "node .claude/hooks/router.js" }] }],
    "PostToolUse": [{ "hooks": [{ "type": "command", "command": "node .claude/hooks/context-tracker.js" }] }],
    "Stop": [{ "hooks": [{ "type": "command", "command": "node .claude/hooks/stop-guard.js" }] }]
  }
}
```

---

## 🎯 Step 4: Install Companion Plugins (Optional but Recommended)

Open Claude Code and type these commands:

```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
/plugin install code-simplifier@superpowers-marketplace
/reload-plugins
```

This adds:
- **Superpowers** — Structured planning and brainstorming workflows
- **code-simplifier** — The `/simplify` command for cleaning up messy code

---

## 🎨 Step 5: Customize ccstatusline (Optional)

If you want to customize the look of your terminal status bar:

```bash
npx ccstatusline@latest
```

This opens an interactive setup where you can:
- Pick a theme (Tokyo Night, Catppuccin, Gruvbox, etc.)
- Choose which widgets to show (tokens, cost, git branch, etc.)
- Preview your status bar in real-time

---

## ✅ Step 6: Verify Everything Works

### Check MCP Servers
```bash
claude mcp list
```
You should see `sequential-thinking` and `context7` in the list.

### Check Inside Claude Code
Type `/mcp` inside Claude Code — both servers should appear as active.

### Test the Model Router
Try different prompts and watch the model recommendation:
- **Simple:** "Fix this typo" → Should recommend **Haiku**
- **Normal:** "Add a login page" → Should recommend **Sonnet**
- **Complex:** "Refactor the entire authentication system" → Should recommend **Opus**

### Check Context Tracking
After a few interactions, ask Claude: **"How's the context?"**
You should see a dashboard like:
```
📊 Context Dashboard
────────────────────
  Turns:     5
  Est. Tokens: 12,450 / 200,000
  Usage:     6%
  Model Tier: sonnet
  Status:    🟢 Healthy
```

---

## 🗺️ How It Works (The Big Picture)

```
You type a prompt
       ↓
┌─────────────────────────┐
│  UserPromptSubmit Hook  │ ← router.js scores your prompt
│  (Model Router)         │   and recommends Opus/Sonnet/Haiku
└──────────┬──────────────┘
           ↓
    Claude processes it
           ↓
┌─────────────────────────┐
│  PostToolUse Hook       │ ← context-tracker.js estimates
│  (Context Tracker)      │   tokens used by each tool call
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│  Stop Hook              │ ← stop-guard.js blocks Claude if
│  (Stop Guard)           │   context exceeds 50% — asks you
└──────────┬──────────────┘   to run /compact
           ↓
    Response delivered
    (with status bar showing live stats)
```

---

## ❓ Troubleshooting

### "MCP server not found"
Make sure you ran `node setup.js` and have Node.js installed. The MCP servers use `npx` to download packages on first use.

### "Context tracker shows 0 tokens"
This is normal for a fresh session. The tracker only counts tokens after tool calls (file reads, searches, etc.), not plain conversation.

### "Model router always says Sonnet"
Sonnet is the default for most prompts. The router only recommends Opus for heavy keywords (refactor, architect, migrate) or Haiku for trivial ones (typo, rename, formatting).

### "Status bar not showing"
Make sure ccstatusline is installed: `npx ccstatusline@latest`. Then restart Claude Code.

### Reset everything
Delete the state file to start fresh:
```bash
# Windows
del hooks\state.json

# macOS/Linux
rm hooks/state.json
```

---

## 📚 Further Reading

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/overview)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [ccstatusline on npm](https://www.npmjs.com/package/ccstatusline)

---

**Made with ❤️ for the Claude Code community**
