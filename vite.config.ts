/// <reference types="vitest/config" />
import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/** GitHub project site: `/thumbric/` matches repo name. Custom domain: set VITE_BASE_PATH=/ */
const base = process.env.VITE_BASE_PATH || '/thumbric/'
const siteUrl = (
  process.env.VITE_SITE_URL || 'https://thiru-cloud-architect.github.io/thumbric/'
).replace(/\/?$/, '/')
// So Vite's HTML `%VITE_SITE_URL%` replacement (and client import.meta.env) see a default.
process.env.VITE_SITE_URL = siteUrl

/** Emit sitemap / robots / SPA 404 from SITE_URL + base so custom domain is a workflow env flip. */
function siteFilesPlugin(): Plugin {
  return {
    name: 'thumbric-site-files',
    transformIndexHtml(html) {
      return html
        .replaceAll('%VITE_SITE_URL%', siteUrl)
        .replaceAll('%BASE_URL%', base)
    },
    closeBundle() {
      const outDir = path.resolve('dist')
      if (!fs.existsSync(outDir)) return

      const paths = ['', 'pricing', 'career']
      const urls = paths
        .map(
          (p) => `  <url>
    <loc>${siteUrl}${p}</loc>
    <changefreq>${p === 'career' ? 'monthly' : 'weekly'}</changefreq>
    <priority>${p === '' ? '1.0' : p === 'pricing' ? '0.8' : '0.5'}</priority>
  </url>`,
        )
        .join('\n')

      fs.writeFileSync(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
      )

      fs.writeFileSync(
        path.join(outDir, 'robots.txt'),
        `User-agent: *
Allow: ${base}

Sitemap: ${siteUrl}sitemap.xml
`,
      )

      fs.writeFileSync(
        path.join(outDir, '404.html'),
        `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Thumbric.ai</title>
    <script>
      ;(function () {
        var base = ${JSON.stringify(base)}
        var path = window.location.pathname.replace(base, '')
        var redirect = base + '?/' + path.replace(/^\\//, '')
        if (window.location.search) redirect += '&' + window.location.search.slice(1)
        redirect += window.location.hash
        window.location.replace(redirect)
      })()
    </script>
  </head>
  <body></body>
</html>
`,
      )
    },
  }
}

export default defineConfig({
  base,
  plugins: [react(), siteFilesPlugin()],
  server: {
    host: '0.0.0.0',
    port: 43201,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 43201,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
  },
})
