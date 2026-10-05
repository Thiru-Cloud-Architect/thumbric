import { useEffect, useMemo, useRef, useState } from 'react'
import {
  NICHE_GROUPS,
  NICHES,
  type NicheId,
  filterNiches,
  getNiche,
} from './niches'
import { downloadThumbnail, renderThumbnail } from './render'
import { STICKERS, type StickerId } from './stickers'
import './App.css'

const SAMPLES = [
  {
    niche: 'tech' as NicheId,
    tag: 'AI TOOLS',
    title: 'I built an agent that reviews production PRs',
    stickers: ['new', 'arrow'] as StickerId[],
  },
  {
    niche: 'finance' as NicheId,
    tag: 'SALARY',
    title: 'How I saved 3 lakhs without cutting fun',
    stickers: ['rupee', 'wow'] as StickerId[],
  },
  {
    niche: 'travel' as NicheId,
    tag: 'TRIP',
    title: '48 hours in Chennai on a student budget',
    stickers: ['fire', 'click'] as StickerId[],
  },
  {
    niche: 'fitness' as NicheId,
    tag: 'TRAIN',
    title: 'Home workout that actually keeps you consistent',
    stickers: ['wow', 'arrow'] as StickerId[],
  },
]

const POPULAR: NicheId[] = ['tech', 'finance', 'gaming', 'cooking', 'travel', 'fitness', 'education', 'vlog']

