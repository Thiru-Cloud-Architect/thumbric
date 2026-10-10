# Thumbric — SEO & Funnel Execution Plan

Owner lens: SEO + funnel specialist. Goal: rank for high-intent creator searches **and** convert visitors into repeat users and paid plans.

Existing foundation (already shipped): `robots.txt`, `sitemap.xml`, per-route titles/descriptions (`siteRoutes.ts` + `DocumentHead`), SEO maker landings, free tools hub, score/analyzer hooks, growth blueprint.

This plan is **what to do next**, ranked by impact.

---

## North star funnel

```
Search / social / referral
  → Free tool or AI maker (value in <60s)
    → First useful thumbnail / score
      → Soft signup (save / HD / no watermark)
        → Repeat weekly
          → Creator / Pro
            → Referral / share roast
```

Do **not** optimize for vanity traffic. Optimize for: **start tool → generate → export intent → account → paid**.

---

## Phase 0 — Measurement (do first, 1–2 sessions)

Without this, SEO work is guessing.

1. **Google Search Console** on `thumbric.app` (DNS/HTML verify). Submit `sitemap.xml`.
2. **Google Analytics 4** (or Plausible) + keep existing `track()` events.
3. Funnel events to watch weekly:
   - `landing_page_view` by path
   - tool start / score upload / AI generate success
   - export click / signup / plan view / checkout
4. **Bing Webmaster Tools** (cheap extra index).
5. Baseline screenshot: top queries = none or brand-only until weeks of content + links.

**Gate:** GSC + analytics live before writing 20 more pages.

---

## Phase 1 — Technical SEO (highest leverage for an SPA)

Thumbric is a client-rendered Vite SPA. Google can render JS, but **competitors with real HTML win**. Fix crawl quality.

| Priority | Action | Why |
|----------|--------|-----|
| P0 | **Prerender or SSG** key URLs (home, AI maker, score, analyzer, each maker landing, pricing, learn) | Bots get real H1 + copy without waiting on JS |
| P0 | Unique **OG image 1200×630** (not `favicon.svg`) per money page | Shares + brand CTR in SERP/social |
| P0 | Fix **canonical + trailing-slash** consistency (`/ai-thumbnail-maker` vs 301s) | Avoid duplicate/soft-404 signals |
| P1 | `noindex` thin/private routes: `/account`, `/dashboard`, `/projects`, `/feedback` (or remove from sitemap) | Don’t waste crawl budget |
| P1 | FAQPage + HowTo **JSON-LD** on AI maker, score, resizer | Rich-result eligibility |
| P1 | Compress LCP: hero/fonts; keep CLS low on editor | Core Web Vitals = ranking + conversion |
| P1 | `llms.txt` / clean brand mentions for AI Overviews (optional) | Emerging discovery |

**Money URLs (prerender first):**

- `/`
- `/ai-thumbnail-maker`
- `/youtube-thumbnail-maker`
- `/youtube-thumbnail-score`
- `/youtube-thumbnail-analyzer`
- `/shorts-thumbnail-maker`
- `/gaming-thumbnail-maker`
- `/pricing`
- `/learn`

---

## Phase 2 — Keyword clusters (own the SERP map)

Build **one primary page per intent**. Expand with supporting posts later.

### Cluster A — Create (commercial)

| Primary keyword intent | Target URL |
|------------------------|------------|
| free youtube thumbnail maker | `/youtube-thumbnail-maker` + `/` |
| ai thumbnail maker / generator | `/ai-thumbnail-maker` |
| shorts thumbnail maker | `/shorts-thumbnail-maker` |
| gaming / podcast / faceless thumbnail maker | existing niche maker URLs |

### Cluster B — Diagnose (top-of-funnel magnets)

| Intent | Target URL |
|--------|------------|
| youtube thumbnail analyzer / score | `/youtube-thumbnail-score`, `/youtube-thumbnail-analyzer` |
| thumbnail tester / A/B | `/youtube-thumbnail-tester` |
| ctr calculator | `/youtube-ctr-calculator` |
| title analyzer | `/youtube-title-analyzer` |
| thumbnail resizer 1280x720 | `/youtube-thumbnail-resizer` |
| thumbnail doctor / fix | `/thumbnail-doctor` |

### Cluster C — Learn (authority + long-tail)

Expand `/learn` into a real content hub (not a thin page):

- YouTube thumbnail size 2026
- CTR benchmarks by niche
- Faceless channel thumbnail formulas
- Mobile-first thumbnail checklist
- Title + thumbnail pairing
- Before/after case studies (use anonymized examples)

**Rule:** every learn article ends with one CTA → Score **or** AI Maker (never only “home”).

---

## Phase 3 — On-page template (every SEO URL)

Each page must have:

1. **One H1** matching intent (already partly done via `SeoMakerPage`).
2. **150–400 words** of unique, useful copy (problem → steps → proof → CTA). Thin step lists alone won’t rank long-term.
3. **Above-the-fold CTA** to the working tool (score upload / prompt box / editor).
4. **Internal links:** Tools hub ↔ related makers ↔ Learn article ↔ Pricing.
5. **Proof block:** 1 example before/after or scored sample.
6. Honest claims only (no fake “guaranteed CTR”).

Upgrade thin `SeoMakerPage` landings from “steps + tips” → **full intent pages** with FAQ (3–5 questions).

