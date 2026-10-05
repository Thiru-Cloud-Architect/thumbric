# ThumbForge

Free thumbnail maker for YouTube, Shorts/Reels, Instagram, LinkedIn, and Facebook.

**Live site:** https://thiru-cloud-architect.github.io/thumbforge/

## For anyone (no tech skill needed)

1. Open the site and choose where you will post.
2. Pick a look, optional quick template, move photo/text/stickers on the preview.
3. Type your title. Optional: add your photo and stickers.
4. Use **Mobile squint** to check readability, then **Save free preview** or **Save clean** after email registration.

## Free vs clean

- Free preview: unlimited. Watermark sits on the photo so cropping a thin edge does not remove it.
- Clean download (no mark): register with email for **2 free** clean downloads, then a small paid plan (₹99/month). Stripe can be connected next; demo unlock works in-browser for now.

## Share & SEO (GitHub Pages for now)

- Submit the site to [Google Search Console](https://search.google.com/search-console) as a URL prefix: `https://thiru-cloud-architect.github.io/thumbforge/`
- Sitemap: `https://thiru-cloud-architect.github.io/thumbforge/sitemap.xml`
- Set the GitHub repo **About** box: description + website link; add topics: `youtube`, `thumbnail`, `github-pages`
- Share the link in creator communities; short screen recordings beat long posts

## Run locally

```bash
npm install
npm test
npm run dev
```

Open http://127.0.0.1:43201/thumbforge/
