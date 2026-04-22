# Credits & Acknowledgements

Claude Code Power Pack integrates and automates the setup of tools built by these
developers and organizations. All plugins are installed from their authors' official
sources — no third-party code is bundled or redistributed here.

---

## 🛠️ Companion Tools & Plugins

### ccstatusline
> Terminal status bar — tokens, cost, git branch, model, session time

- **Author:** Matthew Breedlove ([@sirmalloc](https://github.com/sirmalloc))
- **Repository:** https://github.com/sirmalloc/ccstatusline
- **npm:** https://www.npmjs.com/package/ccstatusline
- **License:** MIT
- **How we use it:** Referenced as the `statusLine` command in Claude Code settings (configured by `setup.js`)

---

### Sequential Thinking MCP Server
> Structured step-by-step reasoning tool for complex problems

- **Author:** Anthropic & the Model Context Protocol team
- **Repository:** https://github.com/modelcontextprotocol/servers
- **npm:** `@modelcontextprotocol/server-sequential-thinking`
- **License:** MIT
- **How we use it:** Registered via `claude mcp add` in `setup.js` to give Claude a structured thinking tool

---

### Context7 MCP Server
> Live, version-specific library documentation

- **Author:** [Upstash](https://upstash.com)
- **Repository:** https://github.com/upstash/context7
- **npm:** `@upstash/context7-mcp`
- **License:** MIT (MCP client code); backend service is hosted by Upstash
- **How we use it:** Registered via `claude mcp add` in `setup.js` for real-time API docs

---

### Caveman
> 🪨 Cuts ~75% of output tokens by making Claude respond concisely — same accuracy, way less fluff

- **Author:** Julius Brussee ([@JuliusBrussee](https://github.com/JuliusBrussee))
- **Repository:** https://github.com/JuliusBrussee/caveman
- **Stars:** 42.9k+ ⭐
- **License:** MIT
- **Marketplace:** `JuliusBrussee/caveman`
- **How we use it:** Installed via `claude plugin install caveman@caveman` from the author's own marketplace

---

### Superpowers
> Agentic skills framework — structured planning, brainstorming, and workflow methodology

- **Author:** Jesse Vincent ([@obra](https://github.com/obra))
- **Marketplace:** https://github.com/obra/superpowers-marketplace
- **License:** See repository
- **How we use it:** Installed via `claude plugin install superpowers@superpowers-marketplace`

---

### double-shot-latte
> ☕ Zero-interruption mode — automatically evaluates whether Claude should continue working

- **Author:** Jesse Vincent ([@obra](https://github.com/obra))
- **Repository:** https://github.com/obra/double-shot-latte
- **License:** See repository
- **How we use it:** Installed via `claude plugin install double-shot-latte@superpowers-marketplace` to reduce "Would you like me to continue?" prompts.

---

### Andrej Karpathy Skills
> Disciplined AI-assisted coding principles: think before coding, simplicity first, surgical changes, goal-driven execution

- **Author:** Forrest Chang ([@forrestchang](https://github.com/forrestchang))
- **Repository:** https://github.com/forrestchang/andrej-karpathy-skills
- **Based on:** Principles articulated by [Andrej Karpathy](https://github.com/karpathy)
- **Marketplace:** `forrestchang/andrej-karpathy-skills`
- **License:** See repository
- **How we use it:** Installed via `claude plugin install andrej-karpathy-skills@karpathy-skills`

---

## 🤖 Platform

### Claude Code
- **Author:** [Anthropic](https://anthropic.com)
- **Documentation:** https://docs.anthropic.com/en/docs/claude-code/overview
- **License:** Proprietary

### Model Context Protocol (MCP)
- **Author:** [Anthropic](https://anthropic.com) & the open-source community
- **Website:** https://modelcontextprotocol.io
- **Repository:** https://github.com/modelcontextprotocol
- **License:** MIT

---

### RTK (Rust Token Killer)
> ✂️ High-performance CLI proxy to prune 60-90% of output noise

- **Author:** [RTK AI Team](https://github.com/rtk-ai)
- **Repository:** https://github.com/rtk-ai/rtk
- **License:** MIT
- **How we use it:** Acts as a transparent proxy between Claude and the shell to maximize context efficiency.

---

### CLI-Anything
> 🚀 "CLI over MCP" — Making all software agent-native with lean harnesses

- **Author:** [HKUDS Lab](https://github.com/HKUDS)
- **Repository:** https://github.com/HKUDS/CLI-Anything
- **License:** Apache-2.0
- **How we use it:** Provides high-efficiency CLI harnesses for complex applications to save up to 30x tokens vs. verbose MCP integrations.

---

## 📝 License

The original code in this repository — the hooks (`router.js`, `context-tracker.js`, `session-start.js`, `stop-guard.js`), agents, skills, and `setup.js` — is released under the **MIT License**. See [LICENSE](LICENSE) for details.

All third-party tools listed above retain their respective licenses. This project does not redistribute any third-party code — it only references, integrates, and provides setup automation for these tools.

---

*If you are an author of any tool referenced here and would like to update this attribution or request changes, please open an issue or pull request at https://github.com/anwarshariffa2z/claude-code-power-pack*
