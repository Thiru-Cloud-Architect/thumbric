import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { track } from './analytics'
import { loadImageFromUrl, objectUrlToDataUrl, saveAiHandoff } from './aiHandoff'
import { topDoctorProblems, type DoctorProblem } from './doctorProblems'
import { hintFromScore, analyzeThumbnailImage, type ThumbnailScore } from './score'
import { ToolShell } from './ToolShell'

export default function DoctorPage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState('')
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [score, setScore] = useState<ThumbnailScore | null>(null)
  const [problems, setProblems] = useState<DoctorProblem[]>([])

  async function onFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Choose a JPG or PNG thumbnail.')
      return
    }
    setError('')
    setScore(null)
    setProblems([])
    if (preview) URL.revokeObjectURL(preview)
    const url = URL.createObjectURL(file)
    setPreview(url)
    track('thumbnail_uploaded', { tool: 'thumbnail-doctor' })
    track('doctor_started', { tool: 'thumbnail-doctor' })
  }

  async function onAnalyze() {
    if (!preview) {
      setError('Upload a thumbnail first.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const image = await loadImageFromUrl(preview)
      const result = analyzeThumbnailImage(image)
      setScore(result)
      setProblems(topDoctorProblems(result))
      track('thumbnail_analyzed', { tool: 'thumbnail-doctor', score: result.total })
      track('doctor_completed', { tool: 'thumbnail-doctor', score: result.total })
    } catch {
      setError('Could not read that image. Try another PNG or JPG.')
    } finally {
      setBusy(false)
    }
  }

  async function onFix() {
    if (!score) return
    let photoDataUrl: string | undefined
    if (preview) {
      try {
        photoDataUrl = await objectUrlToDataUrl(preview)
      } catch {
        photoDataUrl = undefined
      }
    }
    saveAiHandoff({
      hint: hintFromScore(score, title),
      title,
      styleId: 'auto',
      photoDataUrl,
      source: 'doctor',
      mode: 'classic',
    })
    track('cta_click', { tool: 'thumbnail-doctor', cta: 'fix_with_thumbric' })
  }

  return (
    <ToolShell
      path="/thumbnail-doctor"
      kicker="Thumbnail Doctor"
      title={
        <>
          Diagnose the click. <span className="gradient-text">Then fix it.</span>
        </>
      }
      lede="Upload an existing thumbnail. Get a honest heuristic score, the top 3 problems, then fix it in the editor — no video upload required."
    >
      <section className="tool-card doctor-upload" aria-label="Upload thumbnail">
        <button type="button" className="tool-drop" onClick={() => inputRef.current?.click()}>
          {preview ? <img src={preview} alt="Thumbnail to diagnose" /> : <span>Drop or choose a thumbnail</span>}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => void onFile(event.target.files?.[0])}
        />
        <label className="inspector-field">
          Video title (optional)
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What this thumbnail needs to sell"
          />
        </label>
        <div className="tool-actions">
          <button type="button" className="primary" disabled={!preview || busy} onClick={() => void onAnalyze()}>
            {busy ? 'Analyzing…' : 'Run Doctor'}
          </button>
          <p className="hint">Stays in this browser. Heuristic score — not a CTR forecast.</p>
        </div>
        {error ? <p className="tool-error">{error}</p> : null}
      </section>

      {score ? (
        <section className="doctor-result" aria-live="polite">
          <article className="tool-card doctor-score-card">
            <p className="doctor-score-kicker">Thumbric Score</p>
            <p className="doctor-score-total">{score.total}</p>
            <p className="hint">{score.disclaimer}</p>
            <ul className="doctor-dims">
              {score.dimensions.map((dim) => (
                <li key={dim.id}>
                  <span>{dim.label}</span>
                  <strong>{dim.score}</strong>
                </li>
              ))}
            </ul>
          </article>

          <article className="tool-card">
            <h2>Top 3 problems</h2>
            <ol className="doctor-problems">
              {problems.map((problem, index) => (
                <li key={problem.id} className={`is-${problem.severity}`}>
                  <span className="doctor-problem-index">{index + 1}</span>
                  <div>
                    <strong>{problem.title}</strong>
                    <p>{problem.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>

          <article className="tool-card doctor-fix-card">
            <h2>Fix it in the editor</h2>
            <p>
              Your thumbnail opens on the canvas so you can change the title and download.
              Or rebuild a new cover from this diagnosis.
            </p>
            <div className="doctor-fix-actions">
              <button
                type="button"
                className="chip solid"
                onClick={() => {
                  void onFix().then(() => navigate({ pathname: '/', hash: '#editor' }))
                }}
              >
                Open in editor →
              </button>
              <button
                type="button"
                className="chip"
                onClick={() => {
                  void onFix().then(() => navigate('/ai-thumbnail-maker'))
                }}
              >
                Rebuild with AI
              </button>
              <Link className="chip" to="/youtube-thumbnail-tester">
                Compare in A/B Tester
              </Link>
            </div>
          </article>
        </section>
      ) : (
        <div className="doctor-steps doctor-steps-teaser">
          <article className="tool-card">
            <h2>1 · Upload</h2>
            <p>Any existing YouTube thumbnail JPG/PNG.</p>
          </article>
          <article className="tool-card">
            <h2>2 · Diagnose</h2>
            <p>Score + three concrete problems — focal point, text, mobile, clutter.</p>
          </article>
          <article className="tool-card">
            <h2>3 · Fix</h2>
            <p>Open the same image in the editor, or rebuild a new cover with AI.</p>
          </article>
        </div>
      )}
    </ToolShell>
  )
}
