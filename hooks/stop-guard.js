/**
 * Stop Hook — Auto-Compact Enforcement Guard
 * 
 * Fires when Claude finishes responding.
 * If the contextWarning flag is active in state.json:
 *   - Exits with code 2 (BLOCK) to prevent Claude from completing.
 *   - Writes a feedback message to stderr instructing Claude to request /compact.
 * If context is fine:
 *   - Exits with code 0 (no-op, let Claude finish).
 * 
 * This is the "hard enforcement" mechanism. The router.js soft-warns in the prompt,
 * but this hook actually STOPS Claude from moving on until context is addressed.
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'state.json');

// ── Main ────────────────────────────────────────────────────────────────────

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
} catch (e) {
  // If we can't read state, don't block — exit clean
  process.exit(0);
}

if (state.contextWarning) {
  const usagePercent = Math.round(state.estimatedTokens / 2000);
  
  // Write feedback to stderr — Claude receives this as the blocking reason
  const message = [
    `[Context & Model Manager — Stop Guard]`,
    ``,
    `⚠️  Estimated context usage: ~${state.estimatedTokens.toLocaleString()} tokens (${usagePercent}% of 200K window).`,
    ``,
    `Before completing this response, you MUST:`,
    `1. Inform the user that context usage is high.`,
    `2. Ask the user to run the /compact command to summarize and free context.`,
    `3. Provide a brief summary of what was accomplished so far (so /compact preserves it).`,
    ``,
    `Do NOT continue with new work until /compact has been run.`,
  ].join('\n');

  process.stderr.write(message);

  // Reset the warning after firing once (so we don't infinite-loop the block)
  state.contextWarning = false;
  state.compactCount += 1;
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');

  // Exit code 2 = BLOCK — forces Claude to continue (re-respond with the feedback)
  process.exit(2);
} else {
  // Context is fine — let Claude finish normally
  process.exit(0);
}
