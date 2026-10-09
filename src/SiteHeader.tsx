import { type MouseEvent, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PRODUCT_NAME_FULL } from './brand'
import { goToHash, useOnHomePage } from './nav'
import { getActiveTheme, toggleTheme, type ThemeId } from './theme'
import { TOOL_NAV_CATEGORIES, toolsByCategory } from './toolsCatalog'

type SiteHeaderProps = {
  userLabel?: string | null
  onLoginClick?: () => void
}

export function SiteHeader({ userLabel, onLoginClick }: SiteHeaderProps) {
  const onHome = useOnHomePage()
  const navigate = useNavigate()
  const [toolsOpen, setToolsOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeId>(() =>
    typeof document !== 'undefined' ? getActiveTheme() : 'light',
  )
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
        <span className="brand-word">{PRODUCT_NAME_FULL}</span>
      </Link>
      <nav className="top-nav" aria-label="Primary">
        <a
          className="nav-link"
          href={onHome ? '#editor' : '/#editor'}
          onClick={(event) => goHomeHash(event, 'editor')}
        >
          Create
        </a>
        <Link className="nav-link" to="/ai-thumbnail-maker">
          AI Maker
        </Link>
        <Link className="nav-link" to="/thumbnail-doctor">
          Analyze
        </Link>
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
            className="nav-dropdown-panel nav-mega-panel"
            role="menu"
            hidden={!toolsOpen}
            onMouseEnter={openTools}
            onMouseLeave={scheduleCloseTools}
          >
            <div className="nav-mega-grid">
              {TOOL_NAV_CATEGORIES.map((category) => (
                <div key={category.id} className="nav-mega-col">
                  <p className="nav-dropdown-heading">{category.label}</p>
                  {toolsByCategory(category.id).map((item) => (
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
                </div>
              ))}
            </div>
            <Link
              className="nav-dropdown-item nav-dropdown-more"
              to="/tools"
              role="menuitem"
              onClick={() => setToolsOpen(false)}
            >
              <strong>View all tools</strong>
              <span>Score · tester · resizer · CTR · titles · Doctor · AI</span>
            </Link>
          </div>
        </div>
        <Link className="nav-link" to="/pricing">
          Pricing
        </Link>
      </nav>
      <div className="top-actions">
        <button
          type="button"
          className="theme-toggle"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          onClick={() => setTheme(toggleTheme())}
        >
          <span className="theme-toggle-icon" aria-hidden="true">
            {theme === 'dark' ? '☀' : '☾'}
          </span>
          <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
        {onLoginClick ? (
          <button type="button" className="top-login" onClick={onLoginClick}>
            {userLabel ? userLabel : 'Sign in'}
          </button>
        ) : (
          <Link className="top-login" to="/account">
            {userLabel ? userLabel : 'Sign in'}
          </Link>
        )}
        {onHome ? (
          <a
            className="top-cta top-cta-light"
            href="#editor"
            onClick={(event) => goHomeHash(event, 'editor')}
          >
            Create thumbnail
          </a>
        ) : (
          <Link
            className="top-cta top-cta-light"
            to={{ pathname: '/', hash: '#editor' }}
            onClick={(event) => goHomeHash(event, 'editor')}
          >
            Create thumbnail
          </Link>
        )}
      </div>
    </header>
  )
}
