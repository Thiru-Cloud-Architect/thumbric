# Thumbric.ai — team brief

Living status for agents and humans.  
**Canonical live URL:** https://thumbric.app/  
Fallback: https://thiru-cloud-architect.github.io/thumbric/  
Repo: `Thiru-Cloud-Architect/thumbric` · Code checkout often at `/home/ubuntu/thumbforge`

## Help here (current ask)

When someone says `@team.md can you help here`, treat these as the open threads:

1. **AI quality** — Free Pollinations is still the pixel source without `FAL_KEY`. Keep improving prompts, scene rewrites, and Punch/Warm/Cinematic grades. Never claim Canva-grade photoreal without Worker AI.
2. **UI polish** — Studio clarity, Tools hover menu, tool pages. Footer stamp must match `UI_BUILD` in `src/brand.ts`.
3. **Custom domain `thumbric.ai`** — Preferred later; **live is `thumbric.app`**.

## Status (2026-10-08)

| Thread | State |
|--------|--------|
| Tools menu | **Live** — hover opens dropdown (click still works on touch); Score / A/B / Resizer / CTR / Title / AI Maker + All tools. |
| Studio UI | **Live** — clearer labels, inspector contrast, cleaner look picker (no “restyle” jargon). |
| AI looks | **Live** — stronger CTR prompts, song-cover / meta-prompt rewrite, punchier grades (`UI_BUILD=2026.10.08-tier`). |
| Growth tools | **Live** — `/tools` hub + SEO makers + `/learn` + `/legal` + roast share. |
| Selling-point CTA | **Live** — hero “Try AI Thumbnail creator”; header **Start free** → `#editor-ai`; hero **Start 7-day trial**. Careers footer-only. |
| Custom domain `thumbric.app` | **Live**. `thumbric.ai` unpaid. |
| Premium Worker AI | **Ready in repo, not in production** — `wrangler deploy` + `FAL_KEY` + `VITE_API_BASE`. |

## AI product truth (cost-aware)

- **Now:** Describe scene → free AI (or studio fallback) fills 3 looks → finish title on canvas.
- **Not yet:** YouTube URL / video analysis / Canva-grade faces with burned-in text (needs paid model key).

## Verify deploy

```bash
curl -sL https://thumbric.app/ | rg -o '/assets/index-[^"]+\.js'
# Expect UI_BUILD string inside that bundle:
# 2026.10.08-tier
```
