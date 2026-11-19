# Second Message - Build the AI OS Brain (the 3D graph)

This turns your vault into the living 3D brain you saw in the video: every note a glowing node, every `[[link]]` an edge, colored by layer, orbiting in space, click any node to inspect it.

There are two ways to do this. Use the fast path unless you want Claude to rebuild it from scratch on camera.

---

## Fast path (30 seconds)

This pack already ships the brain in `ai-os-brain/`. Paste this to Claude Code:

> Go to the `ai-os-brain/` folder in my AI OS Starter Pack. Run `python3 build-graph.py` so it reads MY vault and rebuilds `graph-data.js` with my real notes. Then start a local server (`python3 -m http.server 8000`) and open http://localhost:8000 so I can see my own brain. Tell me the node and link count.

`build-graph.py` auto-detects your vault (it checks `~/Documents/My Vault` first). If your vault lives elsewhere, open `build-graph.py` and add your path to the `CANDIDATES` list at the top.

---

## Full build path (if you want Claude to build it live from scratch)

Paste this. It is written so the page always renders, even if a step is skipped.

> Build me a 3D "second brain" visualization of my Obsidian vault, as a single self-contained web app. Requirements:
>
> 1. **Read my vault.** Write a small Python script `build-graph.py` that walks my vault (auto-detect `~/Documents/My Vault`, skip `.obsidian/.trash/.git`), turns every `.md` note into a node, and every `[[wikilink]]` into a link. Group each node by its top folder (Daily Notes, People, Playbooks, Business, Claude Memory, Projects, etc.). Node size = number of connections. Write the result to `graph-data.js` as `const GRAPH_DATA = {nodes, links}`. Everything stays local.
> 2. **Render it in 3D** using the `3d-force-graph` library (WebGL). Dark near-black background, nodes glowing, edges as faint orange lines with directional particles, auto-orbit camera. Color each node by its group from a fixed palette (warm orange / clay / green / amber family, one cool accent per extra layer, NO purple).
> 3. **Make it an OS console, not a toy.** Left sidebar with a brand mark and a clickable list of every layer with live counts. A top status bar with total nodes and links. A right inspector panel that fills in when I click a node (its layer, its connections, what the OS can do with it). Click a layer to isolate it; click a node to fly the camera to it.
> 4. **Bulletproof.** The page must render with content visible by default. If `graph-data.js` is missing, ship a small built-in demo dataset so it never boots blank. No section starts at `opacity:0` waiting on JS.
> 5. Start a local server and open it so I can see MY brain. Report the node and link count.
>
> Keep it to one `index.html` plus `graph-data.js`, `build-graph.py`, and the graph library in a `lib/` folder. Plain static, no build step, opens by double-clicking or via `python3 -m http.server`.

---

## What "good" looks like

- The graph fills the screen with hundreds of glowing nodes and thousands of links, slowly orbiting.
- Clicking "People" isolates just your contacts; clicking a node opens an inspector with its connections.
- Node counts in the sidebar match your real note counts.
- Zero console errors. It opens from a plain folder, no `npm run dev`.

This is the hero visual of the whole video. Get it on screen first, then build everything else around it.
