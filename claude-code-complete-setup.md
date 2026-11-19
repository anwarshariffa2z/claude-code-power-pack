# Claude Code Complete Setup Guide
### A2Z Ship Stores — Based on Your Actual Files

---

## Status Check — What's Already Done

| Item | Status | Location |
|------|--------|----------|
| Karpathy 4 guidelines | ✅ Done | `~/.claude/CLAUDE.md` |
| Context Management Rules (compact at 60/70%) | ✅ Done | `~/.claude/CLAUDE.md` |
| Session Management Rules (read todo/lessons/HANDOVER) | ✅ Done | `~/.claude/CLAUDE.md` |
| Memory compiler (hooks fire globally) | ✅ Done | `E:\Web-App\claude-memory-compiler` |
| Project CLAUDE.md (architecture + rules) | ✅ Done | `a2z-webapp/CLAUDE.md` |

---

## What Still Needs To Be Done

1. Add Model Strategy to global CLAUDE.md
2. Set Sonnet as default model
3. Create settings.json (allow rules + acceptEdits)
4. Update PowerShell profile (aliases + env vars)
5. Create architect agent
6. Create tasks/ folder structure (required by your Session Management Rules)
7. Create HANDOVER.md template
8. Split project CLAUDE.md to reduce token load
9. Add .claudeignore
10. Fix model routing conflict in project CLAUDE.md

---

## Step 1 — Add Model Strategy to Global CLAUDE.md

Open the file:
```powershell
notepad "$env:USERPROFILE\.claude\CLAUDE.md"
```

Add this section at the very TOP, before everything else:

```markdown
## Model Strategy
- **Default:** Sonnet for all tasks — never start a session on Opus
- **Architect agent (Opus):** Auto-spawned for system design, schema decisions,
  complex debugging, multi-file planning, security review
- **Haiku:** Simple lookups, summaries, renaming, formatting, quick validations
- **Never** manually switch to Opus in the main session — let the architect agent handle it
- Swarm subagents default to Sonnet unless the architect agent is explicitly needed

```

Your global CLAUDE.md final order should be:
1. Model Strategy ← add this now
2. Context Management Rules ← already there
3. Session Management Rules ← already there
4. Karpathy Guidelines (Think, Simplicity, Surgical, Goal-Driven) ← already there

---

## Step 2 — Set Sonnet as Default Model

```powershell
claude config set model sonnet
```

Verify:
```powershell
claude config get model
# Should return: sonnet
```

---

## Step 3 — Create settings.json

```powershell
notepad "$env:USERPROFILE\.claude\settings.json"
```

Paste this entire content (create fresh or replace existing):

```json
{
  "model": "sonnet",
  "permissions": {
    "defaultMode": "acceptEdits",
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
      "Bash(echo *)",
      "Bash(cd *)",
      "Bash(pwd)",
      "Bash(type *)"
    ]
  },
  "env": {
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "200000",
    "CLAUDE_CODE_SUBAGENT_MODEL": "sonnet"
  }
}
```

**What this does:**
- `acceptEdits` — auto-approves all file edits, mkdir, mv, cp without prompting
- `allow` rules — pre-approves git/npm/node commands (no more constant prompts)
- `CLAUDE_CODE_AUTO_COMPACT_WINDOW` — caps context at 200k tokens (prevents runaway token burn)
- `CLAUDE_CODE_SUBAGENT_MODEL` — all swarm agents default to Sonnet

---

## Step 4 — Update PowerShell Profile

```powershell
notepad $PROFILE
```

Add these lines at the end:

```powershell
# ── Claude Code ────────────────────────────────────────────
# Quick launch: Sonnet + acceptEdits (tokens preserved)
function cc { claude --model sonnet --permission-mode acceptEdits @args }

# Fallback: opusplan for very heavy sessions (plan=Opus, execute=Sonnet)  
function cco { claude --model opusplan --permission-mode acceptEdits @args }

# Subagent model default (backup in case settings.json env doesn't load)
$env:CLAUDE_CODE_SUBAGENT_MODEL = "sonnet"

# Context window cap (backup in case settings.json env doesn't load)
$env:CLAUDE_CODE_AUTO_COMPACT_WINDOW = "200000"
# ───────────────────────────────────────────────────────────
```

Reload immediately:
```powershell
. $PROFILE
```

**Usage:**
- `cc` — normal sessions (Sonnet, acceptEdits, tokens preserved)
- `cco` — heavy planning sessions (Opus for planning, Sonnet for execution)

---

## Step 5 — Create Architect Agent

Navigate to your project:
```powershell
cd E:\Web-App\a2z-webapp\a2z-webapp
mkdir .claude\agents -ErrorAction SilentlyContinue
notepad .claude\agents\architect.md
```

Paste this content:

