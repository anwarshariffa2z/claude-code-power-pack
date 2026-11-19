# The Ultimate Second Brain for Claude Code
### A Complete Guide for Your A2Z Projects

---

## PART 1: WHAT IS THIS ABOUT?

---

### 1.1 The Core Problem You're Solving

Every time you open a new Claude Code session, Claude remembers nothing. You re-explain your stack, your decisions, your project structure. With multiple projects (a2z-webapp, procurement platform, ISO work, client disputes), this context tax compounds. You've partially solved this with your `/handover` slash command — but the two new methods take it much further.

---

### 1.2 Karpathy's Tweet & The LLM Wiki Pattern (The Foundation)

In April 2026, Andrej Karpathy (OpenAI co-founder, coined "vibe coding") posted about a shift in how he uses LLMs. He was no longer using them primarily to write code — he was using them to **build and maintain a personal knowledge base**. His research wiki on a single topic grew to **~100 articles, ~400,000 words, without him writing a single word himself**.

The idea he published is called the **LLM Wiki pattern**:

> "Instead of just retrieving from raw documents at query time, the LLM **incrementally builds and maintains a persistent wiki** — a structured, interlinked collection of markdown files. The knowledge is compiled once and then kept current, not re-derived on every query."

**The key analogy:**
> "Obsidian is the IDE. The LLM is the programmer. The wiki is the codebase."

**RAG vs LLM Wiki in a nutshell:**

| When you add a source | RAG | LLM Wiki |
|---|---|---|
| Processing | At query time (every question) | Once at ingest time |
| Cross-references | Found ad-hoc per query | Pre-built and maintained |
| Contradictions | May never surface | Flagged during ingestion |
| Accumulation | Starts fresh each query | Compounds with every source |
| Maintenance | Black box, no improvement | LLM handles it; transparent |

**Why wikis fail with humans but succeed with LLMs:** The tedious part of maintaining a knowledge base is the bookkeeping — updating cross-references, keeping summaries current, flagging contradictions. Humans abandon wikis because the maintenance burden grows faster than the value. LLMs don't get bored, can touch 15 files in one pass, and the cost of maintenance is near zero.

---

### 1.3 What is Antigravity?

Antigravity is a **community hub for AI coding tools** — specifically for AI IDEs like Cursor, Windsurf, and others. They run a curated directory of 1,500+ MCP servers, 500+ AI coding rules, workflows, and agent skills. Their Second Brain Bootcamp (the video you linked) is their course/guide on implementing the Karpathy LLM Wiki pattern using Obsidian + Claude Code. They are not a product themselves — they are a resource site. Think of them as a curated library for the AI dev tooling ecosystem.

---

### 1.4 Method A: `claude-memory-compiler` (Cole Medin's Repo)

**What it does:** Gives Claude Code an *automated, self-evolving memory* tied to your codebase. Instead of you manually writing HANDOVER.md, hooks automatically capture every session, extract key decisions and lessons via the Claude Agent SDK, and compile them into structured knowledge articles.

**The pipeline:**
```
Session ends → Hook fires → flush.py extracts knowledge 
→ daily/YYYY-MM-DD.md → compile.py → knowledge/concepts/ 
→ SessionStart hook injects index into next session → repeat
```

**Key scripts:**
- `flush.py` — triggered on session end/pre-compaction; calls Claude Agent SDK to extract what's worth saving; after 6 PM triggers end-of-day compilation automatically
- `compile.py` — turns daily logs into organized concept articles with cross-references
- `query.py` — answer questions from the knowledge base (no RAG, just index-guided retrieval)
- `lint.py` — runs 7 health checks (broken links, orphans, contradictions, staleness)

**No extra API cost:** Uses Claude Agent SDK which works under your existing Claude Max subscription — no separate API billing.

**No RAG:** At personal scale (50–500 articles), the LLM reading a structured `index.md` outperforms vector similarity. RAG only becomes necessary at ~2,000+ articles.

