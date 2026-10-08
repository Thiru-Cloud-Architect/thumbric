# Thumbric.ai

Free browser thumbnail maker for **YouTube**, Shorts/Reels, Instagram, LinkedIn, and Facebook — plus **AI image** generation and free creator tools (score, A/B tester, resizer, CTR, title).

**Live site:** https://thumbric.app/  
**Fallback:** https://thiru-cloud-architect.github.io/thumbric/

## Brand vs URL

| What | Name |
|------|------|
| **Product** | **Thumbric.ai** |
| **Public site** | **thumbric.app** (Cloudflare → GitHub Pages) |

Connect steps and DNS records: see **[DEPLOY.md](./DEPLOY.md)**. Optional later: buy `thumbric.ai` and redirect `.app` → `.ai`. Worker API can live on `api.thumbric.app` — see `worker/`.

## Features today

- Studio editor: left tools / center canvas / right title inspector
- Platform sizes, moods, drag title/stickers, YouTube-style templates
- **Title kit:** size, fill color, outline, shadow, left/center/right, 2-line titles
- **Generate 3 looks** — Punch / Warm / Cinematic restyles; if free AI is busy, cinematic studio stills still fill
- Free tools (header **Tools** menu): Thumbnail Score, A/B Tester, Resizer, CTR Calculator, Title Analyzer
- Shareable score pages at `/roast/…` (heuristic, not CTR)
- Light **Sign in** (name + email on device; optional sync to Cloudflare Worker JSON)
- Pricing page (demo unlock until Stripe/Razorpay)

## Routes

| Path | What |
|------|------|
| `/` | Home + studio editor (`#editor-ai`) |
| `/tools` | Free-tools hub |
| `/youtube-thumbnail-score` | Analyzer / 0–100 heuristic score |
| `/youtube-thumbnail-tester` | A/B compare |
| `/youtube-thumbnail-resizer` | 1280×720 / Shorts / square |
| `/youtube-ctr-calculator` | Impressions → CTR |
| `/youtube-title-analyzer` | Title length & hook |
| `/youtube-thumbnail-maker` and niche makers | SEO landings → editor |
| `/learn` | Short thumbnail lessons |
| `/legal` | Privacy & terms |
| `/pricing` | Plans |
| `/career` | Careers (footer only) |

## AI backends

| Mode | How to enable | What you get |
|------|----------------|--------------|
| **Premium (recommended)** | Deploy `worker/`, `npx wrangler secret put FAL_KEY`, build with `VITE_API_BASE` | **fal.ai Flux Schnell** via Worker proxy — keys never in the client |
| **Workers AI fallback** | Bind `[ai]` in `worker/wrangler.toml` if `FAL_KEY` is unset | Cloudflare Flux Schnell on the same `/api/ai/image` route |
| **Local demo key** | `VITE_FAL_KEY` (insecure — baked into JS) | Direct fal.run from the browser; CORS may block it |
| **Free (default)** | nothing | One model call, then Punch/Warm/Cinematic grades. If the model is busy, **3 studio stills** still fill the picker |

See `.env.example`. **Canva-level photoreal faces, identity lock, and URL-from-video still need a paid fal (or similar) key** — set `FAL_KEY` on the Worker and `VITE_API_BASE` on the Pages build. The free path is a scene still + editor overlays.

## Simple login (no Auth0 / Supabase yet)

- Header **Sign in** → name + email → `localStorage`
- When you deploy the Worker and set `VITE_API_BASE`, the same form also `POST`s to `/api/register` and appends to a **JSON list in Cloudflare KV** (`users.json`)

```bash
cd worker
npm install
npx wrangler login
npx wrangler kv namespace create THUMBRIC_USERS
# paste id into wrangler.toml [[kv_namespaces]]
npx wrangler secret put FAL_KEY
npx wrangler deploy
# then build the site with: VITE_API_BASE=https://thumbric-api.<your-subdomain>.workers.dev
```

## Run locally

```bash
npm install
npm test
npm run dev
```

Open http://127.0.0.1:43201/ (or http://127.0.0.1:43201/thumbric/ if you set `VITE_BASE_PATH=/thumbric/`).

## Stack

React 19, TypeScript, Vite, canvas renderer (`src/render.ts`). Optional Cloudflare Worker for user JSON + premium AI proxy + optional event ingest.
