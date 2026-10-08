# Thumbric E2E Test Plan

## Critical flows

1. Homepage → Create with AI → describe → Create 3 concepts → pick → edit title → Mobile preview → Export checklist → Save preview
2. Design from scratch → template → upload photo → stickers → clean save (demo plan)
3. Improve → Thumbnail Doctor → upload → Run Doctor → Fix with Thumbric
4. Projects empty state → Create thumbnail
5. Pricing shows Free / Creator / Pro only
6. Keyboard: Ctrl+Z undo, arrows nudge, `?` shortcuts, Esc deselect
7. Deep link `/roast/:code` resolves via SPA 404 shell
8. Mobile 390px: docks usable, no horizontal overflow on editor

## Automation

```bash
node scripts/live-audit.mjs
npm test
npm run build
```

## Manual release gate

See master audit §102 — Reliability, Editor, AI, Mobile, UX, Visual.
