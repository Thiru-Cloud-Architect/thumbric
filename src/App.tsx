import { useEffect, useMemo, useRef, useState } from 'react'
import { COLOR_PRESETS, LAYOUTS, PHOTO_SHAPES, type LayoutId, type PhotoShapeId } from './layout'
import {
  NICHE_GROUPS,
  NICHES,
  type NicheId,
  filterNiches,
  getNiche,
} from './niches'
import { PLATFORMS, type PlatformId, getPlatform } from './platforms'
import { downloadThumbnail, renderThumbnail } from './render'
import { STICKERS, type StickerId } from './stickers'
import './App.css'

const SAMPLES = [
  {
    niche: 'tech' as NicheId,
    tag: 'AI TOOLS',
    title: 'I built an agent that reviews production PRs',
    stickers: ['new', 'arrow'] as StickerId[],
    platform: 'youtube' as PlatformId,
    layout: 'photo-left' as LayoutId,
  },
  {
    niche: 'finance' as NicheId,
    tag: 'SALARY',
    title: 'How I saved 3 lakhs without cutting fun',
    stickers: ['rupee', 'wow'] as StickerId[],
    platform: 'linkedin' as PlatformId,
    layout: 'photo-right' as LayoutId,
  },
  {
    niche: 'travel' as NicheId,
    tag: 'TRIP',
    title: '48 hours in Chennai on a student budget',
    stickers: ['fire', 'click'] as StickerId[],
    platform: 'shorts' as PlatformId,
    layout: 'photo-top' as LayoutId,
  },
]

const POPULAR: NicheId[] = ['tech', 'finance', 'gaming', 'cooking', 'travel', 'fitness', 'education', 'vlog']

