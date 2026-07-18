# Task 10 — Share a pub (deep links)

**Priority:** COULD · **Model:** Sonnet · **Depends on:** nothing
(if task 04 is done, reuse its slug helper; otherwise create the same one)

## Objective

A share button in every popup that copies a link like
`https://…/playingwithclaude/#pub=harp@51.5095,-0.1265`. Opening such a
link flies the map to that pub and opens its popup — so Matt can text a pub
to friends.

## Files involved

- `js/app.js` only.

## Steps

1. Use the slug format from task 04 (`normName(name)@lat,lng` with lat/lng
   at 4 decimal places). NEVER use `_idx` in URLs — it changes when the
   data refreshes (risk register).
2. On load (after markers exist): if `location.hash` starts with `#pub=`,
   find the pub whose slug matches; if found, `focusPub` it; if not found
   (pub gone after a data refresh), show the map normally — no error, and
   clear the hash.
3. Share button in the popup links row: uses `navigator.share` when
   available (phones), else copies the URL to the clipboard with the same
   "✅ copied" feedback pattern as task 05.
4. Do not keep the hash in sync while browsing (no history spam) — the hash
   is only read on load and written on share.
5. Local test: share a pub, open the copied URL in a private tab — map
   flies there and the popup opens. Try a garbage hash (`#pub=nonsense`) —
   app loads normally.
6. `node scripts/check.mjs` → ALL CHECKS PASSED. Commit and push.

## How Matt verifies this

1. On your phone, tap a pub, tap "Share" — your phone's share sheet should
   appear (or "copied" confirmation). Send it to yourself.
2. Open the received link: the app should open with the map already zoomed
   to that pub, popup open.
3. Send one to a friend with a different phone — same result on their end.

## Do not

- Do not use query strings (`?pub=`) — hash only, so GitHub Pages routing
  stays untouched.
- Do not add Open Graph/social preview tags in this task.

## Rollback

```sh
git revert HEAD && git push origin main
```
