# Thumbric — team brief

**Live:** https://thumbric.app/ · Repo: `Thiru-Cloud-Architect/thumbric`  
**Call with:** `@team.md` · Checklist: `@my_team.md`

## Docs

- **Freemium model:** `docs/FREEMIUM_MODEL.md`
- **Supabase setup:** `docs/SUPABASE_SETUP.md`
- **AI imaging setup:** `docs/AI_IMAGING_SETUP.md`
- Simple UI roadmap: `docs/SIMPLE_UI_ROADMAP.md`
- Master plan: `docs/THUMBRIC_PHASED_MASTER_PLAN_AI_EDITOR_FIRST.md`
- **AI orchestrator master:** `docs/THUMBRIC_AI_ENGINE_ORCHESTRATOR_IMPLEMENTATION_MASTER.md`
- Design system: `docs/THUMBRIC_DESIGN_SYSTEM.md`
- **Honest gap:** `docs/IMPLEMENTATION_GAP.md`
- **Live audit 2026-10-09:** `docs/LIVE_SITE_AUDIT_2026-10-09.md` (screenshots under `.walkthrough/live-audit-2026-10-09/`)

## Truth

Visible UI brand is **Thumbric** (no .ai). The live domain stays https://thumbric.app/.

**Color system (active):** light/dark via `data-theme` + `thumbric-theme` localStorage. Light = warm cream/peach + coral `#f05d6a` + purple `#c084fc`. Dark = warm ink `#0d0a0a`/`#161010`, elevated cards, same coral→purple accents. Theme toggle lives next to Sign in.

Shipped: calm AI one-box maker, **multi-stage generation progress**, **3 packaging concepts**, brief→variant wiring, structured cooldown/errors, editor handoff, canvas-first editor card, **provider readiness chip** + `ImagingJob` hooks, Tools mega-menu, freemium gates, Supabase auth client with local fallback, **light/dark theme**.

**Windows Downloads note:** Cloud Agents cannot read `C:\Users\…\Downloads\…` until the file is uploaded; the orchestrator master is now in `docs/`.

**Honest AI gap:** free Pollinations path is live; imaging **infra** (readiness + job types + Worker `/api/ai/ready`) is started. Paid fal wow pixels need keys. Gemini provider router, AI critic, ThumbnailDocument layers, Stripe, YouTube frames, OAuth CTR are **not** done. See `@my_team.md`.

## Current stamp

`UI_BUILD=2026.10.09-live-audit`

## Live audit note (2026-10-09)

- Directive file `THUMBRIC_LIVE_SITE_DEEP_REANALYSIS.md` was **not** on the VM (Windows Downloads path inaccessible); audit still ran against https://thumbric.app + local `:43201`.
- **P0 fixed in repo:** unread `editorTab` broke `tsc`/`npm run build`, which blocked Pages from shipping the More-options popover. Regression: `src/titleOptionsLayout.test.ts`.
- **Verified local:** More title options opens `#title-options-popover` with `deltaScrollH=0`; download gate + AI demo stub exercised.
- **Verified production after Pages deploy (`fbac6a6`):** stamp `2026.10.09-live-audit`; More title options popover present; `deltaScrollH=0`. Pre-deploy audit also recorded routes 200 except `/roast/:code` HTTP 404 with working SPA.
- **Staging:** none.

## Open threads

1. Add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` for cloud accounts.
2. Stripe / Razorpay for Creator & Pro.
3. Paid fal path: set `FAL_KEY` on Worker + `VITE_API_BASE` on Pages (see `docs/AI_IMAGING_SETUP.md`).
4. Real YouTube frame pull — optional advanced path only.
5. Orchestrator Phase 1 remainder: Gemini provider abstraction, critic, ThumbnailDocument layers.
