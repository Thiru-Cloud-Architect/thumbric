# Thumbric — simple UI roadmap

Ruthless checklist inspired by vidIQ / Canva / Genspark / WayinVideo screenshots — **not** by `team.md` as a design brief. Goal: calm market-leader first impression. Fake CTR analytics and paid fal are out of scope until basics feel trustworthy.

## Competitor patterns we copy

| Pattern | Who | Rule for us |
| --- | --- | --- |
| One promise + one primary CTA | vidIQ, Canva | Hero never stacks 3 equally loud buttons |
| Single input: describe **or** paste URL | vidIQ, Wayin, Genspark | AI maker = one box, not style grids + presets + tips |
| Result: “Your thumbnail is ready” + big preview + Generate again | vidIQ | Celebrate completion; defer editor polish |
| Categorized Tools mega-menu (title + one-line desc) | vidIQ Features / Free AI Tools | Flat link dumps feel “low market” |
| Breadcrumbs + calm tool hero | Genspark, Canva, Wayin | Shared chrome on every free tool |
| Clean pricing cards | vidIQ | Free / paid tiers with short copy only |

## P0 — ship in this pass

Basics that stop the “confused product” feeling. Do these before Pro polish.

1. **AI Thumbnail Maker = market-simple** (`/ai-thumbnail-maker`)
   - One primary card; single field: “Describe your video or paste a YouTube URL.”
   - Optional secondary: photo upload / video-file stub (do not require upload).
   - YouTube URL → extract id/title (URL parse + oEmbed when available); honest note if frames cannot be fetched yet.
   - Generate via existing free Pollinations + strategy concepts.
   - Loading copy rotates: analysing idea → high-CTR packaging framing → preparing thumbnail.
   - Result state: “Your thumbnail is ready” + large preview + Generate again + Finish in editor / Download.
   - Remove cluttered multi-mode chrome (style chip walls, preset rows as primary UI).

2. **Clean editor stays simple** (`/#editor`)
   - From-scratch path only inside the studio: platform → template/photo → title → export.
   - No AI mode complexity on the default create path; link out to AI maker.
   - Calm canvas toolbar; no marketing noise inside the editor.

3. **Nav Tools mega-menu** (vidIQ-inspired)
   - Categorized columns: Thumbnails | Analyze | Utilities (or similar).
   - Each item: short title + one-line description.
   - Correct tool routes; pathname change always scrolls to top.

4. **Home hero simplification**
   - One clear promise + primary CTA (Create) + secondary AI maker.
   - Analyze stays secondary; cut trial/noise from the first viewport when competing.

5. **Free tool pages shared chrome**
   - Consistent hero (kicker, title, one lede), breadcrumbs, aligned “More free tools” grid (not jagged link rows).

6. **Empty / loading honesty**
   - AI busy states say what is happening; never invent Studio CTR %.

## P1 — next

- Pricing page: three calm cards (Free / Creator / Pro) with short blurbs only; defer Stripe checkout UI polish.
- Footer: clear columns (Product · Tools · Company · Legal) matching mega-menu labels.
- Home below-fold: fewer competing sections; one job per section.
- Maker SEO pages: same one-box CTA pattern pointing at AI maker or clean editor — no conflicting “Try AI” that opens the old in-editor AI mode.
- Result download HD path: watermark honesty + clear upgrade teaser (no fake paywall).
- Improve / Doctor funnel: score → one CTA into AI maker (not back into a third editor mode).
- Mobile mega-menu: sheet with same categories.

## P2 — later (paid / Pro)

- Paid fal (or equivalent) for photoreal faces and video-frame understanding.
- Stripe checkout + entitlement sync.
- Face / brand kit training from creator uploads.
- Real YouTube OAuth + channel metrics (never fake CTR %).
- Video file upload → frame pick (privacy-safe client path).
- A/B history cloud sync, agency seats, MCP / coach features.

## Explicit non-goals (this pass)

- Do not block AI on paid models or video upload.
- Do not invent CTR percentages as analytics.
- Do not create a PR — commit + push feature branch only.
- Do not treat `team.md` as the visual brief (stamp only).
