# Autoresearch Integration Guide
### Adding Tier 4: Autonomous Optimization to Your Second Brain Stack

---

## PART 1: WHAT AUTORESEARCH ACTUALLY IS

---

### The 10-second version

> One file to edit + one metric to measure + an agent that never stops.  
> You write the directions. The agent runs experiments while you sleep.

That's it. No GPU required. No ML knowledge needed. The original repo trains small language models, but the pattern works on anything you can score.

### The three components Karpathy defines

```
program.md      ← YOU write this (natural language directions)
[target file]   ← AGENT edits this (code, templates, prompts, config)
[eval script]   ← MEASURES this (binary yes/no → single score)
```

The agent loop (from `program.md`, verbatim philosophy):
```
LOOP FOREVER:
1. Look at current state of target file
2. Hypothesize an improvement
3. Modify the target file
4. Run the eval script
5. If score improved: git commit (KEEP)
6. If score equal or worse: git reset (DISCARD)
7. Log to results.tsv
8. NEVER STOP until manually interrupted
```

### What makes a valid autoresearch target

✅ Clear artifact the agent can modify (one file)  
✅ Runnable eval that produces a number (or binary yes/no average)  
✅ A baseline score to beat  
✅ Fast feedback loop (ideally under 5 minutes per experiment)  

❌ "Make it better" (not measurable)  
❌ Requires human judgment to evaluate  
❌ Depends on live production data with no simulation  

---

## PART 2: WHERE IT FITS IN YOUR FULL STACK

---

```
YOUR FULL SECOND BRAIN STACK (4 TIERS)
═══════════════════════════════════════════════════════════════════════

TIER 1 — KNOWLEDGE FOUNDATION  (passive, accumulates)
───────────────────────────────────────────────────────────────────────
  Obsidian Master Vault (a2z/ dealclues/ bridgemail/ smm/ perfume/ saas/)
  LLM Wiki pages: domain knowledge, industry intel, lessons
  Grows when YOU ingest sources (Obsidian Clipper → ingest command)
  Answers: "What do we know about this domain?"

        ↕ (knowledge informs sessions; sessions surface new wiki needs)

TIER 2 — SESSION MEMORY  (auto-captured, compounds)
───────────────────────────────────────────────────────────────────────
  claude-memory-compiler: daily logs → concept articles → index.md
  HANDOVER.md + tasks/todo.md + tasks/lessons.md (manual snapshots)
  Injected automatically at every Claude Code session start
  Answers: "What has Claude learned across all our sessions?"

        ↕ (memory shapes what gets built; builds create new memories)

TIER 3 — ACTIVE BUILDING  (human-led, session-based)
───────────────────────────────────────────────────────────────────────
  Claude Code sessions: features, fixes, business tasks
  CLAUDE.md: rules, constraints, project context
  Your /handover slash command
  Answers: "What are we building right now?"

        ↕ (builds create targets; autoresearch improves those targets)

TIER 4 — AUTONOMOUS OPTIMIZATION  (agent-led, runs overnight)  ★ NEW
───────────────────────────────────────────────────────────────────────
  autoresearch loops: one program.md per optimization target
  Agent modifies target file, runs eval, keeps improvements, loops
  Results (results.tsv + git commits) auto-captured by memory compiler
  Answers: "How can this specific thing be better while I sleep?"

        ↑ (improved artifacts + experimental results feed back into Tier 1)
```

**The critical connection you need to understand:**

autoresearch uses `git` as its memory — keeps improvements via commits, discards via `git reset`. Your `claude-memory-compiler` already monitors the git repo and extracts knowledge from sessions. So when autoresearch runs overnight and makes 15 commits, the memory compiler captures the experimental history automatically — what changed, what score it achieved, what was kept vs discarded. The loop becomes self-documenting with zero extra effort.

---

## PART 3: PRACTICAL APPLICATIONS FOR EACH OF YOUR VENTURES

---

### 3.1 a2z-webapp — Supplier Matching Algorithm

