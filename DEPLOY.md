# Deploy notes (Thumbric.ai)

## Live URL

- Product: **Thumbric.ai**
- GitHub repo: `Thiru-Cloud-Architect/thumbric`
- Pages: https://thiru-cloud-architect.github.io/thumbric/

GitHub Pages only updates when **`main` is pushed** and the **Pages** workflow finishes. Footer build stamp should match `UI_BUILD` in `src/brand.ts`.

## Custom domain (optional)

1. Point **thumbric.ai** DNS at GitHub Pages (see README).
2. In repo **Settings → Pages → Custom domain**: `thumbric.ai`
3. Set Vite base to site root in the Pages workflow:

   ```yaml
   env:
     VITE_BASE_PATH: /
   ```

4. Update `SITE_URL` in `src/brand.ts` to `https://thumbric.ai/`