```markdown
---
name: architect
model: opus
description: >
  Use for: Supabase schema design, RLS policy decisions, Next.js architecture,
  Gemini AI integration planning, multi-file refactoring, complex bug root cause
  analysis, security review, financial logic validation, and any task requiring
  deep multi-step reasoning across the A2Z stack.
---

You are the architect agent for A2Z Ship Stores web application.

## Your Responsibilities
- Design and validate Supabase schemas, views, and RLS policies
- Plan multi-file or multi-component changes before implementation
- Debug complex issues that span multiple layers (DB → API → UI)
- Review architecture decisions for the maritime ERP stack
- Validate financial calculations and payment lifecycle logic
- Security review for API routes and auth patterns

## Project Context
- Stack: Next.js 16, React 19, TypeScript (strict), Supabase, Gemini AI, Vercel
- Multi-entity: entity_id 1=India, 2=UAE, 3=Sri Lanka — always filter by entity_id
- Financial: invoice_balances and ledger_entries views drive all calculations
- Public routes: /portal, /supplier-portal, /rfq, /epod, /track, /tracker

## Output Format
State your reasoning clearly. Produce a step-by-step implementation plan.
Hand back to Sonnet agents for actual code execution.
Keep responses focused — plan, don't implement unless explicitly asked.
```

---

## Step 6 — Create tasks/ Folder Structure

Your global CLAUDE.md Session Management Rules reference `tasks/todo.md` and `tasks/lessons.md` — these must exist or Claude will error at session start.

```powershell
cd E:\Web-App\a2z-webapp\a2z-webapp
mkdir tasks -ErrorAction SilentlyContinue
```

Create `tasks/todo.md`:
```powershell
notepad tasks\todo.md
```

Paste:
```markdown
# A2Z Webapp — Task List

## Active
<!-- Claude writes tasks here during sessions -->

## Completed
<!-- Tick off items here -->

## Backlog
<!-- Future tasks parked here -->
```

Create `tasks/lessons.md`:
```powershell
notepad tasks\lessons.md
```

Paste:
```markdown
# A2Z Webapp — Lessons Learned

<!-- Claude appends lessons here after corrections -->
<!-- Format: ## YYYY-MM-DD — [brief title] -->
<!-- Include: what went wrong, root cause, how to avoid -->
```

---

## Step 7 — Create HANDOVER.md Template

Your Session Management Rules also reference `HANDOVER.md`. Create it:

```powershell
notepad HANDOVER.md
```

Paste:
```markdown
# HANDOVER — A2Z Webapp

**Last updated:** <!-- Claude updates this -->
**Branch:** dev
**Session ended:** <!-- timestamp -->

## Last Known State
<!-- What was being worked on when session ended -->

## Pending Tasks
<!-- Tasks in progress, not yet in todo.md -->

## Important Context
<!-- Anything Claude must know before continuing -->

## Last Error / Blocker
<!-- If session ended due to an issue -->
```

---

## Step 8 — Split Project CLAUDE.md to Reduce Token Load

**The problem:** Your project `CLAUDE.md` is ~200+ lines and loads every session.
The Architecture, Operations, and Environment sections alone are ~120 lines of
tokens you pay for even when doing a simple UI fix.

**The fix:** Move heavy sections to separate files, reference with `@` only when needed.

### Step 8a — Create reference files

```powershell
mkdir docs\context -ErrorAction SilentlyContinue
```

Create `docs\context\architecture.md` — move the Architecture section from CLAUDE.md:
```powershell
notepad docs\context\architecture.md
```

Cut from CLAUDE.md and paste: everything under `## Architecture` (Stack, Directory Layout,
Auth & Middleware, Supabase Client Pattern, Vercel Cron Jobs, Path Alias).

Create `docs\context\operations.md` — move the Operations section:
```powershell
notepad docs\context\operations.md
```

Cut from CLAUDE.md and paste: everything under `## Operations` (Backup, Disaster Recovery).

Create `docs\context\env-vars.md` — move environment variables:
```powershell
notepad docs\context\env-vars.md
```

Cut from CLAUDE.md and paste: everything under `## Environment Variables`.

### Step 8b — Update project CLAUDE.md to use references

After moving content out, add this to the bottom of project CLAUDE.md:

```markdown
## Reference Files (load on demand with @)
- `@docs/context/architecture.md` — Stack, directory layout, auth patterns, Supabase client usage
- `@docs/context/operations.md` — Backup runbooks, disaster recovery, DR drill schedule
- `@docs/context/env-vars.md` — All required environment variables
```

**Result:** Project CLAUDE.md drops from ~200 lines to ~80 lines.
You load architecture details only when actually working on architecture,
not during every simple bug fix or UI task.

---

## Step 9 — Add .claudeignore

Prevents Claude from reading unnecessary files into context (node_modules,
build artifacts, archive files all waste tokens if Claude explores the codebase).

```powershell
notepad .claudeignore
```

Paste:
```
# Build output
.next/
out/
dist/
build/

# Dependencies
node_modules/

# Archives and temp files
archive/
*.log
*.txt
*.sql

# Large generated files
.nyc_output/
coverage/

# Supabase local
supabase/.branches/
supabase/.temp/
```

---

## Step 10 — Fix Model Routing Conflict in Project CLAUDE.md