**Target file:** `lib/matching/scoring.ts` (or wherever your matching logic lives)  
**Metric:** matching_score (unit test suite that checks: right supplier found? ranked by price? IMPA code matched? within lead time?)  
**Time budget:** Run unit tests — probably under 30 seconds per experiment

**program.md for this:**
```markdown
# autoresearch — a2z supplier matching

## Goal
Improve the supplier matching algorithm in lib/matching/scoring.ts.
Optimize for: matching_score (higher = better).

## Setup
Read CLAUDE.md for full project context.
Read lib/matching/scoring.ts — this is the ONLY file you modify.

## Eval
Run: npx vitest run tests/matching.test.ts --reporter=json
Parse the JSON output. matching_score = (passed_tests / total_tests) * 100.
Baseline score is recorded after the first run.

## What you CAN change
- Scoring weights and formulas in scoring.ts
- Ranking logic
- Tie-breaking rules
- Data normalization approaches

## What you CANNOT change  
- Test files (tests/matching.test.ts is locked)
- Database schema
- API contracts

## Constraints
- File must stay under 120 lines
- No external dependencies beyond what's in package.json
- TypeScript strict mode must pass

## Loop
NEVER STOP. Run until matching_score = 100 or you are manually stopped.
When stuck, try combining best-scoring fragments from kept commits.
```

---

### 3.2 bridgemail.in — Email Template Optimization

This is the highest-value autoresearch target in your portfolio. Email deliverability and open rates are literally optimizable with this pattern. In fact, **bridgemail.in could be built around autoresearch as a core feature** — "your email templates, autonomously optimized overnight."

**Target file:** `templates/subject-lines.md` (a markdown file of subject line patterns)  
**Metric:** template_score = average of binary questions applied to N=30 generated subjects  
**Time budget:** ~60 seconds per experiment (generate 30 subjects, score each with 5 binary questions)

**Binary eval criteria for email subjects:**
```
Q1: Does the subject line contain a number or specific stat?
Q2: Is it under 60 characters?
Q3: Does it create urgency or curiosity without clickbait?
Q4: Does it avoid spam trigger words (free, click here, guaranteed)?
Q5: Does it personalize or speak directly to the recipient's problem?
```

**Score = (sum of yes answers across 30 generated subjects) / (30 × 5) × 100**

```markdown
# autoresearch — bridgemail subject line optimizer

## Goal
Improve subject line templates in templates/subject-lines.md.
Metric: template_score (binary eval — higher = better).

## Eval
Run: node scripts/eval-subjects.js
This generates 30 subjects from current templates, scores each with 5 binary questions.
Prints: template_score (0-100).

## What you CAN change
- Subject line patterns and formulas in templates/subject-lines.md
- Variable placeholder conventions
- Pattern categories and organization

## What you CANNOT change
- eval/binary-questions.json (the scoring criteria)
- scripts/eval-subjects.js (the evaluation harness)

## The goal
Start at baseline. Optimize until template_score >= 90.
NEVER STOP. Each experiment takes ~60 seconds.
```

---

### 3.3 SMM Agency — Content Template Optimization

The most immediately profitable autoresearch application for your portfolio. Your SMM agency's output quality can be auto-optimized before you deliver to clients.

**Target file:** `templates/instagram-hooks.md` (one platform, one format at a time)  
**Metric:** hook_score = binary eval on generated hooks

**Binary eval criteria for Instagram hooks:**
```
Q1: Does the hook create a pattern interrupt in the first 3 words?
Q2: Does it avoid starting with "I" or the brand name?
Q3: Is it under 15 words?
Q4: Does it imply a clear benefit or transformation?
Q5: Would it make someone stop scrolling?
```

**This compounds.** After running autoresearch on hooks, run it on captions, then CTAs, then hashtag clusters. You end up with a full library of battle-tested templates that scored 90+ on every metric. That IS your agency's product differentiation.

---

### 3.4 dealclues.in — Deal Scoring Algorithm

**Target file:** `lib/scoring/deal-ranker.ts`  
**Metric:** ranking_score (does the algorithm surface deals with highest CTR? test against historical data)  
**Time budget:** unit test suite run

---

