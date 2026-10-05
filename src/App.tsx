import { useEffect, useMemo, useRef, useState } from 'react'
import { NICHES, type NicheId, getNiche, HEIGHT, WIDTH } from './niches'
import { downloadThumbnail, renderThumbnail } from './render'
import './App.css'

const SAMPLES = [
  {
    niche: 'tech' as NicheId,
    eyebrow: 'AI TOOLS',
    title: 'I built an agent that reviews production PRs',
  },
  {
    niche: 'finance' as NicheId,
    eyebrow: 'SALARY',
    title: 'How I saved 3 lakhs without cutting fun',
  },
  {
    niche: 'education' as NicheId,
    eyebrow: 'WEEK 1',
    title: 'Kubernetes in 12 minutes for platform engineers',
  },
]

export default function App() {
  const [nicheId, setNicheId] = useState<NicheId>('tech')
  const [title, setTitle] = useState(SAMPLES[0].title)
  const [eyebrow, setEyebrow] = useState(SAMPLES[0].eyebrow)
  const [status, setStatus] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const niche = useMemo(() => getNiche(nicheId), [nicheId])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderThumbnail(ctx, { title, eyebrow, niche, watermark: true })
  }, [title, eyebrow, niche])

  function applySample(index: number) {
    const sample = SAMPLES[index]
    setNicheId(sample.niche)
    setTitle(sample.title)
    setEyebrow(sample.eyebrow)
    setStatus('')
  }

  function onDownload() {
    try {
      downloadThumbnail({ title, eyebrow, niche, watermark: true })
      setStatus('Downloaded 1280×720 PNG with a free watermark.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Download failed.')
    }
  }

  return (
    <div className="page">
      <header className="top">
        <a className="brand" href="#top">
          ThumbForge
        </a>
        <p className="tag">Free YouTube thumbnails · no account · no paid API</p>
      </header>

      <main id="top">
        <section className="hero">
          <div>
            <p className="eyebrow">Creator tool</p>
            <h1>Title in. Thumbnail out.</h1>
            <p className="lede">
              Pick a niche, type the video title, download a 1280×720 PNG. Runs in your browser. The
              free export carries a small ThumbForge mark.
            </p>
          </div>
          <dl className="facts">
            <div>
              <dt>Cost today</dt>
              <dd>Zero. Canvas drawing only. No model bill.</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>
                {WIDTH}×{HEIGHT} YouTube standard
              </dd>
            </div>
            <div>
              <dt>Later</dt>
              <dd>Paid HD packs without watermark, then photo/AI fill.</dd>
            </div>
          </dl>
        </section>

        <section className="workbench" aria-label="Thumbnail generator">
          <form
            className="controls"
            onSubmit={(event) => {
              event.preventDefault()
              onDownload()
            }}
          >
            <div className="samples" role="group" aria-label="Sample titles">
              {SAMPLES.map((sample, index) => (
                <button
                  key={sample.title}
                  type="button"
                  className="chip"
                  onClick={() => applySample(index)}
                >
                  Sample {index + 1}
                </button>
              ))}
            </div>

            <fieldset>
              <legend>Niche</legend>
              <div className="niches">
                {NICHES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={item.id === nicheId ? 'niche active' : 'niche'}
                    aria-pressed={item.id === nicheId}
                    onClick={() => setNicheId(item.id)}
                  >
                    <span>{item.label}</span>
                    <small>{item.hint}</small>
                  </button>
                ))}
              </div>
            </fieldset>

            <label>
              Eyebrow
              <input
                value={eyebrow}
                maxLength={24}
                onChange={(event) => setEyebrow(event.target.value)}
                placeholder={niche.badge}
              />
            </label>

            <label>
              Video title
              <textarea
                value={title}
                maxLength={90}
                rows={3}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What is this video about?"
              />
            </label>

            <div className="actions">
              <button type="submit" className="primary">
                Download PNG
              </button>
              <p className="hint">{status || 'Preview updates as you type.'}</p>
            </div>
          </form>

          <div className="preview-wrap">
            <canvas
              ref={canvasRef}
              className="preview"
              width={WIDTH}
              height={HEIGHT}
              aria-label="Thumbnail preview"
            />
          </div>
        </section>
      </main>

      <footer>
        <p>
          ThumbForge is the free lane next to Agent Gate. Ship thumbnails, collect demand, charge for
          clean exports when people ask.
        </p>
      </footer>
    </div>
  )
}
