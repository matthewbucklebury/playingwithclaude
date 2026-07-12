# 👺 The Goblin's Guide to London Pubs

*"What's the matter, Lager Boy — afraid you might **taste** something?"*

A searchable, mobile-first map of London's best pubs and bars. No build step,
no backend — a single static page you can host anywhere.

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

`js/data.js` holds a hand-curated set of ~130 notable London pubs and bars.
Coordinates are approximate; ratings blend public review reputation with
beer-guide acclaim; keywords are distilled from the things reviewers mention
most. It's a starting point, not gospel — pull requests from thirsty
correspondents welcome.

## Stack

- [Leaflet](https://leafletjs.com) 1.9.4 (vendored in `vendor/leaflet/`)
- [CARTO dark basemap](https://carto.com/attributions) over OpenStreetMap data
- Vanilla JS + CSS, gothic fonts via Google Fonts (graceful fallback)
