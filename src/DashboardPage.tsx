import { Link } from 'react-router-dom'
import { loadEvents } from './analytics'
import { eventsByDay, summarizeEvents } from './analyticsSummary'
import { PRODUCT_NAME_FULL, UI_BUILD } from './brand'
import { DocumentHead } from './DocumentHead'
import { SiteFooter } from './LandingSections'
import { SiteHeader } from './SiteHeader'
import { loadProjects } from './projects'
import { loadThumbnailHistory } from './thumbnailHistory'
import './App.css'

export default function DashboardPage() {
  const events = loadEvents()
  const funnel = summarizeEvents(events)
  const byDay = eventsByDay(events)
  const historyCount = loadThumbnailHistory().length
  const projects = loadProjects()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="page">
      <DocumentHead path="/dashboard" />
      <SiteHeader />
      <main className="dashboard-main tool-page-main">
        <p className="section-eyebrow">Creator dashboard</p>
        <h1 className="section-title">
          {greeting}. <span className="gradient-text">Create your next thumbnail.</span>
        </h1>
        <p className="section-lede">
          Action first — then a quiet look at what you already made on this device.
        </p>

        <section className="dashboard-actions" aria-label="Start creating">
          <Link className="dashboard-action is-primary" to={{ pathname: '/', hash: '#editor-ai' }}>
            <strong>Describe your video</strong>
            <span>AI concepts → editable canvas</span>
          </Link>
          <Link className="dashboard-action" to="/thumbnail-doctor">
            <strong>Upload thumbnail to improve</strong>
            <span>Doctor score + top 3 fixes</span>
          </Link>
          <Link className="dashboard-action" to={{ pathname: '/', hash: '#video-optional' }}>
            <strong>Optional: understand my video</strong>
            <span>Privacy-first · never required</span>
          </Link>
        </section>

        {projects.length === 0 && historyCount === 0 ? (
          <article className="tool-card empty-state-card">
            <h2>Your next thumbnail starts here.</h2>
            <p>No projects yet. Create with AI or analyze an existing thumb — exports land in Projects.</p>
            <Link className="chip solid" to={{ pathname: '/', hash: '#editor-ai' }}>
              Create thumbnail
            </Link>
          </article>
        ) : (
          <article className="tool-card">
            <h2>Recent projects</h2>
            <ul className="history-list">
              {projects.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <img src={item.previewDataUrl} alt="" width={120} height={68} />
                  <div>
                    <strong>{item.name || item.title || 'Untitled'}</strong>
                    <span>
                      {item.platform} · {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/projects">View all projects →</Link>
          </article>
        )}

        <div className="dashboard-stats">
          {(
            [
              ['Downloads', funnel.downloaded],
              ['Generations', funnel.generated],
              ['Analyzed', funnel.analyzed],
              ['Returns', funnel.returned],
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
      </main>
      <SiteFooter buildLabel={`${PRODUCT_NAME_FULL} · build ${UI_BUILD}`} />
    </div>
  )
}
