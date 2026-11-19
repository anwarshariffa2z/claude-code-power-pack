#!/usr/bin/env python3
"""Build graph-data.js from YOUR Obsidian vault.
Run:  python3 build-graph.py
It reads every .md note, extracts [[wikilinks]], and writes the nodes + links
for the 3D brain. 100% local. Nothing leaves your machine.
"""
import os, re, json

# Auto-detect your vault. First match wins. Add your own path at the top if needed.
CANDIDATES = [
    "~/Documents/My Vault",
    "~/Documents/2ndBrain",
    "~/Obsidian/My Vault",
    "~/Library/Mobile Documents/com~apple~CloudDocs/My Vault",
]
VAULT = next((os.path.expanduser(p) for p in CANDIDATES if os.path.isdir(os.path.expanduser(p))), None)
if not VAULT:
    raise SystemExit("No vault found. Edit CANDIDATES at the top of build-graph.py with your vault path.")

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "graph-data.js")
SKIP_DIRS = {".obsidian", ".trash", ".git", "attachments"}

notes = {}
for root, dirs, files in os.walk(VAULT):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for f in files:
        if not f.endswith(".md"):
            continue
        stem = f[:-3]
        rel = os.path.relpath(os.path.join(root, f), VAULT)
        parts = rel.split(os.sep)
        if len(parts) == 1:
            group = "Root"
        elif parts[0] == "Notes" and len(parts) >= 3:
            group = parts[1]
        else:
            group = parts[0]
        notes[stem] = {"path": rel, "group": group}

lower_map = {}
for stem in notes:
    lower_map.setdefault(stem.lower(), stem)

LINK_RE = re.compile(r"\[\[([^\]\|#]+)")
links, degree = [], {}
for stem, meta in notes.items():
    try:
        with open(os.path.join(VAULT, meta["path"]), encoding="utf-8", errors="ignore") as fh:
            text = fh.read()
    except OSError:
        continue
    for m in LINK_RE.finditer(text):
        target = lower_map.get(m.group(1).strip().lower())
        if target and target != stem:
            links.append({"source": stem, "target": target})
            degree[stem] = degree.get(stem, 0) + 1
            degree[target] = degree.get(target, 0) + 1

seen, uniq = set(), []
for l in links:
    k = (l["source"], l["target"])
    if k not in seen and (k[1], k[0]) not in seen:
        seen.add(k)
        uniq.append(l)

nodes = [{"id": s, "group": m["group"], "val": max(1, degree.get(s, 0))} for s, m in notes.items()]
with open(OUT, "w", encoding="utf-8") as fh:
    fh.write("const GRAPH_DATA = " + json.dumps({"nodes": nodes, "links": uniq}) + ";\n")

groups = {}
for n in nodes:
    groups[n["group"]] = groups.get(n["group"], 0) + 1
print(f"Built your brain: nodes={len(nodes)} links={len(uniq)}")
print("Groups:", groups)
print("Now open index.html (or: python3 -m http.server 8000  ->  http://localhost:8000)")
