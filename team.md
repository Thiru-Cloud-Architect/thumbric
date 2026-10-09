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

**Color system (active):** cohesive sky studio (`--bg #e3f0ff`, `--bg-soft #f0f5ff`) + mild purple primary (`--accent/#cta #6366f1`) and sky secondary (`--accent-2 #0ea5e9`). Corner lavenders only — no edge stripe columns. Coral-on-black is retired.

Shipped: calm AI one-box maker (centered sky composition), **multi-stage generation progress**, **3 packaging concepts** with strategy/why, brief→variant wiring, structured cooldown/errors, editor handoff (title + line 2 + placement), canvas-first editor card, Tools mega-menu, freemium gates, Supabase auth client with local fallback.

**Windows Downloads note:** Cloud Agents cannot read `C:\Users\…\Downloads\…` until the file is uploaded; the orchestrator master is now in `docs/`.

Missing / deferred: live Supabase project credentials in prod, Stripe checkout, paid fal AI (Worker ready; keys unset), YouTube frame extraction, AI critic / ThumbnailDocument / Gemini provider router.

## Current stamp

`UI_BUILD=2026.10.09-orchestrator`

## Open threads

1. Add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` for cloud accounts.
2. Stripe / Razorpay for Creator & Pro.
3. Paid fal path when ready for face-wow AI (do not fake); set `FAL_KEY` + `VITE_API_BASE`.
4. Real YouTube frame pull — optional advanced path only.
5. Orchestrator Phase 1 remainder: provider abstraction, critic, ThumbnailDocument layers.
