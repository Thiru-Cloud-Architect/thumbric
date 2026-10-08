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
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
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
        <div className={toolsOpen ? 'nav-dropdown is-open' : 'nav-dropdown'} ref={toolsRef}>
          <button
            type="button"
            className="nav-dropdown-trigger"
            aria-expanded={toolsOpen}
            aria-haspopup="true"
            onClick={() => setToolsOpen((open) => !open)}
          >
            Tools
          </button>
          {toolsOpen ? (
            <div className="nav-dropdown-panel" role="menu">
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
              <Link className="nav-dropdown-item nav-dropdown-more" to="/tools" onClick={() => setToolsOpen(false)}>
                <strong>All free tools</strong>
                <span>Score, tester, resizer, CTR, titles</span>
              </Link>
            </div>
          ) : null}
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
