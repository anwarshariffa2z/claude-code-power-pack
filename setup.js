#!/usr/bin/env node

/**
 * Setup Script — Context & Model Manager Plugin v2.1
 * 
 * Automates the full companion tool configuration:
 * 1. Registers MCP servers via `claude mcp add` CLI commands
 * 2. Writes ccstatusline config to ~/.claude/settings.json (safe merge)
 * 3. Prints /plugin install commands for Superpowers and code-simplifier
 * 
 * Usage:
 *   node setup.js              — Run full setup
 *   node setup.js --dry-run    — Preview changes without executing
 *   node setup.js --skip-statusline  — Skip ccstatusline config
 *   node setup.js --skip-mcp         — Skip MCP server registration
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { execSync } = require('child_process');

// ── Configuration ───────────────────────────────────────────────────────────

const CLAUDE_SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');

const STATUSLINE_CONFIG = {
  statusLine: {
    type: "command",
    command: "ccstatusline",
    padding: 0
  }
};

const MCP_SERVERS = [
  {
    name: 'sequential-thinking',
    description: 'Structured step-by-step reasoning for complex problems',
    command: 'claude mcp add sequential-thinking -s user -- npx -y @modelcontextprotocol/server-sequential-thinking'
  },
  {
    name: 'context7',
    description: 'Live, version-specific library documentation lookup (free tier)',
    command: 'claude mcp add context7 -s user -- npx -y @upstash/context7-mcp@latest'
  }
];

const PLUGIN_INSTALL_COMMANDS = [
  {
    name: 'Superpowers',
    description: 'Agentic skills framework — structured planning, brainstorming, and workflow skills',
    marketplaceCmd: '/plugin marketplace add obra/superpowers-marketplace',
    installCmd: '/plugin install superpowers@superpowers-marketplace'
  },
  {
    name: 'code-simplifier',
    description: 'Refactoring agent — /simplify command for cleaning up complex code',
    marketplaceCmd: null, // Same marketplace as Superpowers
    installCmd: '/plugin install code-simplifier@superpowers-marketplace'
  }
];

// ── CLI Flags ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_STATUSLINE = args.includes('--skip-statusline');
const SKIP_MCP = args.includes('--skip-mcp');

// ── Helpers ─────────────────────────────────────────────────────────────────

function colorText(text, code) {
  return `\x1b[${code}m${text}\x1b[0m`;
}

const green = (t) => colorText(t, '32');
const yellow = (t) => colorText(t, '33');
const cyan = (t) => colorText(t, '36');
const red = (t) => colorText(t, '31');
const bold = (t) => colorText(t, '1');
const dim = (t) => colorText(t, '2');

function printHeader() {
  console.log('');
  console.log(bold('╔══════════════════════════════════════════════════════════════╗'));
  console.log(bold('║     Context & Model Manager — Plugin Setup v2.1             ║'));
  console.log(bold('╚══════════════════════════════════════════════════════════════╝'));
  console.log('');
}

function loadSettings(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.log(yellow(`  ⚠ Could not parse ${filePath}: ${e.message}`));
  }
  return {};
}

function mergeSettings(existing, updates) {
  const merged = { ...existing };
  for (const [key, value] of Object.entries(updates)) {
    if (!(key in merged)) {
      merged[key] = value;
    } else {
      console.log(dim(`    → "${key}" already exists in settings, skipping (won't overwrite)`));
    }
  }
  return merged;
}

function runCmd(command, label) {
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(green(`  ✔ ${label}`));
    if (output.trim()) {
      console.log(dim(`    ${output.trim()}`));
    }
    return true;
  } catch (e) {
    const stderr = e.stderr ? e.stderr.trim() : e.message;
    // "already exists" is not an error — it means it's already configured
    if (stderr.includes('already exists') || stderr.includes('already configured')) {
      console.log(yellow(`  ⚠ ${label} — already registered, skipping`));
      return true;
    }
    console.log(red(`  ✘ ${label}`));
    console.log(red(`    Error: ${stderr}`));
    return false;
  }
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// ── Step 1: MCP Servers via CLI ─────────────────────────────────────────────

function setupMCPServers() {
  console.log(bold('Step 1: MCP Servers (via CLI)'));
  console.log(dim('  Registers servers in your user-level Claude settings.'));
  console.log('');

  if (SKIP_MCP) {
    console.log(yellow('  ⏭ Skipped (--skip-mcp flag)'));
    console.log('');
    return;
  }

  for (const server of MCP_SERVERS) {
    if (DRY_RUN) {
      console.log(cyan(`  [DRY RUN] Would run: ${server.command}`));
      console.log(dim(`    ${server.description}`));
    } else {
      runCmd(server.command, `${server.name} — ${server.description}`);
    }
  }

  console.log('');
  console.log(dim('  Verify with: claude mcp list'));
  console.log(dim('  Or run /mcp inside Claude Code.'));
  console.log('');
}

// ── Step 2: ccstatusline ────────────────────────────────────────────────────

async function setupStatusLine() {
  console.log(bold('Step 2: ccstatusline (Terminal Status Bar)'));
  console.log(dim('  Adds a persistent HUD showing tokens, cost, git branch, and model.'));
  console.log('');

  if (SKIP_STATUSLINE) {
    console.log(yellow('  ⏭ Skipped (--skip-statusline flag)'));
    console.log('');
    return;
  }

  const settingsDir = path.dirname(CLAUDE_SETTINGS_PATH);

  if (DRY_RUN) {
    console.log(cyan('  [DRY RUN] Would write to:'), CLAUDE_SETTINGS_PATH);
    const existing = loadSettings(CLAUDE_SETTINGS_PATH);
    const merged = mergeSettings(existing, STATUSLINE_CONFIG);
    console.log(cyan('  [DRY RUN] Result would be:'));
    console.log(dim('  ' + JSON.stringify(merged, null, 2).replace(/\n/g, '\n  ')));
    console.log('');
    return;
  }

  // Ensure .claude directory exists
  if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true });
    console.log(green('  ✔ Created directory: ' + settingsDir));
  }

  const existing = loadSettings(CLAUDE_SETTINGS_PATH);

  if (existing.statusLine) {
    console.log(green('  ✔ statusLine already configured — no changes needed'));
    console.log(dim('    Current: ' + JSON.stringify(existing.statusLine)));
  } else {
    const merged = mergeSettings(existing, STATUSLINE_CONFIG);
    fs.writeFileSync(CLAUDE_SETTINGS_PATH, JSON.stringify(merged, null, 2), 'utf8');
    console.log(green('  ✔ Added statusLine config to ' + CLAUDE_SETTINGS_PATH));
    console.log(dim('  ℹ Run `npx ccstatusline@latest` once to customize themes and widgets.'));
  }

  console.log('');
}

// ── Step 3: Plugin Install Commands ─────────────────────────────────────────

function printPluginCommands() {
  console.log(bold('Step 3: Claude Code Plugins (Manual — run inside Claude Code)'));
  console.log('');
  console.log(dim('  These plugins must be installed via Claude Code\'s plugin system.'));
  console.log(dim('  Open Claude Code and run these commands:'));
  console.log('');

  console.log(yellow('  ── First, add the marketplace ──'));
  console.log('');
  console.log(cyan('  ' + PLUGIN_INSTALL_COMMANDS[0].marketplaceCmd));
  console.log('');

  console.log(yellow('  ── Then, install the plugins ──'));
  console.log('');

  for (const plugin of PLUGIN_INSTALL_COMMANDS) {
    console.log(cyan('  ' + plugin.installCmd));
    console.log(dim('    ' + plugin.description));
    console.log('');
  }

  console.log(dim('  After installing, run /reload-plugins to activate them.'));
  console.log('');
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  printHeader();

  if (DRY_RUN) {
    console.log(yellow('  🔍 DRY RUN MODE — no changes will be made\n'));
  }

  setupMCPServers();
  await setupStatusLine();
  printPluginCommands();

  console.log(bold('════════════════════════════════════════════════════════════════'));
  console.log(bold('  Setup Complete!'));
  console.log('');
  console.log('  Your plugin now provides:');
  console.log(green('    ✔') + ' Context tracking & auto-compaction');
  console.log(green('    ✔') + ' Intelligent model routing (Opus/Sonnet/Haiku)');
  console.log(green('    ✔') + ' Session memory across restarts');
  console.log(green('    ✔') + ' Sequential Thinking MCP server');
  console.log(green('    ✔') + ' Context7 documentation MCP server');
  console.log(green('    ✔') + ' ccstatusline terminal HUD');
  console.log(dim('    ◯') + ' Superpowers plugin ' + dim('(run /plugin install inside Claude Code)'));
  console.log(dim('    ◯') + ' code-simplifier plugin ' + dim('(run /plugin install inside Claude Code)'));
  console.log('');
  console.log(bold('════════════════════════════════════════════════════════════════'));
  console.log('');
}

main().catch(console.error);
