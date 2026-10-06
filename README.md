# ThumbnailPulse

Free browser thumbnail maker for **YouTube**, Shorts/Reels, Instagram, LinkedIn, and Facebook.

**Live site:** https://thiru-cloud-architect.github.io/thumbforge/

## Product name vs GitHub repo

| What | Name |
|------|------|
| **Product (UI, marketing)** | **ThumbnailPulse** |
| **GitHub repo / Pages path** | `thumbforge` → `/thumbforge/` URL (kept so existing links work) |
| **npm package name** | `thumbnailpulse` |

Renaming the GitHub repo to `thumbnailpulse` is optional: update Pages settings and add redirects from `/thumbforge/` if you do.

### `.ai` name ideas (check domain + trademark before buying)

These are **alternatives**, not live brands yet:

| Name | Notes |
|------|--------|
| **ThumbnailPulse.ai** | Matches current product name; clear category. |
| **ClickFrame.ai** | Short, CTR/thumbnail vibe. |
| **PulseThumb.ai** | Compact variant of ThumbnailPulse. |
| **FrameRush.ai** | Energy / speed for creators. |
| **HookFrame.ai** | Title + thumbnail “hook” angle. |
| **ThumbLab.ai** | Studio / maker feel. |

`thumbforge.ai` is reported taken. Prefer a name you can register on a registrar and connect via GitHub Pages custom domain.

## For anyone (no tech skill needed)

1. Open the site and tap **Start free** (opens the editor).
2. Choose platform & mood, or **Quick idea** for a random combo.
3. Add your title (and optional photo). Use the live preview — drag text and stickers.
4. **Save free preview** or **Save clean** after choosing a plan on the [pricing page](https://thiru-cloud-architect.github.io/thumbforge/pricing).

## Free vs clean

- **Free preview:** unlimited downloads with a small on-image watermark.
- **Clean export:** register email, then **Creator** (9 clean PNGs/month) or **Pro** (unlimited). See pricing on `/pricing`. Stripe checkout can be wired later; demo unlock works in-browser today.

## Share & SEO (GitHub Pages)

- [Google Search Console](https://search.google.com/search-console) URL prefix: `https://thiru-cloud-architect.github.io/thumbforge/`
- Sitemap: https://thiru-cloud-architect.github.io/thumbforge/sitemap.xml
- Repo **About**: “ThumbnailPulse — free YouTube thumbnail maker” + website link; topics: `youtube`, `thumbnail`, `github-pages`

## Run locally

```bash
npm install
npm test
npm run dev
```

Open http://127.0.0.1:43201/thumbforge/

## Stack

React 19, TypeScript, Vite, client-side canvas (`src/render.ts`). No backend required for the current editor.
