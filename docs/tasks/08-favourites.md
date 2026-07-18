# Task 08 — Favourites ("want to visit" list)

**Priority:** SHOULD · **Model:** Sonnet · **Depends on:** Task 04 (reuses
its slug + storage helpers)

## Objective

A heart on every pub so Matt can build a "want to visit" list, with a filter
chip to show only hearted pubs. Same localStorage approach as ratings.

## Files involved

- `js/app.js`, `css/style.css`, `index.html` (one chip)

## Steps

1. Storage: localStorage key `goblin-favourites`, a JSON array of slugs.
   Reuse the slug and safe-storage helpers created in task 04 — do not
   invent a second pattern.
2. Popup: a heart button (🤍 / ❤️) next to the pub name row. Tap toggles.
3. Filter chip in the filter row: `❤️ Saved`. When active, `matchesFilters`
   keeps only favourites (combines naturally with search/type chips).
4. Hearted pubs get a small ❤️ shown on their Near You card row.
5. Local test: heart 2 pubs, filter, unheart, reload page (persists),
   private-browsing (no crash).
6. `node scripts/check.mjs` → ALL CHECKS PASSED. Commit and push.

## Acceptance criteria

- Hearts persist across reloads; the Saved chip filters map, list, and plan
  results; no crash without storage.

## How Matt verifies this

1. On the live site, tap a pub, tap the white heart — it turns red.
2. Heart one more pub. Tap the "❤️ Saved" chip at the top — the map should
   show only your two pubs; Near You should list only those two.
3. Tap the chip off, reload the page, tap a hearted pub — still red.
4. Un-heart it — it disappears from the Saved view.

## Do not

- Do not build lists/collections/notes — a single flat favourites list only.
- Do not duplicate task 04's storage helpers; reuse them.

## Rollback

```sh
git revert HEAD && git push origin main
```
