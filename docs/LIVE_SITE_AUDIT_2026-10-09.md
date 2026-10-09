# LIVE SITE AUDIT — 2026-10-09

**Directive source:** `THUMBRIC_LIVE_SITE_DEEP_REANALYSIS.md` was **not found** on this VM after searching `/home/ubuntu`, `/workspace`, `/home/ubuntu/.cursor/projects/workspace/uploads`, and the repo. Closest related docs already in-tree: `docs/THUMBRIC_DEEP_LIVE_AUDIT_PREMIUM_EDITOR_MASTER.md`, `docs/THUMBRIC_LIVE_AUDIT_REPORT.md`. Audit proceeded against production + `/home/ubuntu/thumbforge` using the user’s stated process.

**Staging:** no staging environment.

## Environment tested

| Env | URL | Build stamp observed | Notes |
|-----|-----|----------------------|-------|
| **Production** | https://thumbric.app | `UI 2026.10.09-editor-ai` | Asset `assets/index-DqDLc-gl.js`, `Last-Modified: Fri, 09 Oct 2026 10:59:47 GMT` |
| **Local** | http://127.0.0.1:43201 (Vite `npm run dev` already listening) | `UI 2026.10.09-editor-ai` | Same stamp string as prod, but **newer source** on `main` (includes More-options popover commit `d893c2f`) |
| **Staging** | — | — | **no staging** |

Screenshots: `.walkthrough/live-audit-2026-10-09/`  
Raw machine log: `.walkthrough/live-audit-2026-10-09/audit-raw.json`  
Audit runner: `scripts/live-audit-2026-10-09.mjs`

### Screenshot index

| File | What it shows |
|------|----------------|
| `prod-home-1280.png` / `prod-home-390.png` | Production homepage hero + CTAs |
| `prod-editor-1280.png` | Production `#editor` canvas + inspector |
| `prod-ai-maker-1280.png` / `prod-ai-maker-390.png` | Production AI Thumbnail Maker |
| `prod-pricing-1280.png` / `prod-pricing-390.png` | Free / Creator $1 / Pro $3 launch tiers |
| `prod-tools-1280.png` | Free tools hub |
| `prod-doctor-1280.png` | Thumbnail Doctor |
| `prod-roast-1280.png` | `/roast/demo-code/` SPA still renders despite HTTP 404 |
| `local-home-1280.png` / `local-pricing-1280.png` / `local-tools-1280.png` | Local marketing surfaces |
| `local-editor-open.png` | Local editor open |
| `local-editor-title.png` | Title inspector after edit attempt |
| `local-editor-more-options.png` | More title options popover open (local) |
| `local-editor-upload.png` | Fixture image upload |
| `local-editor-download-gate.png` | Download → quality checklist + register gate |
| `local-ai-maker.png` / `local-ai-demo.png` | AI maker + `?demoResult=1` stub |
| `local-title-more-verify.png` / `prod-title-more-verify.png` | Side-by-side More-options verify |
| `local-sync-more.png` / `prod-sync-more.png` | Additional layout probes |

---

## Method (actually executed)

1. `git pull origin main` in `/home/ubuntu/thumbforge` (already up to date at start).
2. Searched for `THUMBRIC_LIVE_SITE_DEEP_REANALYSIS.md` — **missing**; noted here.
3. Production HTTP route matrix + Puppeteer screenshots (home, `#editor`, `/ai-thumbnail-maker`, `/pricing`, `/tools`, doctor, mobile, roast).
4. Local Vite preview/dev on **43201**; exercised editor open → title field → More title options → upload fixture → Download gate; AI maker + demo stub.
5. Compared prod JS bundle vs local source for `title-options-popover`.
6. Confirmed `npm run build` / `tsc -b` status on current `main`.

**Not claimed complete without runtime proof:** real Pollinations generation under rate limits, Stripe checkout, Supabase cloud auth, paid fal path.

---

## Route matrix

### Production (`https://thumbric.app`)

| Route | HTTP | SPA shell |
|-------|------|-----------|
| `/` | 200 | yes |
| `/ai-thumbnail-maker/` | 200 | yes |
| `/pricing/` | 200 | yes |
| `/tools/` | 200 | yes |
| `/thumbnail-doctor/` | 200 | yes |
| `/projects/` | 200 | yes |
| tool routes (score/resizer/ctr/title) | 200 | yes |
| `/roast/demo-code/` | **404** | yes (React roast UI still mounts) |

### Local (`http://127.0.0.1:43201`)

All listed routes **200**, including `/roast/demo-code/`.

---

## Confirmed bugs

### P0 — `main` cannot build / Pages cannot ship the More-options fix

- **Symptom:** `npx tsc -b` / `npm run build` fails: `src/HomePage.tsx(281,10): error TS6133: 'editorTab' is declared but its value is never read.` (`noUnusedLocals: true`).
- **Impact:** GitHub Pages workflow runs `npm run build`. Commit `d893c2f` (“Fix title inspector More options expanding the page”) is on `main` but **cannot deploy**. Production remains on the **10:59 UTC** asset bundle **without** `title-options-popover`.
- **Evidence:** local `tsc` failure; prod JS lacks `title-options-popover` while local `src/HomePage.tsx` + `dist` (when buildable) contain it; prod `Last-Modified` precedes the fix commit time.
- **Repro:**
  1. `cd /home/ubuntu/thumbforge && git checkout main && npx tsc -b`
  2. Observe TS6133 on `editorTab`.
