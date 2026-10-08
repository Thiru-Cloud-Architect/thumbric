import { type MouseEvent, type ReactNode, useEffect, useLayoutEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

/** Dispatched after hash navigation so HomePage can open the right editor tab. */
export const HASH_NAV_EVENT = 'thumbric:hash-nav'

export type HashNavDetail = { hash: string }

/** Sticky `.top` header clearance when scrolling a section into view. */
const HEADER_SCROLL_OFFSET = 80

export function useOnHomePage() {
  const { pathname } = useLocation()
  // With BrowserRouter basename, home is always `/` regardless of Vite base.
  return pathname === '/'
}

export function normalizeHash(hash: string) {
  return hash.replace(/^#/, '')
}

/** Editor hashes scroll the studio section, not a tiny mode pill mid-page. */
export function scrollTargetIdForHash(hash: string) {
  const id = normalizeHash(hash)
  if (id === 'editor' || id === 'editor-ai' || id === 'editor-title' || id === 'editor-improve') {
    return 'editor'
  }
  return id
}

export function stickyHeaderOffset() {
  const header = document.querySelector('.top')
  if (header instanceof HTMLElement) {
    return Math.max(header.offsetHeight + 8, HEADER_SCROLL_OFFSET)
  }
  return HEADER_SCROLL_OFFSET
}

/** Scroll the window so `el` sits just below the sticky header. */
export function scrollElementNearTop(el: HTMLElement, behavior: ScrollBehavior = 'auto') {
  const top = el.getBoundingClientRect().top + window.scrollY - stickyHeaderOffset()
  window.scrollTo({ top: Math.max(0, top), left: 0, behavior })
}

export function scrollWindowToTop(behavior: ScrollBehavior = 'auto') {
  window.scrollTo({ top: 0, left: 0, behavior })
  // DocumentElement / body — cover browsers that scroll either root.
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

/** Scroll to an id with retries (needed when the target mounts after a tab switch). */
export async function scrollToElementId(
  id: string,
  {
    behavior = 'auto',
    block = 'start',
    attempts = 60,
    nearTop = true,
  }: {
    behavior?: ScrollBehavior
    block?: ScrollLogicalPosition
    attempts?: number
    nearTop?: boolean
  } = {},
) {
  const clean = normalizeHash(id)
  for (let i = 0; i < attempts; i += 1) {
    const el = document.getElementById(clean)
    if (el) {
      if (nearTop) {
        scrollElementNearTop(el, behavior)
      } else {
        el.scrollIntoView({ behavior, block })
      }
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
  if (id === 'editor' || id === 'editor-title' || id === 'editor-ai' || id === 'editor-improve') {
    const focusId =
      id === 'editor-title'
        ? 'title-input'
        : id === 'editor-improve'
          ? 'editor-tab-create'
          : 'editor-tab-create'
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

/**
 * Global SPA scroll hygiene:
 * - pathname change, no hash → always top of page (fixes Tools nav after scroll)
 * - hash change → scroll target near top under sticky header (fixes Fix with Thumbric)
 */
export function ScrollToHash() {
  const { pathname, hash } = useLocation()
  const prevPath = useRef(pathname)

  useLayoutEffect(() => {
    const pathChanged = prevPath.current !== pathname
    prevPath.current = pathname

    if (!hash) {
      // Instant reset so tool pages never inherit previous scrollY.
      scrollWindowToTop('auto')
      return
    }

    // When entering home (or any page) with a hash, start from top then seek the target
    // so a mid-page scrollY from the previous route cannot stick.
    if (pathChanged) {
      scrollWindowToTop('auto')
    }
  }, [pathname, hash])

  useEffect(() => {
    if (!hash) return
    const id = normalizeHash(hash)
    let cancelled = false

    const run = async () => {
      // Let HomePage switch editor tabs before we look for #editor / #editor-ai.
      window.dispatchEvent(
        new CustomEvent<HashNavDetail>(HASH_NAV_EVENT, { detail: { hash: id } }),
      )
      await new Promise((r) => window.setTimeout(r, 48))
      if (cancelled) return
      const targetId = scrollTargetIdForHash(id)
      const el = await scrollToElementId(targetId, { behavior: 'auto', attempts: 80 })
      if (!cancelled && el) focusHashTarget(id)
      // Second pass after layout (LazyReveal / fonts) so we do not stop mid-marketing.
      await new Promise((r) => window.setTimeout(r, 120))
      if (cancelled) return
      const again = document.getElementById(targetId)
      if (again) scrollElementNearTop(again, 'auto')
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [pathname, hash])

  return null
}
