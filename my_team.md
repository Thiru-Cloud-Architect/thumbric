# my_team.md — acceptance checklist (orchestrator slice)

Call with: `@my_team.md`  
Repo workdir: `/home/ubuntu/thumbforge` (not `/workspace`).

## Completion status

Honest snapshot for product owners. The free AI path and coral studio UI are real; the full orchestrator (paid models, critic, layered docs, billing) is **not** finished.

### Live audit pointer

See `docs/LIVE_SITE_AUDIT_2026-10-09.md` + `docs/THUMBRIC_LIVE_SITE_DEEP_REANALYSIS.md`.  
P0: build + More-options — **prod verified**.  
P1: export gate no modal stack — `exportGate.test.ts`; **local + production verified** (`2026.10.09-export-gate`). No staging.

### COMPLETED (in repo today)

- One-field AI maker (scene **or** YouTube URL) — `/ai-thumbnail-maker`
- Brief → variants (`buildCreativeBrief`, `thumbOptionsFromBrief`, `attachCreativeConcepts`)
- Multi-stage progress UI (`planning → generating → assembling`) — master §26 / §54
- 3 packaging concepts with strategy / why / headline — §8 / §48
- Generate 3 new directions (strategy rotation) — §49
- Structured failure + cooldown UX — §50
- Editor handoff (title, line 2, placement, cover) — §57 (raster cover honest, not fake layers)
- Client rate limits + cooldown UI
- Free Pollinations path (+ studio fallback looks)
- Coral + purple brand; light/dark theme toggle
- Calm canvas-first editor card (soft stage, compact tools/templates, quiet inspector)
- **AI imaging infra started:** provider readiness (`aiConfig`), `ImagingJob` plan→generate→assemble (`aiImaging`), Worker `GET /api/ai/ready`, maker status chip
- Freemium gates / usage limits
- Supabase client with local fallback when keys unset
- INR/USD geo pricing display
- Tools mega-menu, Doctor / Score / Resizer / CTR / titles, etc.

### NOT COMPLETED (orchestrator / paid infra — do not claim)

- ~~Paid **fal** path~~ — Worker + `VITE_API_BASE` live; quota Free 3 / Creator 60 / Pro unlimited
- Creative brief still heuristic (no LLM) — guarded by `src/packagingCorpus.ts` (20+ failure-class cases in CI); Nano Banana / critic still open
- YouTube **frame extraction** from video (public title only today) — §32 optional future
- Gemini / Nano Banana **provider router** — §2–3 (documented only; not wired)
- AI **critic** + targeted patch ops — §16–21
- Canonical **ThumbnailDocument** layer model as source of truth — §10–11, §57 full
- Stripe / Razorpay checkout
- Supabase **prod** credentials wired in live deploy
- YouTube OAuth CTR / A-B learning — Phase 5–6

See also: `docs/THUMBRIC_AI_ENGINE_ORCHESTRATOR_IMPLEMENTATION_MASTER.md`, `docs/AI_IMAGING_SETUP.md`, `docs/IMPLEMENTATION_GAP.md`.

---

## Local Downloads path — why it was inaccessible

Cloud Agents run on a remote Linux VM and **cannot read** `C:\Users\…\Downloads\…` on the user’s Windows disk until a file is uploaded/attached into the session.

## Master doc — now in repo

`docs/THUMBRIC_AI_ENGINE_ORCHESTRATOR_IMPLEMENTATION_MASTER.md`  
(Copied from the uploaded `…_5232.md` attach; content preserved, readable name.)

---

## AI imaging layer — detail

### SHIPPED (in repo today)

| Capability | Where |
|------------|--------|
| One-box scene **or** YouTube URL input | `/ai-thumbnail-maker`, `AiThumbnailMakerPage.tsx` |
| `buildCreativeBrief()` — topic → concepts / headlines (+ rotate for new directions) | `creativeBrief.ts` |
| **Packaging golden corpus** — failure classes (YouTube wrapper, music, auto, finance, tech, gaming, …) | `packagingCorpus.ts` + `packagingCorpus.test.ts` (CI) |
| `generateAiThumbnailVariants()` — free Pollinations + studio fallback looks | `aiThumbnail.ts` |
| **Multi-stage progress UI** (`planning → generating → assembling`) matching master §26/§54 | `aiOrchestrator.ts`, maker page |
| **Brief → variant wiring** (concept visual + placement-aligned composition index) | `thumbOptionsFromBrief`, `attachCreativeConcepts` |
| **3 concept results** with strategy / why / headline picker | `AiThumbnailMakerPage.tsx` |
| **Structured error + cooldown** (§50) — idea preserved, clear retry hint | `structuredAiFailure` |
| **Editor handoff fidelity** — title, titleLine2, placement, strategy + cover image | `aiHandoff.ts`, `HomePage.tsx` |
| Client AI rate limit + cooldown UI | `AI_RATE_LIMIT_COOLDOWN_SEC`, maker page |
| Honest YouTube note — **public title when available; no video frame extraction** | `youtubeUrl.ts`, FAQ, maker copy |
| Demo stub for QA only (`?demoResult=1`) | `AiThumbnailMakerPage.tsx` |

