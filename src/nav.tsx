import { type MouseEvent, type ReactNode, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

/** Dispatched after hash navigation so HomePage can open the right editor tab. */
export const HASH_NAV_EVENT = 'thumbric:hash-nav'

export type HashNavDetail = { hash: string }

export function useOnHomePage() {
  const { pathname } = useLocation()
  // With BrowserRouter basename, home is always `/` regardless of Vite base.
  return pathname === '/'
}

export function normalizeHash(hash: string) {
  return hash.replace(/^#/, '')
}

/** Scroll to an id with retries (needed when the target mounts after a tab switch). */
export async function scrollToElementId(
  id: string,
  {
    behavior = 'smooth',
    block = 'start',
    attempts = 60,
  }: {
    behavior?: ScrollBehavior
    block?: ScrollLogicalPosition
    attempts?: number
  } = {},
) {
  const clean = normalizeHash(id)
  for (let i = 0; i < attempts; i += 1) {
    const el = document.getElementById(clean)
    if (el) {
      el.scrollIntoView({ behavior, block })
      return el
    }
    // Mix rAF + short timeouts so tab-switched mounts are found reliably.
    if (i % 2 === 0) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    } else {
      await new Promise<void>((resolve) => window.setTimeout(() => resolve(), 16))
    }
  }
  return null
}

export function focusHashTarget(hash: string) {
  const id = normalizeHash(hash)
  if (id === 'editor' || id === 'editor-title' || id === 'editor-ai') {
    const focusId =
      id === 'editor-ai' ? 'ai-scene-hint' : id === 'editor-title' ? 'title-input' : 'editor-tab-setup'
    const focusEl = document.getElementById(focusId)
    if (focusEl instanceof HTMLElement) {
      focusEl.focus({ preventScroll: true })
      return
    }
    const editor = document.getElementById('editor')
    if (editor instanceof HTMLElement) {
      editor.setAttribute('tabindex', '-1')
      editor.focus({ preventScroll: true })
    }
  }
}

/** Update the URL hash and notify listeners (works on home and after route changes). */
export function goToHash(hash: string) {
  const id = normalizeHash(hash)
  const next = `#${id}`
  if (window.location.hash !== next) {
    const url = `${window.location.pathname}${window.location.search}${next}`
    window.history.pushState(null, '', url)
  }
  window.dispatchEvent(new CustomEvent<HashNavDetail>(HASH_NAV_EVENT, { detail: { hash: id } }))
}

export function NavHashLink({ hash, children }: { hash: string; children: ReactNode }) {
  const onHome = useOnHomePage()
  const navigate = useNavigate()
  const id = normalizeHash(hash)

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    if (onHome) {
      goToHash(id)
      return
    }
    navigate({ pathname: '/', hash: `#${id}` })
  }

  if (onHome) {
    return (
      <a href={`#${id}`} onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <Link to={{ pathname: '/', hash: `#${id}` }} onClick={onClick}>
      {children}
    </Link>
  )
}

/** Scroll to hash after route changes (footer / pricing → home anchors). */
export function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = normalizeHash(hash)
    let cancelled = false

    const run = async () => {
      // Let HomePage switch editor tabs before we look for #editor-ai / #editor-title.
      window.dispatchEvent(
        new CustomEvent<HashNavDetail>(HASH_NAV_EVENT, { detail: { hash: id } }),
      )
      await new Promise((r) => window.setTimeout(r, 40))
      if (cancelled) return
      const el = await scrollToElementId(id)
      if (!cancelled && el) focusHashTarget(id)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [pathname, hash])

  return null
}