Your project CLAUDE.md currently says:
> "Model Routing: Use Sonnet for UI/Boilerplate and Opus for Architecture/Security/Calculations"

This conflicts with the architect agent approach (we want automatic Opus selection,
not manual switching). Update that line in project CLAUDE.md:

**Find this in project CLAUDE.md:**
```markdown
- **Model Routing:** Use **Sonnet** for UI/Boilerplate and **Opus** for Architecture/Security/Calculations to optimize token spend
```

**Replace with:**
```markdown
- **Model Routing:** Default is **Sonnet**. The architect agent (`.claude/agents/architect.md`) 
  automatically uses **Opus** for architecture, schema design, and complex reasoning. 
  Use **Haiku** for simple lookups, summaries, and formatting tasks. Never manually switch 
  to Opus in the main session.
```

---

## Step 11 — Session Habits (No Installation Required)

These are habits, not setup. Do them every session:

| Habit | When | Command |
|-------|------|---------|
| Enable status bar | Every new session | `/statusline` |
| Compact context | When status hits 50% | `/compact` |
| Clear between tasks | When switching to a new unrelated task | `/clear` |
| Reference architecture | Only when working on architecture | `@docs/context/architecture.md` |
| Reference env vars | Only when working on env/config | `@docs/context/env-vars.md` |

---

## Final Verification Checklist

Run all of these after completing the steps above:

```powershell
# 1. Global CLAUDE.md has Model Strategy at top
Get-Content "$env:USERPROFILE\.claude\CLAUDE.md" | Select-Object -First 10
# Expected: first lines should show ## Model Strategy

# 2. Default model is sonnet
claude config get model
# Expected: sonnet

# 3. settings.json exists and is valid JSON
Get-Content "$env:USERPROFILE\.claude\settings.json" | ConvertFrom-Json
# Expected: object with model, permissions, env keys

# 4. PowerShell aliases loaded
Get-Command cc
# Expected: shows the cc function

# 5. Architect agent exists
Test-Path "E:\Web-App\a2z-webapp\a2z-webapp\.claude\agents\architect.md"
# Expected: True

# 6. tasks/ folder exists with both files
Test-Path "E:\Web-App\a2z-webapp\a2z-webapp\tasks\todo.md"
Test-Path "E:\Web-App\a2z-webapp\a2z-webapp\tasks\lessons.md"
# Expected: True, True

# 7. HANDOVER.md exists
Test-Path "E:\Web-App\a2z-webapp\a2z-webapp\HANDOVER.md"
# Expected: True

# 8. Context reference files exist
Test-Path "E:\Web-App\a2z-webapp\a2z-webapp\docs\context\architecture.md"
# Expected: True

# 9. .claudeignore exists
Test-Path "E:\Web-App\a2z-webapp\a2z-webapp\.claudeignore"
# Expected: True

# 10. Subagent env var loaded
echo $env:CLAUDE_CODE_SUBAGENT_MODEL
# Expected: sonnet
```

---

## How Everything Works Together

```
You type: cc
    │
    ▼
Claude Code starts
    ├── Loads ~/.claude/CLAUDE.md (Model Strategy + Context Rules + Karpathy)
    ├── Loads a2z-webapp/CLAUDE.md (Project rules — now ~80 lines, not 200)
    ├── Memory compiler hooks fire (session-start.py captures context)
    └── Reads tasks/todo.md + tasks/lessons.md + HANDOVER.md
    │
    ▼
Working session on Sonnet
    ├── File edits → auto-approved (acceptEdits)
    ├── git/npm/npx/node → auto-approved (allow rules)
    ├── git push / .env writes → still prompts (safety)
    ├── Context hits 50% → /compact (saves state + compresses)
    └── Switch tasks → /clear (fresh start, cheap)
    │
    ▼
Heavy task detected
    └── Architect agent spawned → runs on Opus automatically
        ├── Designs schema / plans architecture
        └── Returns plan → Sonnet agents execute it
    │
    ▼
Session ends
    └── Memory compiler session-end.py fires
        └── Flushes to daily/YYYY-MM-DD.md (IST timezone)
            └── After 6PM → compile.py builds knowledge/ wiki articles
```

---

## Token Savings Summary

| Change | Estimated Saving Per Session |
|--------|------------------------------|
| Project CLAUDE.md trimmed (200 → 80 lines) | ~3,000 tokens |
| .claudeignore (no node_modules exploration) | ~5,000–20,000 tokens |
| CLAUDE_CODE_AUTO_COMPACT_WINDOW=200000 | Prevents runaway long sessions |
| acceptEdits (fewer round-trips) | ~1,000–2,000 tokens |
| Haiku for simple tasks | ~60–80% cheaper per simple call |
| /compact at 50% (not 90%) | Prevents degraded quality + token waste |

**Memory compiler note:** The hooks add a small token cost per session (session-start.py,
session-end.py fire automatically) but the knowledge/ wiki they build saves you far more
by eliminating re-explanation of past context.
