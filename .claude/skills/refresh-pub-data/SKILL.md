---
name: refresh-pub-data
description: Refresh js/osm-data.js with the latest pubs and bars from OpenStreetMap. Use when Matt asks to refresh/update the pub data, or roughly every 2-3 months.
---

# Refresh the OSM pub data

Follow these steps exactly, in order. Do not combine this with any other work.

1. Confirm a clean start: `git status` must show a clean tree on `main`.
   If not, stop and resolve that first.
2. Record the current count — run `node scripts/check.mjs` and note the
   "N OSM entries" number from its output.
3. Run the refresh:
   ```sh
   node scripts/fetch-osm.mjs
   ```
   It may retry across mirrors — that's normal. If it fails entirely, the
   free Overpass servers are busy: wait 10 minutes and try once more. If it
   still fails, stop, run `git checkout js/osm-data.js`, and tell Matt to
   try another day. Never run the script in a rapid loop.
4. Validate: `node scripts/check.mjs` must end `ALL CHECKS PASSED`.
   If it fails (usually: entry count collapsed because the download was
   partial), restore with `git checkout js/osm-data.js` and stop.
5. Sanity-compare counts: the new count should be within ~10% of the old
   one. A swing bigger than that is suspicious — restore and stop.
6. Diff scale check: `git diff --stat js/osm-data.js` — only that one file
   should have changed.
7. Commit and push:
   ```sh
   git add js/osm-data.js
   git commit -m "Refresh OSM pub data (N entries)"
   git push origin main
   ```
8. Follow the session-close protocol in CLAUDE.md (HANDOVER.md session-log
   entry: old count → new count).

**Tell Matt to verify:** wait 2 minutes, hard-refresh the live site, and
check the spot count in the top-right of the filter row roughly matches the
new number. Tap a couple of purple dots to confirm popups still work.
