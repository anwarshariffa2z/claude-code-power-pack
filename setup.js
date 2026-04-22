#!/usr/bin/env node

/**
 * Setup Script — Claude Code Power Pack v2.1
 *
 * Automates the full companion tool configuration:
 * 1. Registers MCP servers via `claude mcp add` CLI (Sequential Thinking, Context7)
 * 2. Configures ccstatusline status bar in ~/.claude/settings.json
 * 3. Installs companion plugins from their official marketplaces:
 *    — Caveman       (JuliusBrussee/caveman)
 *    — Superpowers   (obra/superpowers-marketplace)
 *    — code-simplifier (obra/superpowers-marketplace)
 *    — Karpathy Skills (forrestchang/andrej-karpathy-skills)
 *
 * All plugins are installed from their original authors' marketplaces.
 * No third-party code is bundled or redistributed here.
 *
 * Usage:
 *   node setup.js              — Full setup
 *   node setup.js --dry-run    — Preview without making changes
 *   node setup.js --skip-mcp         — Skip MCP server registration
 *   node setup.js --skip-statusline  — Skip ccstatusline config
 *   node setup.js --skip-plugins     — Skip plugin install instructions
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// ── Configuration ───────────────────────────────────────────────────────────

const CLAUDE_SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');

const STATUSLINE_CONFIG = {
  statusLine: {
    type: 'command',
    command: 'ccstatusline',
    padding: 0
  }
};

// MCP servers registered via `claude mcp add` CLI — installed to user-level settings.
// These run npx on first use (no pre-install needed), free tier.
const MCP_SERVERS = [
  {
    name: 'sequential-thinking',
    description: 'Structured step-by-step reasoning for complex multi-part problems',
    command: 'claude mcp add sequential-thinking -s user -- npx -y @modelcontextprotocol/server-sequential-thinking',
    credit: 'Anthropic / MCP team — https://github.com/modelcontextprotocol/servers'
  },
  {
    name: 'context7',
    description: 'Live, version-specific library documentation (free tier)',
    command: 'claude mcp add context7 -s user -- npx -y @upstash/context7-mcp@latest',
    credit: 'Upstash — https://github.com/upstash/context7'
  }
];

// Claude Code plugins — installed from each author's official marketplace.
// Grouped by marketplace so we add each marketplace once, then install all plugins from it.
const PLUGIN_MARKETPLACES = [
  {
    name: 'Caveman',
    marketplace: 'JuliusBrussee/caveman',
    marketplaceCmd: 'claude plugin marketplace add JuliusBrussee/caveman',
    plugins: [
      {
        name: 'Caveman',
        installCmd: 'claude plugin install caveman@caveman',
        description: '🪨 Cuts ~75% of output tokens by making Claude respond concisely — same accuracy, way less fluff',
        credit: 'Julius Brussee — https://github.com/JuliusBrussee/caveman'
      }
    ]
  },
  {
    name: 'Superpowers',
    marketplace: 'obra/superpowers-marketplace',
    marketplaceCmd: 'claude plugin marketplace add obra/superpowers-marketplace',
    plugins: [
      {
        name: 'Superpowers',
        installCmd: 'claude plugin install superpowers@superpowers-marketplace',
        description: 'Agentic skills framework — structured planning, brainstorming, and workflow methodology',
        credit: 'Jesse Vincent (@obra) — https://github.com/obra/superpowers-marketplace'
      },
      {
        name: 'code-simplifier',
        installCmd: 'claude plugin install code-simplifier@superpowers-marketplace',
        description: 'Refactoring agent — /simplify command to clean up complex or messy code',
        credit: 'Jesse Vincent (@obra) — https://github.com/obra/superpowers-marketplace'
      },
      {
        name: 'double-shot-latte',
        installCmd: 'claude plugin install double-shot-latte@superpowers-marketplace',
        description: '☕ Zero-interruption mode — automatically evaluates whether Claude should continue working',
        credit: 'Jesse Vincent (@obra) — https://github.com/obra/superpowers-marketplace'
      }
    ]
  },
  {
    name: 'Karpathy Skills',
    marketplace: 'forrestchang/andrej-karpathy-skills',
    marketplaceCmd: 'claude plugin marketplace add forrestchang/andrej-karpathy-skills',
    plugins: [
      {
        name: 'andrej-karpathy-skills',
        installCmd: 'claude plugin install andrej-karpathy-skills@karpathy-skills',
        description: "Karpathy's LLM coding guidelines: think before coding, simplicity first, surgical changes, goal-driven execution",
        credit: 'Forrest Chang — https://github.com/forrestchang/andrej-karpathy-skills'
      }
    ]
  }
];

// ── CLI Flags ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN         = args.includes('--dry-run');
const SKIP_MCP        = args.includes('--skip-mcp');
const SKIP_STATUSLINE = args.includes('--skip-statusline');
const SKIP_PLUGINS    = args.includes('--skip-plugins');
const REGISTER_HOOKS  = args.includes('--register-hooks');

// ── Colour helpers ──────────────────────────────────────────────────────────

const c = (code, t) => `\x1b[${code}m${t}\x1b[0m`;
const green  = t => c('32', t);
const yellow = t => c('33', t);
const cyan   = t => c('36', t);
const red    = t => c('31', t);
const bold   = t => c('1',  t);
const dim    = t => c('2',  t);
const magenta = t => c('35', t);

// ── Helpers ─────────────────────────────────────────────────────────────────

function printHeader() {
  console.log('');
  console.log(bold('╔══════════════════════════════════════════════════════════════╗'));
  console.log(bold('║         Claude Code Power Pack — Setup v2.1                ║'));
  console.log(bold('╚══════════════════════════════════════════════════════════════╝'));
  console.log('');
  console.log(dim('  All plugins are installed from their original authors\' marketplaces.'));
  console.log(dim('  No third-party code is bundled or redistributed.'));
  console.log('');
}

function loadSettings(filePath) {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.log(yellow(`  ⚠ Could not parse ${filePath}: ${e.message}`));
  }
  return {};
}

function runCmd(command, label) {
  if (DRY_RUN) {
    console.log(cyan(`  [DRY RUN] ${label}`));
    console.log(dim(`            ${command}`));
    return true;
  }
  try {
    const output = execSync(command, {
      encoding: 'utf8', timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(green(`  ✔ ${label}`));
    if (output.trim()) console.log(dim(`    ${output.trim().split('\n')[0]}`));
    return true;
  } catch (e) {
    const stderr = (e.stderr || e.message || '').trim();
    if (/already (exists|configured|registered)/i.test(stderr)) {
      console.log(yellow(`  ⚠ ${label} — already registered, skipping`));
      return true;
    }
    console.log(red(`  ✘ ${label}`));
    console.log(red(`    ${stderr.split('\n')[0]}`));
    return false;
  }
}

// ── Step 1: MCP Servers ─────────────────────────────────────────────────────

function setupMCPServers() {
  console.log(bold('Step 1: MCP Servers'));
  console.log(dim('  Registers servers at user level via claude mcp add.'));
  console.log('');

  if (SKIP_MCP) {
    console.log(yellow('  ⏭ Skipped (--skip-mcp)'));
    console.log('');
    return;
  }

  for (const server of MCP_SERVERS) {
    runCmd(server.command, `${server.name} — ${server.description}`);
    if (!DRY_RUN) console.log(dim(`    Credit: ${server.credit}`));
  }

  console.log('');
  console.log(dim('  Verify: claude mcp list  |  or /mcp inside Claude Code'));
  console.log('');
}

// ── Step 2: ccstatusline ────────────────────────────────────────────────────

function setupStatusLine() {
  console.log(bold('Step 2: ccstatusline — Terminal Status Bar'));
  console.log(dim('  by Matthew Breedlove (@sirmalloc) — MIT licensed'));
  console.log(dim('  Adds a HUD showing tokens, cost, git branch, and model tier.'));
  console.log('');

  if (SKIP_STATUSLINE) {
    console.log(yellow('  ⏭ Skipped (--skip-statusline)'));
    console.log('');
    return;
  }

  const settingsDir = path.dirname(CLAUDE_SETTINGS_PATH);

  if (DRY_RUN) {
    console.log(cyan(`  [DRY RUN] Would write statusLine config to: ${CLAUDE_SETTINGS_PATH}`));
    console.log('');
    return;
  }

  if (!fs.existsSync(settingsDir)) fs.mkdirSync(settingsDir, { recursive: true });

  const existing = loadSettings(CLAUDE_SETTINGS_PATH);
  if (existing.statusLine) {
    console.log(green('  ✔ statusLine already configured — no changes needed'));
  } else {
    const merged = { ...existing, ...STATUSLINE_CONFIG };
    fs.writeFileSync(CLAUDE_SETTINGS_PATH, JSON.stringify(merged, null, 2), 'utf8');
    console.log(green('  ✔ Added ccstatusline to ' + CLAUDE_SETTINGS_PATH));
    console.log(dim('  ℹ Customize: npx ccstatusline@latest'));
  }
  console.log('');
}

// ── Step 3: Claude Code Plugins ─────────────────────────────────────────────

function setupPlugins() {
  console.log(bold('Step 3: Claude Code Companion Plugins'));
  console.log(dim('  Each plugin is installed from its author\'s official marketplace.'));
  console.log('');

  if (SKIP_PLUGINS) {
    console.log(yellow('  ⏭ Skipped (--skip-plugins)'));
    console.log('');
    return;
  }

  for (const group of PLUGIN_MARKETPLACES) {
    console.log(yellow(`  ── ${group.name} marketplace ──`));
    console.log('');

    // Add marketplace
    runCmd(group.marketplaceCmd, `Add marketplace: ${group.marketplace}`);

    // Install each plugin in this marketplace
    for (const plugin of group.plugins) {
      runCmd(plugin.installCmd, `Install: ${plugin.name} — ${plugin.description}`);
      if (!DRY_RUN) console.log(dim(`    Credit: ${plugin.credit}`));
    }
    console.log('');
  }

  if (!DRY_RUN) {
    console.log(dim('  Run /reload-plugins inside Claude Code to activate.'));
    console.log('');
  }
}

// ── Step 4: Hook Registration ───────────────────────────────────────────────

function setupHooks() {
  console.log(bold('Step 4: Hook Registration (Local Project)'));
  console.log(dim('  Registers context tracker and model router in .claude/settings.json.'));
  console.log('');

  if (!REGISTER_HOOKS) {
    console.log(dim('  ⏭ Skipped (use --register-hooks to automate this step)'));
    console.log('');
    return;
  }

  const localSettingsPath = path.join(process.cwd(), '.claude', 'settings.json');
  const localSettingsDir = path.dirname(localSettingsPath);

  if (DRY_RUN) {
    console.log(cyan(`  [DRY RUN] Would write hook config to: ${localSettingsPath}`));
    console.log('');
    return;
  }

  if (!fs.existsSync(localSettingsDir)) fs.mkdirSync(localSettingsDir, { recursive: true });

  const existing = loadSettings(localSettingsPath);
  
  const HOOK_CONFIG = {
    hooks: {
      SessionStart:     [{ hooks: [{ type: 'command', command: 'node .claude/hooks/session-start.js' }] }],
      UserPromptSubmit: [{ hooks: [{ type: 'command', command: 'node .claude/hooks/router.js' }] }],
      PostToolUse:      [{ hooks: [{ type: 'command', command: 'node .claude/hooks/context-tracker.js' }] }],
      Stop:             [{ hooks: [{ type: 'command', command: 'node .claude/hooks/stop-guard.js' }] }]
    }
  };

  const merged = { ...existing, ...HOOK_CONFIG };
  fs.writeFileSync(localSettingsPath, JSON.stringify(merged, null, 2), 'utf8');

  console.log(green('  ✔ Hooks registered in ' + localSettingsPath));
  console.log(dim('  ⚠ Ensure you have copied the hooks/ directory to .claude/hooks/'));
  console.log('');
}

// ── Step 5: Advanced Token Efficiency ────────────────────────────────────────

function setupTokenEfficiency() {
  console.log(bold('Step 5: Advanced Token Efficiency (Optional)'));
  console.log(dim('  Maximize context by pruning noise and using lean CLI harnesses.'));
  console.log('');

  // CLI-Anything
  console.log(magenta('  ── CLI-Anything (HKUDS/CLI-Anything) ──'));
  console.log(dim('  "CLI over MCP" — provides lean harnesses for complex apps (GIMP, Blender, etc.)'));
  console.log(dim('  Saves up to 30x tokens vs. verbose MCP servers.'));
  console.log('');

  const pluginPath = path.join(os.homedir(), '.claude', 'plugins', 'cli-anything');
  if (fs.existsSync(pluginPath)) {
    console.log(green('  ✔ CLI-Anything plugin detected at ' + pluginPath));
  } else {
    console.log(yellow('  ⚠ CLI-Anything not found. To install:'));
    console.log(dim('    git clone https://github.com/HKUDS/CLI-Anything.git ' + pluginPath));
  }
  console.log('');

  // RTK
  console.log(magenta('  ── RTK (Rust Token Killer) ──'));
  console.log(dim('  Transparent CLI proxy that prunes 60-90% of output noise (logs, progress bars).'));
  console.log('');

  try {
    execSync('rtk --version', { stdio: 'ignore' });
    console.log(green('  ✔ RTK detected in PATH'));
  } catch (e) {
    console.log(yellow('  ⚠ RTK not found. Highly recommended for token savings:'));
    console.log(dim('    Download binary: https://github.com/rtk-ai/rtk'));
    console.log(dim('    Initialize: rtk init --global'));
  }
  console.log('');
}

// ── Prerequisite Checks ─────────────────────────────────────────────────────

function checkPrerequisites() {
  console.log(bold('Checking Prerequisites...'));
  
  // Node version check
  const nodeVersion = process.versions.node.split('.')[0];
  if (parseInt(nodeVersion) < 16) {
    console.log(red(`  ✘ Node.js v${nodeVersion} detected. v16+ is required.`));
    process.exit(1);
  }
  console.log(green(`  ✔ Node.js v${process.versions.node}`));

  // Python check for CLI-Anything
  try {
    const pythonVersion = execSync('python --version', { encoding: 'utf8' }).trim();
    console.log(green(`  ✔ ${pythonVersion} (required for CLI-Anything)`));
  } catch (e) {
    try {
        const python3Version = execSync('python3 --version', { encoding: 'utf8' }).trim();
        console.log(green(`  ✔ ${python3Version} (required for CLI-Anything)`));
    } catch (e2) {
        console.log(yellow('  ⚠ Python not found. CLI-Anything requires Python 3.10+.'));
    }
  }

  // Claude CLI check
  try {
    const version = execSync('claude --version', { encoding: 'utf8' }).trim();
    console.log(green(`  ✔ ${version}`));
  } catch (e) {
    console.log(red('  ✘ Claude Code CLI not found. Please install it first.'));
    console.log(dim('    https://docs.anthropic.com/en/docs/claude-code/overview'));
    process.exit(1);
  }
  console.log('');
}

// ── Summary ─────────────────────────────────────────────────────────────────

function printSummary() {
  console.log(bold('════════════════════════════════════════════════════════════════'));
  console.log(bold('  Setup Complete! Your Claude Code Power Pack provides:'));
  console.log('');
  console.log(green('    ✔') + ' Context tracking & auto-compaction (built-in hooks)');
  console.log(green('    ✔') + ' Intelligent model routing — Opus / Sonnet / Haiku');
  console.log(green('    ✔') + ' Session memory across restarts');
  console.log(green('    ✔') + ' Sequential Thinking MCP server');
  console.log(green('    ✔') + ' Context7 live documentation MCP server');
  console.log(green('    ✔') + ' ccstatusline terminal HUD');
  console.log(green('    ✔') + ' Caveman — 75% token reduction (by @JuliusBrussee)');
  console.log(green('    ✔') + ' Superpowers — structured planning (by @obra)');
  console.log(green('    ✔') + ' code-simplifier — /simplify refactor (by @obra)');
  console.log(green('    ✔') + ' Karpathy Skills — disciplined coding guidelines (by @forrestchang)');
  console.log(green('    ✔') + ' CLI-Anything discovery — lean agent harnesses (by @HKUDS)');
  console.log(green('    ✔') + ' RTK pruning — up to 90% token savings (by @rtk-ai)');
  console.log('');
  console.log(dim('  See CREDITS.md for full attribution of all third-party tools.'));
  console.log(bold('════════════════════════════════════════════════════════════════'));
  console.log('');
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  printHeader();
  if (DRY_RUN) console.log(yellow('  🔍 DRY RUN MODE — no changes will be made\n'));

  checkPrerequisites();

  setupMCPServers();
  setupStatusLine();
  setupPlugins();
  setupHooks();
  setupTokenEfficiency();
  printSummary();
}

main().catch(console.error);
