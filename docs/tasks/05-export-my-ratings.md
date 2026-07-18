# Task 05 — Export your ratings (backup + promotion path)

**Priority:** SHOULD · **Model:** Sonnet · **Depends on:** Task 04

## Objective

Matt's ratings live only in his phone browser and die if he clears browser
data. Give him a one-tap export: a button that copies all his ratings (with
pub names) to the clipboard as text he can paste into a note or into a
Claude session. That pasted text is also how ratings get promoted into the
permanent curated data (see the add-rated-pub skill).

## Files involved

- `index.html` (one button in the Near You list header)
- `js/app.js` (export function)
- `css/style.css` (minor button styling if needed)

## Steps

1. In the Near You header (`.list-header`, under the sort toggle), add:
   `<button id="export-ratings" class="chip">📤 Export my ratings</button>`
2. In `js/app.js`: on click, read the `goblin-my-ratings` storage, resolve
   each slug back to its pub (name, area/London, lat, lng, rating), and build
   a human-readable JSON array. Copy with `navigator.clipboard.writeText`;
   on failure (older browsers) fall back to showing the JSON in a
   `window.prompt("Copy this:", json)` so it can be copied manually.
   After copying, set the button text to "✅ Copied N ratings" for 3 seconds.
   If there are no ratings yet, set it to "No ratings yet — go drink
   something" for 3 seconds.
3. Format example (one line per pub is fine):
   ```json
   [{"name":"The Palm Tree","lat":51.5301,"lng":-0.0344,"myRating":5}]
   ```
4. Test locally: rate 2 pubs, export, paste somewhere, confirm both appear.
5. `node scripts/check.mjs` → ALL CHECKS PASSED. Commit and push.

## Acceptance criteria

- Button exports every stored rating with resolvable pub names; empty and
  clipboard-blocked cases both handled gracefully.

## How Matt verifies this

1. On the live site, make sure you have at least 2 rated pubs (task 04).
2. Open **Near You**, tap "📤 Export my ratings".
3. The button should briefly say "✅ Copied 2 ratings" (your number).
4. Open your phone's notes app and paste. You should see your pubs by name
   with your scores. Save that note — it's your backup.

## Do not

- Do not add file downloads, QR codes, email, or cloud sync — clipboard only.
- Do not change how ratings are stored (that shape belongs to task 04).

## Rollback

```sh
git revert HEAD && git push origin main
```