---

### 1.5 Method B: Your Existing System (HANDOVER.md)

You already built a solid foundation:
- `/handover` slash command → generates `HANDOVER.md` + `tasks/todo.md` + `tasks/lessons.md`
- CLAUDE.md with project rules (files <120 lines, TDD, etc.)
- `dev` branch to prevent production accidents
- `claude --continue` / `claude --resume` for session continuity

**Strengths:** Manual control, human-curated, always accurate.  
**Limitations:** Only captures what you explicitly trigger. No automatic extraction between sessions. No cross-referencing between sessions over time. No searchable knowledge base that compounds.

---

### 1.6 The Karpathy LLM Wiki Pattern (Method C — for research/external knowledge)

This is for your non-code knowledge: marine supply industry, GST law, IMPA standards, ISO certification procedures, Incoterms, client communication patterns, competitor intel — everything you read, research, and accumulate that isn't code. You use Obsidian as the viewer, Claude Code as the maintainer, and a `raw/ + wiki/` folder structure.

---

## PART 2: COMPARISON OF ALL METHODS

---

| Dimension | Your HANDOVER System | claude-memory-compiler | Karpathy LLM Wiki |
|---|---|---|---|
| **What it captures** | Code decisions, TODOs, lessons | All session knowledge, patterns, gotchas | External research, articles, documents |
| **Trigger** | Manual (`/handover`) | Automatic (hooks on session end) | Manual (you ingest sources) |
| **Output** | HANDOVER.md, todo.md, lessons.md | Daily logs → concept articles | `wiki/` folder of interlinked .md files |
| **Cross-session memory** | Partial (requires resume) | Automatic | Yes (persistent wiki) |
| **Compounds over time** | Somewhat | Yes — articles link and cross-reference | Yes — strongest compounding |
| **Search/query** | None | `query.py` | Obsidian search + qmd |
| **Health checks** | None | `lint.py` (7 checks) | Lint operation |
| **Cost** | Free | Free (included in Max sub) | Free |
| **Setup effort** | Already done | Low (clone + hook install) | Medium (Obsidian + folder structure) |
| **Best for** | Your daily dev workflow | Dev knowledge accumulation | Business, research, external knowledge |

**Verdict: Use all three, for different purposes. They don't overlap — they stack.**

---

## PART 3: HOW EACH METHOD HELPS YOUR SPECIFIC PROJECTS

---

### 3.1 a2z-webapp (Next.js / Supabase / Gemini / Vercel)

**HANDOVER.md** → Already working. Keep using it.

**claude-memory-compiler** → This is the big win for you here. Every time you solve a Supabase RLS issue, fix a Gemini API edge case, resolve a Next.js routing bug, or figure out an openpyxl formatting trick — the hook captures it. Next session on the same codebase, Claude already knows:
- "The supplier discovery engine uses a two-mode Gemini-only approach (Industry + Upstream)"
- "Files must stay under 120 lines — this was a hard lesson"
- "The email archive schema has these 4 tables: email_archive, email_participants, contact_profiles, ingestion_progress"
- "TDD is mandatory here — we learned this the hard way on the rate comparison module"

This is everything currently living in your lessons.md and CLAUDE.md — but now it auto-updates without you needing to trigger `/handover`.

**LLM Wiki** → For the procurement platform: ingest IMPA catalogs, ShipServ documentation, port authority guidelines, Supabase docs you've referenced, Gemini API documentation. The wiki builds a cross-referenced knowledge base that Claude queries when helping you build features.

---

### 3.2 A2Z Ship Stores Business Operations

**LLM Wiki is most powerful here.** Drop in:
- ISO 14001 / ISO 22000 procedure documents → Claude maintains wiki pages for each clause, cross-references your existing procedures, flags gaps
- GST law articles and rulings → Entity pages for tax regulations, linked to your use cases
- Incoterms 2020 guide → Reference wiki that Claude reads when helping you draft shipping documents
- Client communication patterns → Build a wiki of communication templates, what worked, what didn't (Apollo Group dispute lessons)
- Competitor analysis → Ingest anything about competitors, the wiki builds comparison pages automatically

