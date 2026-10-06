# Domain name options for Thumbric (Cloudflare Registrar)

Buy with **Cloudflare Registrar** (at-cost renewals). Live site stays free on GitHub Pages until DNS is attached.

Availability checked via DNS NS lookup (Status NXDOMAIN ≈ likely free to register). **Always confirm at checkout** — registrars are source of truth.

## Recommended shortlist

| Domain | Likely free? | Est. Cloudflare / yr | Why |
|--------|--------------|----------------------|-----|
| **thumbric.ai** | Yes | **~$70–90** (often **2-yr min** → ~$140–180 first buy) | Best brand match for **Thumbric.ai** |
| **thumbric.app** | Yes | **~$8–15** | Strong product TLD, cheap, HTTPS-required |
| **thumbric.dev** | Yes | **~$8–15** | Clean “tool/dev” vibe, cheap |
| **thumbric.io** | Yes | **~$30 first / ~$50 renew** | OK name; renewals sting |
| **thumbric.com** | **No — taken** | — | Skip |
| **thumbric.online** | Yes | Promo ~$2–5 / renew ~$25–30 | Cheap bait; avoid unless temporary |

## Alternative brand names (same idea as Thumbric)

| Name | .ai | .app | .dev | .io | .com | Notes |
|------|-----|------|------|-----|------|-------|
| **thumbric** | free | free | free | free | **taken** | **Primary pick** |
| **thumbrix** | free | free | free | free | **taken** | Close alternate if `.ai` scooped |
| **thumbora** | free | free | free | free | **taken** | Softer brand |
| **thumbricks** | free | free | free | free | free | Longer; `.com` available |
| **getthumbric** | free | free | free | free | free | Weaker (“get…” prefix) |
| **usethumbric** | free | free | free | free | free | Weaker |
| **makethumb** | free | **taken** | free | free | free | Generic |
| **clickthumb** | free | free | free | **taken** | **taken** | Generic |
| **thumbforge** | **taken** | **taken** | free | **taken** | ? | Old repo name — mostly gone |
| **thumbly** | **taken** | **taken** | free | **taken** | **taken** | Crowded |

“free” = NXDOMAIN at check time · “taken” = NS records present.

## TLD price guide (Cloudflare / Porkbun ballpark, Oct 2026)

| TLD | First year (typical) | Renewal | Fit for Thumbric |
|-----|----------------------|---------|------------------|
| **.ai** | ~$80 (or 2× if min 2 years) | ~$80+ | Best for AI product story |
| **.app** | ~$8–15 | ~$14–15 | Best budget + still premium |
| **.dev** | ~$8–15 | ~$12–13 | Great if you’re OK with “dev” |
| **.io** | ~$27–35 | ~$50+ | Only if you love `.io` |
| **.com** | ~$10–11 | ~$10–15 | Ideal but `thumbric.com` taken |
| **.online** | Promo $2–5 | ~$25–30 | Not worth it long-term |

## Decision cheat-sheet

1. **Want exact brand + AI signal** → buy **`thumbric.ai`** on Cloudflare.
2. **Want cheap + clean** → buy **`thumbric.app`** (or `.dev`).
3. **`.ai` already gone when you check** → try **`thumbrix.ai`** or **`thumbora.ai`**, or keep **`thumbric.app`**.
4. **$0 for now** → keep https://thiru-cloud-architect.github.io/thumbric/ (already live).

## After purchase (Cloudflare → GitHub Pages)

1. Cloudflare DNS: apex **A** → `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153` (and optional `www` **CNAME** → `thiru-cloud-architect.github.io`).
2. GitHub repo **Settings → Pages → Custom domain** → your domain → **Enforce HTTPS**.
3. Uncomment in `.github/workflows/pages.yml`:

```yaml
env:
  VITE_BASE_PATH: /
  VITE_SITE_URL: https://thumbric.ai/   # or .app / whatever you bought
```

4. Push `main`. More detail in `DEPLOY.md`.
