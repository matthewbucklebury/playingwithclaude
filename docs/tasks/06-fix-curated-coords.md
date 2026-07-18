# Task 06 — Fix curated pub positions (snap to OSM)

**Priority:** MUST · **Model:** Sonnet · **Depends on:** nothing

## Objective

The 134 curated pubs' coordinates were written from memory and can be off by
~100 m — enough to put a blob on the wrong street. OpenStreetMap's positions
are surveyed and accurate. Snap each curated pub to its matching OSM entry's
coordinates, and produce a plain-English report of curated pubs that have NO
OSM match (possible closures or bad entries) for Matt to review. This is a
one-off script run — the script itself is disposable.

## Files involved

- `scripts/snap-coords.mjs` (new, one-off)
- `js/data.js` (coordinates updated by the script)
- `js/app.js` — NOT touched
- `js/osm-data.js` — read only, NOT modified

## Steps

1. Write `scripts/snap-coords.mjs` (zero dependencies, same loading trick as
   `scripts/check.mjs`):
   - Load PUBS and OSM_PUBS.
   - For each curated pub, find OSM entries whose normalised name matches
     (reuse the same normalisation as app.js: lowercase, strip leading
     "the"/"ye olde", strip non-alphanumerics) within 500 m (haversine).
   - If exactly one match, or one clearly nearest match: rewrite lat/lng in
     `js/data.js` with the OSM values (do a careful text replacement of that
     entry's `lat: X, lng: Y` only — preserve all formatting and comments).
   - Collect: snapped (with distance moved), ambiguous (2+ similar
     distances), unmatched.
   - Print a readable report: `SNAPPED 51.5093,-0.0345 → 51.50921,-0.03434
     (12 m) The Grapes`, then lists of AMBIGUOUS and UNMATCHED names.
2. Run it. Expect most pubs snapped by small distances. Investigate any
   snap that moved a pub more than 300 m — that's probably a wrong match;
   exclude it and note it in the report instead.
3. Run `node scripts/check.mjs` → ALL CHECKS PASSED (it validates every
   coordinate is still inside London).
4. Serve locally; spot-check 5 famous pubs (The Harp, The French House,
   Churchill Arms, The Grapes, Ye Olde Cheshire Cheese) — each blob should
   sit on the right street, and no duplicate purple dot should appear
   underneath (the dedupe uses 300 m, snapping brings pairs closer, so
   dedupe should only improve).
5. Put the UNMATCHED list into the session-close message for Matt in plain
   English: "These curated pubs have no OpenStreetMap entry nearby — they
   may have closed: … Say the word and a later session removes them."
   Also paste the list into `docs/HANDOVER.md` under Current state.
6. Commit (`js/data.js`, the new script, HANDOVER update) and push.

## Acceptance criteria

- Curated coordinates snapped where a confident match exists; report of
  unmatched pubs delivered to Matt and recorded in HANDOVER.md; check passes.

## How Matt verifies this

On the live site (hard-refresh):
1. Find The Harp (search "Harp"). Tap its blob, tap "Walking directions" —
   Google Maps should point at Chandos Place, Covent Garden, and the pin
   should be on the pub, not a neighbouring street.
2. Repeat for the Churchill Arms (Kensington Church St) and The Grapes
   (Narrow Street, Limehouse).
3. Zoom in close on any big blob: there should not be a separate purple dot
   for the same pub right next to it.

## Do not

- Do not delete any curated pub in this task (even suspected closures) —
  report them; removal is Matt's call in a later session.
- Do not rewrite `js/data.js` wholesale (e.g. regenerating it from objects);
  edit only the lat/lng numbers so descriptions and comments survive.
- Do not modify `js/osm-data.js` or `js/app.js`.

## Rollback

```sh
git revert HEAD && git push origin main
```
