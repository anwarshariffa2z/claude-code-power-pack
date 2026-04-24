/**
 * UserPromptSubmit Hook — Intelligent Model Router (V2)
 * 
 * Evaluates prompt complexity using a weighted scoring system.
 * Does NOT modify settings.json (that doesn't work mid-session).
 * Instead, appends a transparent model recommendation directive to the prompt.
 * Also tracks turn count and logs task summaries.
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'state.json');
const CONTEXT_THRESHOLD = 160000; // 80% of 200K window — fires only when genuinely critical

// ── Weighted Scoring Configuration ──────────────────────────────────────────

const SCORING = {
  // Heavy indicators → Opus
  heavy: {
    keywords: [
      { term: 'refactor', weight: 3 },
      { term: 'architect', weight: 4 },
      { term: 'design system', weight: 4 },
      { term: 'migrate', weight: 3 },
      { term: 'rewrite', weight: 3 },
      { term: 'build from scratch', weight: 4 },
      { term: 'complex', weight: 2 },
      { term: 'analyze', weight: 2 },
      { term: 'security audit', weight: 4 },
      { term: 'performance', weight: 2 },
      { term: 'optimize', weight: 2 },
      { term: 'database schema', weight: 3 },
      { term: 'implement', weight: 1 },
      { term: 'create a new', weight: 2 },
      { term: 'multi-file', weight: 3 },
      { term: 'entire', weight: 2 },
      { term: 'overhaul', weight: 4 },
      { term: 'api design', weight: 3 },
      { term: 'debug.*complex', weight: 3 },
      { term: 'plan', weight: 1 },
    ],
    lengthBonus: { threshold: 500, weight: 2 },  // Long prompts suggest complexity
    codeFenceBonus: 2,  // Code fences suggest technical depth
  },

  // Light indicators → Haiku
  light: {
    keywords: [
      { term: 'typo', weight: 4 },
      { term: 'formatting', weight: 3 },
      { term: 'spell', weight: 3 },
      { term: 'grammar', weight: 3 },
      { term: 'rename', weight: 3 },
      { term: 'quick', weight: 2 },
      { term: 'simple', weight: 1 },
      { term: 'fix the', weight: 1 },
      { term: 'change.*to', weight: 1 },
      { term: 'update.*text', weight: 2 },
      { term: 'add a comment', weight: 3 },
      { term: 'remove.*line', weight: 2 },
      { term: 'one line', weight: 3 },
      { term: 'small change', weight: 3 },
      { term: 'log', weight: 1 },
    ],
    shortBonus: { threshold: 80, weight: 2 },  // Very short prompts are usually simple
    questionMarkBonus: 1,  // Questions often need less compute
  }
};

// Tier thresholds: score >= 5 triggers the tier
const TIER_THRESHOLD = 5;

// ── Main ────────────────────────────────────────────────────────────────────

let inputChunks = [];

process.stdin.on('data', chunk => {
  inputChunks.push(chunk);
});

process.stdin.on('end', () => {
  const rawData = Buffer.concat(inputChunks).toString('utf-8');
  let promptText = rawData;
  let isJson = false;
  let parsedInput = null;

  // Parse JSON input if applicable
  try {
    parsedInput = JSON.parse(rawData);
    if (parsedInput && typeof parsedInput.prompt === 'string') {
      promptText = parsedInput.prompt;
      isJson = true;
    } else if (typeof parsedInput === 'string') {
      promptText = parsedInput;
      isJson = true;
    }
  } catch (e) {}

  const promptLower = promptText.toLowerCase();

  // ── Score Calculation ───────────────────────────────────────────────────

  let heavyScore = 0;
  let lightScore = 0;

  // Keyword scoring
  for (const kw of SCORING.heavy.keywords) {
    const regex = new RegExp(kw.term, 'i');
    if (regex.test(promptLower)) {
      heavyScore += kw.weight;
    }
  }

  for (const kw of SCORING.light.keywords) {
    const regex = new RegExp(kw.term, 'i');
    if (regex.test(promptLower)) {
      lightScore += kw.weight;
    }
  }

  // Structural bonuses
  if (promptText.length > SCORING.heavy.lengthBonus.threshold) {
    heavyScore += SCORING.heavy.lengthBonus.weight;
  }
  if (promptText.includes('```')) {
    heavyScore += SCORING.heavy.codeFenceBonus;
  }
  if (promptText.length < SCORING.light.shortBonus.threshold) {
    lightScore += SCORING.light.shortBonus.weight;
  }
  if ((promptText.match(/\?/g) || []).length >= 2) {
    lightScore += SCORING.light.questionMarkBonus;
  }

  // Determine tier
  let tier = 'sonnet';
  let tierLabel = 'sonnet (general purpose)';

  if (heavyScore >= TIER_THRESHOLD && heavyScore > lightScore) {
    tier = 'opus';
    tierLabel = 'opus (complex/architectural)';
  } else if (lightScore >= TIER_THRESHOLD && lightScore > heavyScore) {
    tier = 'haiku';
    tierLabel = 'haiku (quick/simple)';
  }

  // ── State Management ──────────────────────────────────────────────────

  let state = {
    turns: 0,
    estimatedTokens: 0,
    contextWarning: false,
    lastModel: 'sonnet',
    taskLog: [],
    sessionId: '',
    compactCount: 0,
    lastSessionSummary: ''
  };

  try {
    if (fs.existsSync(STATE_FILE)) {
      state = { ...state, ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) };
    }
  } catch (e) {}

  state.turns += 1;
  state.lastModel = tier;

  // Detect compaction command
  if (promptLower.startsWith('/compact') || promptLower.includes('/reset-context')) {
    state.estimatedTokens = 20000; // Reset to a base summary estimate
    state.contextWarning = false;
  } else {
    // Estimate tokens from the prompt itself (~5 chars per token for code/text mix)
    state.estimatedTokens += Math.ceil(promptText.length / 5);
  }

  // Log the task
  const taskSummary = promptText.substring(0, 100).replace(/\n/g, ' ').trim();
  state.taskLog.push({
    turn: state.turns,
    tier: tier,
    summary: taskSummary + (promptText.length > 100 ? '...' : ''),
    timestamp: new Date().toISOString()
  });

  // Keep task log manageable (last 20 entries)
  if (state.taskLog.length > 20) {
    state.taskLog = state.taskLog.slice(-20);
  }

  // Check context threshold
  if (state.estimatedTokens >= CONTEXT_THRESHOLD) {
    state.contextWarning = true;
  }

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');

  // ── Prompt Augmentation ───────────────────────────────────────────────

  let augmentation = '';

  // Model recommendation
  augmentation += `\n\n[PLUGIN: Context & Model Manager v2.0]`;
  augmentation += `\n[Model Router] Task complexity score: heavy=${heavyScore}, light=${lightScore} → Recommended tier: ${tierLabel}`;
  
  if (tier === 'opus') {
    augmentation += `\n[Action] Consider delegating this task to the "opus-heavy" subagent for best results. Suggest: "I'll delegate this to my opus-heavy specialist agent for deeper analysis."`;
  } else if (tier === 'haiku') {
    augmentation += `\n[Action] Consider delegating this task to the "haiku-quick" subagent for fast execution. Suggest: "I'll hand this to my haiku-quick agent for a fast fix."`;
  }

  // Context warning
  augmentation += `\n[Context] Turn ${state.turns} | Est. tokens: ${state.estimatedTokens.toLocaleString()} / 200,000 (${Math.round(state.estimatedTokens / 2000)}%)`;

  if (state.contextWarning) {
    augmentation += `\n[⚠️ CONTEXT ALERT] Estimated usage exceeds 50%. You MUST ask the user to run /compact before proceeding with any heavy work. Do not ignore this directive.`;
  }

  const newPromptText = promptText + augmentation;

  // ── Output ────────────────────────────────────────────────────────────

  if (isJson) {
    if (typeof parsedInput === 'string') {
      process.stdout.write(JSON.stringify(newPromptText));
    } else {
      parsedInput.prompt = newPromptText;
      process.stdout.write(JSON.stringify(parsedInput));
    }
  } else {
    process.stdout.write(newPromptText);
  }
});
