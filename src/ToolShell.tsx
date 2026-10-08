import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCT_NAME_FULL, UI_BUILD } from './brand'
import { DocumentHead } from './DocumentHead'
import { SiteFooter } from './LandingSections'
import { SiteHeader } from './SiteHeader'
import { TOOL_NAV } from './toolsCatalog'
import './App.css'

type ToolShellProps = {
  path: string
  kicker?: string
  title: ReactNode
  lede: string
  children: ReactNode
  userLabel?: string | null
  onLoginClick?: () => void
}

export function ToolShell({ path, kicker, title, lede, children, userLabel, onLoginClick }: ToolShellProps) {
  return (
    <div className="page">
      <DocumentHead path={path} />
      <SiteHeader userLabel={userLabel} onLoginClick={onLoginClick} />
      <main className="tool-page-main">
        <section className="tool-hero">
          {kicker ? <p className="section-eyebrow">{kicker}</p> : null}
          <h1 className="section-title">{title}</h1>
          <p className="section-lede">{lede}</p>
        </section>
        {children}
        <nav className="tool-more" aria-label="More free tools">
          <p className="footer-head">More free tools</p>
          <div className="tool-more-links">
            {TOOL_NAV.filter((item) => item.path !== path).map((item) => (
              <Link key={item.id} to={item.path}>
                {item.label}
              </Link>
            ))}
            <Link to="/tools">All tools</Link>
          </div>
        </nav>
      </main>
      <SiteFooter buildLabel={`${PRODUCT_NAME_FULL} · UI ${UI_BUILD}`} />
    </div>
  )
}
