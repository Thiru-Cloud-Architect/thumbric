import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ToolShell } from './ToolShell'
import { calculateCtr, formatCtr, parseCount } from './ctrCalc'
import { track } from './analytics'

export default function CtrPage() {
  const [impressions, setImpressions] = useState('10000')
  const [clicks, setClicks] = useState('420')
  const result = useMemo(
    () => calculateCtr(parseCount(impressions), parseCount(clicks)),
    [impressions, clicks],
  )

  return (
    <ToolShell
      path="/youtube-ctr-calculator"
      kicker="CTR calculator"
      title={
        <>
          YouTube CTR calculator <span className="gradient-text">{formatCtr(result.ctr)}</span>
        </>
      }
      lede="CTR is clicks divided by impressions. Paste numbers from YouTube Studio. Bands below are rough public ranges — not your niche average."
    >
      <section className="tool-card ctr-card">
        <div className="ctr-fields">
          <label>
            Impressions
            <input inputMode="numeric" value={impressions} onChange={(event) => setImpressions(event.target.value)} />
          </label>
          <label>
            Clicks
            <input inputMode="numeric" value={clicks} onChange={(event) => setClicks(event.target.value)} />
          </label>
        </div>
        <div className="ctr-result" aria-label={`CTR ${formatCtr(result.ctr)}`}>
          <div className="score-ring">
            <strong>{formatCtr(result.ctr)}</strong>
            <span>{result.band.label}</span>
          </div>
          <div className="ctr-result-copy">
            <p className="ctr-result-lead">{result.band.hint}</p>
            <p className="hint">{result.disclaimer}</p>
          </div>
        </div>
        <div className="tool-actions">
          <Link
            className="btn-gradient"
            to="/youtube-thumbnail-score"
            onClick={() => track('cta_click', { tool: 'ctr', cta: 'score' })}
          >
            Score a thumbnail
          </Link>
          <Link
            className="btn-outline"
            to="/ai-thumbnail-maker"
            onClick={() => track('cta_click', { tool: 'ctr', cta: 'ai-maker' })}
          >
            Open AI Thumbnail Maker
          </Link>
        </div>
      </section>
    </ToolShell>
  )
}
