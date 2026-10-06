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

  function onStartFree(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    if (onHome) {
      goToHash('editor')
      return
    }
    navigate({ pathname: '/', hash: '#editor' })
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
        <NavHashLink hash="editor">Editor</NavHashLink>
      </nav>
      <div className="top-actions">
        {onLoginClick ? (
          <button type="button" className="top-login" onClick={onLoginClick}>
            {userLabel ? userLabel : 'Sign in'}
          </button>
        ) : null}
        {onHome ? (
          <a className="top-cta top-cta-light" href="#editor" onClick={onStartFree}>
            Start free
          </a>
        ) : (
          <Link
            className="top-cta top-cta-light"
            to={{ pathname: '/', hash: '#editor' }}
            onClick={onStartFree}
          >
            Start free
          </Link>
        )}
      </div>
    </header>
  )
}
