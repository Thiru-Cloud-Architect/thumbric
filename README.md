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

- Studio editor: left tools / center canvas / right title inspector
- Platform sizes, moods, drag title/stickers, YouTube-style templates
- **Title kit:** size, fill color, outline, shadow, left/center/right, 2-line titles
- **Generate 3 looks** — first still lands on the canvas; remaining looks always fill
- Light **Sign in** (name + email on device; optional sync to Cloudflare Worker JSON)
- Pricing page (demo unlock until Stripe/Razorpay)

## AI backends

| Mode | How to enable | What you get |
|------|----------------|--------------|
| **Premium (recommended)** | Deploy `worker/`, `npx wrangler secret put FAL_KEY`, build with `VITE_API_BASE` | **fal.ai Flux Schnell** via Worker proxy — keys never in the client |
| **Workers AI fallback** | Bind `[ai]` in `worker/wrangler.toml` if `FAL_KEY` is unset | Cloudflare Flux Schnell on the same `/api/ai/image` route |
| **Local demo key** | `VITE_FAL_KEY` (insecure — baked into JS) | Direct fal.run from the browser; CORS may block it |
| **Free (default)** | nothing | Pollinations Flux, **one** model call, then 2 local crop/grade looks so the picker never shows empty “Paused” slots |

See `.env.example`. **Canva-level photoreal faces, text-in-image, and URL-from-video still need a paid fal (or similar) key** — the free path is a scene still + editor overlays.

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

Open http://127.0.0.1:43201/thumbric/

## Stack

React 19, TypeScript, Vite, canvas renderer (`src/render.ts`). Optional Cloudflare Worker for user JSON + premium AI proxy.
