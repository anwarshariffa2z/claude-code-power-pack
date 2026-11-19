# Claude Code Power Setup Guide
### A2Z Ship Stores — Anwar Sheriff

---

## What This Guide Covers

Everything configured in this session, in order of execution:

1. Karpathy Guidelines → **DONE**
2. Model Strategy (Sonnet default + Opus architect agent)
3. Permission Fix (stop Sonnet asking constantly)
4. PowerShell profile aliases (one command startup)
5. Architect agent for a2z-webapp

---

## Step 1 — Karpathy Guidelines ✅ ALREADY DONE

Appended to `~/.claude/CLAUDE.md`. Active from next session onwards.
Verify anytime:
```powershell
Get-Content "$env:USERPROFILE\.claude\CLAUDE.md" | Measure-Object -Line
# Should show 57 lines
```

---

## Step 2 — Set Sonnet as Global Default Model

```powershell
claude config set model sonnet
```

Verify:
```powershell
claude config get model
# Should return: sonnet
```

**Why:** Sonnet handles 90% of tasks well and preserves your Max quota. Opus is reserved for the architect agent only.

---

## Step 3 — Fix Sonnet Permission Prompts

Create or edit `~/.claude/settings.json`:

```powershell
# Open in notepad to edit
notepad "$env:USERPROFILE\.claude\settings.json"
```

Paste this content (or merge with existing):

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(node *)",
      "Bash(ls *)",
      "Bash(cat *)",
      "Bash(mkdir *)",
      "Bash(cp *)",
      "Bash(mv *)",
      "Bash(touch *)",
      "Bash(echo *)"
    ]
  },
  "model": "sonnet"
}
```

**Why:** These are safe, repetitive commands Sonnet prompts for constantly. Whitelisting them globally gives you ~90% fewer prompts without disabling safety on anything that matters (git push, env files, network calls still prompt).

---

## Step 4 — Set acceptEdits as Default Permission Mode

Add this to your `settings.json` (merge with Step 3):

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(node *)",
      "Bash(ls *)",
      "Bash(cat *)",
      "Bash(mkdir *)",
      "Bash(cp *)",
      "Bash(mv *)",
      "Bash(touch *)",
      "Bash(echo *)"
    ],
    "defaultMode": "acceptEdits"
  },
  "model": "sonnet"
}
```

**What acceptEdits does:**
- ✅ Auto-approves all file edits
- ✅ Auto-approves: mkdir, touch, rm, rmdir, mv, cp, sed
- ⚠️ Still prompts for: git push, npm install, network requests
- 🔒 Never auto-approves: .env files, .git folder, Claude config

---

## Step 5 — Set CLAUDE_CODE_SUBAGENT_MODEL Permanently

This routes all swarm subagents to Sonnet by default (Opus only fires for the architect agent you define in Step 6).

```powershell
# Open your PowerShell profile
notepad $PROFILE
```

Add these lines:
```powershell
# Claude Code — subagents default to Sonnet
$env:CLAUDE_CODE_SUBAGENT_MODEL = "sonnet"

# Quick launch alias
function cc { claude --model sonnet --permission-mode acceptEdits @args }
```

Save and reload:
```powershell
. $PROFILE
```

Now just type `cc` to start Claude Code with the right model and permission mode every time.

---

## Step 6 — Create Architect Agent (a2z-webapp only)

This agent fires automatically on Opus when Claude needs heavy reasoning inside your swarm.

```powershell
# Navigate to your project
cd path\to\a2z-webapp

# Create agents folder if it doesn't exist
mkdir .claude\agents -ErrorAction SilentlyContinue
```

Create the file `.claude\agents\architect.md`:

```powershell
notepad .claude\agents\architect.md
```

Paste this content:

```markdown
---
name: architect
model: opus
description: Use for system design, architecture decisions, complex debugging, planning multi-file changes, Supabase schema design, Gemini AI integration planning, and any task requiring deep reasoning.
---

You are the architect agent for the A2Z Ship Stores web application (a2z-webapp).

Use Opus reasoning for:
- Supabase schema decisions and RLS policies
- Next.js architecture and routing decisions  
- Gemini AI supplier discovery logic
- Planning multi-file or multi-component changes
- Complex bug investigation across the stack
- Reviewing and validating other agents' work

Keep responses focused. State your reasoning, give a clear plan, then hand back to the implementation agents.
```

**Why this works:** Every other swarm agent runs on Sonnet. Only when Claude explicitly spawns the architect (for heavy tasks) does Opus get used — preserving your quota.

---

## Step 7 — Add Model Strategy to Global CLAUDE.md

```powershell
notepad "$env:USERPROFILE\.claude\CLAUDE.md"
```

Add this section at the **top** of the file (before the Karpathy guidelines):

```markdown
## Model Strategy
- Default model: Sonnet for all tasks
- Spawn architect agent (Opus) only for: system design, complex debugging, 
  architecture decisions, multi-file planning, schema design
- Use Haiku for: simple lookups, boilerplate, quick validations
- Never use Opus for the main session — reserve it for architect subagent only
- Run swarm agents on Sonnet by default

## Permissions
- acceptEdits mode is default
- Pre-approved: git, npm, npx, node, ls, cat, mkdir, cp, mv, touch
- Always prompt for: git push, env file writes, network requests, deployments

```

---

## Final Verification Checklist

Run these to confirm everything is set up correctly:

```powershell
# 1. Check model default
claude config get model
# Expected: sonnet

# 2. Check CLAUDE.md line count
Get-Content "$env:USERPROFILE\.claude\CLAUDE.md" | Measure-Object -Line
# Expected: ~70+ lines (57 + your new model strategy section)

# 3. Check settings.json exists and is valid
Get-Content "$env:USERPROFILE\.claude\settings.json"
# Expected: JSON with permissions.allow array and defaultMode

# 4. Check subagent env var loaded
echo $env:CLAUDE_CODE_SUBAGENT_MODEL
# Expected: sonnet

# 5. Check architect agent exists (inside a2z-webapp)
Test-Path ".\.claude\agents\architect.md"
# Expected: True
```

---

## How It All Works Together

```
You type: cc
    ↓
Claude Code starts on Sonnet + acceptEdits mode
    ↓
Swarm spins up → all workers on Sonnet (CLAUDE_CODE_SUBAGENT_MODEL)
    ↓
Heavy task detected → architect agent spawned → runs on Opus
    ↓
Opus does the thinking → hands plan back to Sonnet workers
    ↓
File edits / git / npm → auto-approved (no prompts)
Git push / .env writes → still prompts (safety preserved)
```

---

## Both CLAUDE.md Files Are Always Active

| File | Scope | Contains |
|------|-------|----------|
| `~/.claude/CLAUDE.md` | Global — every project | Model strategy + Karpathy guidelines |
| `a2z-webapp/CLAUDE.md` | Project only | Handover workflow, /handover command, dev branch rules |

Both load simultaneously at session start. Project file takes priority if there's a conflict.

---

## Quick Reference Card

| What | Command |
|------|---------|
| Start Claude Code | `cc` |
| Switch to Opus mid-session | `/model opus` |
| Cycle permission modes | `Shift+Tab` |
| Check loaded memory | `/memory` |
| Check current model | `/model` |
| View permissions | `/permissions` |
