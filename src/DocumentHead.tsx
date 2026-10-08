import { useEffect } from 'react'
import { track } from './analytics'
import { SITE_URL } from './brand'
import { routeMeta } from './siteRoutes'

export function DocumentHead({ path }: { path: string }) {
  const meta = routeMeta(path)

  useEffect(() => {
    track('landing_page_view', { landing: path, tool: path })
  }, [path])

  useEffect(() => {
    document.title = meta.title
    const ensure = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        if (selector.startsWith('meta[')) {
          const nameMatch = /meta\[name="([^"]+)"\]/.exec(selector)
          const propMatch = /meta\[property="([^"]+)"\]/.exec(selector)
          if (nameMatch) el.setAttribute('name', nameMatch[1]!)
          if (propMatch) el.setAttribute('property', propMatch[1]!)
          document.head.appendChild(el)
        }
      }
      el.setAttribute(attr, value)
    }
    ensure('meta[name="description"]', 'content', meta.description)
    ensure('meta[property="og:title"]', 'content', meta.title)
    ensure('meta[property="og:description"]', 'content', meta.description)
    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      const url = `${SITE_URL.replace(/\/?$/, '/')}${meta.path === '/' ? '' : meta.path.replace(/^\//, '')}`
      canonical.setAttribute('href', url)
    }
  }, [meta.description, meta.path, meta.title])

  return null
}
