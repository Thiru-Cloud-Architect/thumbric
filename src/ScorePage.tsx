import { useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ToolShell } from './ToolShell'
import { analyzeThumbnailImage, hintFromScore, type ThumbnailScore } from './score'
import { encodeRoastPayload, shareTargets } from './sharePayload'
import { loadImageFromUrl, saveAiHandoff } from './aiHandoff'
import { getOrCreateReferralId, track } from './analytics'
import { SITE_URL } from './brand'

export default function ScorePage({ analyzer }: { analyzer?: boolean }) {
  const location = useLocation()
  const path = analyzer ? '/youtube-thumbnail-analyzer' : '/youtube-thumbnail-score'
  const inputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [preview, setPreview] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [score, setScore] = useState<ThumbnailScore | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const roastUrl = useMemo(() => {
    if (!score) return ''
    return `${SITE_URL.replace(/\/?$/, '/')}roast/${encodeRoastPayload(score, title)}?ref=${getOrCreateReferralId()}`
  }, [score, title])

  async function onFile(next: File | undefined) {
    if (!next) return
    if (!next.type.startsWith('image/')) {
      setError('Choose a JPG or PNG thumbnail.')
      return
    }
    setError('')
    setScore(null)
    setFile(next)
    if (preview) URL.revokeObjectURL(preview)
    const url = URL.createObjectURL(next)
    setPreview(url)
    track('thumbnail_uploaded', { tool: 'score' })
  }

  async function onAnalyze() {
    if (!preview) {
      setError('Upload a thumbnail first.')
      return
    }
    try {
      const image = await loadImageFromUrl(preview)
      const result = analyzeThumbnailImage(image)
      setScore(result)
      track('thumbnail_analyzed', { tool: 'score', score: result.total })
    } catch {
      setError('Could not read that image. Try another PNG or JPG.')
    }
  }

  function onGenerateAlts() {
    if (!score) return
    saveAiHandoff({
      hint: hintFromScore(score, title),
      title,
      styleId: 'auto',
      source: 'score',
      mode: 'ai',
    })
    track('cta_click', { tool: 'score', cta: 'generate_3' })
  }

  async function onCopy() {
    if (!roastUrl) return
    try {
      await navigator.clipboard.writeText(roastUrl)
      setCopied(true)
      track('thumbnail_shared', { tool: 'score', channel: 'copy' })
      track('result_page_created', { tool: 'score', score: score?.total ?? 0 })
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <ToolShell
      path={path}
      kicker={analyzer ? 'Free analyzer' : 'Thumbric Score'}
      title={
        <>
          {analyzer ? 'YouTube thumbnail analyzer' : 'YouTube thumbnail score'}
          <span className="gradient-text"> — then 3 alternatives.</span>
        </>
      }
      lede="Upload an existing thumbnail. Get a 0–100 visual score, see what is weak, then generate 3 alternatives in the editor. No signup."
    >
      <section className="tool-card" aria-label="Score a thumbnail">
        <div className="tool-upload">
          <button type="button" className="tool-drop" onClick={() => inputRef.current?.click()}>
            {preview ? <img src={preview} alt="Thumbnail to score" /> : <span>Drop or choose a thumbnail</span>}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => void onFile(event.target.files?.[0])}
          />
          <label>
            Video title (optional)
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="The title this thumbnail has to sell"
            />
          </label>
          <div className="tool-actions">
            <button type="button" className="primary" onClick={() => void onAnalyze()} disabled={!file && !preview}>
              Score thumbnail
            </button>
            <p className="hint">Stays in this browser until you download or share a score link.</p>
          </div>
          {error ? <p className="tool-error">{error}</p> : null}
        </div>

        {score ? (
          <div className="score-result">
            <div className="score-ring" aria-label={`Thumbric Score ${score.total} of 100`}>
              <strong>{score.total}</strong>
              <span>/100</span>
            </div>
            <ul className="score-dims">
              {score.dimensions.map((item) => (
                <li key={item.id}>
                  <div>
                    <span>{item.label}</span>
                    <b>{item.score}</b>
                  </div>
                  <div className="score-bar" style={{ ['--p' as string]: `${item.score}%` }} />
                  <small>{item.note}</small>
                </li>
              ))}
            </ul>
            <div className="score-tips">
              <p>Want to see how Thumbric would improve it?</p>
              <ul>
                {score.recommendations.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
              <div className="tool-actions">
                <Link className="btn-gradient" to={{ pathname: '/', hash: '#editor-ai' }} onClick={onGenerateAlts}>
                  Fix in editor →
                </Link>
                <Link className="btn-outline" to="/ai-thumbnail-maker" onClick={onGenerateAlts}>
                  Open AI Maker
                </Link>
                <Link className="btn-outline" to="/youtube-thumbnail-tester">
                  Compare two thumbs
                </Link>
              </div>
              <p className="hint">{score.disclaimer}</p>
            </div>
            <div className="share-row">
              {shareTargets(roastUrl, `Thumbric Score: ${score.total}/100`).map((item) =>
                item.id === 'copy' ? (
                  <button key={item.id} type="button" className="chip" onClick={() => void onCopy()}>
                    {copied ? 'Copied' : 'Copy link'}
                  </button>
                ) : (
                  <a
                    key={item.id}
                    className="chip"
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('thumbnail_shared', { tool: 'score', channel: item.id })}
                  >
                    {item.label}
                  </a>
                ),
              )}
            </div>
          </div>
        ) : null}
      </section>
      {location.pathname === '/youtube-thumbnail-analyzer' ? (
        <p className="hint tool-alias">Same engine as <Link to="/youtube-thumbnail-score">Thumbnail Score</Link>.</p>
      ) : null}
    </ToolShell>
  )
}
