# Thumbric.ai

Free browser thumbnail maker for **YouTube**, Shorts/Reels, Instagram, LinkedIn, and Facebook — plus **AI image** generation in the editor.

**Live site:** https://thumbric.app/  
**Fallback:** https://thiru-cloud-architect.github.io/thumbric/

## Brand vs URL

| What | Name |
|------|------|
| **Product** | **Thumbric.ai** |
| **Public site** | **thumbric.app** (Cloudflare → GitHub Pages) |

Connect steps and DNS records: see **[DEPLOY.md](./DEPLOY.md)**. Optional later: buy `thumbric.ai` and redirect `.app` → `.ai`. Worker API can live on `api.thumbric.app` — see `worker/`.

## Features today

- Platform sizes, moods, drag title/stickers, templates
- **Generate AI image** (Pollinations — no API key; uses your title + mood + optional hint)
- Light **Sign in** (name + email on device; optional sync to Cloudflare Worker JSON)
- Pricing page (demo unlock until Stripe/Razorpay)

## Simple login (no Auth0 / Supabase yet)

- Header **Sign in** → name + email → `localStorage`
- When you deploy the Worker and set `VITE_API_BASE`, the same form also `POST`s to `/api/register` and appends to a **JSON list in Cloudflare KV** (`users.json`)

```bash
cd worker
npm install
npx wrangler login
npx wrangler kv namespace create THUMBRIC_USERS
# paste id into wrangler.toml [[kv_namespaces]]
npx wrangler deploy
# then build the site with: VITE_API_BASE=https://thumbric-api.<your-subdomain>.workers.dev
```

## Run locally

```bash
npm install
npm test
npm run dev
```

Open http://127.0.0.1:43201/thumbric/

## Stack

React 19, TypeScript, Vite, canvas renderer (`src/render.ts`). Optional Cloudflare Worker for user JSON.