### 3.5 Second Brain SaaS — Ingestion Prompt Optimization

This is the meta-loop: using autoresearch to improve the second brain itself.

**Target file:** `prompts/wiki-ingestion-prompt.md`  
**Metric:** wiki_quality_score (binary eval on output wiki pages)

**Binary eval criteria:**
```
Q1: Is the wiki article self-contained (makes sense without the source)?
Q2: Does it contain at least 3 cross-references to other wiki pages?
Q3: Is the YAML frontmatter complete (all required fields)?
Q4: Are contradictions with existing knowledge flagged?
Q5: Is it organized with clear sections (concept, context, implications)?
```

**Run this overnight and wake up to better ingestion prompts.** The quality of your entire second brain improves as a result.

---

### 3.6 Perfume Co. — Product Description Optimization

**Target file:** `content/product-descriptions.md`  
**Metric:** description_score (binary eval on generated descriptions)

```
Q1: Does it evoke a sensory experience in the first sentence?
Q2: Does it mention at least 3 specific notes (top/heart/base)?
Q3: Does it connect the fragrance to an emotion or occasion?
Q4: Is it between 80-150 words?
Q5: Does it avoid generic perfume clichés ("fresh", "clean", "elegant" as standalone descriptors)?
```

---

## PART 4: HOW TO SET THIS UP — STEP BY STEP

---

### Step 1: Understand what you're NOT doing

You are NOT cloning `karpathy/autoresearch` and running it. That repo requires an NVIDIA GPU and trains language models. That's not your use case.

You are taking the PATTERN from that repo and applying it to your own targets using Claude Code.

### Step 2: Create the autoresearch folder structure

```
your-project/
├── autoresearch/                  ← new folder
│   ├── smm-hooks/
│   │   ├── program.md            ← your instructions (written by you)
│   │   ├── results.tsv           ← auto-populated by agent (untracked in git)
│   │   └── eval/
│   │       └── score.js          ← the eval harness (locked, agent can't modify)
│   ├── email-subjects/
│   │   ├── program.md
│   │   └── eval/
│   │       └── score.js
│   └── supplier-matching/
│       ├── program.md
│       └── eval/
│           └── score.ts
```

### Step 3: Write your program.md (the human's job)

Each `program.md` has five sections:
1. **Goal** — what metric, what target file
2. **Setup** — what to read for context (CLAUDE.md, target file)
3. **Eval** — how to run and parse the score
4. **Constraints** — what the agent CAN and CANNOT do
5. **Loop behavior** — "NEVER STOP until [condition] or manually interrupted"

### Step 4: Write your eval harness (locked, agent cannot modify)

For code targets: unit test suite
For content targets: a script that generates N outputs, scores each with binary questions, returns average

```javascript
// eval/score.js — example for content templates
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

const BINARY_QUESTIONS = [
  "Does the hook create a pattern interrupt in the first 3 words? Answer YES or NO only.",
  "Does it avoid starting with 'I' or the brand name? Answer YES or NO only.",
  "Is it under 15 words? Answer YES or NO only.",
  "Does it imply a clear benefit or transformation? Answer YES or NO only.",
  "Would it make someone stop scrolling? Answer YES or NO only."
];

async function scoreTemplates() {
  const templates = fs.readFileSync('../templates/instagram-hooks.md', 'utf-8');
  const client = new Anthropic();
  
  // Generate 30 outputs from current templates
  const generated = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: `Using these templates: ${templates}\n\nGenerate 30 different Instagram hook variations. One per line.` }]
  });
  
  const hooks = generated.content[0].text.split('\n').filter(h => h.trim()).slice(0, 30);
  
  let totalScore = 0;
  for (const hook of hooks) {
    for (const question of BINARY_QUESTIONS) {
      const result = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 5,
        messages: [{ role: 'user', content: `Hook: "${hook}"\n\n${question}` }]
      });
      if (result.content[0].text.trim().startsWith('YES')) totalScore++;
    }
  }
  
  const finalScore = (totalScore / (hooks.length * BINARY_QUESTIONS.length)) * 100;
  console.log(`template_score: ${finalScore.toFixed(2)}`);
  return finalScore;
}

scoreTemplates();
```

