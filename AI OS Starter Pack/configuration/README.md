# The Configuration

This is the full working setup the OS runs on: the tool stack, the skills, and the always-on rules. Message 03 installs it. This file is the reference for what each layer is.

## The RAPID stack (how the OS is organized)

- **R - Rules.** Always-on enforcement in `~/.claude/rule-bank/`. Every correction becomes a permanent rule, so a mistake never happens twice.
- **A - Awareness.** The vault + `CLAUDE.md` + semantic search. The OS knows who you are, what you are working on, and your history.
- **P - Playbooks.** Reusable skills in `~/.claude/skills/` (client-delivery, outreach-reply, voice-model, pdf-generation, self-learn, and the workshop skills).
- **I - Integrations.** The MCP + connector stack below. This is the OS's hands.
- **D - Daemons.** Hooks + scheduled tasks: phone notifications, morning routines, vault maintenance on every message.

## The tool stack (Integrations)

Full install commands are in `messages/03 - Install My Configuration.md`. The stack, at a glance:

| Tool | What it does | How it connects |
| --- | --- | --- |
| WhatsApp | Read + send WhatsApp, fully local | Local MCP (QR login) |
| Gmail | Read + draft mail in your voice | Local MCP + Google creds |
| Google Calendar / Drive | Events, scheduling, docs, files | Connector (OAuth) |
| Playwright | Live browser testing + screenshot proof | Local MCP |
| 21st Magic | Premium animated UI components | Local MCP + your key |
| shadcn | Production UI components | Local MCP |
| Magnific | Image + video generation | Hosted MCP |
| Excalidraw | Diagrams + on-screen boards | Hosted MCP |
| Pencil | Design canvas | Desktop app MCP |
| Palmier | Video + screen-recording editing | Desktop app MCP |
| Zapier | 7000+ app actions | Hosted MCP (OAuth) |
| Calendly | Availability + booking links | Connector |
| Fathom | Sales-call recordings + transcripts | Connector |
| Fireflies | Meeting notes + transcripts | Connector |
| Apify | Web + social scrapers, video transcripts | Connector + token |
| Supabase | Project databases | Connector |
| Vault Search | Semantic recall over the whole brain | Local MCP (Ollama) |

## Skills (Playbooks) that ship in this pack

Installed by Message 01 into `~/.claude/skills/`:

- `client-delivery` - the full build-test-deploy-document cycle
- `outreach-reply` + `voice-model` - reply to leads in your exact voice
- `pdf-generation` - branded PDF proposals and invoices
- `self-learn` - how lessons crystallize into permanent skills and rules
- `aios-audit` - score any setup 0-100 across the RAPID layers (this is also your sales weapon)
- `aios-level-up` - find the weakest layer and upgrade it end to end
- `skill-builder` - build new skills with the six-step framework
- `v0-dashboard` - generate real hosted dashboards

## The rule that makes it compound

Every time you correct the OS, a hook writes that correction into `~/.claude/rule-bank/` as a permanent rule that loads on every future session. The system gets sharper every day instead of repeating the same mistakes. That is the whole point of an OS over a chatbot.
