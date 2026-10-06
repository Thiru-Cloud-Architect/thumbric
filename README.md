# Thumbric.ai

Free browser thumbnail maker for **YouTube**, Shorts/Reels, Instagram, LinkedIn, and Facebook.

**Live site:** https://thiru-cloud-architect.github.io/thumbforge/

## Brand vs GitHub repo

| What | Name |
|------|------|
| **Product** | **Thumbric.ai** |
| **GitHub repo / Pages URL** | still `thumbforge` → `…github.io/thumbforge/` until you rename the repo or attach **thumbric.ai** |

The product name is **Thumbric.ai**. The address bar still says `thumbforge` because GitHub Pages uses the **repository name** in the URL. To change that:

1. **Best:** buy/connect **thumbric.ai** → GitHub Pages → Settings → Pages → Custom domain.
2. **Or** rename the GitHub repo to `thumbric` (Settings → Rename). Then update Vite `base` to `/thumbric/` and redeploy.

## For anyone (no tech skill needed)

1. Open the site and tap **Start free** (opens the editor).
2. Choose platform & mood, or **Quick idea** for a random combo.
3. Add your title (and optional photo). Use the live preview — drag text and stickers.
4. **Save free preview** or **Save clean** after choosing a plan on the [pricing page](https://thiru-cloud-architect.github.io/thumbforge/pricing).

## Free vs clean

- **Free preview:** unlimited downloads with a small on-image watermark (`Thumbric.ai · free preview`).
- **Clean export:** register email, then **Creator** (9 clean PNGs/month) or **Pro** (unlimited). See `/pricing`.

## Share & SEO

- [Google Search Console](https://search.google.com/search-console): `https://thiru-cloud-architect.github.io/thumbforge/`
- Sitemap: https://thiru-cloud-architect.github.io/thumbforge/sitemap.xml
- Repo **About**: “Thumbric.ai — free YouTube thumbnail maker” + website link

## Run locally

```bash
npm install
npm test
npm run dev
```

Open http://127.0.0.1:43201/thumbforge/

## Stack

React 19, TypeScript, Vite, client-side canvas (`src/render.ts`).
