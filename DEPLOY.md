# Deploy notes (Thumbric.ai)

## Production URL (live now — zero user action)

- Product: **Thumbric.ai**
- GitHub repo: `Thiru-Cloud-Architect/thumbric`
- **Canonical site:** https://thiru-cloud-architect.github.io/thumbric/
- Custom domain: **not connected**

GitHub Pages only updates when **`main` is pushed** and the **Pages** workflow finishes. Footer build stamp should match `UI_BUILD` in `src/brand.ts`.

## Domain plan state (2026-10-06 agent scan)

### Credentials / accounts scanned

| Source | Result |
|--------|--------|
| Env (`CLOUDFLARE_*`, `CF_*`, `AWS_*`, `NAMECHEAP_*`, `WRANGLER_*`, etc.) | **None set** |
| `gh secret list` (repo) | **Empty** |
| `~/.config`, `~/.aws`, `~/.wrangler`, `~/.cloudflared`, `.env*` | **No registrar / DNS tokens** |
| `wrangler whoami` / local wrangler binary | **Not authenticated** (no wrangler install + no CF login) |
| AWS CLI / Route53 | **Not installed / no credentials** |
| Cloudflare API | **Unreachable without token** |

### Owned hostnames under this GitHub account

| Site | URL | Custom domain |
|------|-----|---------------|
| thumbric | https://thiru-cloud-architect.github.io/thumbric/ | **none** (`cname: null`) |
| thumbforge | https://thiru-cloud-architect.github.io/thumbforge/ | none |
| agent-pr-gate-app | https://thiru-cloud-architect.github.io/agent-pr-gate-app/ | none |
| `Thiru-Cloud-Architect.github.io` user site | **does not exist** | — |

No Cloudflare zones, `*.pages.dev`, or `*.workers.dev` deployments are available without Cloudflare auth.

### DNS availability (Cloudflare DoH Status=3 = NXDOMAIN)

| Domain | DNS |
|--------|-----|
| `thumbric.ai` | **NXDOMAIN** (not registered) — preferred target |
| `thumbric.dev` / `.app` / `.io` / `.net` / `.org` / `.xyz` | NXDOMAIN |
| `thumbric.com` | **REGISTERED** (GoDaddy NS) — do not target |

### What can be automated vs not

| Goal | Automatable without user? |
|------|---------------------------|
| Keep shipping on github.io | **Yes** — already live |
| Register `thumbric.ai` (or alt) via API | **No** — needs paid registrar + billing method; no API token present |
| Cloudflare Pages `*.pages.dev` deploy | **No** — needs `wrangler` login / `CLOUDFLARE_API_TOKEN` |
| GitHub Pages custom domain + HTTPS + `VITE_*` flip | **After domain is owned + DNS** — agent can finish via `gh` + workflow edit |

**Zero-touch custom domain is impossible** in this environment. The only free hostname that works with zero user action remains the GitHub project Pages URL above.

## Single unavoidable user step (custom domain)

1. **Buy `thumbric.ai`** (Cloudflare Registrar recommended) with your payment method.

Optional but best for agents afterward: create a Cloudflare API token (Zone DNS Edit + Registrar if available) and put it in the Cursor environment / repo secret as `CLOUDFLARE_API_TOKEN`. Then say `@team.md domain` — agents can finish DNS + Pages + `VITE_*` without further clicks.

If you only buy in the dashboard and do not provide a token, also complete DNS + Pages UI yourself (steps below).

## After purchase (exact steps)

1. In Cloudflare DNS for `thumbric.ai`, add GitHub Pages records (apex `A`/`AAAA` and/or `www` `CNAME` → `thiru-cloud-architect.github.io`).
2. GitHub → **Settings → Pages → Custom domain** → `thumbric.ai` (optionally `www`). Wait until DNS check passes and **Enforce HTTPS** is on.
3. In `.github/workflows/pages.yml`, uncomment:

   ```yaml
   env:
     VITE_BASE_PATH: /
     VITE_SITE_URL: https://thumbric.ai/
   ```

4. Push `main`. Build stamps `SITE_URL`, sitemap, robots, `404.html`, and router basename from those env vars — no further code edits needed.

Optional: add a `CNAME` file containing `thumbric.ai` under `public/` after step 2 (GitHub also sets this when you save the custom domain in the UI).
