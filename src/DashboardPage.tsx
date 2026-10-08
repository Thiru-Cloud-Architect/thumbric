import { Link } from 'react-router-dom'
import { loadEvents } from './analytics'
import { eventsByDay, summarizeEvents } from './analyticsSummary'
import { PRODUCT_NAME_FULL, UI_BUILD } from './brand'
import { DocumentHead } from './DocumentHead'
import { SiteFooter } from './LandingSections'
import { SiteHeader } from './SiteHeader'
import { loadThumbnailHistory } from './thumbnailHistory'
import './App.css'

export default function DashboardPage() {
  const events = loadEvents()
  const funnel = summarizeEvents(events)
  const byDay = eventsByDay(events)
  const historyCount = loadThumbnailHistory().length

  return (
    <div className="page">
      <DocumentHead path="/dashboard" />
      <SiteHeader />
      <main className="dashboard-main tool-page-main">
        <p className="section-eyebrow">Creator dashboard</p>
        <h1 className="section-title">
          Funnel &amp; <span className="gradient-text">retention</span>
        </h1>
        <p className="section-lede">
          Product analytics stored on this device ({events.length} events). Connect{' '}
          <code>VITE_API_BASE</code> to mirror to the Worker for team cohorts.
        </p>

        <div className="dashboard-stats">
          {(
            [
              ['Landing views', funnel.landing],
              ['Tools started', funnel.toolStarted],
              ['Thumbs analyzed', funnel.analyzed],
              ['Generations done', funnel.generated],
              ['Downloads', funnel.downloaded],
              ['Shares', funnel.shared],
              ['Signups', funnel.signupCompleted],
              ['Return visits', funnel.returned],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="dashboard-stat">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <article className="tool-card">
          <h2>Activity (14 days)</h2>
          {byDay.length === 0 ? (
            <p className="hint">Use the editor or free tools — events will appear here.</p>
          ) : (
            <ul className="dashboard-days">
              {byDay.map(([day, count]) => (
                <li key={day}>
                  <span>{day}</span>
                  <span>{count} events</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="tool-card">
          <h2>Cloud history</h2>
          <p>
            {historyCount} thumbnails in local history. Server sync and YouTube OAuth are planned for Pro — see{' '}
            <Link to="/roadmap">roadmap</Link>.
          </p>
          <Link className="chip solid" to={{ pathname: '/', hash: '#editor-ai' }}>
            Back to editor
          </Link>
        </article>
      </main>
      <SiteFooter buildLabel={`${PRODUCT_NAME_FULL} · build ${UI_BUILD}`} />
    </div>
  )
}
