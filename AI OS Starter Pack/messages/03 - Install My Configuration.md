# Third Message - Install My Configuration (Optional)

Paste this as your third message to Claude Code, AFTER you have run `FIRST_MESSAGE.md` (the interview + vault + hooks + skills) and let it finish.

`FIRST_MESSAGE.md` gives you the brain. This gives you my hands. It is the exact stack of tools I actually use every day, wired into Claude so your OS can send WhatsApps, read your inbox, book calls, scrape the web, spin up databases, edit video, and build UIs. None of my API keys are in here. Every service you connect uses your own account and your own keys.

---

## What you paste

> This is my third setup message. I already ran FIRST_MESSAGE.md and it finished. Now install the reference configuration: the full tool stack from THIRD_MESSAGE.md.
>
> First, ask me ONE question: do I want the **full stack** (everything below), or do I want to **pick and choose** from a numbered menu? Wait for my answer.
>
> Then install only what I picked. For every service, use MY OWN account and MY OWN key. If I do not have a key for something yet, register the MCP anyway, tell me exactly where to drop the key later, and move on. Never stop the whole run because one key is missing. Report progress as you go, and at the end print a table of every tool: name, status (live / needs key / needs app), and what it does.

That is the whole instruction. Everything below is the reference Claude follows to install each piece.

---

## The stack (what "my configuration" actually is)

### A. Local MCP servers (run on your Mac, added via the Claude Code CLI)

Claude registers these with `claude mcp add`. Where a key is needed, it is YOUR key, stored on YOUR machine.

1. **WhatsApp** - read and send WhatsApp from your OS, fully local (your messages never leave your machine).
   - Clone the bridge, then register it:
     ```bash
     git clone https://github.com/lharries/whatsapp-mcp ~/Code/whatsapp-mcp 2>/dev/null || echo "already cloned"
     claude mcp add whatsapp -- /opt/homebrew/bin/uv --directory ~/Code/whatsapp-mcp/whatsapp-mcp-server run main.py
     ```
   - First run prints a QR code. Scan it from WhatsApp on your phone (Linked Devices). That is the only login step.

2. **Playwright** - a real headless browser so the OS can test sites, click through flows, and screenshot proof.
   ```bash
   claude mcp add playwright -- npx -y @playwright/mcp@latest --browser webkit --headless
   ```

3. **shadcn** - pull production UI components straight into any build.
   ```bash
   claude mcp add shadcn -- npx -y shadcn-mcp-server
   ```

4. **21st Magic** - premium animated UI components, heroes, backgrounds, and logos.
   ```bash
   claude mcp add magic21 --env API_KEY=YOUR_21ST_KEY -- npx -y @21st-dev/magic@latest
   ```
   Get your key at 21st.dev (Magic API key). Free tier works; the Builder plan removes limits.

5. **Gmail** - already installed by FIRST_MESSAGE.md if you chose it. To activate: get `credentials.json` from Google Cloud Console and save it to `~/.claude/credentials/gmail_credentials.json` (guide in `~/.claude/credentials/README.md`).

6. **Vault Search** - semantic search over your whole second brain. Already installed by FIRST_MESSAGE.md (ChromaDB + Ollama). Nothing to do here.

### B. Desktop-app MCPs (need the Mac app installed first)

These only appear once their app is running. Claude should register them if the app is present, and otherwise tell you which app to install.

7. **Pencil** - design canvas driven by Claude. Install the Pencil app, then it exposes its MCP automatically.
8. **Palmier** - edit video and screen recordings from Claude (timeline, captions, title cards, export). Install Palmier Pro; it serves its MCP locally.
   ```bash
   claude mcp add --transport http palmier-pro http://127.0.0.1:19789/mcp
   ```

### C. Hosted MCP servers (remote, sign in with your account)

9. **Magnific** - image and video generation.
   ```bash
   claude mcp add --transport http magnific https://mcp.magnific.com
   ```
10. **Excalidraw** - diagrams and on-screen explainer boards.
    ```bash
    claude mcp add --transport http excalidraw https://api.excalidraw.com/api/v1/mcp
    ```
11. **Zapier** - 7000+ app actions through one connector.
    ```bash
    claude mcp add --transport http Zapier-MCP https://mcp.zapier.com/api/v1/connect
    ```
    On first use it opens a browser to authorize with YOUR Zapier account.

### D. Connectors (add inside Claude, then sign in as yourself)

These are one-click OAuth connectors. In Claude Code / Claude Desktop, open the connectors menu and add each, signing in with your own account. No keys to paste, no keys of mine involved.

12. **Google Workspace** - Gmail, Google Calendar, Google Drive
13. **Calendly** - read availability and create booking links
14. **Fathom** - sales-call recordings and transcripts
15. **Fireflies** - meeting notes and transcripts
16. **Apify** - web + social scrapers and video transcripts (drop your Apify token at `~/.claude/credentials/apify.env` for CLI use too)
17. **Supabase** - spin up and query project databases

### E. Skills and hooks (already yours)

FIRST_MESSAGE.md already copied my skills (`~/.claude/skills/`), rule bank (`~/.claude/rule-bank/`), and hooks (`~/.claude/hooks/`) into place. That includes client-delivery, outreach-reply, voice-model, pdf-generation, self-learn, and the workshop skills (aios-audit, aios-level-up, skill-builder, v0-dashboard). Nothing extra to install here.

---

## Rules Claude must follow while installing

- Ask full-stack vs pick-and-choose FIRST. Install only what I chose.
- Every key and login is MINE. Never use, ask for, or invent someone else's key.
- If a key or app is missing, register the MCP, tell me exactly where the key goes or which app to install, and keep going. Do not abort the run.
- After each `claude mcp add`, note it as registered. Do not claim a tool is "live" until it actually connects.
- End with a status table: Tool | Status (live / needs key / needs app) | What it does.

---

## The one-line version (if you just want everything)

> Install the full reference configuration from THIRD_MESSAGE.md. Full stack, my own accounts and keys, skip nothing, tell me where any missing key goes, and print the final status table.
