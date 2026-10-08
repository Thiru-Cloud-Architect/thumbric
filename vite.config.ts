/// <reference types="vitest/config" />
import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { SITE_ROUTES } from './src/siteRoutes.ts'

/** Custom domain defaults to /. Local project-path builds: VITE_BASE_PATH=/thumbric/ */
const base = process.env.VITE_BASE_PATH || '/'
const siteUrl = (
  process.env.VITE_SITE_URL || 'https://thumbric.app/'
).replace(/\/?$/, '/')
// So Vite's HTML `%VITE_SITE_URL%` replacement (and client import.meta.env) see a default.
process.env.VITE_SITE_URL = siteUrl

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

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

      const urls = SITE_ROUTES.filter((route) => route.path !== '/roast')
        .map(
          (route) => `  <url>
    <loc>${siteUrl}${route.path === '/' ? '' : route.path.replace(/^\//, '')}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
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

      const indexPath = path.join(outDir, 'index.html')
      if (fs.existsSync(indexPath)) {
        const indexHtml = fs.readFileSync(indexPath, 'utf8')
        for (const route of SITE_ROUTES) {
          if (route.path === '/' || route.path === '/roast') continue
          const dir = path.join(outDir, route.path.replace(/^\//, ''))
          fs.mkdirSync(dir, { recursive: true })
          const pageHtml = indexHtml
            .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
            .replace(
              /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
              `<meta name="description" content="${escapeHtml(route.description)}" />`,
            )
            .replace(
              /<link rel="canonical" href="[^"]*" \/>/,
              `<link rel="canonical" href="${siteUrl}${route.path.replace(/^\//, '')}" />`,
            )
          fs.writeFileSync(path.join(dir, 'index.html'), pageHtml)
        }
      }

      // GitHub Pages serves 404.html for unknown paths (e.g. /roast/:code).
      // Copy the SPA shell so BrowserRouter can resolve the real pathname.
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, path.join(outDir, '404.html'))
      }
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