---

## Phase 4 — Conversion funnel (SEO traffic → revenue)

### Entry products (free, no card)

1. **Thumbnail Score** — fastest “aha” (upload → number).
2. **AI Maker** — describe/URL → 3 concepts.
3. **Resizer / CTR / Title** — utility SEO; always cross-link to Score + AI Maker.

### Soft walls (convert without killing SEO)

| Moment | Soft gate |
|--------|-----------|
| 2nd–3rd HD download / clean export | Signup |
| Save project / history | Signup |
| Pro imaging (fal) | Paid plan |
| Batch / brand kit later | Pro |

Keep **preview free forever** — that is the SEO moat vs Canva lock-in messaging.

### Pricing page

- Clear Free vs Creator vs Pro.
- Feature that justifies paid: **no watermark, HD, pro imaging, higher limits**.
- Geo INR/USD already started — keep local currency visible for India.

### Retention loop

- Email: “Your last score was 67 — improve it in 2 minutes.”
- In-app: weekly “thumbnail checkup.”
- Shareable **roast** / score cards (`/roast/:code`) for viral loops.

---

## Phase 5 — Off-page & distribution (ranking needs links + brand)

Google will not put a new domain #1 on “youtube thumbnail maker” from on-page alone.

### High-ROI channels (in order)

1. **YouTube itself** — demos: “I remade this thumbnail in 60s with Thumbric.” Put URL in description + pinned comment.
2. **Creator communities** — Reddit (r/NewTubers, r/PartneredYoutube), Discord, Indie Hackers: help first, soft CTA.
3. **Comparison / alternative pages** — “Canva vs Thumbric for YouTube thumbs”, “CapCut thumbnail workflow” (honest, not spammy).
4. **Directory / tool lists** — AlternativeTo, Product Hunt launch, There’s An AI For That, indie tool roundups.
5. **Partner embeds** — faceless/AI YouTube course creators; affiliate later.
6. **Tamil / India niche** — language-specific landing + WhatsApp/Telegram creator groups (underserved SERPs).

### Link bait assets

- Free “Thumbnail Score” badge creators can screenshot.
- Public CTR calculator + benchmark charts.
- Open checklist PDF → email capture (optional).

---

## Phase 6 — Competitive SERP strategy

Head terms (`youtube thumbnail maker`) are dominated by Canva, Adobe, established makers. **Do not bet the company only on head terms.**

**Win path:**

1. Rank first for **tool + long-tail** (score, resizer, shorts, faceless, gaming).
2. Earn brand searches (“thumbric”).
3. Climb head terms with prerender + backlinks + consistent product updates.
4. Capture **AI Overviews / featured snippets** with clear definitions + FAQs.

---

## 90-day execution board

### Days 1–14

- [ ] GSC + GA4 live; sitemap submitted
- [ ] Prerender money URLs **or** gate SPA with static HTML shells
- [ ] Real OG images; fix sitemap `noindex` for account/dashboard
- [ ] Score page: stronger above-fold upload + “Generate 3 alternatives” CTA
- [ ] Top up fal **balance** (not only card) for Pro demos

### Days 15–45

- [ ] Upgrade 8 SEO maker pages to full content + FAQ schema
- [ ] Publish 8 Learn articles (one primary keyword each)
- [ ] Internal link graph: every tool ↔ AI maker ↔ pricing
- [ ] Product Hunt / 3 community launches
- [ ] 4 YouTube demo videos

### Days 46–90

- [ ] Double down on queries that get impressions in GSC
- [ ] Add 10 niche makers / learn posts only where GSC shows demand
- [ ] Referral + roast virality
- [ ] Start paid acquisition **only** after free CAC baselines known (optional small YouTube/Google experiments)

---

## Paid models vs SEO spend (business rule)

| Spend | When |
|-------|------|
| fal Flux Schnell (~$0.003/img) | Small balance for demos + paid users; gate behind Pro |
| Nano Banana / Gemini | After paying users or high-converting demos justify 10–50× cost |
| SEO content + prerender engineering | **Now** — compounds; does not require fal |
| Google/YouTube ads | After organic funnel converts; else you buy traffic into a leaky bucket |

**SEO success does not require paid image models.** Free Pollinations + Score tools can acquire users. Paid models improve **wow / retention / Pro conversion** after traffic exists.

---

## KPI targets (directional)

| Metric | Early target |
|--------|----------------|
| GSC impressions | Growing weekly within 30–60 days |
| Non-brand clicks | First wins on long-tail tools |
| Tool start rate | ≥25% of landing sessions |
| Generate / score complete | ≥40% of tool starts |
| Signup rate | ≥8–15% of generators |
| Paid conversion | Optimize after 100+ signups of data |

---

## What “top of the list” really means

- **Realistic near-term:** top 3–10 for long-tail tool keywords + brand.
- **Hard / slow:** #1 for “youtube thumbnail maker” globally — multi-month, links + product authority.
- **Success definition:** creators who return weekly and pay — not only SERP position.

---

## Immediate owners checklist

1. Top up fal **credits** at [fal.ai/dashboard/billing](https://fal.ai/dashboard/billing) → retest Pro imaging.
2. Verify Search Console.
3. Prerender + OG images.
4. Strengthen Score → AI Maker funnel copy/CTAs.
5. Ship Learn hub content on a weekly cadence.
