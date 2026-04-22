/**
 * SessionStart Hook — Project Memory Bootstrap
 * 
 * Fires when Claude Code starts or resumes a session.
 * Reads state.json to inject continuity context from the previous session.
 * Outputs a memory summary to stdout so Claude ingests it as session context.
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'state.json');
const PLUGIN_VERSION = '2.1.0';

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {}
  return null;
}

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function formatTokenCount(tokens) {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

// Main execution
const state = loadState();
const lines = [];

lines.push(`[Context & Model Manager v${PLUGIN_VERSION} — Session Bootstrap]`);
lines.push('');

if (state && (state.turns > 0 || state.taskLog.length > 0)) {
  // Continuing from a previous session
  lines.push('📋 Previous Session Summary:');
  lines.push(`  • Turns completed: ${state.turns}`);
  lines.push(`  • Estimated tokens used: ${formatTokenCount(state.estimatedTokens)} / 200K`);
  lines.push(`  • Last recommended model tier: ${state.lastModel}`);
  lines.push(`  • Times compacted: ${state.compactCount}`);

  if (state.contextWarning) {
    lines.push('  ⚠️  Context warning was active — consider running /compact early.');
  }

  if (state.taskLog.length > 0) {
    lines.push('');
    lines.push('📝 Recent Task Log:');
    const recentTasks = state.taskLog.slice(-5); // Last 5 tasks
    recentTasks.forEach(task => {
      lines.push(`  • [${task.tier}] ${task.summary}`);
    });
  }

  if (state.lastSessionSummary) {
    lines.push('');
    lines.push(`💡 Last Session Note: ${state.lastSessionSummary}`);
  }
} else {
  lines.push('✨ Fresh session — no previous state detected.');
  lines.push('   The plugin will track context usage and recommend models as you work.');
}

lines.push('');
lines.push('Available subagents: opus-heavy (complex tasks), sonnet-default (general), haiku-quick (simple fixes)');
lines.push('Context tracking is active via PostToolUse hooks.');
lines.push('');
lines.push('🔌 Bundled MCP Servers:');
lines.push('  • sequential-thinking — Use for complex multi-step reasoning. Ask Claude to "use sequential thinking" for structured problem decomposition.');
lines.push('  • context7 — Live library documentation. Add "use context7" to prompts when you need up-to-date API docs for any framework/library.');
lines.push('');
lines.push('🛠️ Enhanced Tools (if installed):');
lines.push('  • /simplify — Run code-simplifier to refactor and clean up complex code');
lines.push('  • Superpowers — Structured planning, brainstorming, and workflow skills');
lines.push('');

// Initialize new session state
const newState = state || {
  turns: 0,
  estimatedTokens: 0,
  contextWarning: false,
  lastModel: 'sonnet',
  taskLog: [],
  compactCount: 0,
  lastSessionSummary: ''
};

newState.sessionId = generateSessionId();

// Preserve turns and tokens across session restarts — they represent actual context
// Only reset if the user explicitly compacts
fs.writeFileSync(STATE_FILE, JSON.stringify(newState, null, 2), 'utf8');

// Output to stdout — Claude Code ingests this as session context
process.stdout.write(lines.join('\n'));
