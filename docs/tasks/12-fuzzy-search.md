# Task 12 — Forgiving search

**Priority:** COULD · **Model:** Sonnet · **Depends on:** nothing

## Objective

Search currently needs exact substrings: "cheshire chese" (typo) or
"olde mitre" (missing "ye") find nothing. Make search forgiving without
adding dependencies or slowing typing down.

## Approach (decided)

Keep it simple and predictable — three improvements, nothing more:

1. **Normalisation:** strip accents/punctuation from both haystack and
   query (`"the harp"` == `"The Harp!"`), collapse whitespace.
2. **All-words matching:** split the query into words; every word must
   appear somewhere in the haystack, in any order ("mitre ye" finds
   Ye Olde Mitre).
3. **One-typo tolerance for single-word queries of 5+ letters:** a word
   matches if it appears exactly OR if some haystack word is within one
   edit (Levenshtein distance 1 — implement the small standard function).
   Skip this for multi-word queries and short words (too many false hits).

Precompute each pub's normalised haystack once at load; the per-keystroke
work stays roughly what it is today (the existing 150 ms debounce stays).

## Files involved

- `js/app.js` only (normalise + match logic; precomputed haystack field).

## Steps

1. Precompute `p._hay` at merge time; rewrite `matchesFilters`'s search
   clause per the approach above (pure functions, testable).
2. Add a test table to `scripts/check.mjs`: at least 10 query→expected
   cases against a tiny fixed fake dataset (exact, reordered words, one
   typo hit, one typo correctly NOT matching a 4-letter word, accents).
3. Local test with the real data: "cheshire chese", "harp", "mitre ye",
   "beer gaden" all return sensible results; typing feels instant.
4. `node scripts/check.mjs` → ALL CHECKS PASSED. Commit and push.

## How Matt verifies this

1. Live site: search `cheshire chese` (with the typo) — Ye Olde Cheshire
   Cheese should appear.
2. Search `mitre ye` — Ye Olde Mitre should appear.
3. Search `beer gaden` — beer-garden pubs should appear.
4. Type fast; the map should keep up without stutter.

## Do not

- Do not add a search library (no dependencies — hard rule 4).
- Do not implement scoring/ranking of results — filtering only, the
  existing sort orders stay in charge.
- Do not loosen matching beyond the three listed improvements.

## Rollback

```sh
git revert HEAD && git push origin main
```
