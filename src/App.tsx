import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
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
import { FONTS, FONT_SIZES, type FontId, type FontSizeId } from './fonts'
import { COLOR_PRESETS, LAYOUTS, PHOTO_SHAPES, type LayoutId, type PhotoShapeId } from './layout'
import {
  NICHE_GROUPS,
  NICHES,
  type NicheId,
  filterNiches,
  getNiche,
} from './niches'
import { PLATFORMS, type PlatformId, getPlatform } from './platforms'
import {
  defaultTextPosition,
  downloadThumbnail,
  hitTestSticker,
  hitTestTextBlock,
  renderThumbnail,
} from './render'
import { TEXT_STYLES, type TextStyleId } from './textStyle'
import { THUMB_TEMPLATES, type TemplateId } from './templates'
import {
  DEFAULT_STICKER_SLOTS,
  STICKERS,
  clampStickerPos,
  type PlacedSticker,
  type StickerId,
} from './stickers'
import './App.css'

const SAMPLES = [
  {
    niche: 'tech' as NicheId,
    tag: 'AI TOOLS',
    title: 'I built an agent that reviews production PRs',
    stickers: [
      { id: 'new' as StickerId, x: 0.78, y: 0.2 },
      { id: 'arrow' as StickerId, x: 0.7, y: 0.48 },
    ],
    platform: 'youtube' as PlatformId,
    layout: 'photo-left' as LayoutId,
    fontId: 'bebas' as FontId,
    fontSizeId: 'L' as FontSizeId,
  },
  {
    niche: 'finance' as NicheId,
    tag: 'SALARY',
    title: 'How I saved 3 lakhs without cutting fun',
    stickers: [
      { id: 'rupee' as StickerId, x: 0.76, y: 0.22 },
      { id: 'wow' as StickerId, x: 0.68, y: 0.7 },
    ],
    platform: 'linkedin' as PlatformId,
    layout: 'photo-right' as LayoutId,
    fontId: 'oswald' as FontId,
    fontSizeId: 'M' as FontSizeId,
  },
  {
    niche: 'travel' as NicheId,
    tag: 'TRIP',
    title: '48 hours in Chennai on a student budget',
    stickers: [
      { id: 'fire' as StickerId, x: 0.74, y: 0.18 },
      { id: 'click' as StickerId, x: 0.66, y: 0.72 },
    ],
    platform: 'shorts' as PlatformId,
    layout: 'photo-top' as LayoutId,
    fontId: 'anton' as FontId,
    fontSizeId: 'L' as FontSizeId,
  },
]

const POPULAR: NicheId[] = ['tech', 'finance', 'gaming', 'cooking', 'travel', 'fitness', 'education', 'vlog']

type PreviewMode = 'normal' | 'squint' | 'dark'
type DragTarget = 'sticker' | 'text' | null