- **Fix target:** stop declaring an unread `editorTab` (keep `setEditorTab` or remove dead tab state entirely) so build+deploy can land the already-merged popover fix.

### P1 — Production still shows always-expanded title extras (pre-fix UI)

- **Symptom:** On production `#editor`, Line 2 / Tag / style chips appear inline in the inspector (no absolute `#title-options-popover`). Local `main` uses an anchored overlay; measured `deltaScrollH = 0` when opening More title options.
- **Severity:** P1 editor reliability / layout (the user-reported “sliding inspector” class of bug). Fix already authored in `d893c2f`; blocked by P0 build break.
- **Repro (prod):** open https://thumbric.app/#editor → inspect Title panel → Line 2/Tag visible without a working popover overlay.
- **Repro (local, fixed behavior):** open http://127.0.0.1:43201/#editor → click **More title options** → panel `#title-options-popover` appears; document height unchanged.
- **Do not fight parallel work:** if another agent lands the same fix, verify with the layout probe above rather than re-implementing.

### P1 — Download flow can stack Register + Export quality modals

- **Symptom:** Clicking **Download** can leave **Register to download** and **Export quality check** overlapping (see `local-editor-download-gate.png`).
- **Repro:** local `#editor` → Download (guest) → observe stacked dialogs.
- **Fix direction (later):** single gate sequence — auth first **or** quality checklist first, never both opaque layers.

### P2 — `/roast/:code` returns HTTP 404 on production while UI works

- **Symptom:** https://thumbric.app/roast/demo-code/ → status **404**, but SPA renders “This share link is unreadable.” (`prod-roast-1280.png`). Local Vite returns **200**.
- **Impact:** SEO / share previews / uptime monitors; not a blank page for users.
- **Note:** `public/404.html` is still the old `/thumbric/` hash-redirect stub; build copies `index.html` → `dist/404.html` via Vite plugin. Host still emits 404 status for unknown paths.

### P2 — Hero Unsplash image blocked (ORB)

- **Symptom:** `net::ERR_BLOCKED_BY_ORB` for `images.unsplash.com/photo-1611162617474-…` on home/editor loads.
- **Impact:** mosaic / sample imagery may degrade; page still usable.

### P2 — Empty title placeholder vs canvas copy mismatch (UX confusion, not desync)

- **Symptom:** Empty title shows input placeholder `I SPENT $1` while canvas draws `YOUR TITLE HERE` (`src/render.ts`). Looks like a sync bug in screenshots; values match once text is entered (`#title-input`).
- **Not a logic desync** after keyboard edit into `#title-input`.

---

## Recommendations (not bugs)

1. Bump `UI_BUILD` when shipping the More-options deploy so prod vs local stamp divergence is obvious.
2. Replace or self-host the Unsplash hero asset to avoid ORB/CDN flakes.
3. Align `public/404.html` with custom-domain SPA shell (not `/thumbric/` redirect) for defense in depth.
4. AI maker `?demoResult=1` is a useful QA stub; keep clearly labeled DEMO (already is).
5. Wire real Stripe / Supabase before calling Creator/Pro checkout “live” (copy already says demo).
6. Paid fal / Gemini critic / ThumbnailDocument layers remain orchestrator backlog — see `docs/IMPLEMENTATION_GAP.md`.

---

## What was verified where

| Check | Local (43201) | Production | Staging |
|-------|---------------|------------|---------|
| Home / pricing / tools / AI maker render | yes (screenshots) | yes (screenshots) | n/a |
| Editor opens, canvas + inspector | yes | yes | n/a |
| Title edit via `#title-input` | yes | yes | n/a |
| More title options: no page-height growth | **yes** (`deltaScrollH=0`, popover DOM present) | **old UI** (popover absent in bundle) | n/a |
| Upload fixture image | yes | not re-run (same client code path) | n/a |
| Download gate (register / quality modal) | yes | not fully clicked (avoid account noise) | n/a |
| AI maker UI + demo stub | yes | maker UI yes; demo query not required on prod | n/a |
| Roast deep link UX | 200 + UI | **404 status** + UI | n/a |
| `npm run build` | **FAIL** (P0) at audit start | deploy of latest main blocked | n/a |

---

## Fix order (per directive)

1. **P0** — restore green `npm run build` (unread `editorTab`) + regression test for More-options absolute panel.
2. **P1** — confirm production after deploy: More options overlay, no inspector/page slide.
3. **P1** — download modal stacking.
4. AI quality / visual polish only after the above.

---

## P0 fix status (same day)

| Item | Status | Proof |
|------|--------|-------|
| Remove unread `editorTab` / restore `tsc -b` + `npm run build` | **Fixed in repo** | `npm test` 100 passed; `npm run build` OK; stamp `2026.10.09-live-audit` |
| Regression: absolute More-options panel | **Added** | `src/titleOptionsLayout.test.ts` |
| Local More-options layout | **Verified runtime** | popover present, `deltaScrollH=0` → `.walkthrough/live-audit-2026-10-09/local-p0-verify-more-options.png` |
| Production popover after Pages deploy | **Pending deploy of this commit** | Re-check https://thumbric.app/#editor for `#title-options-popover` + stamp `live-audit` |

P1 modal stacking and roast 404 status **not** fixed in this pass (deferred per P0-first rule).

---

## Audit stamp

- Date: 2026-10-09  
- Repo: `/home/ubuntu/thumbforge` @ `main`  
- Agent: live audit + P0 fix pass  
