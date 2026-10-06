import { type ReactNode, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function useOnHomePage() {
  const { pathname } = useLocation()
  return pathname === '/' || pathname === '/thumbforge' || pathname.endsWith('/thumbforge/')
}

export function NavHashLink({ hash, children }: { hash: string; children: ReactNode }) {
  const onHome = useOnHomePage()
  const id = hash.replace(/^#/, '')
  if (onHome) {
    return <a href={`#${id}`}>{children}</a>
  }
  return (
    <Link to={{ pathname: '/', hash: `#${id}` }}>{children}</Link>
  )
}

/** Scroll to hash after route changes (footer / pricing → home anchors). */
export function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = hash.replace(/^#/, '')
    const scroll = () => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    const t = window.setTimeout(scroll, 50)
    return () => window.clearTimeout(t)
  }, [pathname, hash])

  return null
}
