# Task 11 — Area names for every pub

**Priority:** COULD · **Model:** Sonnet · **Depends on:** nothing

## Objective

The 4,200 OSM pubs show a blank "London" where curated pubs show "Soho" or
"Hackney". Give every pub a neighbourhood name so Near You cards and search
work better (searching "Peckham" should find Peckham pubs).

## Approach (decided): nearest-anchor lookup, not an API

No geocoding services (cost/rate limits/keys). Instead build a static list
of ~80 London neighbourhood anchor points (name, lat, lng) — Soho, Camden,
Peckham, Brixton, Dalston, Richmond, etc. — and assign each OSM pub the
nearest anchor's name at load time in `js/app.js` (compute once, cache on
the object). ~80 anchors × 4,300 pubs is ~350k cheap distance calls at
startup — measure it; if it adds more than ~100 ms, precompute in the fetch
script instead and store `area` in `js/osm-data.js`.

## Files involved

- `js/areas.js` (new: `const AREAS = [{name, lat, lng}, …]`)
- `index.html` (script tag before app.js)
- `js/app.js` (assignment + use existing `p.area` display path)
- `scripts/check.mjs` (validate areas file: 60+ entries, coords in London)

## Steps

1. Write `js/areas.js` with ~80 well-known neighbourhood centres spread
   across all of Greater London (not just zone 1). Use real central points
   (the tube station or town-centre coordinates are fine).
2. Assign `p.area` for OSM pubs at merge time; curated pubs keep their own.
3. The search haystack already includes area — verify searching "Peckham"
   now returns purple dots there.
4. Update the plan-mode area dropdown to list ALL areas (it currently lists
   only curated ones) — the option label keeps its pub count.
5. Extend check.mjs for the new file. Run it → ALL CHECKS PASSED.
6. Load-time sanity: reload locally with the browser console open and no
   visible startup lag versus before.
7. Commit and push.

## How Matt verifies this

1. Live site → Near You: cards for small unrated pubs should now say a
   neighbourhood ("Bethnal Green · 250 m") instead of "London".
2. Search "Peckham" — the map should light up around Peckham, including
   purple dots.
3. Plan tab → the area dropdown should now offer many more areas; pick
   "Brixton" — the pin should land in Brixton.
4. The app should feel exactly as fast to open as before.

## Do not

- Do not call any external service for this.
- Do not overwrite the hand-written `area` of curated pubs.

## Rollback

```sh
git revert HEAD && git push origin main
```
