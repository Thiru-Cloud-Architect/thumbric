import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCT_NAME_FULL, UI_BUILD } from './brand'
import { DocumentHead } from './DocumentHead'
import { SiteFooter } from './LandingSections'
import { SharedSiteHeader } from './SharedSiteHeader'
import { deleteProject, duplicateProject, loadProjects, type Project } from './projects'
import { track } from './analytics'
import './App.css'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects())

  function refresh() {
    setProjects(loadProjects())
  }

  function onDuplicate(id: string) {
    duplicateProject(id)
    track('project_duplicated', { tool: 'projects' })
    refresh()
  }

  function onDelete(id: string) {
    if (!window.confirm('Delete this project from this browser?')) return
    deleteProject(id)
    track('project_deleted', { tool: 'projects' })
    refresh()
  }

  return (
    <div className="page">
      <DocumentHead path="/projects" />
      <SharedSiteHeader />
      <main className="projects-main tool-page-main">
        <p className="section-eyebrow">Projects</p>
        <h1 className="section-title">
          Your thumbnail <span className="gradient-text">history</span>
        </h1>
        <p className="section-lede">
          Saved locally when you export. Open the editor to create more — cloud sync waits for checkout.
        </p>

        {projects.length === 0 ? (
          <article className="tool-card empty-state-card">
            <h2>Your next thumbnail starts here.</h2>
            <p>Create with AI or start from scratch. Exports appear on this page automatically.</p>
            <div className="empty-state-actions">
              <Link className="chip solid" to="/ai-thumbnail-maker">
                Create thumbnail
              </Link>
              <Link className="chip" to="/thumbnail-doctor">
                Analyze a thumbnail
              </Link>
            </div>
          </article>
        ) : (
          <ul className="projects-grid">
            {projects.map((project) => (
              <li key={project.id} className="project-card">
                <img src={project.previewDataUrl} alt="" width={320} height={180} />
                <div className="project-card-body">
                  <h2>{project.name || project.title || 'Untitled'}</h2>
                  <p>
                    {project.platform} · {project.status}
                    {typeof project.score === 'number' ? ` · score ${project.score}` : ''} ·{' '}
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="project-card-actions">
                    <Link className="chip solid" to={{ pathname: '/', hash: '#editor' }}>
                      Open editor
                    </Link>
                    <button type="button" className="chip" onClick={() => onDuplicate(project.id)}>
                      Duplicate
                    </button>
                    <Link className="chip" to="/thumbnail-doctor">
                      Analyze
                    </Link>
                    <button type="button" className="chip ghost" onClick={() => onDelete(project.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter buildLabel={`${PRODUCT_NAME_FULL} · build ${UI_BUILD}`} />
    </div>
  )
}
