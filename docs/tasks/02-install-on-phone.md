# Task 02 — Make it installable on the phone (PWA basics)

**Priority:** MUST · **Model:** Sonnet · **Depends on:** Task 01 (live site)

## Objective

Let Matt add the app to his phone's home screen with a proper goblin icon
and no browser address bar — so it feels like a real app. This is a small,
standard "web app manifest" job. The icons already exist in `assets/icons/`.

## Files involved

- `index.html` (add manifest + icon links)
- `manifest.webmanifest` (new file at repo root)
- `assets/icons/icon-512.png`, `icon-192.png`, `icon-180.png` (already exist — do not regenerate)

## Steps

1. Create `manifest.webmanifest` at the repo root:
   ```json
   {
     "name": "The Goblin's Guide to London Pubs",
     "short_name": "Goblin's Guide",
     "description": "Find a proper pint near you, mortal.",
     "start_url": "./",
     "scope": "./",
     "display": "standalone",
     "background_color": "#160b1e",
     "theme_color": "#160b1e",
     "icons": [
       { "src": "assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
     ]
   }
   ```
2. In `index.html`, inside `<head>`, after the existing favicon line, add:
   ```html
   <link rel="manifest" href="manifest.webmanifest">
   <link rel="apple-touch-icon" href="assets/icons/icon-180.png">
   <meta name="apple-mobile-web-app-capable" content="yes">
   <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
   ```
3. Run `node scripts/check.mjs` → must end `ALL CHECKS PASSED`.
4. Serve locally (`python3 -m http.server 8000`) and confirm the browser
   console shows no error about the manifest (open http://localhost:8000).
5. Commit, push to `main`, tell Matt to wait ~2 minutes, then verify.

## Acceptance criteria

- `manifest.webmanifest` served and referenced; apple-touch-icon referenced.
- check.mjs passes. Matt's verification below passes.

## How Matt verifies this

On your phone, open the live site (hard-refresh first):
1. **iPhone (Safari):** tap the Share button → "Add to Home Screen". You
   should see the goblin face icon and the name "Goblin's Guide". Add it.
2. **Android (Chrome):** menu (⋮) → "Add to Home screen" (or an "Install"
   prompt appears).
3. Open the app from the new home-screen icon. It should open full-screen
   — no browser address bar — with the dark purple theme.
4. The icon on your home screen should be the goblin on a purple background,
   not a generic letter or screenshot.

## Do not

- Do not add a service worker, offline mode, caching, or push notifications.
  That is deliberately out of scope (adds fragile complexity for little gain).
- Do not regenerate or edit the icon PNGs.
- Do not rename the existing favicon line or any other head tag.

## Rollback

```sh
git revert HEAD && git push origin main
```
(Reverts this task's single commit; the site redeploys in ~2 minutes.)
