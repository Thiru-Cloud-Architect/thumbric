import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  FREE_CLEAN_DOWNLOADS,
  PAID_PRICE_LABEL,
  activateDemoPayment,
  canDownloadClean,
  cleanDownloadsLeft,
  consumeCleanDownload,
  isPaid,
  isValidEmail,
  loadEntitlement,
  registerEmail,
  type Entitlement,
} from './entitlement'
import { COLOR_PRESETS, LAYOUTS, PHOTO_SHAPES, type LayoutId, type PhotoShapeId } from './layout'
import {
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
  const [entitlement, setEntitlement] = useState<Entitlement>(() => loadEntitlement())
  const [modal, setModal] = useState<'none' | 'register' | 'pay'>('none')
  const [emailDraft, setEmailDraft] = useState('')
  const [showMore, setShowMore] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const niche = useMemo(() => getNiche(nicheId), [nicheId])
  const platform = useMemo(() => getPlatform(platformId), [platformId])
  const cleanLeft = cleanDownloadsLeft(entitlement)
  const paid = isPaid(entitlement)
  const lookList = useMemo(() => {
    if (query.trim()) return filterNiches(query)
    if (showAllLooks) return NICHES
    return POPULAR.map((id) => getNiche(id))
  }, [query, showAllLooks])

  const previewInput = useMemo(
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
    renderThumbnail(ctx, previewInput)
  }, [previewInput, platform.width, platform.height])

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
    setStatus('Example loaded. Change anything you want, then save.')
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

  function saveMarked() {
    try {
      downloadThumbnail({ ...previewInput, watermark: true })
      setStatus(`Saved free preview. Look in Downloads for thumbforge-${platform.id}.png`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save the image.')
    }
  }

  function requestCleanSave() {
    if (canDownloadClean(entitlement)) {
      saveClean(entitlement)
      return
    }
    if (!entitlement.email) {
      setEmailDraft(entitlement.email)
      setModal('register')
      return
    }
    setModal('pay')
  }

  function saveClean(current: Entitlement = entitlement) {
    try {
      downloadThumbnail({ ...previewInput, watermark: false })
      const next = consumeCleanDownload(current)
      setEntitlement(next)
      const left = cleanDownloadsLeft(next)
      setStatus(
        isPaid(next) || left === Number.POSITIVE_INFINITY
          ? 'Saved clean image (no watermark).'
          : `Saved clean image. ${left} free clean download${left === 1 ? '' : 's'} left.`,
      )
      setModal('none')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save the image.')
    }
  }

  function onRegister(event: FormEvent) {
    event.preventDefault()
    if (!isValidEmail(emailDraft)) {
      setStatus('Enter a valid email to register.')
      return
    }
    const next = registerEmail(emailDraft)
    setEntitlement(next)
    setStatus(
      `Registered as ${next.email}. You get ${FREE_CLEAN_DOWNLOADS} free clean downloads.`,
    )
    if (canDownloadClean(next)) {
      saveClean(next)
      return
    }
    setModal('none')
  }

  function onDemoPay() {
    if (!entitlement.email) {
      setModal('register')
      return
    }
    const next = activateDemoPayment(entitlement)
    setEntitlement(next)
    setModal('none')
    setStatus(`Payment unlocked for 30 days at ${PAID_PRICE_LABEL}. Clean downloads are unlimited.`)
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
            <p className="kicker">Free · Simple · Works on phone</p>
            <h1>Make a clickable thumbnail</h1>
            <p className="lede">
              Pick where you post, type a title, add a photo if you want, then save. Extra style
              options stay tucked away until you need them.
            </p>
          </div>
          <ol className="steps-hero">
            <li>
              <strong>1</strong> Platform + look
            </li>
            <li>
              <strong>2</strong> Title + photo
            </li>
            <li>
              <strong>3</strong> Save
            </li>
          </ol>
        </section>

        <section className="workbench" aria-label="Thumbnail maker">
          <form
            className="controls"
            onSubmit={(event) => {
              event.preventDefault()
              saveMarked()
            }}
          >
            <div className="samples" role="group" aria-label="Try a ready example">
              <span className="soft-label">Quick start</span>
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
                  <h2>Platform & look</h2>
                  <p>Choose the app size, then a color mood.</p>
                </div>
              </header>
              <div className="choice-row compact">
                {PLATFORMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={item.id === platformId ? 'choice active' : 'choice'}
                    aria-pressed={item.id === platformId}
                    onClick={() => setPlatformId(item.id)}
                  >
                    <span>{item.label}</span>
                    <small>{item.orientation}</small>
                  </button>
                ))}
              </div>
              <div className="niches">
                {(showAllLooks || query ? lookList : POPULAR.map((id) => getNiche(id))).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={item.id === nicheId ? 'niche active' : 'niche'}
                    aria-pressed={item.id === nicheId}
                    onClick={() => setNicheId(item.id)}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="linkish"
                onClick={() => setShowAllLooks((value) => !value)}
              >
                {showAllLooks ? 'Fewer looks' : 'More looks'}
              </button>
            </section>

            <section className="step">
              <header>
                <span className="step-num">2</span>
                <div>
                  <h2>Your words & photo</h2>
                  <p>Keep the title short. Photo is optional.</p>
                </div>
              </header>

              <label>
                Title
                <textarea
                  value={title}
                  maxLength={70}
                  rows={2}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What should people notice?"
                />
              </label>

              <label>
                Small tag
                <input
                  value={tag}
                  maxLength={18}
                  onChange={(event) => setTag(event.target.value)}
                  placeholder={niche.badge}
                />
              </label>

              <div className="photo-box">
                <div>
                  <p className="photo-title">Photo (optional)</p>
                  <p className="photo-help">JPG or PNG. Stays on your device.</p>
                  {photoName ? <p className="photo-name">{photoName}</p> : null}
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
                <legend>Stickers (up to 3)</legend>
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

              <button
                type="button"
                className="linkish"
                onClick={() => setShowMore((value) => !value)}
              >
                {showMore ? 'Hide extra options' : 'More options: move photo, shape, color'}
              </button>

              {showMore ? (
                <div className="more-box">
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
                            (item.value === ''
                              ? accentOverride === ''
                              : accentOverride === item.value)
                              ? 'swatch active'
                              : 'swatch'
                          }
                          aria-pressed={
                            item.value === ''
                              ? accentOverride === ''
                              : accentOverride === item.value
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
                      Custom color
                      <input
                        type="color"
                        value={accentOverride || niche.accent}
                        onChange={(event) => setAccentOverride(event.target.value)}
                      />
                    </label>
                  </fieldset>

                  <label className="search">
                    Search more looks
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="travel, cooking, news…"
                    />
                  </label>
                </div>
              ) : null}
            </section>

            <section className="step save-step">
              <header>
                <span className="step-num">3</span>
                <div>
                  <h2>Save your thumbnail</h2>
                  <p>
                    Free saves keep a mark on the photo (hard to crop away). Register for{' '}
                    {FREE_CLEAN_DOWNLOADS} clean downloads, then {PAID_PRICE_LABEL}.
                  </p>
                </div>
              </header>

              <div className="plan-box">
                <p>
                  {paid
                    ? `Paid plan active for ${entitlement.email}`
                    : entitlement.email
                      ? `Signed in as ${entitlement.email} · ${
                          cleanLeft === Number.POSITIVE_INFINITY
                            ? 'unlimited clean downloads'
                            : `${cleanLeft} clean download${cleanLeft === 1 ? '' : 's'} left`
                        }`
                      : 'Not registered yet · free preview downloads unlimited'}
                </p>
              </div>

              <div className="actions">
                <button type="submit" className="primary">
                  Save free preview
                </button>
                <button type="button" className="chip solid" onClick={requestCleanSave}>
                  Save clean (no mark)
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
            <p className="preview-note">
              Free mark sits at the bottom of the photo. Clean files remove it after register / pay.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <p>
          Tip: big face + short title + one sticker usually gets more clicks. Clean downloads need
          email registration first.
        </p>
        <p className="build-tag">ThumbForge UI build 2026.10.05-c</p>
      </footer>

      {modal !== 'none' ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setModal('none')}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            {modal === 'register' ? (
              <form onSubmit={onRegister}>
                <h2 id="modal-title">Register to remove the mark</h2>
                <p>
                  Free users can always save a preview. After you register with email, you get{' '}
                  {FREE_CLEAN_DOWNLOADS} clean downloads with no watermark.
                </p>
                <label>
                  Email
                  <input
                    type="email"
                    value={emailDraft}
                    onChange={(event) => setEmailDraft(event.target.value)}
                    placeholder="you@email.com"
                    required
                    autoFocus
                  />
                </label>
                <div className="actions">
                  <button type="submit" className="primary">
                    Register & save clean
                  </button>
                  <button type="button" className="chip" onClick={() => setModal('none')}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h2 id="modal-title">Continue with a small payment</h2>
                <p>
                  You used your {FREE_CLEAN_DOWNLOADS} free clean downloads
                  {entitlement.email ? ` on ${entitlement.email}` : ''}. Unlock unlimited clean
                  downloads for {PAID_PRICE_LABEL}.
                </p>
                <p className="hint">
                  Stripe checkout can be connected next. For now this unlocks a 30-day demo on this
                  browser.
                </p>
                <div className="actions">
                  <button type="button" className="primary" onClick={onDemoPay}>
                    Unlock {PAID_PRICE_LABEL}
                  </button>
                  <button type="button" className="chip" onClick={() => setModal('none')}>
                    Not now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
