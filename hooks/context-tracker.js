/**
 * PostToolUse Hook — Tool-Aware Context Estimator
 * 
 * Fires after every tool call (Read, Bash, Edit, Write, Grep, etc.).
 * Estimates the token cost of the tool output and accumulates it in state.json.
 * Sets a contextWarning flag when estimated usage exceeds 50%.
 *
 * This is far more accurate than counting turns because one large file read
 * can consume 10x the tokens of a dozen simple edits.
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'state.json');
const CONTEXT_THRESHOLD = 160000; // 80% of 200K window — fires only when genuinely critical

// Token estimation multipliers by tool type
const TOOL_TOKEN_ESTIMATES = {
  // File reads — most expensive, content goes into context
  'Read':     (data) => estimateFromContent(data),
  'View':     (data) => estimateFromContent(data),
  
  // Bash/Shell — output can be huge
  'Bash':     (data) => estimateFromOutput(data),
  'Terminal': (data) => estimateFromOutput(data),
  
  // Search tools — results are moderate
  'Grep':     (data) => estimateFromOutput(data, 0.8),
  'Glob':     (data) => Math.min(estimateFromOutput(data), 500),
  'Search':   (data) => 2000, // Flat estimate for web search
  
  // Edit tools — diff content goes into context
  'Edit':     (data) => estimateFromDiff(data),
  'Write':    (data) => estimateFromContent(data, 0.5),
  'Replace':  (data) => estimateFromDiff(data),
  
  // Subagent responses — summary comes back
  'Subagent': (data) => estimateFromOutput(data, 0.6),
};

function estimateFromContent(data, multiplier = 1.0) {
  let charCount = 0;
  if (data && data.output) {
    charCount = String(data.output).length;
  } else if (data && data.content) {
    charCount = String(data.content).length;
  } else if (typeof data === 'string') {
    charCount = data.length;
  }
  // ~5 characters per token, with multiplier (standard for code/prose mix)
  return Math.ceil((charCount / 5) * multiplier);
}

function estimateFromOutput(data, multiplier = 1.0) {
  let charCount = 0;
  if (data && data.stdout) {
    charCount += String(data.stdout).length;
  }
  if (data && data.stderr) {
    charCount += String(data.stderr).length;
  }
  if (data && data.output) {
    charCount += String(data.output).length;
  }
  if (charCount === 0 && typeof data === 'string') {
    charCount = data.length;
  }
  return Math.ceil((charCount / 5) * multiplier);
}

function estimateFromDiff(data) {
  // Diffs are usually smaller than full content
  return estimateFromContent(data, 0.6);
}

// ── Main ────────────────────────────────────────────────────────────────────

let inputChunks = [];

process.stdin.on('data', chunk => {
  inputChunks.push(chunk);
});

process.stdin.on('end', () => {
  const rawData = Buffer.concat(inputChunks).toString('utf-8');
  
  let toolData = {};
  try {
    toolData = JSON.parse(rawData);
  } catch (e) {
    // If we can't parse, estimate from raw string
    toolData = { output: rawData };
  }

  // Identify the tool type
  const toolName = toolData.tool || toolData.toolName || toolData.type || 'Unknown';
  
  // Find the matching estimator
  let tokenEstimate = 500; // Default flat estimate for unknown tools
  for (const [toolKey, estimator] of Object.entries(TOOL_TOKEN_ESTIMATES)) {
    if (toolName.toLowerCase().includes(toolKey.toLowerCase())) {
      tokenEstimate = estimator(toolData);
      break;
    }
  }

  // Also add the overhead of Claude's own response (~200 tokens per tool use cycle)
  tokenEstimate += 200;

  // ── Update State ────────────────────────────────────────────────────────

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

  state.estimatedTokens += tokenEstimate;

  // Hard cap: estimator can never exceed the actual window size
  if (state.estimatedTokens > 200000) state.estimatedTokens = 200000;

  // Check threshold
  const previousWarning = state.contextWarning;
  if (state.estimatedTokens >= CONTEXT_THRESHOLD) {
    state.contextWarning = true;
  }

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');

  // Log to stderr for debugging (doesn't affect Claude)
  if (state.contextWarning && !previousWarning) {
    process.stderr.write(
      `[Context Tracker] ⚠️ Estimated tokens (${state.estimatedTokens.toLocaleString()}) ` +
      `exceeded 50% threshold (${CONTEXT_THRESHOLD.toLocaleString()}). ` +
      `contextWarning flag is now active.\n`
    );
  }

  // Exit 0 — PostToolUse hooks should never block
  process.exit(0);
});
