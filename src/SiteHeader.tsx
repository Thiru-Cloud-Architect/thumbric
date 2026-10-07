import { type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PRODUCT_NAME_FULL } from './brand'
import { NavHashLink, goToHash, useOnHomePage } from './nav'

type SiteHeaderProps = {
  userLabel?: string | null
  onLoginClick?: () => void
}

export function SiteHeader({ userLabel, onLoginClick }: SiteHeaderProps) {
  const onHome = useOnHomePage()
  const navigate = useNavigate()

  function goHomeHash(event: MouseEvent<HTMLAnchorElement>, hash: string) {
    event.preventDefault()
    if (onHome) {
      goToHash(hash)
      return
    }
    navigate({ pathname: '/', hash: `#${hash}` })
  }

  return (
    <header className="top">
      <Link className="brand" to="/">
        <span className="brand-mark" aria-hidden>
          ▶
        </span>
        {PRODUCT_NAME_FULL}
      </Link>
      <nav className="top-nav" aria-label="Sections">
        <NavHashLink hash="features">Features</NavHashLink>
        <Link to="/pricing">Pricing</Link>
        <NavHashLink hash="how">How it works</NavHashLink>
        <NavHashLink hash="editor-ai">
          <span className="nav-ai-cta">
            <span className="nav-ai-spark" aria-hidden>
              ✦
            </span>
            Try AI Thumbnail creator
          </span>
        </NavHashLink>
      </nav>
      <div className="top-actions">
        {onLoginClick ? (
          <button type="button" className="top-login" onClick={onLoginClick}>
            {userLabel ? userLabel : 'Sign in'}
          </button>
        ) : null}
        {onHome ? (
          <>
            <a
              className="top-cta top-cta-ai"
              href="#editor-ai"
              onClick={(event) => goHomeHash(event, 'editor-ai')}
            >
              Try AI Thumbnail creator
            </a>
            <a
              className="top-cta top-cta-light top-cta-secondary"
              href="#editor"
              onClick={(event) => goHomeHash(event, 'editor')}
            >
              Start free
            </a>
          </>
        ) : (
          <>
            <Link
              className="top-cta top-cta-ai"
              to={{ pathname: '/', hash: '#editor-ai' }}
              onClick={(event) => goHomeHash(event, 'editor-ai')}
            >
              Try AI Thumbnail creator
            </Link>
            <Link
              className="top-cta top-cta-light top-cta-secondary"
              to={{ pathname: '/', hash: '#editor' }}
              onClick={(event) => goHomeHash(event, 'editor')}
            >
              Start free
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