### STARTED (imaging infra — 2026-10-09)

| Capability | Where | Needs user action? |
|------------|--------|--------------------|
| Provider readiness (`Free preview engine` / `Pro imaging ready`) | `aiConfig.ts`, maker chip | No for free; **yes** for pro (`FAL_KEY` + `VITE_API_BASE`) |
| Worker readiness route | `GET /api/ai/ready` | Deploy Worker + `wrangler secret put FAL_KEY` |
| `ImagingJob` plan → generate → assemble hooks | `aiImaging.ts` (+ tests) | No — free path uses it; pixels still Pollinations until keys |
| Env + setup docs | `.env.example`, `docs/AI_IMAGING_SETUP.md` | Set secrets in deploy |

**We do not ship:** face-swap, photoreal fal “wow” pixels without keys, or YouTube frame/thumbnail extraction from video.

### Still open / blocked on keys (orchestrator / later)

- Preferred Gemini / Nano Banana provider abstraction + server keys (§2–3, Phase 1) — **blocked on wiring + keys**
- Full `ThumbnailDocument` layer model + AI critic / patch ops (§10–11, §16–21)
- Paid **fal** photoreal multi-concept pipeline (Worker exists; set `FAL_KEY` / `VITE_API_BASE`)
- Phase 4 optional **video intelligence** beyond public title
- Phase 5–6 YouTube OAuth CTR / A/B learning
- Stripe / Razorpay; Supabase prod credentials
- Real YouTube frame extraction (do not claim)

---

## Acceptance — color (coral + purple + themes)

- [x] Light: warm cream/peach wash; coral `#f05d6a`/`#ff7f8a` + purple `#c084fc`; white cards
- [x] Dark: warm ink `#0d0a0a`/`#161010`; coral+purple CTAs; dark raised cards (not white panels)
- [x] Theme toggle next to Sign in; `localStorage` `thumbric-theme`; `data-theme` on `<html>`
- [x] Header uses `--header-bg` in both modes (no hardcoded white bar in dark)
- [x] Editor panels use `--panel-surface` / soft `--canvas-stage` (theme-matched)
- [x] Brighter hero mosaic scrim in both modes; coral→purple CTA gradients

## Acceptance — AI maker (`/ai-thumbnail-maker`)

- [x] One field (YouTube link OR scene), centered composition
- [x] Multi-stage progress list while busy
- [x] Honest provider status chip (free vs pro-configured)
- [x] Result: 3 concepts (when available) + Download + Open in editor; handoff via `aiHandoff`
- [x] Honest YouTube / no fake frames note
- [x] Rate limit cooldown when provider throttles

## Acceptance — Editor (`/#editor`)

- [x] One elevated card; canvas stage + side panels match theme
- [x] Soft warm stage behind preview (not harsh cool grid chrome, not dead void)
- [x] AI maker handoff applies title + optional line 2 + placement
- [x] Upload: dashed drop zone with icon + helper text
- [x] Templates closed by default — compact summary row when closed
- [x] Right panel: Align / Size / Fill obvious; quieter disclosure chrome
- [x] Top bar: Editor · Size · Download (+ AI maker link)
- [x] Canvas toolbar: Undo, Redo, More

## UI correction (2026-10-09)

User feedback: editor felt unclear / not soothing. Softened stage, tightened card spacing for a larger canvas, quieter inspector/toolbar chrome, clearer upload + title controls. Coral theme kept.

## Screenshot evidence

Desktop 1440×900: `.walkthrough/coral-pass/` — light + dark for `/#editor` (and prior home/pricing shots).

## Still open

1. Paid fal / face-wow AI (infra started; **needs `FAL_KEY` + `VITE_API_BASE`**)
2. Real YouTube frame extraction (deferred — do not claim)
3. Supabase prod credentials + Stripe
4. AI critic / ThumbnailDocument / Gemini provider router (master Phase 1 remainder)
5. Mobile editor stacking polish (optional)
