# Tvara

Tvara is a static brain‑training web app (vanilla HTML/CSS/JS) with short games for speed, pattern recognition, reaction time, logic, memory, and mental math.

## Run locally

This is a static site. Serve the repo root with any static server.

```bash
cd "/Users/mehalsrivastava/GitHub/Tvara"
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## What’s “launch ready” in this repo

- **No account required**: users can start immediately.
- **Profile & Settings**: `/profile/` (rename, export/import, reset, reduced motion/sound toggles).
- **Legal pages**: `/legal/privacy.html`, `/legal/terms.html`, `/legal/cookies.html`.
- **Offline reliability**: `sw.js` service worker caches the app shell.
- **Anonymous install ID**: stored as `localStorage` key `tvara_device_id` (for future leaderboard/account work).

## Deploy

This repo includes config for:

- Netlify: `netlify.toml` + `_redirects` + `_headers`
- Vercel: `vercel.json`

## Launch checklist (high signal)

- **Domain**
  - Point your apex + `www` to Netlify/Vercel.
  - Add canonical URL + social preview tags (OpenGraph/Twitter) when ready.
- **Analytics**
  - Google Analytics is already embedded in pages (gtag). Confirm it’s the correct property.
- **Support**
  - Set a real support inbox (currently `hello@tvaralabs.in`) and respond fast in week 1.
- **Product loop**
  - Add a “Feedback” entry (mailto or form) and watch what people request.

## Leaderboards & storing data (recommended approach)

### Ship now (no login)

Keep the current no‑account experience for conversion. You can still:

- Show **personal best** + streak locally
- Offer **export/import** for power users
- Add **share** prompts after games (already exists per game)

### Phase 2 (real leaderboard + cross‑device progress)

When you’re ready to start storing data:

- Use a managed backend (fastest): **Supabase** (Postgres + Auth) or **Firebase** (Auth + Firestore)
- Support **optional login** (Google + email magic link)
- Allow **anonymous play** → “claim” progress when logging in later (map `tvara_device_id` → user account)

Minimum viable schema (Supabase/Firebase equivalent):

- `users`: id, display_name, created_at
- `scores`: id, user_id (nullable), device_id, game_id, score, created_at, metadata
- `leaderboards`: materialized view or query by game + time window (daily/weekly/all‑time)

Anti‑cheat baseline:

- Server-side validate score ranges and durations
- Rate limit score submissions

## Two suggested new games (good for your audience)

- **Prime Sprint**: quickly decide if a number is prime (time pressure). Trains divisibility heuristics and speed.
- **Percent Panic**: compute common percentage transforms (e.g. 12% of 250, 35% off, ratio → percent). Directly relevant to exams + mental math.

