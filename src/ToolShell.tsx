import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCT_NAME_FULL, UI_BUILD } from './brand'
import { DocumentHead } from './DocumentHead'
import { SiteFooter } from './LandingSections'
import { SiteHeader } from './SiteHeader'
import { TOOL_NAV } from './toolsCatalog'
import { useHeaderAuth } from './useHeaderAuth'
import './App.css'

export type Crumb = {
  label: string
  to?: string
}

type ToolShellProps = {
  path: string
  kicker?: string
  title: ReactNode
  lede: string
  children: ReactNode
  breadcrumbs?: Crumb[]
  userLabel?: string | null
  onLoginClick?: () => void
  /** AI maker is one field. Other tools keep the footer tool row. */
  hideMoreTools?: boolean
}

export function ToolShell({
  path,
  kicker,
  title,
  lede,
  children,
  breadcrumbs,
  userLabel,
  onLoginClick,
  hideMoreTools = false,
}: ToolShellProps) {
  const header = useHeaderAuth()
  const crumbs =
    breadcrumbs ??
    ([
      { label: 'Home', to: '/' },
      { label: 'Tools', to: '/tools' },
      { label: typeof title === 'string' ? title : 'Tool' },
    ] satisfies Crumb[])

  const mainClass = hideMoreTools ? 'tool-page-main ai-maker-shell' : 'tool-page-main'
  const resolvedLabel = userLabel === undefined ? header.userLabel : userLabel
  const resolvedLogin = onLoginClick ?? header.onLoginClick

  return (
    <div className="page">
      <DocumentHead path={path} />
      <SiteHeader
        userLabel={resolvedLabel}
        planLabel={header.signedIn ? header.planLabel : null}
        onLoginClick={resolvedLogin}
      />
      <main className={mainClass}>
        <div className="tool-lead">
          <nav className="tool-breadcrumbs" aria-label="Breadcrumb">
            <ol>
              {crumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`}>
                  {crumb.to && index < crumbs.length - 1 ? (
                    <Link to={crumb.to}>{crumb.label}</Link>
                  ) : (
                    <span aria-current={index === crumbs.length - 1 ? 'page' : undefined}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <section className="tool-hero">
            {kicker ? <p className="section-eyebrow">{kicker}</p> : null}
            <h1 className="section-title">{title}</h1>
            <p className="section-lede">{lede}</p>
          </section>
          {children}
        </div>
        {hideMoreTools ? null : (
        <nav className="tool-more" aria-label="More free tools">
          <p className="footer-head">More free tools</p>
          <div className="tool-more-grid">
            {TOOL_NAV.filter((item) => item.path !== path).map((item) => (
              <Link key={item.id} className="tool-more-card" to={item.path}>
                <strong>{item.label}</strong>
                <span>{item.blurb}</span>
              </Link>
            ))}
            <Link className="tool-more-card tool-more-all" to="/tools">
              <strong>All free tools</strong>
              <span>Browse the full toolkit</span>
            </Link>
          </div>
        </nav>
        )}
      </main>
      <SiteFooter buildLabel={`${PRODUCT_NAME_FULL} · UI ${UI_BUILD}`} />
    </div>
  )
}
