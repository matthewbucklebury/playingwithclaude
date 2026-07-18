# Task 09 — Pub-crawl builder

**Priority:** SHOULD · **Model:** Opus (route ordering + a new interaction
mode across the app) · **Depends on:** nothing hard; nicer after 04/08

## Objective

Extend Planning mode: pick several pubs, and the app orders them into a
sensible walking crawl with straight-line legs drawn on the map, per-leg
walking minutes, and a total. The goblin voice announces the total ("A
noble quest: 4 pints, 38 minutes of marching, mortal.").

## Design decisions (already made)

- Lives INSIDE Planning mode as a second phase: a "🍻 Build a crawl" button
  in the plan panel switches the panel to crawl mode; each tap on any pub
  marker adds/removes it (max 8; refuse politely beyond that).
- Ordering: nearest-neighbour starting from the plan pin (or the first
  selected pub if no pin), then a single 2-opt improvement pass. That's
  plenty for ≤8 stops — do not implement anything fancier.
- Route drawn as a dashed ember-orange polyline; numbered badges 1,2,3…
  on the stops (small divIcon labels).
- Distances are straight-line ×1.25 (street-walking fudge factor), at the
  existing 80 m/min. Label minutes "~" to signal estimates.
- A "Share crawl" button copies a plain-text itinerary to the clipboard:
  name, one keyword, and walking minutes between stops.
- Crawl state is session-only (not persisted) — closing plan mode clears it.

## Files involved

- `js/app.js` (crawl state, ordering, polyline, numbered badges, share text)
- `css/style.css` (crawl buttons, numbered badge style)
- `index.html` (buttons inside the existing plan panel only)

## Steps

1. Add crawl mode state + toggle button in the plan panel; wire marker taps
   (both marker kinds) to add/remove while crawl mode is on. Show the
   running list (numbered, with per-leg ~minutes) in the plan results area.
2. Implement nearest-neighbour + one 2-opt pass as pure functions.
3. Draw/update the polyline and numbered badges on every change; clean them
   all up when leaving crawl mode or closing the plan panel (no orphaned
   lines — test this by toggling repeatedly).
4. Share button → clipboard text; fall back to `window.prompt` like task 05.
5. Local test: build a 5-stop crawl in Soho, check the order looks sane (no
   obvious zig-zag), share it, leave and re-enter plan mode (clean slate).
6. `node scripts/check.mjs` → ALL CHECKS PASSED. Commit and push.

## Acceptance criteria

- 2–8 stops orderable with sane routes; totals shown; share works; entering/
  leaving crawl mode never leaves lines or badges behind.

## How Matt verifies this

1. Live site → **Plan** tab → pick "Soho" from the area dropdown → tap
   "🍻 Build a crawl".
2. Tap 4 pubs on the map. Numbered badges 1–4 should appear, connected by
   an orange dashed line, with a total walking time in the panel.
3. The order should look like a sensible walk, not criss-crossing Soho.
4. Tap "Share crawl", paste into your notes: a readable pub-by-pub list.
5. Close Plan mode, reopen it: the line and numbers should be gone.

## Do not

- Do not call any routing service or add any dependency — straight lines
  with the ×1.25 factor are the accepted approach (decision: free, offline,
  good enough for a crawl).
- Do not persist crawls (no localStorage here).
- Do not modify Near You or the search/filter system.

## Rollback

```sh
git revert HEAD && git push origin main
```
