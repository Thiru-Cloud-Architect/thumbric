# Domain name options for Thumbric

Buy when ready; live site stays free on GitHub Pages until DNS is attached.

Availability checked via DNS NS lookup (Status NXDOMAIN ≈ likely free to register). **Always confirm at checkout** — registrars are source of truth. Prices below are public USD ballparks (Oct 2026); ICANN ~$0.18–$0.20/yr extra on many gTLDs (not `.ai`).

## Where to buy (registrar comparison)

| | **Cloudflare** | **Spaceship** | **Namecheap** | **GoDaddy** |
|--|----------------|---------------|---------------|-------------|
| **.ai** 1st / renew | **~$80 / ~$80** (often **2-yr min**) | **~$80 / ~$80** (2-yr min) | ~$90 / ~$115 (2-yr min) | ~$105 / **~$160** |
| **.app** 1st / renew | ~$8 / ~$14 | Promo **~$5** / ~$15 | Promo ~$11 / ~$23 | ~$16 / ~$28 |
| **.dev** 1st / renew | ~$8 / ~$12 | Promo ~$6–10 / ~$12 | Promo ~$11 / ~$21 | ~$16 / ~$24 |
| **.io** 1st / renew | ~$32 / ~$50 | ~$32 (promo ~$15) / ~$52 | Promo ~$35 / ~$76 | ~$60 / ~$90 |
| **.com** 1st / renew | **~$10 / ~$10** | Promo ~$3–10 / **~$10** | Promo ~$7–11 / ~$18 | Promo ~$3 / **~$23** |
| **Price honesty** | Best — at-cost, no bait | Strong on `.ai`; promos elsewhere | Promo-first; renewals higher | Worst renewal jump |
| **WHOIS privacy** | Free | Free | Free for life | Free |
| **DNS → GitHub Pages** | Excellent (CF DNS required) | Good modern UI | Good BasicDNS | Works; cluttered UI |
| **Upsell pressure** | None | Low–medium | Medium | High |
| **Lock-in** | Must use CF nameservers | Standard 60-day | Standard 60-day | Standard + more transfer friction |
| **Support** | Ticket / community | Chat | Strong 24/7 chat | 24/7 phone/chat |

### Recommendation

1. **`thumbric.ai`** → **Cloudflare Registrar** still best (honest ~$80/yr, free privacy, clean DNS for GitHub Pages, no upsells). **Spaceship** is essentially tied on price if you prefer their checkout.
2. **`thumbric.app`** (or `.dev`) → **Cloudflare** for lowest honest renewal; **Spaceship** only if you want the cheapest year-one promo and accept ~$15 renew.
3. **Skip GoDaddy** for Thumbric — higher renewals and upsell noise for no DNS benefit.
4. **Namecheap** is fine if you already have an account; expect higher renewals than CF/Spaceship on `.ai` / `.app`.

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

1. **Want exact brand + AI signal** → buy **`thumbric.ai`** on **Cloudflare** (or Spaceship if tied on checkout).
2. **Want cheap + clean** → buy **`thumbric.app`** (or `.dev`) on Cloudflare.
3. **`.ai` already gone when you check** → try **`thumbrix.ai`** or **`thumbora.ai`**, or keep **`thumbric.app`**.
4. **$0 for now** → keep https://thiru-cloud-architect.github.io/thumbric/ (already live).

## After purchase (registrar DNS → GitHub Pages)

1. Registrar DNS (Cloudflare DNS if bought there): apex **A** → `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153` (and optional `www` **CNAME** → `thiru-cloud-architect.github.io`).
2. GitHub repo **Settings → Pages → Custom domain** → your domain → **Enforce HTTPS**.
3. Uncomment in `.github/workflows/pages.yml`:

```yaml
env:
  VITE_BASE_PATH: /
  VITE_SITE_URL: https://thumbric.ai/   # or .app / whatever you bought
```

4. Push `main`. More detail in `DEPLOY.md`.
