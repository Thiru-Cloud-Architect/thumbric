# Thumbric.ai — team brief

Living status for agents and humans.  
**Canonical live URL:** https://thumbric.app/  
Repo: `Thiru-Cloud-Architect/thumbric` · Checkout: `/home/ubuntu/thumbforge`

**Master plan:** `docs/THUMBRIC_PHASED_MASTER_PLAN_AI_EDITOR_FIRST.md`  
**Audit:** `docs/AUDIT_REPORT.md`  
**Call with:** `@team.md`

## Help here

1. Continue Phase 1B until user corrects UI/product.
2. Never require video URL for core flow.
3. Footer stamp = `UI_BUILD` in `src/brand.ts`.

## Status (2026-10-08)

| Thread | State |
|--------|--------|
| Phase 0 audit | Done |
| Phase 1A concepts + entry chooser | Live |
| Phase 1B Improve / refine | Live — Improve this thumbnail, Fix all, freeform refine chips |
| Phase 1B Undo/Redo | Live — toolbar + Ctrl/Cmd+Z / Y |
| Phase 1B Zoom / Safe zone / Mobile preview | Live |
| Stamp | `UI_BUILD=2026.10.08-phase1b` |
| Still open | Full layers system, BG remove, brand kit, YouTube simulated feed chrome, paid fal |

## Verify

```bash
# Expect 2026.10.08-phase1b in the served JS
curl -sL https://thumbric.app/ | rg -o '/assets/index-[^"]+\.js'
```