export default function App() {
  const [platformId, setPlatformId] = useState<PlatformId>('youtube')
  const [nicheId, setNicheId] = useState<NicheId>('tech')
  const [layout, setLayout] = useState<LayoutId>('photo-left')
  const [photoShape, setPhotoShape] = useState<PhotoShapeId>('rounded')
  const [accentOverride, setAccentOverride] = useState('')
  const [fontId, setFontId] = useState<FontId>('bebas')
  const [fontSizeId, setFontSizeId] = useState<FontSizeId>('M')
  const [textStyleId, setTextStyleId] = useState<TextStyleId>('classic')
  const [textPos, setTextPos] = useState(() =>
    defaultTextPosition(getPlatform('youtube'), 'photo-left'),
  )
  const [showSafeZones, setShowSafeZones] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('normal')
  const [title, setTitle] = useState(SAMPLES[0].title)
  const [tag, setTag] = useState(SAMPLES[0].tag)
  const [query, setQuery] = useState('')
  const [showAllLooks, setShowAllLooks] = useState(false)
  const [stickers, setStickers] = useState<PlacedSticker[]>(SAMPLES[0].stickers)
  const [activeStickerIndex, setActiveStickerIndex] = useState<number | null>(null)
  const [textSelected, setTextSelected] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [status, setStatus] = useState('Pick where you will post, then follow the steps.')
  const [entitlement, setEntitlement] = useState<Entitlement>(() => loadEntitlement())
  const [modal, setModal] = useState<'none' | 'register' | 'pay'>('none')
  const [emailDraft, setEmailDraft] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const dragIndexRef = useRef<number | null>(null)
  const dragTargetRef = useRef<DragTarget>(null)

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
      fontId,
      fontSizeId,
      textStyleId,
      textPos,
      showSafeZones,
      activeStickerIndex: activeStickerIndex ?? undefined,
      highlightText: textSelected || dragging,
    }),
    [
      title,
      tag,
      niche,
      platform,
      layout,
      photoShape,
      accentOverride,
      photo,
      stickers,
      fontId,
      fontSizeId,
      textStyleId,
      textPos,
      showSafeZones,
      activeStickerIndex,
      textSelected,
      dragging,
    ],
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

  useEffect(() => {
    setTextPos(defaultTextPosition(getPlatform(platformId), layout))
    setTextSelected(false)
  }, [platformId, layout])

  function applyTemplate(id: TemplateId) {
    const template = THUMB_TEMPLATES.find((item) => item.id === id)
    if (!template) return
    setPlatformId(template.platform)
    setLayout(template.layout)
    setFontId(template.fontId)
    setFontSizeId(template.fontSizeId)
    setTextStyleId(template.textStyleId)
    setStickers(
      template.stickers.map((stickerId, index) => ({
        id: stickerId,
        x: DEFAULT_STICKER_SLOTS[index]?.x ?? 0.75,
        y: DEFAULT_STICKER_SLOTS[index]?.y ?? 0.25,
      })),
    )
    setTextPos(defaultTextPosition(getPlatform(template.platform), template.layout))
    setActiveStickerIndex(null)
    setTextSelected(false)
    setStatus(`Template “${template.label}” applied. Drag text or stickers on the preview.`)
  }

  function applySample(index: number) {
    const sample = SAMPLES[index]
    setNicheId(sample.niche)
    setTitle(sample.title)
    setTag(sample.tag)
    setStickers(sample.stickers)
    setPlatformId(sample.platform)
    setLayout(sample.layout)
    setFontId(sample.fontId)
    setFontSizeId(sample.fontSizeId)
    setTextStyleId('classic')
    setTextPos(defaultTextPosition(getPlatform(sample.platform), sample.layout))
    setActiveStickerIndex(null)
    setTextSelected(false)
    setQuery('')
    setStatus('Example loaded. Drag stickers on the preview to move them.')
  }

  function toggleSticker(id: StickerId) {
    const existing = stickers.findIndex((item) => item.id === id)
    if (existing >= 0) {
      setStickers(stickers.filter((item) => item.id !== id))
      setActiveStickerIndex(null)
      setStatus('Sticker removed.')
      return
    }
    const slot = DEFAULT_STICKER_SLOTS[stickers.length % DEFAULT_STICKER_SLOTS.length]
    const next = [...stickers, { id, x: slot.x, y: slot.y }]
    const trimmed = next.length > 3 ? next.slice(next.length - 3) : next
    setStickers(trimmed)
    setActiveStickerIndex(trimmed.length - 1)
    setStatus('Drag the sticker on the preview to place it.')
  }

  function canvasPoint(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    return {
      x: ((event.clientX - rect.left) / rect.width) * platform.width,
      y: ((event.clientY - rect.top) / rect.height) * platform.height,
    }
  }

  function onCanvasPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const point = canvasPoint(event)
    if (!point) return
    const stickerIndex = hitTestSticker(stickers, platform, point.x, point.y)
    if (stickerIndex >= 0) {
      event.currentTarget.setPointerCapture(event.pointerId)
      dragIndexRef.current = stickerIndex
      dragTargetRef.current = 'sticker'
      setActiveStickerIndex(stickerIndex)
      setTextSelected(false)
      setDragging(true)
      setStatus('Drag to move sticker. Release to place.')
      return
    }
    if (hitTestTextBlock(previewInput, point.x, point.y)) {
      event.currentTarget.setPointerCapture(event.pointerId)
      dragTargetRef.current = 'text'
      dragIndexRef.current = null
      setActiveStickerIndex(null)
      setTextSelected(true)
      setDragging(true)
      setStatus('Drag to move title block. Release to place.')
      return
    }
    setActiveStickerIndex(null)
    setTextSelected(false)
  }

  function onCanvasPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const point = canvasPoint(event)
    if (!point) return
    const target = dragTargetRef.current
    if (target === 'sticker') {
      const dragIndex = dragIndexRef.current
      if (dragIndex === null) return
      setStickers((current) =>
        current.map((item, index) =>
          index === dragIndex
            ? {
                ...item,
                x: clampStickerPos(point.x / platform.width),
                y: clampStickerPos(point.y / platform.height),
              }
            : item,
        ),
      )
      event.currentTarget.style.cursor = 'grabbing'
      return
    }
    if (target === 'text') {
      setTextPos({
        x: clampStickerPos(point.x / platform.width),
        y: clampStickerPos(point.y / platform.height),
      })
      event.currentTarget.style.cursor = 'grabbing'
      return
    }

    const hoverSticker = hitTestSticker(stickers, platform, point.x, point.y)
    const hoverText = hitTestTextBlock(previewInput, point.x, point.y)
    event.currentTarget.style.cursor = hoverSticker >= 0 || hoverText ? 'grab' : 'default'
  }

  function onCanvasPointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (dragTargetRef.current === null) return
    dragTargetRef.current = null
    dragIndexRef.current = null
    setDragging(false)
    event.currentTarget.style.cursor = 'grab'
    setStatus('Placed. Drag text or stickers anytime on the preview.')
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
        <p className="tagline">Free YouTube / Shorts / Instagram / LinkedIn thumbnails</p>
      </header>

      <main id="top">
        <section className="hero">
          <div>
            <p className="kicker">Free · No account needed for preview</p>
            <h1>Title in. Thumbnail out.</h1>
            <p className="lede">
              Choose where you will post, pick a look, add your title and photo, then save. Clean
              downloads need a quick email register.
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
              saveMarked()
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
                <legend>Quick templates</legend>
                <div className="choice-row compact">
                  {THUMB_TEMPLATES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="choice"
                      onClick={() => applyTemplate(item.id)}
                    >
                      <span>{item.label}</span>
                      <small>{item.hint}</small>
                    </button>
                  ))}
                </div>
              </fieldset>

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

              <fieldset>
                <legend>Title font</legend>
                <div className="choice-row">
                  {FONTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={item.id === fontId ? 'choice active' : 'choice'}
                      aria-pressed={item.id === fontId}
                      onClick={() => setFontId(item.id)}
                    >
                      <span style={{ fontFamily: item.css, fontWeight: item.weight }}>{item.label}</span>
                      <small>{item.hint}</small>
                    </button>
                  ))}
                </div>
                <div className="choice-row compact sizes">
                  {FONT_SIZES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={item.id === fontSizeId ? 'choice active' : 'choice'}
                      aria-pressed={item.id === fontSizeId}
                      onClick={() => setFontSizeId(item.id)}
                    >
                      <span>{item.label}</span>
                      <small>Size</small>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>Title style</legend>
                <div className="choice-row compact">
                  {TEXT_STYLES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={item.id === textStyleId ? 'choice active' : 'choice'}
                      aria-pressed={item.id === textStyleId}
                      onClick={() => setTextStyleId(item.id)}
                    >
                      <span>{item.label}</span>
                      <small>{item.hint}</small>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="linkish"
                  onClick={() => {
                    setTextPos(defaultTextPosition(platform, layout))
                    setTextSelected(false)
                    setStatus('Title position reset to the default for this layout.')
                  }}
                >
                  Reset title position on preview
                </button>
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
                <legend>Stickers (tap up to 3, then drag on preview)</legend>
                <div className="sticker-row">
                  {STICKERS.map((sticker) => (
                    <button
                      key={sticker.id}
                      type="button"
                      className={
                        stickers.some((item) => item.id === sticker.id) ? 'sticker active' : 'sticker'
                      }
                      aria-pressed={stickers.some((item) => item.id === sticker.id)}
                      onClick={() => toggleSticker(sticker.id)}
                      title={sticker.hint}
                    >
                      {sticker.label}
                    </button>
                  ))}
                </div>
                <p className="photo-help">
                  Drag the title block or stickers directly on the live preview.
                </p>
              </fieldset>
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
              {dragging ? ' · dragging' : ' · drag title & stickers'}
            </p>
            <div className="preview-tools" role="group" aria-label="Preview checks">
              <button
                type="button"
                className={previewMode === 'normal' ? 'chip solid' : 'chip'}
                onClick={() => setPreviewMode('normal')}
              >
                Full size
              </button>
              <button
                type="button"
                className={previewMode === 'squint' ? 'chip solid' : 'chip'}
                onClick={() => setPreviewMode('squint')}
              >
                Mobile squint
              </button>
              <button
                type="button"
                className={previewMode === 'dark' ? 'chip solid' : 'chip'}
                onClick={() => setPreviewMode('dark')}
              >
                Dark feed
              </button>
              <button
                type="button"
                className={showSafeZones ? 'chip solid' : 'chip'}
                aria-pressed={showSafeZones}
                onClick={() => setShowSafeZones((value) => !value)}
              >
                Safe zones
              </button>
            </div>
            <div
              className={`preview-shell preview-mode-${previewMode}`}
            >
              <div
                className={`preview-wrap ${platform.orientation}${previewMode === 'squint' ? ' squint' : ''}`}
                style={{ aspectRatio: `${platform.width} / ${platform.height}` }}
              >
                <canvas
                  ref={canvasRef}
                  className="preview interactive"
                  width={platform.width}
                  height={platform.height}
                  aria-label="Thumbnail preview. Drag title and stickers to move them."
                  onPointerDown={onCanvasPointerDown}
                  onPointerMove={onCanvasPointerMove}
                  onPointerUp={onCanvasPointerUp}
                  onPointerCancel={onCanvasPointerUp}
                />
              </div>
            </div>
            <p className="preview-note">
              Squint mode mimics a small feed tile (~168px). Safe zones mark edges and the YouTube
              duration corner. Overlays are preview-only — not saved on download.
            </p>
          </div>
        </section>

        <section className="faq" aria-labelledby="faq-title">
          <h2 id="faq-title">Free YouTube & Shorts thumbnail maker (FAQ)</h2>
          <dl>
            <div>
              <dt>What is ThumbForge?</dt>
              <dd>
                A free browser thumbnail maker for YouTube (1280×720), Shorts/Reels, Instagram,
                LinkedIn, and Facebook. Your photo stays on your device until you download the PNG.
              </dd>
            </div>
            <div>
              <dt>Do I need an account?</dt>
              <dd>
                No account for unlimited free preview downloads. Register with email for two clean
                downloads without the preview mark, then an optional paid plan.
              </dd>
            </div>
            <div>
              <dt>How is this different from Canva?</dt>
              <dd>
                ThumbForge is focused on speed: pick platform size, niche look, title, photo, drag
                stickers and text, export. No template library yet — built for creators who want a
                thumbnail in under a minute.
              </dd>
            </div>
            <div>
              <dt>What file do I get?</dt>
              <dd>
                A PNG sized for the platform you chose. Upload it as your custom thumbnail in
                YouTube Studio or your social app.
              </dd>
            </div>
          </dl>
          <p className="faq-link">
            Share feedback: open the{' '}
            <a href="https://github.com/Thiru-Cloud-Architect/thumbforge" rel="noopener noreferrer">
              GitHub repo
            </a>
            .
          </p>
        </section>
      </main>

      <footer>
        <p>
          Tip: use Mobile squint before you publish — if you cannot read the title, shorten it or
          bump the font size.
        </p>
        <p className="build-tag">ThumbForge UI build 2026.10.05-f</p>
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
