# Deploy notes (Thumbric.ai)

## Live URL

- Product: **Thumbric.ai**
- GitHub repo: `Thiru-Cloud-Architect/thumbric`
- Pages: https://thiru-cloud-architect.github.io/thumbric/
- Custom domain: **not connected** (`thumbric.ai` is not registered / no DNS)

GitHub Pages only updates when **`main` is pushed** and the **Pages** workflow finishes. Footer build stamp should match `UI_BUILD` in `src/brand.ts`.

## Blocker for apex domain

**Buy `thumbric.ai`** (Cloudflare Registrar recommended), then finish the steps below. Nothing else can attach the domain until it is owned and has DNS.

No Cloudflare API token / Wrangler login is available in this environment, so registrar purchase and DNS must be done in the Cloudflare dashboard.

## After purchase (exact steps)

1. In Cloudflare DNS for `thumbric.ai`, add the records GitHub Pages requires (apex `A`/`AAAA` and/or `www` `CNAME` → `thiru-cloud-architect.github.io`).
2. GitHub → **Settings → Pages → Custom domain** → `thumbric.ai` (optionally `www`). Wait until DNS check passes and **Enforce HTTPS** is on.
3. In `.github/workflows/pages.yml`, uncomment:

   ```yaml
   env:
     VITE_BASE_PATH: /
     VITE_SITE_URL: https://thumbric.ai/
   ```

4. Push `main`. Build stamps `SITE_URL`, sitemap, robots, `404.html`, and router basename from those env vars — no further code edits needed.

Optional: add a `CNAME` file containing `thumbric.ai` under `public/` after step 2 (GitHub also sets this when you save the custom domain in the UI).
