# Task 04 — Rate pubs yourself (My Ratings)

**Priority:** MUST · **Model:** Opus (touches state, rendering, and sorting
across the whole app — needs judgement) · **Depends on:** Task 01

## Objective

The heart of the free-data strategy (decision log #2): Matt rates pubs as he
visits them. A rated pub stops being an anonymous purple dot and becomes a
personal coloured blob. Ratings persist on the phone (localStorage) and
outrank the editorial rating wherever both exist.

## Files involved

- `js/app.js` (rating UI in popup, storage, marker/list/sort integration)
- `css/style.css` (star row styling)
- Nothing else. Do not touch the data files.

## Design decisions (already made — implement as stated)

- **Stable key per pub** (never `_idx`, never name alone — see risk
  register): `slug = normName(name) + "@" + lat.toFixed(4) + "," + lng.toFixed(4)`
  using the existing `normName` helper. Compute once at merge time, store as
  `p._slug`.
- **Storage:** localStorage key `goblin-my-ratings`, value JSON object
  `{ [slug]: rating }` where rating is 1–5 in 0.5 steps. Wrap reads/writes
  in try/catch (private browsing can block storage) — on failure the app
  must still work, just without persistence.
- **Effective rating:** `myRating ?? editorialRating ?? null`. My-rating
  wins everywhere: colour, size, sort, "best worth the walk", 4.4+ filter,
  plan ranking. Implement one helper `effRating(p)` and use it in all those
  places — do not sprinkle `??` at each call site.
- **UI:** in every popup, a row of 5 tappable stars (half-star steps are a
  nice-to-have; whole stars acceptable) labelled "Your verdict:". Tapping
  saves instantly, updates the marker (colour/size for dots may become a
  divIcon blob — reuse the existing curated marker construction), and shows
  the choice. A small "clear" affordance removes the rating.
- **Visual mark:** a pub with a personal rating gets a gold ring
  (`border-color: #f2b01e` or equivalent) so Matt can spot his own verdicts.
- **Marker upgrade mechanics:** when an OSM dot gains a rating, replace its
  canvas circleMarker with a divIcon marker (remove old, add new, rebind
  popup). When cleared, revert. Keep this logic in one function.

## Steps (suggested order)

1. Add slug computation + `effRating()` + storage helpers; switch colour/
   size/sort/filter call sites to `effRating`. Run check.mjs + local click-test:
   nothing should look different yet (no ratings stored).
2. Add the popup star row + save/clear + marker upgrade/downgrade.
3. Add the gold-ring style for personally rated pubs (both marker kinds and
   list cards).
4. Test locally in the browser: rate an OSM dot (grows into a blob), rate a
   curated pub (colour shifts), clear a rating (reverts), reload the page
   (ratings survive), private-browsing mode (no crash).
5. `node scripts/check.mjs` → ALL CHECKS PASSED. Commit and push.

## Acceptance criteria

- Ratings persist across reloads; effective rating drives every colour,
  size, and ranking in the app; clearing works; no crash when storage is
  unavailable.

## How Matt verifies this

On the live site (hard-refresh first):
1. Tap any small purple dot → the popup should show "Your verdict:" with
   5 empty stars. Tap the 5th star.
2. The popup should now show 5 filled stars, and the dot on the map should
   become a bigger green blob with a gold ring.
3. Go to **Near You** — that pub's card should show your green 5.0 badge
   and a gold edge.
4. Close the browser completely, reopen the site: the blob and your stars
   should still be there.
5. In the same popup, use the clear option: it should shrink back to a
   purple dot.
6. Rate a big named pub (e.g. one you disagree with) 3 stars — its blob
   should turn orange/red and shrink: your verdict beats the guide's.

## Do not

- Do not use `_idx` or bare names as storage keys.
- Do not add a backend, accounts, or sync — localStorage only (decision #11).
- Do not change `js/data.js` or `js/osm-data.js`.
- Do not redesign the popup layout beyond adding the star row.
- Do not "optimise" the canvas/divIcon marker split while you're in there.

## Rollback

```sh
git revert HEAD && git push origin main
```
(Stored ratings in the phone are harmless if the feature is reverted —
they're just an unused localStorage entry.)
