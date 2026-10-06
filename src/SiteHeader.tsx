import { Link } from 'react-router-dom'
import { PRODUCT_NAME } from './brand'
import { NavHashLink, useOnHomePage } from './nav'

export function SiteHeader() {
  const onHome = useOnHomePage()

  return (
    <header className="top">
      <Link className="brand" to="/">
        <span className="brand-mark" aria-hidden>
          ▶
        </span>
        {PRODUCT_NAME}
      </Link>
      <nav className="top-nav" aria-label="Sections">
        <NavHashLink hash="features">Features</NavHashLink>
        <Link to="/pricing">Pricing</Link>
        <NavHashLink hash="how">How it works</NavHashLink>
        <NavHashLink hash="editor">Editor</NavHashLink>
      </nav>
      {onHome ? (
        <a className="top-cta top-cta-light" href="#editor">
          Start free
        </a>
      ) : (
        <Link className="top-cta top-cta-light" to={{ pathname: '/', hash: '#editor' }}>
          Start free
        </Link>
      )}
    </header>
  )
}
