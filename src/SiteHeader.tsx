import { Link, useLocation } from 'react-router-dom'
import { PRODUCT_NAME } from './brand'
import { FeaturesMenu } from './LandingSections'

export function SiteHeader() {
  const location = useLocation()
  const onHome = location.pathname === '/' || location.pathname === '/thumbforge/'

  return (
    <header className="top">
      <Link className="brand" to="/">
        <span className="brand-mark" aria-hidden>
          ▶
        </span>
        {PRODUCT_NAME}
      </Link>
      <nav className="top-nav" aria-label="Sections">
        <FeaturesMenu />
        <Link to="/pricing">Pricing</Link>
        {onHome ? (
          <>
            <a href="#how">How it works</a>
            <a href="#editor">Editor</a>
          </>
        ) : (
          <Link to="/#editor">Editor</Link>
        )}
      </nav>
      <Link className="top-cta top-cta-light" to={onHome ? '#editor' : '/#editor'}>
        Start free
      </Link>
    </header>
  )
}
