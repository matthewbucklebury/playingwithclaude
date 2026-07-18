# HANDOVER — The Goblin's Guide to London Pubs

**Last updated: 2026-07-18** (keep this line current — every session must bump it)

---

## 1. What this project is (plain English, for Matt)

A website that works like an app on your phone. It shows every pub and bar in
London on a dark, goblin-themed map. The best pubs appear as big green blobs,
average ones as smaller yellow/orange blobs, and the thousands of pubs we
don't have ratings for yet appear as small purple dots. You can search
("cask ale", "Soho", a pub's name), see a list of pubs near where you're
standing with walking times, and use Planning mode to drop a pin where
you'll be tonight and get the best options within walking distance.

There's no company behind the ratings — the ~134 rated pubs were hand-picked
and scored from their general reputation. The other ~4,200 come from
OpenStreetMap, the Wikipedia of maps. Everything is free and stays free:
you decided on 2026-07-18 that this is a pure pub finder with no paid data.

## 2. Current state — three honest buckets

### Works and verified (tested in an automated phone-sized browser)
- Map renders 4,372 spots: 134 rated blobs + ~4,238 purple dots (deduplicated).
- Colour spectrum: full red at rating ≤3.5 → full green at ≥4.7, with a curve
  so green stays rare. Legend gradient bar matches.
- Marker size scales with rating; better pubs draw on top.
- Search (name/area/keyword), type filter (All/Pubs/Bars), 4.4+ filter —
  all update map, list, and plan results together. Search is debounced.
- Near You: geolocation → sorted list with distance + walking minutes;
  "Nearest" and "Best worth the walk" sorts; graceful fallback to central
  London when location is denied.
- Planning mode: tap/drag pin or pick an area, radius slider 250 m–2 km,
  rated pubs ranked first, overflow count shown.
- Popups: rating badge, stars, keyword chips, description, Google Maps
  walking-directions link.
- Health check `node scripts/check.mjs` passes (data valid, HTML/JS refs intact).

### Probably works, but unverified
- **Geolocation on a real phone** — verified only with a simulated location.
  Needs the live HTTPS site (task 01) and a real phone to confirm.
- **Map tiles and gothic fonts on the live site** — the development sandbox
  blocks them, so they've only been seen as placeholders. They are standard
  public services (CARTO tiles, Google Fonts) and should just work.
- **The walking-directions link** opening the Google Maps app on a phone.
- `scripts/fetch-osm.mjs` on a normal home machine (verified only inside the
  sandbox; it needs Node 18+ and curl, both standard).

### Known broken / unfinished / missing
- **Not live yet.** GitHub Pages is not switched on → task 01.
- **Curated coordinates are approximate** (written from memory, may be off by
  ~100 m; a few pubs may have closed) → task 06 snaps them to OSM's surveyed
  positions and flags non-matches.
- ~4,200 OSM pubs have no ratings (by design — the free plan is Matt rating
  pubs himself, task 04/05) and no area names (task 11).
- No opening hours anywhere (tasks 03 then 07).
- Nothing personal persists (no favourites, no own ratings) yet.

## 3. How it all fits together

```
index.html            the single page: header/search/filters, map div,
                      Near You list, plan panel, tab bar. app.js expects
                      specific element ids — check.mjs guards them.
css/style.css         all styling + theme. .grad-bar must mirror the
                      ratingColor() formula in app.js (hard rule 5).
js/osm-data.js        GENERATED. ~4,300 entries {name,type,lat,lng,keywords}.
                      Never hand-edit. Rebuilt by scripts/fetch-osm.mjs.
js/data.js            HAND-CURATED. ~134 entries, adds rating/area/desc.
                      This is the file that grows as Matt rates pubs.
js/app.js             all behaviour, one IIFE, no dependencies beyond Leaflet.
                      Load-time flow: merge datasets (dedupe: same normalised
                      name within 300 m → curated wins) → assign stable _idx
                      → create markers (curated = DOM divIcons; OSM = canvas
                      circleMarkers, for phone performance) → wire search/
                      filters/tabs/geolocation/plan.
scripts/fetch-osm.mjs queries the free Overpass API (OpenStreetMap) for every
                      pub/bar in Greater London, 3 mirror fallback, writes
                      js/osm-data.js.
scripts/check.mjs     zero-dependency health check. "ALL CHECKS PASSED" or
                      failing exit code. Run before every commit.
vendor/leaflet/       Leaflet 1.9.4, vendored. Never edit, never upgrade
                      without an explicit task.
assets/icons/         512/192/180 px goblin icons, pre-generated for task 02.
```

Ripple map — what breaks what:
- Renaming/removing an element id in `index.html` breaks `js/app.js` silently
  → `check.mjs` catches the known ids.
- Changing `ratingColor()` without updating `.grad-bar` → legend lies.
- Changing dataset field names (`rating`, `keywords`, `type`…) ripples through
  app.js AND check.mjs AND fetch-osm.mjs — avoid; add new fields instead.
- `_idx` is assigned at load time from array order. It is NOT stable across
  data refreshes — never store or share it (matters for tasks 04, 08, 10;
  those tasks define a stable key instead).
- Search matches against name+area+keywords+desc. New visible text fields
  should be added to that haystack deliberately or not at all.

## 4. Milestones

| # | Milestone | Meaning | Status |
|---|-----------|---------|--------|
| M0 | Core app | Map, search, Near You, plan mode, full coverage | **Done** |
| M1 | Live on phones | Real URL, installable icon on home screen | Not started (tasks 01–02) |
| M2 | Trustworthy data | Accurate positions, richer pub info | Not started (tasks 03, 06) |
| M3 | Make it yours | Matt rates pubs in-app; ratings grow the green blobs; favourites | Not started (tasks 04, 05, 08) |
| M4 | Going out | Open-now filter, pub-crawl builder | Not started (tasks 07, 09) |
| M5 | Polish | Share links, area names, forgiving search | Not started (tasks 10–12) |

## 5. Task backlog (ordered; briefs in docs/tasks/)

| Task | Priority | Model | Depends on | Status |
|------|----------|-------|------------|--------|
| [01 Go live](tasks/01-go-live.md) | MUST | Sonnet | — | Ready |
| [02 Install on phone](tasks/02-install-on-phone.md) | MUST | Sonnet | 01 | Ready |
| [03 Richer pub info](tasks/03-richer-pub-info.md) | MUST | Sonnet | — | Ready |
| [04 Rate pubs yourself](tasks/04-my-ratings.md) | MUST | Opus | 01 | Ready |
| [05 Export your ratings](tasks/05-export-my-ratings.md) | SHOULD | Sonnet | 04 | Blocked by 04 |
| [06 Fix curated positions](tasks/06-fix-curated-coords.md) | MUST | Sonnet | — | Ready |
| [07 Open-now filter](tasks/07-open-now-filter.md) | SHOULD | Opus | 03 | Blocked by 03 |
| [08 Favourites](tasks/08-favourites.md) | SHOULD | Sonnet | 04 | Blocked by 04 |
| [09 Pub-crawl builder](tasks/09-pub-crawl-builder.md) | SHOULD | Opus | — | Ready |
| [10 Share a pub](tasks/10-share-links.md) | COULD | Sonnet | — | Ready |
| [11 Area names for every pub](tasks/11-osm-area-names.md) | COULD | Sonnet | — | Ready |
| [12 Forgiving search](tasks/12-fuzzy-search.md) | COULD | Sonnet | — | Ready |

Statuses: Ready / In progress / Blocked (say by what) / Done (verification
passed) / Dropped (say why). One task per session. If the four weeks run
short, everything marked COULD can be dropped without regret, and 07/09 can
follow later.

## 6. Risk register — read before your task

- **Overpass API busy (data refresh).** `fetch-osm.mjs` may print retries or
  give up. It's a free shared service. Fix: wait 10 minutes, re-run. If the
  output file shrinks below ~3,000 entries check.mjs fails — restore with
  `git checkout js/osm-data.js`. Never loop the script rapidly.
- **GitHub Pages serves the wrong thing / 404.** Usually the Pages setting
  points at the wrong branch or folder, or the deploy hasn't finished
  (~2 min). See task 01's rollback section before touching anything else.
- **Personal data (ratings/favourites) lives in the phone browser's
  localStorage.** Clearing browser data deletes it. That's accepted (decision
  log #11); task 05 gives Matt a backup path. Never "fix" this with a
  backend or accounts.
- **Two different pubs named "The Dove"** (Broadway Market and Hammersmith) —
  never key anything by name alone; briefs that need a stable key define
  slug = lowercased name + rounded coords.
- **`_idx` is not stable across data refreshes.** In-page use only.
- **Colour sync rule** (app.js `ratingColor()` ↔ style.css `.grad-bar`).
- **iOS quirks:** the search input's `font-size: 16px` prevents auto-zoom on
  focus — do not shrink it. Safari asks for location every visit unless the
  site is installed to the home screen (task 02 helps).
- **Leaflet must stay at vendored 1.9.4.** No upgrades, no plugins, no CDN.
- **The canvas/divIcon marker split is deliberate** (performance on phones).
  Merging them "for cleanliness" will make the map stutter.
- **The sandbox Claude works in may block outside websites** (map tiles show
  grey, fonts fall back). This is NOT an app bug. Judge visuals on the live
  site on Matt's phone.

## 7. Decision log — do not relitigate without Matt

1. **Pure pub finder, no fitness features** — Matt, 2026-07-18.
2. **No paid data APIs** (no Google Places, no paid Foursquare) — Matt,
   2026-07-18. Ratings grow via Matt's own in-app ratings instead.
3. **Go live via GitHub Pages from `main`, root folder** — Matt, 2026-07-18.
4. **No build step, no framework, no npm dependencies** — keeps the project
   operable by a non-programmer and debuggable by any model. 2026-07-12.
5. **Leaflet vendored, pinned 1.9.4** — CDNs were unreachable in testing and
   are a moving target. 2026-07-12.
6. **CARTO dark basemap** — free, fits the theme, allows this usage. 2026-07-12.
7. **Curated ratings are editorial estimates**, not scraped reviews — honest
   as long as the README says so. 2026-07-12.
8. **OSM/Overpass as the coverage layer**, snapshot committed to the repo
   (ODbL allows it) — no key, no cost, works offline-ish. 2026-07-18.
9. **Dedupe rule:** normalised name match within 300 m → curated entry wins.
   2026-07-18.
10. **Colour maths:** red fixed at ≤3.5, green at ≥4.7, curve t^1.6 so green
    stays scarce (a linear ramp painted everything green — tried, rejected).
    Matt set the 3.5 red anchor. 2026-07-18.
11. **Personal data in localStorage, no accounts/backend** — simplest thing
    that works for a single user. Backup via export (task 05). 2026-07-18.
12. **The goblin theme and voice stay.** Hobgoblin-ad-inspired, tongue in
    cheek. Copy in the app addresses the reader as "mortal"/"Lager Boy" —
    keep that register. 2026-07-12.

## 8. Session log (append a dated entry every session — newest first)

### 2026-07-18 — Handover pack (Claude Code, remote)
- Confirmed with Matt: pure pub finder, go live first, no paid data.
- Added `scripts/check.mjs` (all passing), app icons in `assets/icons/`,
  CLAUDE.md, this handover, operator guide, 12 task briefs, 2 skills.
- Verified app healthy via automated phone-sized browser: 4,372 spots,
  40 Near You cards, 12 plan results, no console errors from our code.
- Fast-forwarded `main` to match the working branch so Pages can deploy it.
- Next recommended task: **01 Go live**.

### 2026-07-18 — Colour spectrum (Claude Code, remote)
- Replaced 5 colour buckets with continuous red→green ramp (red ≤3.5,
  green ≥4.7, curve keeps green scarce). Legend became a gradient bar.
- Verified by screenshot; committed and pushed.

### 2026-07-18 — Full coverage (Claude Code, remote)
- Added `scripts/fetch-osm.mjs` (Overpass, 3-mirror fallback); generated
  `js/osm-data.js` with 4,335 pubs/bars; merged into app as canvas-dot layer
  with dedupe; debounced search. Verified via automated browser; pushed.

### 2026-07-12 — Initial build (Claude Code, remote)
- Built the whole app (map/list/plan/search/theme) with 134 curated pubs;
  vendored Leaflet after CDN failure; verified via automated browser; pushed.
