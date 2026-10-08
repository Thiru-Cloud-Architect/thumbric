# Thumbric.ai — team brief

Living status for agents and humans.  
**Canonical live URL:** https://thumbric.app/  
Fallback: https://thiru-cloud-architect.github.io/thumbric/  
Repo: `Thiru-Cloud-Architect/thumbric` · Checkout: `/home/ubuntu/thumbforge`

**Master plan:** `docs/THUMBRIC_PHASED_MASTER_PLAN_AI_EDITOR_FIRST.md`  
**Audit:** `docs/AUDIT_REPORT.md`  
**Call with:** `@team.md` (there is no `myteam.md` yet — use this file)

## Help here (current ask)

1. **Phase 1A** — AI creative assistant: strategies not restyles, editable titles, entry chooser.
2. **Phase 1B** — Professional editor depth (layers/undo/snap) without ripping working canvas.
3. **Never** require video upload / YouTube URL for core flow.
4. Footer stamp must match `UI_BUILD` in `src/brand.ts`.

## Status (2026-10-08)

| Thread | State |
|--------|--------|
| Phase 0 audit | **Done** — `docs/AUDIT_REPORT.md` |
| Phase 1A entry chooser | **Live** — Create with AI / Design from scratch / Improve my thumbnail |
| Phase 1A creative briefs | **Live** — warning / curiosity / outcome… + director copy (`UI_BUILD=2026.10.08-phase1a`) |
| Editable AI titles | **Live** — concept headlines applied to title kit on pick |
| Improve path | **Live** — routes to Thumbnail Score + AI handoff |
| GitHub links on site | **Removed** |
| Repo visibility | **Public** (private disables GH Pages on Free) |
| Premium Worker AI | Ready in repo — needs `FAL_KEY` + `VITE_API_BASE` |

## AI product truth

- **Now:** Topic → 3 packaging concepts → pick → edit title on canvas → export.
- **Not yet:** Video URL analysis, Canva-grade photoreal without paid key, full layer/undo editor.

## Verify deploy

```bash
curl -sL https://thumbric.app/ | rg -o '/assets/index-[^"]+\.js'
# Expect: 2026.10.08-phase1a
```
