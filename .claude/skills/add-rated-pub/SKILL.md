---
name: add-rated-pub
description: Add a pub to the curated rated list in js/data.js, or promote Matt's exported in-app ratings into permanent curated entries. Use when Matt provides ratings or asks to add/promote a pub.
---

# Add or promote a rated pub

The curated list `js/data.js` is what turns anonymous purple dots into
colour-coded blobs for everyone. Matt supplies ratings either as pasted
export text (from the app's "Export my ratings" button) or in conversation
("add the Pembury Tavern, it's a 4.5").

## Steps

1. For each pub to add, find its authoritative entry in `js/osm-data.js`
   (search by name; verify the coordinates are the right pub if the name is
   common — ask Matt which area if ambiguous, in plain English).
2. Build the new entry in the exact house format of `js/data.js`:
   ```js
   { name: "The Pembury Tavern", type: "pub", area: "Hackney", lat: 51.5531, lng: -0.05984, rating: 4.5,
     keywords: ["keyword1", "keyword2", "keyword3"],
     desc: "One goblin-voiced sentence about the pub." },
   ```
   - `lat`/`lng`: copy from the OSM entry (surveyed positions), not from
     memory and not from Matt's export (which may predate a coords fix).
   - `area`: the neighbourhood, capitalised like existing entries.
   - `keywords`: 3–4 short lowercase phrases. Use Matt's words if he gave
     any; otherwise start from the OSM entry's keywords and sharpen.
   - `desc`: one sentence, in the guide's mischievous voice (read a few
     existing entries first and match the register).
   - `rating`: Matt's number. If outside 3.0–5.0, ask him — check.mjs
     rejects it otherwise.
3. Insert the entry under the most fitting `// ---- region ----` comment
   section in `js/data.js`.
4. If the pub is already in the curated list, update its `rating` (and
   nothing else) instead of adding a duplicate — check.mjs catches
   name+area duplicates.
5. Run `node scripts/check.mjs` → must end `ALL CHECKS PASSED`.
6. Commit (`Add <pub name> to curated list (4.5)`) and push to `main`.
7. Follow the session-close protocol in CLAUDE.md.

**Tell Matt to verify:** wait 2 minutes, hard-refresh the live site, search
the pub's name — it should now be a coloured blob (not a purple dot) with
his rating on it, and its popup should show the keywords and description.

## Do not

- Do not remove the pub's OSM twin from `js/osm-data.js` — the app's
  dedupe handles that automatically at load time.
- Do not invent ratings for pubs Matt hasn't rated or asked for.
