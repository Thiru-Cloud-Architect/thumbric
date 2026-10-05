import { useEffect, useMemo, useRef, useState } from 'react'
import {
  NICHE_GROUPS,
  NICHES,
  type NicheId,
  filterNiches,
  getNiche,
  HEIGHT,
  WIDTH,
} from './niches'
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
    niche: 'travel' as NicheId,
    eyebrow: 'TRIP',
    title: '48 hours in Chennai on a student budget',
  },
  {
    niche: 'fitness' as NicheId,
    eyebrow: 'TRAIN',
    title: 'Home workout that actually keeps you consistent',
  },
]

export default function App() {
  const [nicheId, setNicheId] = useState<NicheId>('tech')
  const [title, setTitle] = useState(SAMPLES[0].title)
  const [eyebrow, setEyebrow] = useState(SAMPLES[0].eyebrow)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const niche = useMemo(() => getNiche(nicheId), [nicheId])
  const visible = useMemo(() => filterNiches(query), [query])

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
    setQuery('')
    setStatus('')
  }

  function onDownload() {
    try {
      downloadThumbnail({ title, eyebrow, niche, watermark: true })
      setStatus('PNG saved to your downloads folder (1280×720, free watermark).')
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
              Choose your channel type, type the video title, click Download PNG. The image is drawn
              in your browser and saved to Downloads. No signup. No server bill.
            </p>
          </div>
          <dl className="facts">
            <div>
              <dt>Channel types</dt>
              <dd>{NICHES.length} styles across knowledge, money, lifestyle, and more</dd>
            </div>
            <div>
              <dt>How PNG works</dt>
              <dd>Your browser draws a canvas, then downloads it. Nothing is uploaded.</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>
                {WIDTH}×{HEIGHT} YouTube standard
              </dd>
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

            <label>
              Find your channel type
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="travel, gaming, cooking, news…"
              />
            </label>

            <fieldset>
              <legend>Channel type ({visible.length})</legend>
              <div className="niche-board">
                {visible.length === 0 ? (
                  <p className="empty">No match. Try “tech”, “travel”, or “fitness”.</p>
                ) : (
                  NICHE_GROUPS.map((group) => {
                    const items = visible.filter((item) => item.group === group)
                    if (items.length === 0) return null
                    return (
                      <div key={group} className="niche-group">
                        <p className="group-label">{group}</p>
                        <div className="niches">
                          {items.map((item) => (
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
                      </div>
                    )
                  })
                )}
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
              <p className="hint">
                {status || 'Click Download PNG to save the preview to your computer.'}
              </p>
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
          ThumbForge draws the thumbnail in your browser with the Canvas API, then triggers a normal
          file download. Free exports keep a small watermark.
        </p>
      </footer>
    </div>
  )
}