---

### 3.3 Two Windows Machines Workflow

The claude-memory-compiler `knowledge/` folder is just a markdown directory in your project. It syncs via GitHub exactly like the rest of your codebase. Open Claude Code on either machine, the same accumulated knowledge is there.

Your `.env.local` still travels via HDD and is never committed — that doesn't change.

---

## PART 4: THE RECOMMENDED COMBINED ARCHITECTURE

---

```
YOUR SECOND BRAIN ARCHITECTURE
─────────────────────────────────────────────────────────────────────

LAYER 1: CODE KNOWLEDGE (per repo)
────────────────────────────────────────────────────────────────────
  CLAUDE.md                  ← Rules, standards, project schema
  /handover slash command    ← Manual session handover (keep this)
  .claude/settings.json      ← claude-memory-compiler hooks (ADD THIS)
  
  knowledge/
  ├── daily/                 ← Auto-generated daily logs (flush.py)
  │   └── 2026-05-13.md
  ├── concepts/              ← Auto-compiled concept articles
  │   ├── supabase-rls.md
  │   ├── gemini-api-patterns.md
  │   └── supplier-discovery-engine.md
  ├── connections/           ← Cross-reference articles
  ├── qa/                    ← Q&A knowledge articles
  └── index.md              ← Master index (injected at session start)

LAYER 2: BUSINESS KNOWLEDGE (Obsidian vault, separate from code)
────────────────────────────────────────────────────────────────────
  a2z-knowledge/
  ├── raw/                   ← Immutable source documents (YOU feed this)
  │   ├── articles/          ← Web clips via Obsidian Clipper
  │   ├── regulations/       ← ISO docs, GST rulings, port guidelines
  │   ├── competitors/       ← Market intel
  │   └── templates/         ← Communication templates
  └── wiki/                  ← LLM-generated (Claude Code writes this)
      ├── index.md
      ├── log.md
      ├── concepts/          ← IMPA, Incoterms, ISO clauses, GST rules
      ├── entities/          ← Clients, suppliers, ports, certifications
      ├── comparisons/       ← Competitor analysis, supplier benchmarks
      └── procedures/        ← SOP pages Claude maintains

LAYER 3: HANDOVER BRIDGE
────────────────────────────────────────────────────────────────────
  HANDOVER.md               ← Current state snapshot (manual trigger)
  tasks/todo.md             ← Active task list
  tasks/lessons.md          ← Key lessons (now also auto-captured)
```

---

## PART 5: STEP-BY-STEP INSTALLATION GUIDE

---

### PHASE 1: Install `claude-memory-compiler` (1–2 hours)

**Prerequisites:** Claude Code installed, Python, `uv` package manager

