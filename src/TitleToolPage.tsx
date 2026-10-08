import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ToolShell } from './ToolShell'
import { analyzeTitle } from './titleAnalyze'
import { saveAiHandoff } from './aiHandoff'
import { track } from './analytics'

export default function TitleToolPage() {
  const [title, setTitle] = useState('I Spent $1 And This Happened')
  const analysis = useMemo(() => analyzeTitle(title), [title])

  return (
    <ToolShell
      path="/youtube-title-analyzer"
      kicker="Title analyzer"
      title={
        <>
          YouTube title analyzer <span className="gradient-text">{analysis.score}/100</span>
        </>
      }
      lede="Check length, mobile truncation, numbers, and hook words. Pair a strong title with a matching thumbnail — titles alone do not create CTR."
    >
      <section className="tool-card">
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <p className="hint">{analysis.length} characters · mobile preview: {analysis.mobilePreview || '—'}</p>
        <ul className="title-issues">
          {analysis.issues.map((item) => (
            <li key={item.id} data-sev={item.severity}>
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </li>
          ))}
        </ul>
        <div className="tool-actions">
          <Link
            className="btn-gradient"
            to="/ai-thumbnail-maker"
            onClick={() => {
              saveAiHandoff({
                title: analysis.title,
                hint: `cinematic still that matches: ${analysis.title}`,
                source: 'title',
                mode: 'ai',
              })
              track('cta_click', { tool: 'title', cta: 'ai-maker' })
            }}
          >
            Make a matching thumbnail
          </Link>
          <Link className="btn-outline" to={{ pathname: '/', hash: '#editor' }}>
            Open clean editor
          </Link>
        </div>
      </section>
    </ToolShell>
  )
}
