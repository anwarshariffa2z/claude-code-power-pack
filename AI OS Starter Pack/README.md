# AI OS Starter Pack

Everything you need to build your own AI Operating System and second brain in one session, using Claude Code and Obsidian.

## What is in here

```
AI-OS-Starter-Pack/
  messages/            The prompts you paste, in order
    01 - First Message (Onboarding).md        Interview + installs vault, hooks, skills
    02 - Build the AI OS Brain (3D graph).md  Turns your vault into the 3D brain
    03 - Install My Configuration.md          Wires the full tool stack (your keys)
  ai-os-brain/         The runnable 3D brain (open index.html, or run build-graph.py)
  configuration/       What the tool stack, skills, and rules actually are
```

## How to use it (three messages, in order)

1. Install Obsidian and Claude Code. Nothing else.
2. Paste **Message 01**. It interviews you, then installs your vault, hooks, and skills.
3. Paste **Message 02**. It reads your vault and renders your brain in 3D.
4. Paste **Message 03**. It wires the tools (WhatsApp, Gmail, scrapers, databases, and more) using YOUR own accounts and YOUR own keys.

From there, every correction you give it becomes a permanent rule, and the system gets sharper every day.

## See the brain right now

```bash
cd ai-os-brain
python3 -m http.server 8000
# open http://localhost:8000
```

It boots with a demo brain so you can see it immediately. Run `python3 build-graph.py` to rebuild it from your own vault.

## Privacy

No API keys and no personal notes are in this pack. The brain ships with a generic demo dataset, and the tool stack connects to your own accounts. Everything runs locally on your machine.
