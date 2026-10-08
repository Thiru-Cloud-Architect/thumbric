import { Link, useParams } from 'react-router-dom'
import { ToolShell } from './ToolShell'
import { decodeRoastPayload } from './sharePayload'

export default function RoastPage() {
  const { code = '' } = useParams()
  const payload = decodeRoastPayload(code)

  return (
    <ToolShell
      path="/roast"
      kicker="Shared result"
      title={
        payload ? (
          <>
            Thumbnail Score: <span className="gradient-text">{payload.score}/100</span>
          </>
        ) : (
          <>This share link is <span className="gradient-text">unreadable.</span></>
        )
      }
      lede={
        payload
          ? payload.title
            ? `Made with Thumbric for “${payload.title}”. Heuristic score — not a CTR prediction.`
            : 'Made with Thumbric. Heuristic score — not a CTR prediction.'
          : 'Ask the sender to copy the link again, or score your own thumbnail.'
      }
    >
      {payload ? (
        <section className="tool-card">
          <ul className="score-dims">
            {payload.dims.map((item) => (
              <li key={item.id}>
                <div>
                  <span>{item.label}</span>
                  <b>{item.score}</b>
                </div>
                <div className="score-bar" style={{ ['--p' as string]: `${item.score}%` }} />
              </li>
            ))}
          </ul>
          <ul className="maker-tips">
            {payload.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <div className="tool-actions">
            <Link className="btn-gradient" to="/youtube-thumbnail-score">
              Score your own thumbnail
            </Link>
            <Link className="btn-outline" to={{ pathname: '/', hash: '#editor-ai' }}>
              Generate 3 alternatives
            </Link>
          </div>
        </section>
      ) : (
        <Link className="btn-gradient" to="/youtube-thumbnail-score">
          Score a thumbnail
        </Link>
      )}
    </ToolShell>
  )
}
