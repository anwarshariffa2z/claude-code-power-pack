# AI OS : Second Brain (3D vault graph)

Your Obsidian vault rendered as a 3D glowing constellation. Your notes and links never leave your machine. The graph library and the glow effect load from a CDN, so the page needs internet to render.

## Open it

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

It boots with a demo brain so you can see it immediately.

## Rebuild from your own vault

```bash
python3 build-graph.py
```

`build-graph.py` auto-detects your vault (it checks `~/Documents/My Vault` first). If yours lives elsewhere, add its path to the `CANDIDATES` list at the top of the file. Rerun any time, then reload the page.

## Files

- `index.html` : the 3D scene (loads 3d-force-graph + three from a CDN)
- `graph-data.js` : the graph data, nodes = notes, links = wikilinks. Ships with a demo dataset.
- `build-graph.py` : parses your vault, extracts `[[wikilinks]]`, regenerates `graph-data.js`

## Controls

Drag to orbit, scroll to zoom, click a node to fly in and inspect it. Click a layer in the sidebar to isolate it. It auto-orbits until you interact.

## Colors

Each vault folder becomes a colored layer: Business orange, People green, Playbooks gold, Daily Notes gray, and so on.
