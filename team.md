# Thumbric.ai — team brief

Living status for agents and humans.  
**Canonical live URL:** https://thumbric.app/  
Fallback: https://thiru-cloud-architect.github.io/thumbric/  
Repo: `Thiru-Cloud-Architect/thumbric` · Code checkout often at `/home/ubuntu/thumbforge`

## Help here (current ask)

When someone says `@team.md can you help here`, treat these as the open threads:

1. **Features / AI UX** — Make it obvious that AI is “describe the scene → free AI image,” not full video analysis (cost).
2. **Custom domain `thumbric.ai`** — Preferred later; **live is `thumbric.app`**. `.ai` still needs paid registration.
3. **Stale UI** — Footer stamp must match `UI_BUILD` in `src/brand.ts`. Hard-refresh if cache shows an older stamp.

## Status (2026-10-07)

| Thread | State |
|--------|--------|
| Features AI-first section | **Live** — banner: “Describe the scene…”, Works now / Not yet, `#editor-ai` deep link. |
| Selling-point CTA | **Live** — hero primary “Try AI Thumbnail creator” → `#editor-ai`; header **Start free** opens AI editor; hero **Start 7-day trial**. Careers is footer-only. |
| Editor AI + classic | **Live** — studio layout (tools / canvas / inspector), title kit, templates, one-tap Bigger / Punchier / Cleaner. |
| AI looks | **Live** — 3 looks always fill. Free path: 1 model call + framed crops. If the model is busy/unreachable, **3 cinematic studio plates** still land on the picker (stamp `UI_BUILD=2026.10.07-verify`). |
| Title drag | **Fixed** — titles can sit in the upper third. |
| Accents | **Live** — coral→soft magenta (`#ff7f8a` / `#d4a6f0`). |
| Pricing | **Live** — Creator $19 / Pro $49; INR ₹999 / ₹2499. |
| Custom domain `thumbric.app` | **Live** (Cloudflare Registrar → GitHub Pages). `thumbric.ai` still NXDOMAIN / unpaid. |
| Premium Worker AI | **Ready in repo, not in production** — needs `wrangler deploy`, `FAL_KEY` (or Workers AI bind), and `VITE_API_BASE` on Pages. No secrets in git. |

## AI product truth (cost-aware)

- **Now:** User types a short scene → free AI (or studio fallback) fills 3 looks → they finish title/fonts on the canvas.
- **Not yet:** Paste YouTube URL / watch a video file / photoreal Canva-grade faces with burned-in text (needs a paid model key).

## Verify deploy

```bash
curl -sL https://thumbric.app/ | rg -o '/assets/index-[^"]+\.js'
# Expect UI_BUILD string inside that bundle:
# 2026.10.07-verify
```