### Step 5: Start an autoresearch session in Claude Code

Open Claude Code in the project directory and say:

> "Read autoresearch/smm-hooks/program.md carefully. Set up the experiment on a new branch called autoresearch/smm-hooks-[today's date], establish the baseline score first, then begin the optimization loop. Do not stop unless the score reaches 95 or I manually interrupt you."

Claude Code will:
1. Read the program.md
2. Create the branch
3. Run the eval to establish baseline
4. Begin hypothesizing and testing improvements
5. Keep improvements, discard failures
6. Log everything to results.tsv
7. Run indefinitely until you stop it or the target is reached

**Go to sleep. Come back in the morning.**

### Step 6: Review results

```bash
# See what the agent did overnight
git log autoresearch/smm-hooks-[date] --oneline

# See the score progression
cat autoresearch/smm-hooks/results.tsv

# Merge the improvements to main
git checkout main
git merge autoresearch/smm-hooks-[date]
```

The claude-memory-compiler hook captures this automatically. The next time you start Claude Code, the session injection will include: "The autoresearch loop on SMM hooks ran 47 experiments, kept 12 improvements, score improved from 61% to 89%."

---

## PART 5: THE PROGRAM.MD IS YOUR NEW CLAUDE.MD — EXTENDED

---

Karpathy's key insight, reframed for your context:

```
CLAUDE.md = session-level directions (what to build, how to build it)
program.md = loop-level directions (what to optimize, how to measure it)
```

Your CLAUDE.md already tells Claude how to work in each project. Your `program.md` files tell Claude how to run autonomous optimization loops on specific targets. They're the same idea at different timescales.

**The human's only job in autoresearch:**
1. Pick the right target (something with a clear metric)
2. Write the binary eval criteria (5-10 yes/no questions that define "good")
3. Write the program.md constraints (what the agent can/cannot touch)
4. Start the loop and go to sleep

**The agent's job:**
- Everything else. Hypothesis. Code. Test. Keep. Discard. Repeat.

---

## PART 6: THE FULL COMPOUNDING SYSTEM

---

```
HOW THE FOUR TIERS COMPOUND TOGETHER:

You read an article about email deliverability
        ↓
[TIER 1] Obsidian Clipper → ingest into wiki → email-deliverability.md created
        ↓
[TIER 3] Claude Code session: "Build email template engine using wiki knowledge"
        ↓
[TIER 2] Memory compiler captures: "Anwar built email template engine. Key patterns: X, Y, Z"
        ↓
[TIER 4] autoresearch loop: agent runs overnight optimizing template score
         47 experiments. 12 improvements. Score: 61% → 89%.
        ↓
[TIER 2] Memory compiler captures experimental history from git commits
        ↓
[TIER 1] You add findings to wiki: best-performing subject line patterns.md
        ↓
Next session starts with: full knowledge + session memory + experimental results
```

This is the flywheel. Each tier feeds the next. Each loop generates new knowledge that feeds back into the top. Over weeks and months, your system accumulates thousands of experiments across all 6 ventures — all captured, all searchable, all compounding.

---

## PART 7: QUICK START — DO THIS FIRST

---

The easiest first autoresearch loop to run, requiring zero extra code:

**Target:** Your SMM agency's Instagram hook templates  
**Why:** Content is the easiest thing to score with binary questions, requires no test infrastructure, and immediate business value  

1. Create `autoresearch/smm-hooks/program.md` (copy the template from Part 3.3 above)
2. Create `autoresearch/smm-hooks/eval/score.js` (copy from Part 4, Step 4)
3. Create `templates/instagram-hooks.md` with 10 hook patterns you currently use
4. Open Claude Code: "Read autoresearch/smm-hooks/program.md and start the loop"
5. Leave it running. Check back in 2 hours.

No GPU. No ML. No complex setup. Just Claude Code, your templates, and a loop.

---

*Document prepared: May 2026 | For: Anwar Shariff*  
*Part of the Second Brain + autoresearch integration series*