export default function App() {
  const [platformId, setPlatformId] = useState<PlatformId>('youtube')
  const [nicheId, setNicheId] = useState<NicheId>('tech')
  const [layout, setLayout] = useState<LayoutId>('photo-left')
  const [photoShape, setPhotoShape] = useState<PhotoShapeId>('rounded')
  const [accentOverride, setAccentOverride] = useState('')
  const [title, setTitle] = useState(SAMPLES[0].title)
  const [tag, setTag] = useState(SAMPLES[0].tag)
  const [query, setQuery] = useState('')
  const [showAllLooks, setShowAllLooks] = useState(false)
  const [stickers, setStickers] = useState<StickerId[]>(SAMPLES[0].stickers)
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [status, setStatus] = useState('Pick where you will post, then follow the steps.')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const niche = useMemo(() => getNiche(nicheId), [nicheId])
  const platform = useMemo(() => getPlatform(platformId), [platformId])
  const lookList = useMemo(() => {
    if (query.trim()) return filterNiches(query)
    if (showAllLooks) return NICHES
    return POPULAR.map((id) => getNiche(id))
  }, [query, showAllLooks])

  const input = useMemo(
    () => ({
      title,
      tag,
      niche,
      platform,
      layout,
      photoShape,
      accentOverride,
      watermark: true,
      photo,
      stickers,
    }),
    [title, tag, niche, platform, layout, photoShape, accentOverride, photo, stickers],
  )

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = platform.width
    canvas.height = platform.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderThumbnail(ctx, input)
  }, [input, platform.width, platform.height])

  useEffect(() => {
    if (platform.orientation === 'vertical' && layout === 'photo-left') {
      setLayout('photo-top')
    }
  }, [platform.orientation, layout])

  function applySample(index: number) {
    const sample = SAMPLES[index]
    setNicheId(sample.niche)
    setTitle(sample.title)
    setTag(sample.tag)
    setStickers(sample.stickers)
    setPlatformId(sample.platform)
    setLayout(sample.layout)
    setQuery('')
    setStatus('Example loaded. Change anything you want, then Save image.')
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
      setStatus('Photo added. You can change its shape below.')
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
    setStatus('Photo removed.')
  }

  function onDownload() {
    try {
      downloadThumbnail(input)
      setStatus(`Saved! Look in Downloads for thumbforge-${platform.id}.png`)
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
        <p className="tagline">Thumbnails for YouTube, Shorts, Instagram, LinkedIn & Facebook</p>
      </header>

      <main id="top">
        <section className="hero">
          <div>
            <p className="kicker">Free · No signup · Photo stays on your device</p>
            <h1>Make a clickable thumbnail</h1>
            <p className="lede">
              Choose the app you post on, move the photo, change colors and shape, then save. Made
              simple for everyone — not only tech people.
            </p>
          </div>
          <ol className="steps-hero">
            <li>
              <strong>1</strong> Choose platform & look
            </li>
            <li>
              <strong>2</strong> Arrange photo & text
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
                  <h2>Where will you post?</h2>
                  <p>This sets the size: horizontal, square, or vertical.</p>
                </div>
              </header>
              <div className="choice-row">
                {PLATFORMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={item.id === platformId ? 'choice active' : 'choice'}
                    aria-pressed={item.id === platformId}
                    onClick={() => setPlatformId(item.id)}
                  >
                    <span>{item.label}</span>
                    <small>
                      {item.orientation} · {item.width}×{item.height}
                    </small>
                  </button>
                ))}
              </div>

              <header className="subhead">
                <div>
                  <h2>Pick a look</h2>
                  <p>Colors and mood for your channel type.</p>
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
                  <h2>Arrange and customize</h2>
                  <p>Move the photo, change its shape, and pick your favorite color.</p>
                </div>
              </header>

              <fieldset>
                <legend>Move photo</legend>
                <div className="choice-row">
                  {LAYOUTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={item.id === layout ? 'choice active' : 'choice'}
                      aria-pressed={item.id === layout}
                      onClick={() => setLayout(item.id)}
                    >
                      <span>{item.label}</span>
                      <small>{item.hint}</small>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>Photo shape</legend>
                <div className="choice-row">
                  {PHOTO_SHAPES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={item.id === photoShape ? 'choice active' : 'choice'}
                      aria-pressed={item.id === photoShape}
                      onClick={() => setPhotoShape(item.id)}
                    >
                      <span>{item.label}</span>
                      <small>{item.hint}</small>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>Accent color</legend>
                <div className="choice-row colors">
                  {COLOR_PRESETS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={
                        (item.value === '' ? accentOverride === '' : accentOverride === item.value)
                          ? 'swatch active'
                          : 'swatch'
                      }
                      aria-pressed={
                        item.value === '' ? accentOverride === '' : accentOverride === item.value
                      }
                      onClick={() => setAccentOverride(item.value)}
                      title={item.label}
                      style={
                        item.value
                          ? { background: item.value, color: '#101820' }
                          : { background: niche.accent, color: '#101820' }
                      }
                    >
                      {item.id === 'look' ? 'Look' : item.label}
                    </button>
                  ))}
                </div>
                <label className="tiny-color">
                  Or pick any color
                  <input
                    type="color"
                    value={accentOverride || niche.accent}
                    onChange={(event) => setAccentOverride(event.target.value)}
                  />
                </label>
              </fieldset>

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
                Title text
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
                    Clear face or object photos work best. JPG or PNG. Stays on your device.
                  </p>
                  {photoName ? <p className="photo-name">Selected: {photoName}</p> : null}
                </div>
                <div className="photo-actions">
                  <button
                    type="button"
                    className="chip solid"
                    onClick={() => fileRef.current?.click()}
                  >
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
                  <p>
                    Downloads a ready PNG for {platform.label} ({platform.width}×{platform.height}).
                  </p>
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
            <p className="preview-label">
              Live preview · {platform.label} · {platform.orientation}
            </p>
            <div
              className={`preview-wrap ${platform.orientation}`}
              style={{ aspectRatio: `${platform.width} / ${platform.height}` }}
            >
              <canvas
                ref={canvasRef}
                className="preview"
                width={platform.width}
                height={platform.height}
                aria-label="Thumbnail preview"
              />
            </div>
            <p className="preview-note">What you see here is what gets saved.</p>
          </div>
        </section>
      </main>

      <footer>
        <p>
          Tip: big face + short title + one sticker usually gets more clicks. We do not ask for your
          name or email to download.
        </p>
      </footer>
    </div>
  )
}
