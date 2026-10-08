# Deploy notes (Thumbric)

## Live URLs

| URL | Role |
|-----|------|
| **https://thumbric.app/** | **Primary** (Cloudflare Registrar → GitHub Pages) |
| https://thiru-cloud-architect.github.io/thumbric/ | Fallback project URL (still works) |

Product display name is **Thumbric** (no .ai). The public site is **thumbric.app**.

Build env (`.github/workflows/pages.yml`):

```yaml
env:
  VITE_BASE_PATH: /
  VITE_SITE_URL: https://thumbric.app/
```

## Connect domain (do once in Cloudflare + GitHub)

### 1. Cloudflare DNS (zone: `thumbric.app`)

Set records to **DNS only** (grey cloud), not proxied, until HTTPS works:

| Type | Name | Content |
|------|------|---------|
| **A** | `@` | `185.199.108.153` |
| **A** | `@` | `185.199.109.153` |
| **A** | `@` | `185.199.110.153` |
| **A** | `@` | `185.199.111.153` |
| **AAAA** | `@` | `2606:50c0:8000::153` |
| **AAAA** | `@` | `2606:50c0:8001::153` |
| **AAAA** | `@` | `2606:50c0:8002::153` |
| **AAAA** | `@` | `2606:50c0:8003::153` |
| **CNAME** | `www` | `thiru-cloud-architect.github.io` |

Delete conflicting A/AAAA/CNAME on `@` if Cloudflare added parking records.

### 2. GitHub Pages custom domain

Repo **Thiru-Cloud-Architect/thumbric** → **Settings → Pages → Custom domain** → `thumbric.app` → Save.  
Wait for DNS check ✓ → enable **Enforce HTTPS** (required for `.app`).

Optional: also add `www.thumbric.app` if you use the www CNAME.

### 3. Push / wait

Push to `main` runs the Pages workflow. Footer stamp should match `UI_BUILD` in `src/brand.ts`.

## Later: move to thumbric.ai

1. Buy `thumbric.ai` on Cloudflare (~$80/yr).  
2. Point DNS the same way.  
3. Change Pages custom domain + set `VITE_SITE_URL: https://thumbric.ai/`.  
4. Redirect `thumbric.app` → `thumbric.ai` (Cloudflare Redirect Rule).

## Domain shopping notes

See [DOMAIN_OPTIONS.md](./DOMAIN_OPTIONS.md).
