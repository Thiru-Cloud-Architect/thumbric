# Thumbric audit — editor / AI slice

**Date:** 2026-10-07  
**Live:** https://thumbric.app/  
**Stamp at audit:** `UI_BUILD=2026.10.07-fallback`  
Blueprint: ChatGPT `THUMBRIC_CURSOR_AGENT_BLUEPRINT` v1.0. This is the editor/AI slice, not a full-funnel audit.

| ID | Requirement | Status | Evidence |
|----|-------------|--------|----------|
| P0 core flow | Topic/title + optional image → style → 3 concepts → edit → 1280×720 download | **Partial** | `HomePage.tsx` AI path + classic templates. 3 looks always fill (`generateAiThumbnailVariants` + `composeStudioLooks`). Download is PNG at platform size (`render.ts`). |
| P0 loading / retry / graceful failure | Progress, retry, no amateur jargon | **Implemented** (this slice) | Inline status + spinner. 402/429 → “Free AI is busy”. Network errors never mention CORS/Pollinations. Studio stills fill if the model fails. |
| P0 anonymous trial | Start with minimal friction | **Partial** | No signup to generate or save a watermarked preview. Clean export uses a device trial (`entitlement.ts`). |
| P0 analytics events | landing_view → download funnel | **Missing** | No event schema / dashboard in repo. |
| P0 cost / latency / provider spend | Budget alerts | **Missing** | Free path is unmetered Pollinations; premium Worker not deployed. |
| P0 secrets | No image-provider keys in the browser | **Implemented** | Pages build has no `VITE_FAL_KEY` / `VITE_API_BASE`. Worker holds `FAL_KEY` when deployed. |
| P1 homepage H1 / CTA | Clear AI YouTube maker + Create free | **Partial** | H1 is click-led (“thumbnails that get the click”) per product decision; primary CTA is **Try AI Thumbnail creator**. Blueprint’s exact H1 wording not used. |
| P1 SEO pages | 3–5 unique tool landings | **Missing** | `/`, `/pricing`, `/career` only. |
| P1 robots/sitemap | Valid | **Implemented** | `vite.config.ts` emits `robots.txt` + `sitemap.xml`. |
| P2 one-click refinements | Larger text, contrast, cleaner layout | **Implemented** | Inspector: Bigger type / Punchier / Cleaner. |
| P2 history / brand kit | Saved projects | **Missing** | Device-only sign-in. |
| P2 thumbnail review | Heuristic score | **Missing** | Would need copy that it is **not** CTR prediction. |
| P3 YouTube URL / OAuth | Import + analytics | **Missing** | Intentionally not funded (team.md). |

## Paid-key blockers (cannot fake Canva on $0)

True “team satisfied” **AI quality** (photoreal faces, identity lock, readable burned-in type, video-from-URL) needs:

1. **Deploy `worker/`** to Cloudflare (`npx wrangler deploy`).
2. **`npx wrangler secret put FAL_KEY`** (or bind Workers AI).
3. Set **`VITE_API_BASE`** in `.github/workflows/pages.yml` to that Worker URL (never a client `VITE_FAL_KEY` in production).

Until then, live quality is: one free image model call when it works, framed crops, or cinematic studio stills when it does not — plus the overlay editor.