**Step 1: Install uv (if not already installed)**
```bash
# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Step 2: Clone the repo into your a2z-webapp project**

Open Claude Code terminal in your a2z-webapp directory and tell Claude:
> "Clone https://github.com/coleam00/claude-memory-compiler into this project. Set up the Claude Code hooks so my conversations automatically get captured into daily logs, compiled into a knowledge base, and injected back into future sessions. Read the AGENTS.md for the full technical reference on how everything works."

Claude Code will:
1. Clone the repo
2. Run `uv sync` to install dependencies
3. Merge `.claude/settings.json` hooks into your existing settings
4. Hooks activate next time you open Claude Code

**Step 3: Verify hooks are active**

After the clone, open a new Claude Code session. You should see hooks loading. At session end, check `knowledge/daily/` for today's log.

**Step 4: Manual compilation**
```bash
uv run python scripts/compile.py    # compile daily logs to knowledge articles
uv run python scripts/query.py "how does the supplier discovery engine work?"
uv run python scripts/lint.py       # health check
```

**After 6 PM, compilation triggers automatically.** Every morning you start Claude Code, the knowledge index is injected automatically.

**Step 5: Keep your existing HANDOVER system**

The memory compiler complements — doesn't replace — your `/handover` command. Keep using it for explicit snapshot moments (major feature completion, before a long break).

---

### PHASE 2: Set Up the Karpathy LLM Wiki for A2Z Business Knowledge

**Step 1: Install Obsidian**
Download from https://obsidian.md — free, runs on Windows.

**Step 2: Install Obsidian Web Clipper**
Install browser extension from https://obsidian.md/clipper — works on Chrome, Edge, Firefox.

**Step 3: Create the vault structure**
```
C:\Users\[YourName]\Documents\a2z-knowledge\
├── raw\
│   ├── articles\
│   ├── regulations\
│   ├── clients\
│   └── assets\
└── wiki\
    ├── concepts\
    ├── entities\
    ├── comparisons\
    └── procedures\
```

Open Obsidian → Create New Vault → point to `a2z-knowledge\`

**Step 4: Configure Obsidian**
- Settings → Files and Links → Attachment folder path: `raw/assets`
- Settings → Hotkeys → "Download attachments for current file" → bind `Ctrl+Shift+D`
- Install plugins: Dataview (optional), Obsidian Git (recommended)

**Step 5: Create CLAUDE.md at vault root**

Create `a2z-knowledge/CLAUDE.md`:

```markdown
# A2Z Knowledge Base Schema

## Project Structure
- `raw/` — immutable source documents. NEVER modify.
- `wiki/` — LLM-generated wiki. You own this entirely.
- `wiki/index.md` — master catalog. Update on every ingest.
- `wiki/log.md` — append-only activity log.

## Page Conventions
Every wiki page MUST have YAML frontmatter:
---
title: Page Title
type: concept | entity | source-summary | comparison | procedure
sources: [list of raw/ files referenced]
related: [list of wiki pages linked]
created: YYYY-MM-DD
updated: YYYY-MM-DD
confidence: high | medium | low
---

## Ingest Workflow
When I say "ingest [filename]":
1. Read the source file in raw/
2. Identify key takeaways, note any contradictions with existing wiki pages
3. Create/update a summary page in wiki/sources/
4. Update wiki/index.md
5. Update all relevant concept and entity pages
6. Append an entry to wiki/log.md

## Query Workflow
When I ask a question:
1. Read wiki/index.md to find relevant pages
2. Read those pages
3. Synthesize an answer with [[wiki-link]] citations
4. If the answer is valuable, offer to file it as a new wiki page

## Domain Context
This is the knowledge base for A2Z Ship Stores Pvt. Ltd., 
a certified ship chandler based in Chennai, India.
Key domains: marine procurement, provisions supply, 
ISO certification (14001/22000), GST compliance, 
port operations (Chennai, Cochin, Colombo, UAE),
client communication, shipping terms (Incoterms 2020).
```

**Step 6: First ingestion**

Clip any relevant article (ISO procedure, GST ruling, port guidelines) using Web Clipper → save to `raw/articles/`. Open Claude Code pointed at the vault root and say:
> "Ingest raw/articles/[filename].md"

Watch the wiki populate in Obsidian.

**Step 7: Initialize git for the vault**
```bash
cd a2z-knowledge
git init
git add .
git commit -m "initial vault setup"
```
Push to a private GitHub repo. Now both your home and office machines can sync the knowledge base.

---

### PHASE 3: Wire the Two Systems Together

The power comes from having Claude Code sessions on a2z-webapp that can *also* reference the business knowledge vault.

**Option A (Simple):** Add to your a2z-webapp `CLAUDE.md`:
```markdown
## External Knowledge Base
The A2Z business knowledge wiki is located at:
C:\Users\[YourName]\Documents\a2z-knowledge\wiki\

