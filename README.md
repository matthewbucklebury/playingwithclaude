# 👺 The Goblin's Guide to London Pubs

*"What's the matter, Lager Boy — afraid you might **taste** something?"*

A searchable, mobile-first map of London's best pubs and bars. No build step,
no backend — a single static page you can host anywhere.

> **Working on this project?** Start with [`CLAUDE.md`](CLAUDE.md) (rules and
> commands) and [`docs/HANDOVER.md`](docs/HANDOVER.md) (current state, task
> backlog, decisions). Operators: [`docs/OPERATOR-GUIDE.md`](docs/OPERATOR-GUIDE.md).

## Features

- **Map view** — every pub is a blob on a dark map, **colour-coded by rating**
  (green = nectar of the goblins, red = lager boy territory) and **sized by
  quality** (better pubs take up more space). Tap a blob for rating, review
  keywords, a one-line verdict, and walking directions.
- **Near You** — uses your phone's location to list the closest pubs, with
  distance and walking time. Sort by *Nearest* or *Best worth the walk*
  (rating weighed against distance). Falls back to central London if you
  refuse the goblin your whereabouts.
- **Search & filters** — search by name, area, or vibe ("cask ale", "beer
  garden", "haunted"…); filter to pubs only, bars only, or 4.4★ and up.
- **Planning mode** — going out later? Drop a pin where you'll be (tap the
  map, drag the pin, or pick an area) and set a radius; it lists the best
  options inside the circle, ranked by rating.
- **Review keywords** — every entry carries the words reviewers actually use
  ("snob screens", "best Guinness in London", "pork baps"), shown as chips so
  you can choose between nearby pubs at a glance.

## Running it

It's a static site — serve the folder any way you like:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

**Note:** browser geolocation only works over HTTPS (or localhost), so deploy
to an HTTPS host for the "Near You" magic to work on phones.

### Deploy on GitHub Pages

1. Repo → **Settings → Pages**
2. Source: *Deploy from a branch*, pick your branch, folder `/ (root)`
3. Open `https://<user>.github.io/<repo>/` on your phone

## The data

Two layers:

- **`js/osm-data.js` — full coverage.** Every named pub and bar in Greater
  London (~4,300 of them) pulled from OpenStreetMap via the free
  [Overpass API](https://overpass-api.de). No key, no billing, and the ODbL
  license lets us store the snapshot in the repo. Shown as small purple dots;
  keyword chips ("cask ale", "beer garden", "dog friendly") are derived from
  OSM tags where mapped.
- **`js/data.js` — the rated layer.** A hand-curated set of ~130 notable
  pubs and bars with ratings, review keywords, and one-line verdicts. These
  render as the big colour-coded blobs and rank first in planning mode. At
  load time the app dedupes: any OSM entry matching a curated pub's name
  within 300 m defers to the curated version.

### Refreshing the full-coverage data

```sh
node scripts/fetch-osm.mjs   # rewrites js/osm-data.js, takes ~1 minute
```

The script queries Overpass for `amenity=pub` and `amenity=bar` inside the
Greater London boundary, retries across three public mirrors if one is busy,
dedupes, and regenerates the file. Re-run it every few months, commit, push —
done. Please don't run it in a tight loop; the public Overpass servers are
shared infrastructure.

### Want live ratings for everything? (optional, costs money)

OSM has no ratings, so unrated dots stay purple. The only APIs with review
scores for every pub are commercial:

- **Google Places API** — best data, but its terms require display on a
  Google Map (not Leaflet/OSM), forbid caching results beyond 30 days, and
  enriching ~4,300 places costs roughly $140+ per full pass (Nearby Search,
  Advanced SKU). Doing it properly means swapping the map layer to Google
  Maps JS and fetching ratings client-side on demand.
- **Foursquare Places API** — free tier available, more permissive caching,
  patchier UK ratings.

The pragmatic path this repo takes: full coverage from OSM, quality signal
from the curated layer. To promote any pub into the rated layer, add an entry
to `js/data.js` — it will automatically replace its purple dot.

## Stack

- [Leaflet](https://leafletjs.com) 1.9.4 (vendored in `vendor/leaflet/`)
- [CARTO dark basemap](https://carto.com/attributions) over OpenStreetMap data
- Vanilla JS + CSS, gothic fonts via Google Fonts (graceful fallback)
