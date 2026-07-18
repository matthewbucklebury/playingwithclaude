# Task 07 — "Open now" filter

**Priority:** SHOULD · **Model:** Opus (opening-hours parsing is genuinely
tricky; a wrong parser confidently lies) · **Depends on:** Task 03

## Objective

An "Open now" filter chip, plus friendly "Open until 23:00" / "Closed" lines
in popups, based on the `hours` strings task 03 added from OpenStreetMap.

## The trap this task must avoid

OSM `opening_hours` is a mini-language. Common values are simple
(`Mo-Su 11:00-23:00`) but the long tail is wild (`Mo-Th 12:00-23:00;
Fr,Sa 12:00-24:00; Su off; PH off`). **A parser that guesses wrong will tell
Matt a pub is open when it's shut — worse than no feature.** Therefore:

- Implement a small parser in `js/app.js` that handles ONLY these patterns:
  day-range/day-list prefixes (Mo,Tu,We,Th,Fr,Sa,Su, ranges with `-`,
  lists with `,`), time ranges `HH:MM-HH:MM` (including past-midnight ends
  like `12:00-01:00`), multiple `;`-separated rules, `24/7`, and `off`.
- Anything it cannot fully parse → status "unknown", never a guess.
  Unknown pubs are treated as open by the filter (never hide a pub because
  we're unsure) but show no open/closed line in the popup.
- `PH` (public holiday) rules: ignore the PH part, parse the rest.

## Files involved

- `js/app.js` (parser + `isOpenNow(p)` + filter chip wiring + popup line)
- `index.html` (one chip: `<button class="chip filter-chip" id="open-now">🕰 Open now</button>`)
- `scripts/check.mjs` (add parser unit tests — see below)

## Steps

1. Write the parser as a pure function `parseHours(str)` returning either
   `null` (unparseable) or a structure the checker can test.
2. **Add tests to `scripts/check.mjs`** (a new section): a fixed table of
   at least 12 cases — simple daily, day ranges, multi-rule, past-midnight,
   `24/7`, `off` days, and 3 deliberately weird strings that MUST return
   `null`. Test `isOpenAt(parsed, someFixedDate)` with hand-computed
   expected answers (use fixed dates, e.g. a Tuesday 15:00 and a Friday
   23:30 — never "now" in tests).
3. Wire the chip: toggles `openNowOnly` state, filter logic in
   `matchesFilters`, unknown-hours pubs stay visible.
4. Popup: "🕰 Open now, until 23:00" / "🕰 Closed — opens Mo 11:00" /
   nothing when unknown. Keep wording short.
5. Local click-test at a time when pubs are open AND (by temporarily faking
   the clock in the console, not in committed code) when they're closed.
6. `node scripts/check.mjs` → ALL CHECKS PASSED. Commit and push.

## Acceptance criteria

- Parser tests pass inside check.mjs; unparseable strings never produce an
  open/closed claim; the chip visibly thins the map during closed hours.

## How Matt verifies this

1. Open the live site in the evening (pubs open). Tap "🕰 Open now" — most
   dots should stay, some disappear. Tap it off — they return.
2. Open the site again before 10am. Tap "🕰 Open now" — the map should thin
   out dramatically (most pubs open at 11 or 12).
3. Tap a big pub's blob in the evening: the popup should say something like
   "Open now, until 23:00". If a popup says "Open now" for a pub you can
   see is shut in real life, report it — that's a bug, not a shrug.

## Do not

- Do not import an opening-hours library (no dependencies — hard rule 4).
- Do not extend the parser beyond the listed patterns "while you're at it".
- Do not hide unknown-hours pubs when the filter is on.
- Do not weaken existing checks to get the new tests green.

## Rollback

```sh
git revert HEAD && git push origin main
```
