# Operator Guide — how Matt runs this project

You don't need to read code, ever. You start sessions, paste messages, click
around the app, and describe what you see. This guide covers all of it.

## Starting a work session

1. Open Claude Code in this project's folder.
2. Paste exactly this, changing only the task number:

   > Read CLAUDE.md and docs/HANDOVER.md, then do task 01. When you're done,
   > follow the session-close protocol in CLAUDE.md.

3. Which task number? Open `docs/HANDOVER.md`, look at the backlog table,
   and pick the topmost task whose status is **Ready**. The previous
   session's closing message also names the next task.

**One task per session.** When a task finishes, close the chat and start a
fresh one for the next task. Fresh sessions are more reliable than long ones
— the model re-reads the docs and starts sharp. Long meandering chats are
where mistakes happen.

**Which model?** The backlog table says Opus or Sonnet for each task —
set that model when you start the session. In short: Sonnet for the
well-specified tasks (most of them), Opus for the two or three genuinely
tricky ones. Opus uses up your plan's limits much faster, so don't use it
for tasks marked Sonnet. If a Sonnet session gets truly stuck and stops
itself, retrying that task once with Opus is a reasonable move.

## How to tell a task genuinely succeeded

Every task file has a section called **"How Matt verifies this"**. Do those
steps yourself, on your own screen or phone — every time, even when the
model sounds confident. A task counts as done when:

1. The model says it ran `node scripts/check.mjs` and it ended with
   `ALL CHECKS PASSED` (it should show you this output), **and**
2. Your own verification steps worked, **and**
3. The model updated `docs/HANDOVER.md` and committed (it will say so).

If your verification fails, tell the model exactly what you saw instead of
what was expected. Plain description is perfect: "I tapped the heart and
nothing changed" beats any technical language.

## Warning signs — when to stop a session

Stop (and just close the chat) if you see any of these:

- **Looping.** The model tries the same fix for the same error more than
  twice. It's stuck. Close, start fresh, and paste: "The last session got
  stuck on task NN. Read CLAUDE.md and docs/HANDOVER.md, check what state
  task NN is in, and either finish it or roll it back."
- **Big unexplained changes.** It says it rewrote, refactored, cleaned up,
  or upgraded things that weren't in the task. Paste: "Stop. That wasn't in
  the task. Undo everything not required by task NN."
- **"It should work now"** without showing check output or telling you what
  to verify. Reply: "Show me the output of node scripts/check.mjs, and give
  me my verification steps."
- **Asking you to judge something technical** ("do you prefer approach A or
  B?" about code). Reply: "I can't judge that. Pick whichever is simpler to
  maintain, and record the choice in the decision log in docs/HANDOVER.md."

Nothing is ever truly lost: every finished task is saved in git history, so
a broken working state can always be rolled back to the last good one.
Every task brief has a Rollback section with the exact commands.

## When something is broken on the live site

1. Don't panic; the previous version is one command away.
2. Start a session and paste: "The live site is broken. Read CLAUDE.md and
   docs/HANDOVER.md. Here's what I see: [describe it — what page, what you
   clicked, what happened, any message on screen]. Roll back to the last
   working state first, then diagnose."
3. Useful things to copy for the model: the exact wording of any error on
   screen, what device and browser you're using, and what you did right
   before it broke. Screenshots described in words are fine.

## The live site

- After task 01, the app lives at:
  **https://matthewbucklebury.github.io/playingwithclaude/**
- Changes go live ~2 minutes after a session pushes. Hard-refresh your
  phone browser (or reopen the installed app) to see them.
- The map tiles and fancy fonts come from free public services. If the map
  background ever looks grey on your phone, check your internet first; the
  pub dots draw even without tiles.

## Routine maintenance

- Every 2–3 months, run a session with: "Read CLAUDE.md, then use the
  refresh-pub-data skill." That pulls newly opened/closed pubs from
  OpenStreetMap. It's safe: the health check guards against a bad download.
- After you've rated some pubs in the app (task 04 onwards), occasionally
  run: "Read CLAUDE.md, then use the add-rated-pub skill with the ratings
  I exported." That turns your personal ratings into permanent green blobs.
