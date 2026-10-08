# Thumbric AUDIT_REPORT — Phase 0

**Date:** 2026-10-08  
**Live:** https://thumbric.app/  
**Stamp at audit:** `UI_BUILD=2026.10.08-private`  
**Directive:** `docs/THUMBRIC_PHASED_MASTER_PLAN_AI_EDITOR_FIRST.md`  
**Repo:** `Thiru-Cloud-Architect/thumbric` (public — private broke GH Pages on Free)

## North-star vs today

| Master-plan requirement | Current state | Severity |
|-------------------------|---------------|----------|
| Entry: Create with AI / Design scratch / Improve thumb | Dual path only (AI + Photo). No “Improve” entry. | **P1** |
| “Tell us about your video” natural language | Scene prompt (“describe the scene”) — close but framing is image-prompt, not video topic. | **P1** |
| 3 **strategies** (curiosity/warning/contrarian…) not 3 crops | Punch/Warm/Cinematic are **visual grades/restyles** of one generation — not creative strategies. | **P0** (core product miss) |
| AI text stays editable overlays | Titles are canvas overlays ✓. AI image bans burned-in text ✓. | OK |
| Creative director explains concepts | Missing — picker shows look labels only. | **P1** |
| Refine: “make more dramatic / shorter text…” | Bigger / Punchier / Cleaner exist; no freeform refine. | **P1** |
| “Improve this thumbnail” analysis | `/youtube-thumbnail-score` exists; not wired as studio entry. | **P1** |
| Professional editor (layers, undo, snap, zoom) | Studio 3-column; title inspector; no full layer model / undo stack. | **P1** for Phase 1B |
| Video URL / upload never required | Correct — not required. | OK |
| Auth | Device localStorage light account. | OK for Phase 1 |
| Backend | Optional Worker + fal; live = free Pollinations + studio fallback. | **P0** quality ceiling |
| SEO / tools | Tools menu + makers + learn + legal live. | P2 polish |
| Pricing | Demo trial unlock; no Stripe. | P2 |
| Mobile editor | Responsive; not bottom-sheet pro mobile. | P2 |
| Analytics | localStorage events + optional Worker ingest. | P2 |
| GitHub links on marketing site | Removed (FAQ/footer/careers). | OK |
| Secrets in client | None for image providers in Pages build. | OK |

## P0 — fix in Phase 1A now

1. **Concepts ≠ restyles** — generate three strategy briefs + distinct visual directions before/with image gen.
2. **Editable headline from strategy** — apply concept text to title kit when user picks a concept.
3. **Entry clarity** — three chooser cards matching the master plan (AI / scratch / improve).

## P1 — Phase 1A/1B follow-ups

- Creative director copy under each concept.
- Improve-my-thumbnail → score → handoff into editor.
- Deeper refine actions beyond three polish chips.
- Layer/undo/snap (Phase 1B — don’t rip out working canvas yet).

## P2 / P3

- Growth tools polish, paid fal deploy, YouTube URL (explicitly optional future).
- Brand kits, cloud history, Stripe.

## Do not rebuild without evidence

- Keep canvas render, entitlement trial, Pages deploy, Tools routes, Pollinations+studio fallback.
- Prefer additive creative-brief layer over a greenfield editor rewrite.
