# Task 03 — Richer pub info (address, website, opening hours text)

**Priority:** MUST · **Model:** Sonnet · **Depends on:** nothing
(but do after 01 so Matt can verify on the live site)

## Objective

OpenStreetMap knows more than we currently keep: street addresses, websites,
phone numbers, and opening hours. Carry those fields through the data
pipeline and show them in the popups, so tapping a pub answers "where
exactly, and can I look it up?". Opening hours are shown as plain text only
in this task — the clever "open now" logic is task 07, not this one.

## Files involved

- `scripts/fetch-osm.mjs` (keep more tags)
- `js/osm-data.js` (regenerated output — never hand-edited)
- `js/app.js` (popup rendering only)
- `scripts/check.mjs` (extend the OSM entry validation)

## Steps

1. In `scripts/fetch-osm.mjs`, where each row is built, add optional fields
   (only include a key when the tag exists, to keep the file small):
   - `addr` from `addr:housenumber` + `addr:street` joined with a space,
     plus `addr:postcode` if present (e.g. `"47 Narrow St, E14 8DP"`).
   - `web` from `website` or `contact:website` (first one present).
   - `hours` from `opening_hours` (raw string, verbatim).
2. Re-run `node scripts/fetch-osm.mjs`. If Overpass is busy it retries
   automatically; if it fails entirely, wait 10 minutes and retry. If the
   new `js/osm-data.js` makes check.mjs fail, restore it
   (`git checkout js/osm-data.js`) and stop — report in HANDOVER.md.
3. In `js/app.js` `popupHtml()`, after the keywords line, add (all optional,
   escape everything with the existing `escapeHtml`):
   - address line in the same muted style as `.pop-meta`;
   - hours as `🕰 <hours text>`;
   - a "Website" link next to "Walking directions" (target `_blank`,
     `rel="noopener"`). Display the link as "Website", never the raw URL.
4. Curated pubs (`js/data.js`) don't have these fields — the popup must
   simply omit the lines, no blanks, no "undefined".
5. Extend `scripts/check.mjs`: for OSM entries, if `addr`/`web`/`hours`
   exist they must be non-empty strings; count entries with `hours` and
   print it (expect several hundred at least).
6. Run `node scripts/check.mjs` → ALL CHECKS PASSED. Serve locally and click
   several purple dots and several coloured blobs — popups must render
   cleanly in both cases.
7. Commit and push.

## Acceptance criteria

- Popups for OSM pubs show address/hours/website when OSM has them, and
  curated-pub popups are unchanged in shape (no empty lines).
- check.mjs passes with the new validations.

## How Matt verifies this

On the live site (wait ~2 min after the session pushes, hard-refresh):
1. Tap 5 different small purple dots around central London. At least a
   couple should now show a street address and a line starting with 🕰
   (opening hours), and some a "Website" link.
2. The hours may look technical, like `Mo-Su 11:00-23:00` — that's expected
   for now (task 07 makes it friendly).
3. Tap a big coloured blob (e.g. The Harp). Its popup should look the same
   as before — nothing broken, no word "undefined" anywhere.
4. Tap a Website link — it should open the pub's site in a new tab.

## Do not

- Do not attempt to parse or interpret opening hours in this task.
- Do not add these fields to `js/data.js` entries by hand.
- Do not include email/social/phone tags — address, website, hours only
  (phone was considered and dropped: popup gets crowded).
- Do not hand-edit `js/osm-data.js`.

## Rollback

```sh
git revert HEAD && git push origin main
```
If only the data refresh went bad: `git checkout main -- js/osm-data.js`.
