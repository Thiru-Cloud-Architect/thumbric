import { Link } from 'react-router-dom'
import { PRODUCT_NAME_FULL, UI_BUILD } from './brand'
import { DocumentHead } from './DocumentHead'
import { SiteFooter } from './LandingSections'
import { SiteHeader } from './SiteHeader'
import './App.css'

export default function CareerPage() {
  return (
    <div className="page">
      <DocumentHead path="/career" />
      <SiteHeader />
      <main className="career-page-main">
        <section className="career-hero" aria-labelledby="career-title">
          <p className="section-eyebrow">Careers</p>
          <h1 id="career-title" className="section-title center">
            Build tools creators <span className="gradient-text">actually use</span>
          </h1>
          <p className="section-lede center">
            {PRODUCT_NAME_FULL} is a small, product-first team focused on fast browser thumbnails — not another
            generic design suite.
          </p>
        </section>

        <section className="career-card-wrap section-shell" aria-label="Open roles">
          <article className="career-status-card">
            <h2>No open roles right now</h2>
            <p>
              We are not hiring at the moment. When we open engineering, design, or creator-success roles,
              they will appear here first.
            </p>
            <p>
              <strong>Watch this space</strong> — bookmark this page. When roles open, they will be
              listed here first.
            </p>
            <div className="career-actions">
              <Link className="btn-outline" to="/">
                Back to home
              </Link>
              <Link className="btn-gradient" to={{ pathname: '/', hash: '#editor-ai' }}>
                Try the AI editor
              </Link>
            </div>
          </article>
        </section>
      </main>
      <SiteFooter buildLabel={`${PRODUCT_NAME_FULL} · UI ${UI_BUILD}`} />
    </div>
  )
}