When building procurement features or writing business logic,
reference index.md there for domain context.
```

**Option B (Cleaner):** Add a symlink or git submodule:
```bash
# In a2z-webapp root:
git submodule add [your-private-kb-repo-url] knowledge/business
```
Now both knowledge bases live in your project and are accessible to Claude Code without switching directories.

---

### PHASE 4: Daily Workflow

**Morning:**
1. Open Claude Code → session start hook auto-injects yesterday's compiled knowledge
2. `claude --continue` or `claude --resume` for last session context
3. Code as normal — memory is now running silently in background

**During sessions:**
- Every decision Claude makes, every bug it fixes, every pattern it discovers → auto-captured
- You don't need to do anything differently

**End of week:**
- Run `uv run python scripts/lint.py` to check knowledge base health
- Ingest any new articles/documents into the Obsidian vault
- Run `git add . && git commit -m "weekly sync"` on both repos

**When starting a new major feature:**
- `/handover` to create explicit snapshot (keep this habit — it's your "save game" moment)

---

## PART 6: QUICK REFERENCE — COMMANDS

```bash
# claude-memory-compiler
uv run python scripts/compile.py              # compile today's logs now
uv run python scripts/query.py "question"     # ask the knowledge base
uv run python scripts/query.py "q" --file-back # ask + save answer back to kb
uv run python scripts/lint.py                 # health checks

# Obsidian wiki maintenance (from vault root via Claude Code)
# "ingest raw/articles/[file].md"             # ingest a new source
# "lint the wiki"                              # health check
# "query the wiki: [question]"                 # search knowledge base
# "compile the index"                          # rebuild index.md

# Git sync for knowledge base (run on both machines)
git pull && git add . && git commit -m "session sync" && git push
```

---

## PART 7: FOR YOUR SPECIFIC PROJECTS — WHAT TO INGEST FIRST

### For a2z-webapp codebase (claude-memory-compiler auto-handles):
- Just code. Start a session. The hooks take over from here.
- After a few days, run `query.py "what are the key patterns in this project"` to see what it learned.

### For Obsidian vault (manual ingest priority list):
1. **Regulations:** GST on ship chandling, customs procedures for Colombo deliveries
2. **Standards:** IMPA numbering system, ShipServ vendor requirements
3. **ISO:** ISO 14001 and ISO 22000 scope statement drafts (you already have these)
4. **Communication templates:** Apollo Group dispute resolution, Virgin Voyages tiffin export emails
5. **Market intel:** Key competitor ship chandlers in Chennai/Cochin/Colombo
6. **Process SOPs:** How a2z processes a PO, how provisions are sourced and delivered

---

## PART 8: SUMMARY TABLE

| System | Layer | Effort | Gain |
|---|---|---|---|
| Your existing HANDOVER | Manual snapshots | Already done ✓ | Current state continuity |
| `claude-memory-compiler` | Auto code memory | ~1 hour setup | Compound code knowledge, zero effort after |
| Karpathy LLM Wiki (Obsidian) | Business knowledge | ~2 hours setup | Searchable business intelligence that grows |
| Combined | Full second brain | ~3 hours total | Claude that knows your code AND your business |

---

## PART 9: RESOURCES & LINKS

| Resource | Link |
|---|---|
| claude-memory-compiler repo | https://github.com/coleam00/claude-memory-compiler |
| Karpathy's LLM Wiki gist | https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f |
| Obsidian | https://obsidian.md |
| Obsidian Web Clipper | https://obsidian.md/clipper |
| Antigravity (MCP/rules hub) | https://antigravity.codes |
| Antigravity Second Brain Bootcamp | https://dynamous.ai/#/second-brain-bootcamp |
| qmd (markdown search engine) | https://github.com/tobi/qmd (add later, when wiki > 200 pages) |

---

*Document prepared: May 2026 | For: Anwar Shariff, A2Z Ship Stores*
