# AI imaging setup (honest path)

Thumbric’s free path works with **no keys**. Paid “pro imaging” needs a Worker + `FAL_KEY`.  
This does **not** enable face-swap or YouTube frame extraction.

Master plan: `docs/THUMBRIC_AI_ENGINE_ORCHESTRATOR_IMPLEMENTATION_MASTER.md`  
Status checklist: `my_team.md`

## Env vars

| Variable | Where | Purpose |
|----------|--------|---------|
| `FAL_KEY` | Cloudflare Worker secret | Server-side fal.ai Flux Schnell. **Preferred.** Never put this in the SPA. |
| `VITE_API_BASE` | Pages / local `.env` | Worker URL, e.g. `https://thumbric-api.…workers.dev` (no trailing slash required). |
| `VITE_FAL_KEY` | Local `.env` only | **Insecure escape hatch** — key ships in the JS bundle. Prefer Worker. |
| `VITE_SUPABASE_*` | Optional | Auth only — not required for imaging. |

Gemini / Nano Banana provider router (master §2–3) is **not wired yet**. Do not set Gemini keys expecting them to work today.

## Enable pro imaging

```bash
cd worker
npm install
npx wrangler secret put FAL_KEY
npx wrangler deploy
```

Then build/serve the site with:

```bash
VITE_API_BASE=https://thumbric-api.YOUR_SUBDOMAIN.workers.dev
```

## Readiness checks

- Client: `getProviderReadiness()` / `resolveProviderReadiness()` in `src/aiConfig.ts`
- Worker: `GET /api/ai/ready` → `{ ready, backend: "fal" | "workers-ai" | null }`
- AI maker UI chip: **Free preview engine** vs **Pro imaging ready**

Free Pollinations still runs when pro is unset or the Worker returns `ready: false`.

## Pipeline hooks shipped

`src/aiImaging.ts` — `ImagingJob` with **plan → generate → assemble**, progress copy, and failure recovery.  
Does not call fal by itself; the existing `aiThumbnail.ts` backends still generate pixels.

## Still blocked on keys / later work

- Photoreal fal multi-concept “wow” quality (needs `FAL_KEY` + `VITE_API_BASE` in deploy)
- Gemini / Nano Banana provider abstraction
- Face-swap / identity lock
- YouTube video frame extraction
