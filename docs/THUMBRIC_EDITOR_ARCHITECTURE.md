# Thumbric Editor Architecture

## Layout

```text
TOOL RAIL (Create/Title/Finish tabs)
  + entry path (AI / Classic / Improve)
CANVAS STAGE (zoom, safe zone, grid, mobile, feed, before/after)
INSPECTOR (align, size, rotation, spacing, opacity, fill, outline)
```

## Object model (logical)

| Layer | Source |
|-------|--------|
| background | niche / brand backdrop |
| photo | upload or AI still |
| title | editable overlay (`ThumbInput`) |
| stickers | up to 3 placed stickers |
| logo | Creator kit watermark |

## Persistence

- `autosave.ts` — draft to localStorage
- `projects.ts` — exported project cards
- `versionHistory.ts` — recent export snapshots
- `editorHistory.ts` — undo/redo stack

## AI handoff

- Concepts stay strategy + editable text
- Refine chips mutate design snapshot heuristically
- Paid fal photoreal deferred

## Validation

- `exportValidation.ts` runs preflight before download
