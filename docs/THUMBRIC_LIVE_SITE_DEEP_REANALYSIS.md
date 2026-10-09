# THUMBRIC — Live Site Deep Re-Analysis

**Date:** 2026-10-09  
**Status:** Operating directive for agents.  
**Companion audit (executed):** `docs/LIVE_SITE_AUDIT_2026-10-09.md`  
**Screenshots:** `.walkthrough/live-audit-2026-10-09/`

> **Provenance note:** The user’s Windows path  
> `C:\Users\Thiru\Downloads\THUMBRIC_LIVE_SITE_DEEP_REANALYSIS.md`  
> was not on the Cloud Agent VM. This file captures the full directive as applied from the parent chat brief (audit-first process, priority order, market lessons, tests required). Where the original 16-section paste is incomplete on disk, sections below are reconstructed to match that brief and remain the source of truth for follow-up work.

---

## 1. Executive recommendation

Stop shipping “feature first.” Treat **https://thumbric.app** and the `/home/ubuntu/thumbforge` repo as one product: inspect live behavior, write reproducible findings, then fix in priority order.

**Order (mandatory):**

1. Confirmed **P0** bugs (build/deploy breaks, blank flows, data loss)
2. **Editor reliability** (layout, modal gates, canvas/inspector sync)
3. **AI quality** (generation, progress, honest fallbacks)
4. **Visual polish** (only after the above)

Do **not** redesign the whole site in an audit pass. Every major fix needs a **regression test**. Do not mark an item complete from code changes alone — report what was tested **locally**, in **staging** (if any), and in **production**.

---

## 2. Operating instructions (audit first)

1. Work in `/home/ubuntu/thumbforge`; `git pull origin main`.
2. Keep this directive at `docs/THUMBRIC_LIVE_SITE_DEEP_REANALYSIS.md`.
3. Inspect production: home, `#editor`, `/ai-thumbnail-maker`, `/pricing`, tools — with headless screenshots.
4. Run local preview; exercise end-to-end: open editor → upload or AI → title edit → download gate (without breaking accounts).
5. Write / update `docs/LIVE_SITE_AUDIT_YYYY-MM-DD.md` with environments, confirmed bugs vs recommendations, screenshot paths.
6. Fix **P0 first**, then editor P1s; defer redesign.
7. Update `team.md` / `my_team.md` with audit pointer and verification matrix.
8. Commit + push as directed (this pass: **main**, no PR).

**Staging:** none today — say so explicitly in audit docs.

---

## 3. Environments & truth

| Env | URL | Notes |
|-----|-----|-------|
| Production | https://thumbric.app | GitHub Pages + custom domain |
| Local | Vite `43201` (`npm run dev` / `npm run preview`) | Source of truth for unreleased fixes |
| Staging | — | **no staging** |

Visible brand is **Thumbric** (no `.ai`). Stamp via `UI_BUILD` in `src/brand.ts`.

---

## 4. Market lessons (keep product sharp)

- Creators judge the **editor**, not the marketing hero.
- AI should hand off into a **calm, editable canvas** — not replace the editor.
- Freemium gates must be **single-layered** (one modal at a time).
- Honest AI: free preview path ok; do not fake paid photoreal / layers.
- Prefer fewer surfaces done well over new tools with broken export.

---

## 5. Mandatory live audit artifacts

Every audit pass must include:

- Route matrix (local + production)
- Screenshots under `.walkthrough/…`
- Confirmed bugs with **repro + severity**
- Recommendations called out separately (not bugs)
- Explicit “verified where” table (local / staging / prod)

Reference implementation: `docs/LIVE_SITE_AUDIT_2026-10-09.md`.

---

## 6. Severity rubric

| Severity | Meaning |
|----------|---------|
| **P0** | Build/deploy broken, unusable core path, or live users blocked |
| **P1** | Editor reliability / gate UX / broken secondary path with clear repro |
| **P2** | Cosmetic, SEO status codes, non-blocking CDN flakes |

---

## 7. Priority order for fixes

1. P0 — restore green `npm run build` / Pages deploy  
2. P1 — More title options layout (popover, no page slide)  
3. P1 — Download / export gate: **never stack Register + Export quality modals**  
4. AI quality improvements  
5. Visual polish  

---

## 8. Editor reliability bar

- Inspector overlays must not grow page height or shove the canvas.
- Only **one** blocking modal at a time (auth, pay, export quality).
- Title input `#title-input` drives canvas text; placeholders must not look like filled values without care.
- Download: quality checklist → then auth/pay/download — never simultaneous opaque layers.

---

## 9. AI quality bar

- One-box maker; multi-stage progress; 3 concepts when possible.
- Structured errors + cooldown.
- Demo stub (`?demoResult=1`) clearly labeled.
- Paid fal / critic / layered ThumbnailDocument remain backlog unless keys + tests exist.

---

## 10. Visual polish bar

- Theme toggle light/dark; coral + purple accents.
- No dashboard-y marketing clutter in the first viewport.
- Self-host or replace flaky third-party hero images when ORB/CDN fails.

---

## 11. Testing requirements

- Unit/regression test for every major fix (`vitest`).
- Runtime proof: local preview and, when Pages has deployed, production smoke for the same flow.
- Record results in the live audit doc — code alone is not “done.”

---

## 12. Download / export gate (specific)

Confirmed P1 (2026-10-09 audit): clicking Download can open **Export quality check** and **Register to download** together because `requestExportWithChecks` both sets `exportChecks` and immediately calls `saveMarked()` for guests.

**Required behavior:** open quality checklist only; proceed to auth or download **after** the user confirms (e.g. Export anyway). Mutual exclusion: opening auth/pay clears export checks and vice versa.

---

## 13. Roast / SPA hosting (P2)

`/roast/:code` may return HTTP 404 on GitHub Pages while the SPA still mounts. Prefer correct SPA fallback status over time; do not block P1 editor work on this.

---

## 14. Docs map

| Doc | Role |
|-----|------|
| `docs/THUMBRIC_LIVE_SITE_DEEP_REANALYSIS.md` | This directive |
| `docs/LIVE_SITE_AUDIT_2026-10-09.md` | Executed findings + fix status |
| `docs/THUMBRIC_DEEP_LIVE_AUDIT_PREMIUM_EDITOR_MASTER.md` | Premium editor quality standard |
| `docs/IMPLEMENTATION_GAP.md` | Honest AI / billing gaps |
| `team.md` / `my_team.md` | Call pointers + verify stamps |

---

## 15. Parallel work

A separate fix for **More title options** sliding the inspector may land elsewhere — do not fight it. Verify with `#title-options-popover` + `deltaScrollH ≈ 0` if present.

---

## 16. Acceptance for this follow-up pass

- [x] Live audit written (`LIVE_SITE_AUDIT_2026-10-09.md`)
- [x] P0 build break fixed + More-options verified on production
- [x] P1 download modal stacking fixed + regression test (`exportGate.test.ts`)
- [x] Audit + team docs updated with local/prod verification
- [x] Pushed to `main`

---

*End of Live Site Deep Re-Analysis directive.*
