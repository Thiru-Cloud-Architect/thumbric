# ThumbForge

Free YouTube thumbnail generator. Type a title, pick a niche, download a 1280×720 PNG. No account. No paid API. Everything runs in the browser.

## Who it is for

Creators who need a clean thumbnail fast for tech, finance, education, gaming, or cooking videos.

## What it does

- Live preview as you type
- Five niche styles with fixed YouTube size
- Download PNG with a small free watermark
- Zero cloud cost on the free path (canvas only)

## Run locally

Requires Node.js 20+.

```bash
npm install
npm test
npm run dev
```

Open http://127.0.0.1:43201

## Live site

Public repo and GitHub Pages:

https://thiru-cloud-architect.github.io/thumbforge/

## Deploy free

```bash
npm run build
```

GitHub Pages is already wired via `.github/workflows/pages.yml`. Push to `main` redeploys. You can also upload `dist/` to Cloudflare Pages or Netlify. No server required.

## Money later

1. Keep free exports watermarked.
2. Charge for clean HD packs when people ask.
3. Add optional AI fill / face photo only after traffic shows up.

## Not included

Trademark search, logo brand kits, or paid model calls. Those are separate products.
