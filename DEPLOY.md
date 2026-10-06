# Why live still shows old colors / no AI

GitHub Pages only updates when **`main` is pushed** and the **Pages** workflow finishes.

This Cloud Agent environment often **cannot reach github.com**, so commits may sit **only on the agent disk**. Your PC must push:

```bash
cd path/to/thumbforge
git fetch origin
git log origin/main..HEAD --oneline   # should show coral + AI commits if agent committed
git push origin main
```

Then open: **Actions → Pages** and wait for green ✓. Hard-refresh the site (`Ctrl+Shift+R`).

Footer build stamp should reach **`2026.10.06-ad`** when coral + AI are live.

---

# Why the URL still says `thumbforge`

| What you see | What it is |
|--------------|------------|
| **Thumbric.ai** in the header | Product name (correct) |
| `…github.io/thumbforge/` in the address bar | **GitHub repo name** + Pages project path |
| `/thumbforge/` in code (`vite.config.ts`, router) | Required so assets load on GitHub Pages |

Renaming the **product** does not rename the **repository**. GitHub forces the path `/REPO_NAME/` until you use a custom domain.

### Option A — Custom domain (best for Thumbric.ai)

1. Buy **thumbric.ai** and point DNS to GitHub Pages (see README).
2. In repo **Settings → Pages → Custom domain**: `thumbric.ai`
3. Set build base to site root — in GitHub Actions add env before `npm run build`:

   ```yaml
   env:
     VITE_BASE_PATH: /
   ```

4. Update `SITE_URL` in `src/brand.ts` to `https://thumbric.ai/`

### Option B — Rename GitHub repo

1. **Settings → General → Repository name** → `thumbric`
2. Replace `/thumbforge/` with `/thumbric/` in `vite.config.ts`, `App.tsx` basename, `public/404.html`, sitemap, etc.
3. Push; new URL: `https://thiru-cloud-architect.github.io/thumbric/`

Old `/thumbforge/` links break unless you add redirects.
