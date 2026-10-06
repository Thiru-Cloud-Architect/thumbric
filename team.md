# Thumbric.ai — team brief

Living status for agents and humans.  
**Canonical live URL:** https://thiru-cloud-architect.github.io/thumbric/  
Repo: `Thiru-Cloud-Architect/thumbric` · Code checkout often at `/home/ubuntu/thumbforge`

## Help here (current ask)

When someone says `@team.md can you help here`, treat these as the open threads:

1. **Features / AI UX** — Make it obvious that AI is “describe the scene → free AI image,” not full video analysis (cost).
2. **Custom domain** — Preferred: `thumbric.ai`. **Blocked on paid registration** (see Domain plan).
3. **Stale UI** — If the user still sees the old Features grid, verify deploy stamp vs cache / wrong URL.

## Status (2026-10-06)

| Thread | State |
|--------|--------|
| Features AI-first section | **Live** — stamp `UI_BUILD=2026.10.06-aq`. Banner: “Describe the scene…”, Works now / Not yet, `#editor-ai` deep link. |
| Editor AI | **Live** — Title step → “AI scene image” + “Generate AI scene” (Pollinations, no API key). Inline status + 45s timeout + flux/turbo fallbacks. |
| Custom domain `thumbric.ai` | **Blocked — one user step** — NXDOMAIN; no CF/AWS/Namecheap/Route53 tokens; no owned zones or `*.pages.dev`. Zero-touch host = github.io only. |
| Old UI complaints | **Resolved on origin** — hard-refresh or open `/thumbric/` (not `/thumbforge/`). Footer stamp should show `2026.10.06-aq`. |

## AI product truth (cost-aware)

- **Now:** User types a short scene (or title + niche hint) → free AI generates a backdrop image → they finish title/fonts/stickers on the canvas.
- **Not yet:** Paste YouTube URL / watch a video file / full video analysis (needs a paid model).

## Domain plan (final — agent-automated as far as possible)

**Scan (re-run 2026-10-06):** no Cloudflare / Wrangler / AWS Route53 / Namecheap / Google Domains tokens in env, gh secrets, or `~/.config`. No Pages `cname` on any repo. `thumbric.ai` still NXDOMAIN; `thumbric.com` taken (GoDaddy). Free alternatives (`*.pages.dev` / `*.workers.dev`) need Cloudflare login that does not exist here.

**Production without user:** keep https://thiru-cloud-architect.github.io/thumbric/ (already live).

**Only unavoidable user step for a real custom domain:** buy `thumbric.ai` (or `.dev` / `.app`) with a payment method. Prefer Cloudflare Registrar. Optionally add `CLOUDFLARE_API_TOKEN` so agents can finish DNS + GitHub Pages + uncomment `VITE_BASE_PATH` / `VITE_SITE_URL` in `pages.yml` and push `main`.

Details: `DEPLOY.md`.

## Verify deploy

```bash
# Build stamp in shipped JS
curl -sL https://thiru-cloud-architect.github.io/thumbric/ \
  | rg -o '/thumbric/assets/index-[^"]+\.js'
# Expect UI_BUILD string inside that bundle:
# 2026.10.06-aq  and  "Describe the scene"
```

Wrong path: `…/thumbforge/` is a redirect stub — use `…/thumbric/`.
