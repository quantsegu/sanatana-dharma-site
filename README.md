# Sanatana Dharma Site

React + Vite frontend with an Express API backend that serves CMS data and, in production, also serves the built frontend from `dist`.

## Ashram & Farm shortcut pages

Shortcuts under `/pages` open companion Figma-hosted sites:

- `/pages` — index (Ashram & Farm sites)
- `/pages/brink-trick-47383861` — **Where the Alps Meet the Vedas** → `https://brink-trick-47383861.figma.site`
- `/pages/render-hook-84840522` — **Sustainable Farm Planning** → `https://render-hook-84840522.figma.site`

## Local development

1. Install dependencies:
   - `npm install`
2. Copy env file:
   - `cp .env.example .env`
3. Start frontend + API together:
   - `npm run dev`

The API runs on `PORT` (default `3001`), and Vite runs on `5173`.

## Production run (single process)

Build the frontend, then run Express:

- `npm run build`
- `npm start`

In production (`NODE_ENV=production`), Express serves both:

- API routes at `/api/*`
- frontend routes from `dist/index.html`

## Railway deployment

This repo is configured for Railway with `railway.json`.

### Required environment variables

Set these in Railway service variables:

- `NODE_ENV=production`
- `ADMIN_PASSWORD=<strong-password>`
- `ADMIN_SECRET=<long-random-secret>`
- `PORT` (Railway usually injects this automatically; keep if needed)

### Deploy steps

1. Push this repo to GitHub.
2. In Railway, create a new project from the GitHub repo.
3. Railway will run:
   - build: `npm ci && npm run build`
   - start: `npm run start`
4. Open the generated Railway domain and verify:
   - `/`
   - `/api/health`
   - `/pages`
   - `/pages/brink-trick-47383861`
   - `/pages/render-hook-84840522`
