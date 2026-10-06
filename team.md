# Thumbric.ai — team brief

Living status for agents and humans. Live site: https://thiru-cloud-architect.github.io/thumbric/  
Repo: `Thiru-Cloud-Architect/thumbric` · Code checkout often at `/home/ubuntu/thumbforge`

## Help here (current ask)

When someone says `@team.md can you help here`, treat these as the open threads:

1. **Features / AI UX** — Make it obvious that AI is “describe the scene → free AI image,” not full video analysis (cost).
2. **Custom domain** — Goal is `thumbric.ai` (not registered yet; repo is prepared).
3. **Stale UI** — If the user still sees the old Features grid, verify deploy stamp vs cache / wrong URL.

## Status (2026-10-06)

| Thread | State |
|--------|--------|
| Features AI-first section | **Live** — stamp `UI_BUILD=2026.10.06-ak`. Banner: “Describe the scene…”, Works now / Not yet, `#editor-ai` deep link. |
| Editor AI | **Live** — Title step → “AI scene image” + “Generate AI scene” (Pollinations, no API key). |
| Custom domain `thumbric.ai` | **Blocked** — NXDOMAIN (not registered). Pages `cname` is null. |
| Old UI complaints | **Resolved on origin** — hard-refresh or open `/thumbric/` (not `/thumbforge/`). Footer stamp should show `2026.10.06-ak`. |

## AI product truth (cost-aware)

- **Now:** User types a short scene (or title + niche hint) → free AI generates a backdrop image → they finish title/fonts/stickers on the canvas.
- **Not yet:** Paste YouTube URL / watch a video file / full video analysis (needs a paid model).

## Domain — single blocker

1. Buy **thumbric.ai** (Cloudflare Registrar recommended).
2. Point DNS at GitHub Pages (`Thiru-Cloud-Architect/thumbric`).
3. Repo Settings → Pages → Custom domain → `thumbric.ai` (+ Enforce HTTPS).
4. Uncomment `VITE_BASE_PATH` / `VITE_SITE_URL` in `.github/workflows/pages.yml` and push `main`.

Details: `DEPLOY.md`.

## Verify deploy

```bash
# Build stamp in shipped JS
curl -sL https://thiru-cloud-architect.github.io/thumbric/ \
  | rg -o '/thumbric/assets/index-[^"]+\.js'
# Expect UI_BUILD string inside that bundle:
# 2026.10.06-ak  and  "Describe the scene"
```

Wrong path: `…/thumbforge/` is a redirect stub — use `…/thumbric/`.
