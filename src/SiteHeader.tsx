import { type MouseEvent, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PRODUCT_NAME_FULL } from './brand'
import { NavHashLink, goToHash, useOnHomePage } from './nav'
import { TOOL_NAV } from './toolsCatalog'

type SiteHeaderProps = {
  userLabel?: string | null
  onLoginClick?: () => void
}

export function SiteHeader({ userLabel, onLoginClick }: SiteHeaderProps) {
  const onHome = useOnHomePage()
  const navigate = useNavigate()
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | null>(null)

  function clearCloseTimer() {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  function openTools() {
    clearCloseTimer()
    setToolsOpen(true)
  }

  function scheduleCloseTools() {
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => setToolsOpen(false), 160)
  }

  function goHomeHash(event: MouseEvent<HTMLAnchorElement>, hash: string) {
    event.preventDefault()
    if (onHome) {
      goToHash(hash)
      return
    }
    navigate({ pathname: '/', hash: `#${hash}` })
  }

  useEffect(() => {
    function onDoc(event: Event) {
      if (!toolsRef.current?.contains(event.target as Node)) setToolsOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setToolsOpen(false)
    }
    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDoc)
      document.removeEventListener('keydown', onKey)
      clearCloseTimer()
    }
  }, [])

  return (
    <header className="top">
      <Link className="brand" to="/">
        <span className="brand-mark" aria-hidden>
          ▶
        </span>
        {PRODUCT_NAME_FULL}
      </Link>
      <nav className="top-nav" aria-label="Sections">
        <div
          className={toolsOpen ? 'nav-dropdown is-open' : 'nav-dropdown'}
          ref={toolsRef}
          onMouseEnter={openTools}
          onMouseLeave={scheduleCloseTools}
          onFocusCapture={openTools}
        >
          <button
            type="button"
            className="nav-dropdown-trigger"
            aria-expanded={toolsOpen}
            aria-haspopup="menu"
            aria-controls="tools-menu"
            onClick={() => {
              clearCloseTimer()
              setToolsOpen((open) => !open)
            }}
          >
            Tools
            <span className="nav-dropdown-chevron" aria-hidden>
              ▾
            </span>
          </button>
          <div
            id="tools-menu"
            className="nav-dropdown-panel"
            role="menu"
            hidden={!toolsOpen}
            onMouseEnter={openTools}
            onMouseLeave={scheduleCloseTools}
          >
            <p className="nav-dropdown-heading">Free creator tools</p>
            {TOOL_NAV.map((item) => (
              <Link
                key={item.id}
                className="nav-dropdown-item"
                to={item.path}
                role="menuitem"
                onClick={() => setToolsOpen(false)}
              >
                <strong>{item.label}</strong>
                <span>{item.blurb}</span>
              </Link>
            ))}
            <Link
              className="nav-dropdown-item nav-dropdown-more"
              to="/tools"
              role="menuitem"
              onClick={() => setToolsOpen(false)}
            >
              <strong>All free tools</strong>
              <span>Score · tester · resizer · CTR · titles · AI</span>
            </Link>
          </div>
        </div>
        <NavHashLink hash="features">Features</NavHashLink>
        <Link to="/pricing">Pricing</Link>
        <NavHashLink hash="how">How it works</NavHashLink>
      </nav>
      <div className="top-actions">
        {onLoginClick ? (
          <button type="button" className="top-login" onClick={onLoginClick}>
            {userLabel ? userLabel : 'Sign in'}
          </button>
        ) : null}
        {onHome ? (
          <a
            className="top-cta top-cta-light"
            href="#editor-ai"
            onClick={(event) => goHomeHash(event, 'editor-ai')}
          >
            Start free
          </a>
        ) : (
          <Link
            className="top-cta top-cta-light"
            to={{ pathname: '/', hash: '#editor-ai' }}
            onClick={(event) => goHomeHash(event, 'editor-ai')}
          >
            Start free
          </Link>
        )}
      </div>
    </header>
  )
}
