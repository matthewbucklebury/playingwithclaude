# Task 01 — Go live on GitHub Pages

**Priority:** MUST · **Model:** Sonnet · **Depends on:** nothing

## Objective

Put the app on the public internet at
`https://matthewbucklebury.github.io/playingwithclaude/` so Matt can use it
on his phone. Everything is already on the `main` branch; this task is
mostly flicking the GitHub Pages switch and verifying.

## Files involved

None should need changing. This task is configuration + verification.

## Steps

1. Confirm the repo state is healthy:
   ```sh
   git fetch origin main && git status
   node scripts/check.mjs        # expect: ALL CHECKS PASSED
   ```
2. Confirm `main` contains the app: `git log origin/main --oneline -3`
   should show commits about the handover pack / pub map (not just
   "Initial commit"). If `main` looks empty, STOP and re-read
   docs/HANDOVER.md — do not force-push anything.
3. GitHub Pages is switched on in the browser, not from the command line.
   Give Matt these instructions verbatim:
   - Open https://github.com/matthewbucklebury/playingwithclaude/settings/pages
   - Under **Build and deployment** → **Source**, choose **Deploy from a branch**.
   - Under **Branch**, pick `main`, folder `/ (root)`, press **Save**.
   - Wait 2–3 minutes, then open
     https://matthewbucklebury.github.io/playingwithclaude/ on your phone.
4. While waiting, do nothing else — no code changes belong in this task.

## Acceptance criteria

- The URL above loads the Goblin's Guide on Matt's phone over HTTPS.
- Matt completes the verification below.

## How Matt verifies this

On your phone:
1. Open https://matthewbucklebury.github.io/playingwithclaude/
2. You should see the dark purple app with "The Goblin's Guide" in orange
   gothic letters, and a map with coloured blobs and many small purple dots.
   The map background should show streets (not plain grey).
3. Allow location when asked. A blue dot should appear where you are
   (only if you're in/near London; otherwise the map stays on central London).
4. Tap **Near You** at the bottom — you should get a list of pubs with
   distances and walking minutes.
5. Tap any pub blob on the map — a popup should show its rating, some
   keyword chips, and a "Walking directions" link that opens Google Maps.
6. Tell the session what you saw. All good = task done.

## Do not

- Do not change any code or file to "help" the deploy. The app is static
  files at the repo root; Pages needs no build, no workflow file, no CNAME.
- Do not create a `gh-pages` branch or a GitHub Actions workflow.
- Do not touch repo settings other than the Pages source.

## Rollback

Pages can simply be switched off (same settings page, Source → None).
No code changes happen in this task, so there is nothing else to undo.

## Likely failure and fix

- **404 after 5+ minutes:** the Pages source is probably set to the wrong
  branch/folder. Re-check it says `main` and `/ (root)`.
- **Site loads but looks broken/unstyled:** hard-refresh (or private tab);
  if still broken, run `node scripts/check.mjs` locally and report.
- **Map area is grey but header shows:** usually just slow tiles or no
  internet; wait and refresh. The tiles come from a third-party free
  service (CARTO) — a brief outage there fixes itself.
