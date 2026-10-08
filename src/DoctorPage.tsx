import { Link } from 'react-router-dom'
import { track } from './analytics'
import { ToolShell } from './ToolShell'

/** Phase 2 funnel: score → improve → 3 concepts (premium photoreal AI deferred). */
export default function DoctorPage() {
  return (
    <ToolShell
      path="/thumbnail-doctor"
      kicker="Thumbnail Doctor"
      title={
        <>
          Diagnose the click. <span className="gradient-text">Then fix it.</span>
        </>
      }
      lede="Upload a thumb, get a honest heuristic score, share a roast link, then jump into Improve mode for packaging angles — without pretending we know your CTR."
    >
      <div className="doctor-steps">
        <article className="tool-card">
          <h2>1 · Score</h2>
          <p>Attention, mobile type, emotion, and clutter — same engine as Thumbnail Score.</p>
          <Link
            className="chip solid"
            to="/youtube-thumbnail-score"
            onClick={() => track('tool_started', { tool: 'thumbnail-doctor', step: 'score' })}
          >
            Run Thumbnail Score
          </Link>
        </article>
        <article className="tool-card">
          <h2>2 · Compare</h2>
          <p>Pit your current thumb against a draft in the A/B tester at phone size.</p>
          <Link className="chip solid" to="/youtube-thumbnail-tester">
            Open A/B Tester
          </Link>
        </article>
        <article className="tool-card">
          <h2>3 · Improve in editor</h2>
          <p>Three packaging strategies, editable titles, refine chips — premium photoreal AI unlocks with paid fal.</p>
          <Link
            className="chip solid"
            to={{ pathname: '/', hash: '#editor-ai' }}
            onClick={() => track('tool_started', { tool: 'thumbnail-doctor', step: 'editor' })}
          >
            Improve my thumbnail →
          </Link>
        </article>
      </div>
    </ToolShell>
  )
}
