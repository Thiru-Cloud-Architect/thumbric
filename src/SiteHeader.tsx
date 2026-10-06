import { Link } from 'react-router-dom'
import { PRODUCT_NAME_FULL } from './brand'
import { NavHashLink, useOnHomePage } from './nav'

type SiteHeaderProps = {
  userLabel?: string | null
  onLoginClick?: () => void
}

export function SiteHeader({ userLabel, onLoginClick }: SiteHeaderProps) {
  const onHome = useOnHomePage()

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
        <NavHashLink hash="editor">Editor</NavHashLink>
      </nav>
      <div className="top-actions">
        {onLoginClick ? (
          <button type="button" className="top-login" onClick={onLoginClick}>
            {userLabel ? userLabel : 'Sign in'}
          </button>
        ) : null}
        {onHome ? (
          <a className="top-cta top-cta-light" href="#editor">
            Start free
          </a>
        ) : (
          <Link className="top-cta top-cta-light" to={{ pathname: '/', hash: '#editor' }}>
            Start free
          </Link>
        )}
      </div>
    </header>
  )
}
