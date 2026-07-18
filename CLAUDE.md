# The Goblin's Guide to London Pubs

Read this file fully before doing anything. Then read `docs/HANDOVER.md`.

## What this is

A mobile-first, static web app: a searchable map of every pub and bar in
London, colour-coded by rating, with a geolocated "Near You" list and a
planning mode. Pure pub finder — the owner (Matt) has explicitly decided
there is NO fitness angle and NO paid data services. Do not propose either.

Matt cannot read code. He operates by pasting commands, clicking around the
app, and describing what he sees. Every task must end with verification steps
he can perform by looking at a screen. Never ask him to judge code, diffs, or
technical trade-offs — make the call yourself and record it in the decision
log in `docs/HANDOVER.md`.

## Architecture in a paragraph

No build step, no backend, no framework. `index.html` + `css/style.css` +
three scripts loaded in order: `js/osm-data.js` (generated — every named pub
& bar in Greater London from OpenStreetMap, ~4,300 entries), `js/data.js`
(hand-curated ~134 pubs with ratings/keywords/descriptions), `js/app.js`
(all logic: Leaflet map, markers, search, filters, geolocation, Near You
list, planning mode). Leaflet 1.9.4 is vendored in `vendor/leaflet/` — never
load it from a CDN. Map tiles come from CARTO's public dark basemap at
runtime. Deployed as GitHub Pages from the `main` branch, root folder.

## Key commands

```sh
python3 -m http.server 8000        # run locally → http://localhost:8000
node scripts/check.mjs             # health check → must end "ALL CHECKS PASSED"
node scripts/fetch-osm.mjs         # refresh OSM data (only via the refresh-pub-data skill)
```

## Hard rules

1. **Run `node scripts/check.mjs` before every commit.** If it fails, fix
   the cause. Never delete, weaken, or skip a check to get it green.
2. **Never edit `js/osm-data.js` by hand.** It is generated. To change it,
   re-run `node scripts/fetch-osm.mjs`. To fix one entry, fix it in
   OpenStreetMap itself or promote the pub into `js/data.js`.
3. **Never edit anything in `vendor/`.** Vendored third-party code.
4. **No new dependencies, frameworks, build steps, or bundlers.** The
   no-build simplicity is a deliberate, logged decision. No npm install into
   the repo, no CDN scripts, no TypeScript, no React.
5. **`ratingColor()` in `js/app.js` and `.grad-bar` in `css/style.css` must
   stay in sync** — the CSS gradient is a hand-computed copy of the JS
   formula. If you change one, change the other and say so in your commit.
6. **Work on `main`.** Small commits, one per completed step. Do not create
   branches unless Matt asks. Every push to `main` deploys the live site
   within ~2 minutes, so never push something that fails `check.mjs`.
7. **One task per session.** Do the task in `docs/tasks/`, verify it, close
   the session. Do not start the next task, "tidy up while you're in there",
   refactor working code, or improve things outside the task's file list.
8. **Do not touch the marker-rendering split** (curated = DOM divIcons,
   OSM layer = canvas circleMarkers) except in a task that explicitly
   covers it. It exists so 4,300+ markers stay smooth on phones.
9. Commit messages: short imperative summary + body if needed. Do not
   mention model names or session IDs in commits, code, or docs.

## Session-close protocol (mandatory, no exceptions)

Before ending ANY session — finished, stuck, or interrupted:

1. Run `node scripts/check.mjs`; fix any failure.
2. Update `docs/HANDOVER.md`: current-state changes, a dated entry in the
   Session log (what was done, what was verified, what's next), and the
   task's status in the backlog. A task is **Done** only after its "How Matt
   verifies this" steps actually passed — otherwise mark it "Blocked" or
   "In progress" with one line saying exactly where it stopped.
3. Commit everything (including `docs/HANDOVER.md`) and push to `main`.
4. Tell Matt in plain English: what changed, what he should see, and which
   task comes next.
