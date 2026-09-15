## wiki — this repo's decision record

`wiki/` holds what we DECIDED and why. **Read `wiki/index.md` first, then only the pages it
points to** — never the whole wiki.

⛔ Never edit a page, `index.md` or `log.md` by hand; they are content-hashed and derived.
Write through the verbs (WSL is handled for you; reads are native):

```bash
W="${WIKI_CONNECT:-/e/agentos-setup/ops/wiki/wiki-connect.sh}"   # per machine: WIKI_CONNECT + WIKI_AGENT
bash $W index                      # catalog — start here
bash $W read <page-name>           # first line is: --hash <sha>
cat body.md | bash $W file --tier business --name <page> --summary "one line" [--hash <sha>]
```

Pass back the `--hash` you read, or the write is refused. File a page **after a notable decision
or finding**, not on a schedule. `--tier`: `business` · `personal` · `research`.
