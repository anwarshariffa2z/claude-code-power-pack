# Contributing to Claude Code Power Pack ⚡

Thank you for your interest in making Claude Code even more powerful! We welcome contributions that help automate, optimize, and enhance the developer experience.

## 🛠️ How to Contribute

### 1. Adding a New Skill
Skills live in the `skills/` directory. Each skill should:
- Have a clear `SKILL.md` explaining its purpose and behavior.
- Follow the official Claude Code skill format.
- Be focused on a specific problem (e.g., "React 19 migration", "Security auditing").

### 2. Adding a New Hook
Hooks live in the `hooks/` directory. If you add a hook:
- Update `plugin.json` to register it.
- Update `setup.js` if it requires special configuration.
- Ensure it handles errors gracefully to avoid blocking the main Claude session.

### 3. Adding a Companion Tool
If you find an excellent MCP server or third-party plugin:
- Add it to the `PLUGIN_MARKETPLACES` or `MCP_SERVERS` array in `setup.js`.
- Update `GUIDE.md` and `README.md` with descriptions and usage examples.
- Add proper attribution in `CREDITS.md`.

## 🧪 Development Guidelines

- **Simplicity First**: We follow Karpathy's principles. Don't add complexity where a simpler hook or skill would work.
- **Token Efficiency**: Always consider the context window. Use `Caveman` principles in your hooks' output.
- **Cross-Platform**: Ensure your scripts work on Windows (cmd/powershell) and macOS/Linux (bash/zsh).

## 🚀 Submission Process

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-skill`).
3. Commit your changes (`git commit -m 'Add amazing skill'`).
4. Push to the branch (`git push origin feature/amazing-skill`).
5. Open a Pull Request.

---

*Build with ❤️ by the Claude Code community.*
