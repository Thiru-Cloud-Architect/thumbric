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
            to={{ pathname: '/', hash: '#editor-ai' }}
            onClick={() => {
              saveAiHandoff({ title: analysis.title, hint: `cinematic still that matches: ${analysis.title}`, source: 'title' })
              track('cta_click', { tool: 'title', cta: 'editor-ai' })
            }}
          >
            Make a matching thumbnail
          </Link>
        </div>
      </section>
    </ToolShell>
  )
}
