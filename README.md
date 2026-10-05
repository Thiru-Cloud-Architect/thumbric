# ThumbForge

Free YouTube thumbnail maker. Pick a look, write a title, add an optional photo, tap **Save image**.

## For anyone (no tech skill needed)

1. Open the site.
2. Pick a look (or tap an example).
3. Type your video title.
4. Optional: add your photo and stickers.
5. Tap **Save image** — the PNG goes to your Downloads folder.

Your photo stays on your device. Nothing is uploaded.

## Live site

https://thiru-cloud-architect.github.io/thumbforge/

## Run locally

```bash
npm install
npm test
npm run dev
```

Open http://127.0.0.1:43201

## What makes the image

The page draws a 1280×720 picture in your browser (colors, photo, bold text, stickers), then downloads it as a PNG. Free saves keep a small ThumbForge mark.
