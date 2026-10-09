# Thumbric — team brief

**Live:** https://thumbric.app/ · Repo: `Thiru-Cloud-Architect/thumbric`  
**Call with:** `@team.md` · Checklist: `@my_team.md`

## Docs

- **Freemium model:** `docs/FREEMIUM_MODEL.md`
- **Supabase setup:** `docs/SUPABASE_SETUP.md`
- Simple UI roadmap: `docs/SIMPLE_UI_ROADMAP.md`
- Master plan: `docs/THUMBRIC_PHASED_MASTER_PLAN_AI_EDITOR_FIRST.md`
- **AI orchestrator master:** `docs/THUMBRIC_AI_ENGINE_ORCHESTRATOR_IMPLEMENTATION_MASTER.md`
- Design system: `docs/THUMBRIC_DESIGN_SYSTEM.md`
- **Honest gap:** `docs/IMPLEMENTATION_GAP.md`

## Truth

Visible UI brand is **Thumbric** (no .ai). The live domain stays https://thumbric.app/.

**Color system (active):** light/dark via `data-theme` + `thumbric-theme` localStorage. Light = deepened sky studio (`--bg #d4e6fb`) + mild purple (`#6366f1`) + sky secondary (`#0ea5e9`). Dark = cool navy/slate (`--bg #0f172a`), elevated cards, same sky/purple accents. Coral-on-black is retired. Theme toggle lives next to Sign in.

Shipped: calm AI one-box maker (centered sky composition), **multi-stage generation progress**, **3 packaging concepts** with strategy/why, brief→variant wiring, structured cooldown/errors, editor handoff (title + line 2 + placement), canvas-first editor card, Tools mega-menu, freemium gates, Supabase auth client with local fallback, **light/dark theme**.

**Windows Downloads note:** Cloud Agents cannot read `C:\Users\…\Downloads\…` until the file is uploaded; the orchestrator master is now in `docs/`.

**Honest AI gap:** free Pollinations path is live; paid fal wow, Gemini provider router, AI critic, ThumbnailDocument layers, Stripe, YouTube frames, OAuth CTR are **not** done. See `@my_team.md` Completion status.

Missing / deferred: live Supabase project credentials in prod, Stripe checkout, paid fal AI (Worker ready; keys unset), YouTube frame extraction, AI critic / ThumbnailDocument / Gemini provider router.

## Current stamp

`UI_BUILD=2026.10.09-theme`

## Open threads

1. Add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` for cloud accounts.
2. Stripe / Razorpay for Creator & Pro.
3. Paid fal path when ready for face-wow AI (do not fake); set `FAL_KEY` + `VITE_API_BASE`.
4. Real YouTube frame pull — optional advanced path only.
5. Orchestrator Phase 1 remainder: provider abstraction, critic, ThumbnailDocument layers.