export default function App() {
  const [nicheId, setNicheId] = useState<NicheId>('tech')
  const [title, setTitle] = useState(SAMPLES[0].title)
  const [tag, setTag] = useState(SAMPLES[0].tag)
  const [query, setQuery] = useState('')
  const [showAllLooks, setShowAllLooks] = useState(false)
  const [stickers, setStickers] = useState<StickerId[]>(SAMPLES[0].stickers)
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [status, setStatus] = useState('Follow the 3 steps, then tap Save image.')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const niche = useMemo(() => getNiche(nicheId), [nicheId])

  const lookList = useMemo(() => {
    if (query.trim()) return filterNiches(query)
    if (showAllLooks) return NICHES
    return POPULAR.map((id) => getNiche(id))
  }, [query, showAllLooks])

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderThumbnail(ctx, {
      title,
      tag,
      niche,
      watermark: true,
      photo,
      stickers,
    })
  }, [title, tag, niche, photo, stickers])

  function applySample(index: number) {
    const sample = SAMPLES[index]
    setNicheId(sample.niche)
    setTitle(sample.title)
    setTag(sample.tag)
    setStickers(sample.stickers)
    setQuery('')
    setStatus('Sample loaded. Change the title or add your photo, then Save image.')
  }

  function toggleSticker(id: StickerId) {
    setStickers((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length >= 3) return [...current.slice(1), id]
      return [...current, id]
    })
  }

  function onPickPhoto(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setStatus('Please choose a photo file (JPG or PNG).')
      return
    }
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      setPhoto(image)
      setPhotoUrl(url)
      setPhotoName(file.name)
      setStatus('Photo added. Edit your title if you want, then Save image.')
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      setStatus('That photo could not be opened. Try another JPG or PNG.')
    }
    image.src = url
  }

  function clearPhoto() {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhoto(null)
    setPhotoUrl('')
    setPhotoName('')
    if (fileRef.current) fileRef.current.value = ''
    setStatus('Photo removed. You can still save the colorful style thumbnail.')
  }

  function onDownload() {
    try {
      downloadThumbnail({ title, tag, niche, watermark: true, photo, stickers })
      setStatus('Saved! Check your Downloads folder for thumbforge-youtube.png')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save the image.')
    }
  }

  return (
    <div className="page">
      <header className="top">
        <a className="brand" href="#top">
          ThumbForge
        </a>
        <p className="tagline">Make a YouTube thumbnail in 3 easy steps</p>
      </header>

      <main id="top">
        <section className="hero">
          <div>
            <p className="kicker">Free · No signup · Works on phone too</p>
            <h1>Make a clickable thumbnail</h1>
            <p className="lede">
              Pick a look, write your title, optionally add your photo, then tap Save image. Your
              picture never leaves this device.
            </p>
          </div>
          <ol className="steps-hero">
            <li>
              <strong>1</strong> Pick a look
            </li>
            <li>
              <strong>2</strong> Add title + photo
            </li>
            <li>
              <strong>3</strong> Save the image
            </li>
          </ol>
        </section>

        <section className="workbench" aria-label="Thumbnail maker">
          <form
            className="controls"
            onSubmit={(event) => {
              event.preventDefault()
              onDownload()
            }}
          >
            <div className="samples" role="group" aria-label="Try a ready example">
              <span className="soft-label">Try an example</span>
              {SAMPLES.map((sample, index) => (
                <button
                  key={sample.title}
                  type="button"
                  className="chip"
                  onClick={() => applySample(index)}
                >
                  Example {index + 1}
                </button>
              ))}
            </div>

            <section className="step">
              <header>
                <span className="step-num">1</span>
                <div>
                  <h2>Pick a look</h2>
                  <p>Choose the style that matches your channel.</p>
                </div>
              </header>

              <label className="search">
                Search looks
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Type travel, cooking, gaming…"
                />
              </label>

              <div className="niche-board">
                {lookList.length === 0 ? (
                  <p className="empty">No match. Try “travel” or “finance”.</p>
                ) : showAllLooks || query ? (
                  NICHE_GROUPS.map((group) => {
                    const items = lookList.filter((item) => item.group === group)
                    if (!items.length) return null
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
                ) : (
                  <div className="niches">
                    {lookList.map((item) => (
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
                )}
              </div>

              {!query && (
                <button
                  type="button"
                  className="linkish"
                  onClick={() => setShowAllLooks((value) => !value)}
                >
                  {showAllLooks ? 'Show popular looks only' : `Show all ${NICHES.length} looks`}
                </button>
              )}
            </section>

            <section className="step">
              <header>
                <span className="step-num">2</span>
                <div>
                  <h2>Add your words and photo</h2>
                  <p>Short titles work best. Photo is optional but looks stronger.</p>
                </div>
              </header>

              <label>
                Short tag (top line)
                <input
                  value={tag}
                  maxLength={18}
                  onChange={(event) => setTag(event.target.value)}
                  placeholder={niche.badge}
                />
              </label>

              <label>
                Video title
                <textarea
                  value={title}
                  maxLength={70}
                  rows={3}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Write the title people should notice"
                />
              </label>

              <div className="photo-box">
                <div>
                  <p className="photo-title">Your photo (optional)</p>
                  <p className="photo-help">
                    Use a clear face or object photo. JPG or PNG. Stays on your device.
                  </p>
                  {photoName ? <p className="photo-name">Selected: {photoName}</p> : null}
                </div>
                <div className="photo-actions">
                  <button type="button" className="chip solid" onClick={() => fileRef.current?.click()}>
                    {photo ? 'Change photo' : 'Add photo'}
                  </button>
                  {photo ? (
                    <button type="button" className="chip" onClick={clearPhoto}>
                      Remove
                    </button>
                  ) : null}
                </div>
                <input
                  ref={fileRef}
                  className="file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => onPickPhoto(event.target.files?.[0])}
                />
              </div>

              <fieldset>
                <legend>Stickers (tap up to 3)</legend>
                <div className="sticker-row">
                  {STICKERS.map((sticker) => (
                    <button
                      key={sticker.id}
                      type="button"
                      className={stickers.includes(sticker.id) ? 'sticker active' : 'sticker'}
                      aria-pressed={stickers.includes(sticker.id)}
                      onClick={() => toggleSticker(sticker.id)}
                      title={sticker.hint}
                    >
                      {sticker.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </section>

            <section className="step save-step">
              <header>
                <span className="step-num">3</span>
                <div>
                  <h2>Save your thumbnail</h2>
                  <p>This downloads a YouTube-size PNG to your computer or phone.</p>
                </div>
              </header>
              <div className="actions">
                <button type="submit" className="primary">
                  Save image
                </button>
                <p className="hint" role="status">
                  {status}
                </p>
              </div>
            </section>
          </form>

          <div className="preview-panel">
            <p className="preview-label">Live preview</p>
            <div className="preview-wrap">
              <canvas
                ref={canvasRef}
                className="preview"
                width={1280}
                height={720}
                aria-label="Thumbnail preview"
              />
            </div>
            <p className="preview-note">What you see here is what gets saved.</p>
          </div>
        </section>
      </main>

      <footer>
        <p>
          Tip: big face + short title + one sticker usually gets more clicks than long sentences.
        </p>
      </footer>
    </div>
  )
}
