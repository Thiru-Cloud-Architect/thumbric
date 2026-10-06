# Thumbric.ai

Free browser thumbnail maker for **YouTube**, Shorts/Reels, Instagram, LinkedIn, and Facebook — plus **AI image** generation in the editor.

**Live site:** https://thiru-cloud-architect.github.io/thumbric/

## Brand vs URL

| What | Name |
|------|------|
| **Product** | **Thumbric.ai** |
| **GitHub Pages path** | `/thumbric/` (repo name) until you attach a custom domain |

### Connect `thumbric.ai` on Cloudflare (recommended)

**Blocker today:** `thumbric.ai` is not registered (NXDOMAIN). Buy it first, then:

1. Buy **thumbric.ai** (Cloudflare Registrar or any registrar).
2. Add DNS records GitHub shows for Pages (apex `A`/`AAAA`, optional `www` `CNAME`).
3. GitHub → repo **Settings → Pages → Custom domain** → `thumbric.ai`.
4. Uncomment `VITE_BASE_PATH: /` and `VITE_SITE_URL: https://thumbric.ai/` in `.github/workflows/pages.yml` and push `main`.

See `DEPLOY.md` for the full checklist. Worker API (optional) can live on `api.thumbric.ai` — see `worker/`.

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
