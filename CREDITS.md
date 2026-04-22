# Credits & Acknowledgements

Claude Code Power Pack is built on the shoulders of giants. This project integrates
and builds upon the excellent work of these developers and organizations:

---

## 🛠️ Tools & Integrations

### ccstatusline
> Terminal status bar for Claude Code — shows tokens, cost, git info, and more

- **Author:** Matthew Breedlove ([@sirmalloc](https://github.com/sirmalloc))
- **Repository:** https://github.com/sirmalloc/ccstatusline
- **npm:** https://www.npmjs.com/package/ccstatusline
- **License:** MIT
- **Usage:** Referenced in `setup.js` as the `statusLine` command handler in Claude Code settings

---

### Sequential Thinking MCP Server
> MCP server for structured, step-by-step reasoning in complex tasks

- **Author:** Anthropic & the Model Context Protocol team
- **Repository:** https://github.com/modelcontextprotocol/servers
- **npm:** `@modelcontextprotocol/server-sequential-thinking`
- **License:** MIT
- **Usage:** Registered via `claude mcp add` in `setup.js` to give Claude a structured thinking tool

---

### Context7 MCP Server
> MCP server providing live, version-specific library documentation

- **Author:** [Upstash](https://upstash.com)
- **Repository:** https://github.com/upstash/context7
- **npm:** `@upstash/context7-mcp`
- **License:** MIT (MCP client code); backend service is proprietary/hosted by Upstash
- **Usage:** Registered via `claude mcp add` in `setup.js` to give Claude real-time API docs

---

### Superpowers (Claude Code Plugin)
> Agentic skills framework — structured planning, brainstorming, and workflow skills

- **Author:** Jesse Vincent ([@obra](https://github.com/obra))
- **Marketplace:** https://github.com/obra/superpowers-marketplace
- **License:** See repository
- **Usage:** Optional companion plugin, installed separately inside Claude Code via `/plugin install`

---

### code-simplifier (Claude Code Plugin)
> Refactoring agent — the `/simplify` command for cleaning up complex code

- **Author:** Jesse Vincent ([@obra](https://github.com/obra)) via the Superpowers marketplace
- **Marketplace:** https://github.com/obra/superpowers-marketplace
- **License:** See repository
- **Usage:** Optional companion plugin, installed separately inside Claude Code via `/plugin install`

---

## 🤖 Platform

### Claude Code
> The AI coding assistant this plugin is built for

- **Author:** [Anthropic](https://anthropic.com)
- **Documentation:** https://docs.anthropic.com/en/docs/claude-code/overview
- **License:** Proprietary

### Model Context Protocol (MCP)
> The open protocol that enables Claude to communicate with external tools and servers

- **Author:** [Anthropic](https://anthropic.com) & the open-source community
- **Website:** https://modelcontextprotocol.io
- **Repository:** https://github.com/modelcontextprotocol
- **License:** MIT

---

## 📝 License

The original code in this repository (hooks, agents, skills, setup script) is released
under the **MIT License** — see [LICENSE](LICENSE) for details.

All third-party tools listed above retain their respective licenses. This project
does not redistribute any third-party code — it only references, integrates, and
provides setup automation for these tools.

---

*If you are an author of any tool referenced here and would like to update this
attribution or request changes, please open an issue or pull request.*
