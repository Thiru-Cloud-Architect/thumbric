import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { flushSync } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  CREATOR_CLEAN_DOWNLOADS_PER_MONTH,
  activateDemoPlan,
  canDownloadClean,
  cleanDownloadsLeft,
  consumeCleanDownload,
  entitlementStatusLabel,
  isValidEmail,
  loadEntitlement,
  registerEmail,
  type Entitlement,
} from './entitlement'
import {
  DEFAULT_TITLE_FONT_SIZE,
  FONTS,
  TITLE_FONT_SIZE_MAX,
  TITLE_FONT_SIZE_MIN,
  clampTitleFontSize,
  type FontId,
} from './fonts'
import {
  FaqAccordion,
  FeaturesSection,
  HeroFlashy,
  HowItWorks,
  PricingTeaser,
  ProblemSection,
  SiteFooter,
  StatsStrip,
  Testimonials,
} from './LandingSections'
import { LazyReveal } from './LazyReveal'
import { PlushInfoSection } from './PlushInfoSection'
import { SiteHeader } from './SiteHeader'
import { planPriceLabel } from './plans'
import { COLOR_PRESETS, LAYOUTS, PHOTO_SHAPES, type LayoutId, type PhotoShapeId } from './layout'
import {
  NICHE_GROUPS,
  NICHES,
  type NicheId,
  filterNiches,
  getNiche,
} from './niches'
import { pickQuickIdea } from './quickIdeas'
import { PLATFORMS, type PlatformId, getPlatform } from './platforms'
import { TEXT_STYLES, type TextStyleId } from './textStyle'
import {
  clampTextPosition,
  defaultTextPosition,
  downloadThumbnail,
  hitTestSticker,
  hitTestTextBlock,
  renderThumbnail,
} from './render'
import { THUMB_TEMPLATES, type TemplateId } from './templates'
import {
  DEFAULT_STICKER_SLOTS,
  STICKERS,
  clampStickerPos,
  type PlacedSticker,
  type StickerId,
} from './stickers'
import { generateAiThumbnailImage, titleFromScene } from './aiThumbnail'
import {
  loadSimpleUser,
  registerSimpleUser,
  type SimpleUser,
} from './simpleAuth'
import { DOWNLOAD_PREFIX, PRODUCT_NAME_FULL, UI_BUILD } from './brand'
import {
  HASH_NAV_EVENT,
  focusHashTarget,
  normalizeHash,
  scrollToElementId,
  type HashNavDetail,
} from './nav'
import './App.css'

const POPULAR: NicheId[] = ['tech', 'finance', 'gaming', 'cooking', 'travel', 'fitness', 'education', 'vlog']

type DragTarget = 'sticker' | 'text' | null
type EditorTab = 'setup' | 'title' | 'polish'

export default function HomePage() {
  const [platformId, setPlatformId] = useState<PlatformId>('youtube')
  const [nicheId, setNicheId] = useState<NicheId>('tech')
  const [layout, setLayout] = useState<LayoutId>('photo-left')
  const [photoShape, setPhotoShape] = useState<PhotoShapeId>('rounded')
  const [accentOverride, setAccentOverride] = useState('')
  const [fontId, setFontId] = useState<FontId>('bebas')
  const [textStyleId, setTextStyleId] = useState<TextStyleId>('classic')
  const [titleFontSizePx, setTitleFontSizePx] = useState(DEFAULT_TITLE_FONT_SIZE)
  const [textPos, setTextPos] = useState(() =>
    defaultTextPosition(getPlatform('youtube'), 'photo-left'),
  )
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [query, setQuery] = useState('')
  const [showAllLooks, setShowAllLooks] = useState(false)
  const [stickers, setStickers] = useState<PlacedSticker[]>([])
  const [activeStickerIndex, setActiveStickerIndex] = useState<number | null>(null)
  const [textSelected, setTextSelected] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [status, setStatus] = useState('Start with platform and look — preview starts clean with no stickers.')
  const [entitlement, setEntitlement] = useState<Entitlement>(() => loadEntitlement())
  const [modal, setModal] = useState<'none' | 'register' | 'pay' | 'login'>('none')
  const [emailDraft, setEmailDraft] = useState('')
  const [nameDraft, setNameDraft] = useState('')
  const [simpleUser, setSimpleUser] = useState<SimpleUser | null>(() => loadSimpleUser())
  const [aiHint, setAiHint] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  /** Local feedback beside Generate — Download status alone is easy to miss. */
  const [aiStatus, setAiStatus] = useState<{ kind: 'idle' | 'busy' | 'ok' | 'err'; text: string }>({
    kind: 'idle',
    text: '',
  })
  const [editorTab, setEditorTab] = useState<EditorTab>(() => {
    const hash = normalizeHash(typeof window !== 'undefined' ? window.location.hash : '')
    return hash === 'editor-ai' || hash === 'editor-title' ? 'title' : 'setup'
  })
  const aiAbortRef = useRef<AbortController | null>(null)
  const aiRunIdRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const dragIndexRef = useRef<number | null>(null)
  const dragTargetRef = useRef<DragTarget>(null)

  const niche = useMemo(() => getNiche(nicheId), [nicheId])
  const platform = useMemo(() => getPlatform(platformId), [platformId])
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
      titleFontSizePx,
      textStyleId,
      textPos,
      showSafeZones: false,
      activeStickerIndex: activeStickerIndex ?? undefined,
      highlightText: textSelected,
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
      titleFontSizePx,
      textStyleId,
      textPos,
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
    const openFromHash = (rawHash?: string) => {
      const hash = normalizeHash(rawHash ?? window.location.hash)
      if (!hash) return

      // Commit the Title tab before scrolling — #editor-ai only mounts on that tab.
      if (hash === 'editor-ai' || hash === 'editor-title') {
        flushSync(() => setEditorTab('title'))
      } else if (hash === 'editor') {
        flushSync(() => setEditorTab('setup'))
      }

      void (async () => {
        const el = await scrollToElementId(hash, { attempts: 60 })
        if (el) focusHashTarget(hash)
      })()
    }

    const onHashChange = () => openFromHash()
    const onHashNav = (event: Event) => {
      const detail = (event as CustomEvent<HashNavDetail>).detail
      openFromHash(detail?.hash)
    }

    openFromHash()
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener(HASH_NAV_EVENT, onHashNav)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener(HASH_NAV_EVENT, onHashNav)
    }
  }, [])

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
    const nextPlatform = getPlatform(platformId)
    if (nextPlatform.orientation === 'vertical' && layout === 'photo-left') {
      setLayout('photo-top')
      return
    }
    if (nextPlatform.orientation !== 'vertical' && layout === 'photo-top') {
      setLayout('photo-left')
    }
  }, [platformId, platform.orientation, layout])

  useEffect(() => {
    const scrollY = window.scrollY
    setTextPos(defaultTextPosition(getPlatform(platformId), layout))
    setTextSelected(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY)
      })
    })
  }, [platformId, layout])

  useEffect(() => {
    void Promise.all(
      FONTS.map((item) =>
        document.fonts.load(`${item.weight} 18px ${item.css}`).catch(() => undefined),
      ),
    )
  }, [])

  function applyTemplate(id: TemplateId) {
    const template = THUMB_TEMPLATES.find((item) => item.id === id)
    if (!template) return
    setPlatformId(template.platform)
    setLayout(template.layout)
    setFontId(template.fontId)
    setTextStyleId(template.textStyleId)
    setTitleFontSizePx(template.titleFontSizePx)
    setStickers([])
    setTextPos(defaultTextPosition(getPlatform(template.platform), template.layout))
    setActiveStickerIndex(null)
    setTextSelected(false)
    setStatus(`Template “${template.label}” applied. Drag text or stickers on the preview.`)
  }

  function applyQuickIdea() {
    const idea = pickQuickIdea(platform)
    setNicheId(idea.nicheId)
    setLayout(idea.layout)
    setFontId(idea.fontId)
    setTextStyleId(idea.textStyleId)
    setPhotoShape(idea.photoShape)
    setAccentOverride('')
    setStickers([])
    setActiveStickerIndex(null)
    setTextSelected(false)
    setTextPos(defaultTextPosition(platform, idea.layout))
    const look = getNiche(idea.nicheId)
    setStatus(
      `Quick idea: ${look.label} · ${LAYOUTS.find((item) => item.id === idea.layout)?.label ?? idea.layout}. Edit title on the preview.`,
    )
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
      event.currentTarget.classList.add('is-dragging')
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
      event.currentTarget.classList.add('is-dragging')
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
      setTextPos(
        clampTextPosition(platform, layout, {
          x: point.x / platform.width,
          y: point.y / platform.height,
        }),
      )
      event.currentTarget.style.cursor = 'grabbing'
      return
    }

    const hoverSticker = hitTestSticker(stickers, platform, point.x, point.y)
    const hoverText = hitTestTextBlock(previewInput, point.x, point.y)
    event.currentTarget.style.cursor = hoverSticker >= 0 || hoverText ? 'grab' : 'default'
  }

  function onCanvasPointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    event.currentTarget.classList.remove('is-dragging')
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

  async function runAiThumbnail() {
    if (aiBusy) return
    aiAbortRef.current?.abort()
    const controller = new AbortController()
    const runId = ++aiRunIdRef.current
    aiAbortRef.current = controller
    setAiBusy(true)
    const busyMsg = 'Generating free AI scene… usually 5–20s (may take up to ~45s).'
    setAiStatus({ kind: 'busy', text: busyMsg })
    setStatus(busyMsg)
    try {
      const result = await generateAiThumbnailImage(
        {
          title,
          niche,
          platform,
          hint: aiHint,
        },
        controller.signal,
      )
      if (runId !== aiRunIdRef.current) return
      if (photoUrl) URL.revokeObjectURL(photoUrl)
      setPhoto(result.image)
      setPhotoUrl(result.objectUrl)
      setPhotoName('AI scene')
      // Full-bleed backdrop — not a neon-bordered inset photo-in-photo.
      setLayout('photo-full')
      setPhotoShape('square')
      setStickers([])
      setActiveStickerIndex(null)
      // Empty title → short title from the scene so the canvas is not "YOUR TITLE HERE".
      if (!title.trim()) {
        setTitle(titleFromScene(aiHint, title))
      }
      const okMsg = 'AI backdrop applied full-bleed — tweak the title, then download.'
      setAiStatus({ kind: 'ok', text: okMsg })
      setStatus(okMsg)
      setEditorTab('title')
    } catch (error) {
      if (runId !== aiRunIdRef.current) return
      // User-started supersede only — timeouts throw a normal Error with a message.
      if (error instanceof DOMException && error.name === 'AbortError' && controller.signal.aborted) {
        setAiStatus({ kind: 'idle', text: '' })
        return
      }
      const message = error instanceof Error ? error.message : 'AI scene generation failed.'
      setAiStatus({ kind: 'err', text: message })
      setStatus(message)
    } finally {
      if (runId === aiRunIdRef.current) {
        setAiBusy(false)
        if (aiAbortRef.current === controller) aiAbortRef.current = null
      }
    }
  }

  async function onSimpleLogin(event: FormEvent) {
    event.preventDefault()
    try {
      const user = await registerSimpleUser(nameDraft, emailDraft)
      setSimpleUser(user)
      setModal('none')
      setStatus(`Signed in as ${user.name} (${user.email}).`)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not sign in.')
    }
  }

  function saveMarked() {
    try {
      downloadThumbnail({ ...previewInput, watermark: true })
      setStatus(`Saved free preview. Look in Downloads for ${DOWNLOAD_PREFIX}-${platform.id}.png`)
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
        left === Number.POSITIVE_INFINITY
          ? 'Saved clean image (no watermark).'
          : `Saved clean image. ${left} clean download${left === 1 ? '' : 's'} left this month.`,
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
    setStatus(`Registered as ${next.email}. Pick Creator or Pro to unlock clean exports.`)
    setModal('pay')
  }

  function onDemoPlan(plan: 'creator' | 'pro') {
    if (!entitlement.email) {
      setModal('register')
      return
    }
    const next = activateDemoPlan(entitlement, plan)
    setEntitlement(next)
    setModal('none')
    setStatus(
      plan === 'pro'
        ? `Pro unlocked (demo). Unlimited clean downloads for 30 days.`
        : `Creator unlocked (demo). ${CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean downloads per month.`,
    )
  }

  return (
    <div className="page">
      <SiteHeader
        userLabel={simpleUser ? simpleUser.name : null}
        onLoginClick={() => {
          setNameDraft(simpleUser?.name || '')
          setEmailDraft(simpleUser?.email || '')
          setModal('login')
        }}
      />

      <main id="top" className="page-main">
        <HeroFlashy
          onQuickIdea={() => {
            applyQuickIdea()
            document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' })
          }}
        />
        <PlushInfoSection />
        <LazyReveal staggerMs={75} variant="soft-rise">
          <StatsStrip />
        </LazyReveal>
        <LazyReveal staggerMs={90} variant="rise">
          <ProblemSection />
        </LazyReveal>
        <LazyReveal staggerMs={85} variant="fade-scale">
          <HowItWorks />
        </LazyReveal>
        <LazyReveal staggerMs={70} variant="soft-rise">
          <FeaturesSection />
        </LazyReveal>
        <LazyReveal variant="slide-left">
          <PricingTeaser />
        </LazyReveal>

        <section id="editor" className="editor-section" aria-label="Thumbnail editor">
          <div className="editor-head">
            <p className="section-kicker">Editor</p>
            <h2 className="editor-title">
              Build your thumbnail <span className="gradient-text">live</span>
            </h2>
            <p className="editor-lede">
              Platform-sized canvas, moods, and drag-to-place text — tuned to match the rest of{' '}
              {PRODUCT_NAME_FULL}.
            </p>
          </div>
        <section className="workbench editor-workbench" aria-label="Thumbnail maker">
          <p className="picks-bar" aria-live="polite">
            Your picks: <strong>{platform.label}</strong> · Look: <strong>{niche.label}</strong>
            {accentOverride ? ' · Custom accent' : ''}
          </p>
          <form
            className="controls"
            onSubmit={(event) => {
              event.preventDefault()
              saveMarked()
            }}
          >
            <div className="editor-tabs" role="tablist" aria-label="Editor steps">
              <button
                id="editor-tab-setup"
                type="button"
                role="tab"
                aria-selected={editorTab === 'setup'}
                className={editorTab === 'setup' ? 'editor-tab is-active' : 'editor-tab'}
                onClick={() => setEditorTab('setup')}
                title="Platform and mood"
              >
                1 · Setup
              </button>
              <button
                id="editor-tab-title"
                type="button"
                role="tab"
                aria-selected={editorTab === 'title'}
                className={editorTab === 'title' ? 'editor-tab is-active' : 'editor-tab'}
                onClick={() => setEditorTab('title')}
                title="Title, font, and size"
              >
                2 · Title
              </button>
              <button
                id="editor-tab-polish"
                type="button"
                role="tab"
                aria-selected={editorTab === 'polish'}
                className={editorTab === 'polish' ? 'editor-tab is-active' : 'editor-tab'}
                onClick={() => setEditorTab('polish')}
                title="Polish and export"
              >
                3 · Export
              </button>
            </div>

            {editorTab === 'setup' ? (
            <section className="step step-clean">
              <p className="step-lede">Pick where you post and the color mood. Preview updates on the right.</p>
              <div className="choice-row platform-row" role="radiogroup" aria-label="Platform">
                {PLATFORMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={item.id === platformId ? 'choice is-selected' : 'choice'}
                    role="radio"
                    aria-checked={item.id === platformId}
                    onClick={() => setPlatformId(item.id)}
                  >
                    <span>{item.label}</span>
                    <small>
                      {item.orientation} · {item.width}×{item.height}
                    </small>
                  </button>
                ))}
              </div>

              <div className="quick-row">
                <button type="button" className="chip solid" onClick={applyQuickIdea}>
                  Quick idea
                </button>
                <p className="field-help quick-hint">Shuffle mood, layout, font &amp; title style.</p>
              </div>

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
                              className={item.id === nicheId ? 'niche is-selected' : 'niche'}
                              style={{ ['--niche-accent' as string]: item.accent }}
                              role="radio"
                              aria-checked={item.id === nicheId}
                              onClick={() => setNicheId(item.id)}
                            >
                              <span className="niche-dot" style={{ background: item.accent }} aria-hidden />
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
                        className={item.id === nicheId ? 'niche is-selected' : 'niche'}
                        style={{ ['--niche-accent' as string]: item.accent }}
                        role="radio"
                        aria-checked={item.id === nicheId}
                        onClick={() => setNicheId(item.id)}
                      >
                        <span className="niche-dot" style={{ background: item.accent }} aria-hidden />
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
            ) : null}

            {editorTab === 'title' ? (
            <section id="editor-title" className="step step-clean">
              <p className="step-lede">Headline first — templates set platform and layout for you.</p>
              <fieldset>
                <legend>Starter templates</legend>
                <div className="template-gallery" role="list">
                  {THUMB_TEMPLATES.map((item) => {
                    const tplPlatform = getPlatform(item.platform)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="template-card"
                        role="listitem"
                        onClick={() => applyTemplate(item.id)}
                      >
                        <span
                          className={`template-thumb layout-${item.layout}`}
                          aria-hidden
                        />
                        <span className="template-copy">
                          <strong>{item.label}</strong>
                          <small>
                            {tplPlatform.label} · {item.layout.replace('photo-', '')}
                          </small>
                        </span>
                      </button>
                    )
                  })}
                </div>
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
                  id="title-input"
                  value={title}
                  maxLength={70}
                  rows={3}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Write the title people should notice"
                />
              </label>
              <button
                type="button"
                className="linkish"
                onClick={() => {
                  setTextPos(defaultTextPosition(platform, layout))
                  setTextSelected(false)
                  setStatus('Title position reset for this layout.')
                }}
              >
                Reset title position on preview
              </button>

              <div id="editor-ai" className="photo-box ai-scene-box">
                <div>
                  <p className="photo-title">AI scene image</p>
                  <p className="photo-help">
                    Fill the YouTube title field above, then describe the visual scene here.
                    Free AI paints a full-bleed backdrop from your scene (plus title + niche) —
                    not a small bordered photo.
                  </p>
                  {photoName ? <p className="photo-name">Selected: {photoName}</p> : null}
                </div>
                <label className="ai-hint-field">
                  Describe the scene for your thumbnail
                  <input
                    id="ai-scene-hint"
                    type="text"
                    value={aiHint}
                    onChange={(event) => setAiHint(event.target.value)}
                    placeholder="e.g. Tamil singer in warm stage light, soft bokeh, music cover mood"
                  />
                </label>
                <p className="ai-honesty-note">
                  Tip: write the clickable YouTube title up top, and a visual scene here (one coherent
                  shot — person, setting, mood). Empty title uses a short title from your scene.
                  Free Pollinations image (no API key) — not YouTube-URL / video analysis.
                </p>
                <div className="photo-actions">
                  <button
                    type="button"
                    className="chip solid ai-generate"
                    disabled={aiBusy}
                    aria-busy={aiBusy}
                    onClick={() => void runAiThumbnail()}
                  >
                    {aiBusy ? 'Generating…' : 'Generate AI scene'}
                  </button>
                  <button
                    type="button"
                    className="chip solid"
                    onClick={() => fileRef.current?.click()}
                  >
                    {photo ? 'Change photo' : 'Upload your photo'}
                  </button>
                  {photo ? (
                    <button type="button" className="chip" onClick={clearPhoto}>
                      Remove
                    </button>
                  ) : null}
                </div>
                {aiStatus.text ? (
                  <p
                    className={`ai-inline-status is-${aiStatus.kind}`}
                    role="status"
                    aria-live="polite"
                  >
                    {aiStatus.kind === 'busy' ? <span className="ai-inline-spinner" aria-hidden /> : null}
                    {aiStatus.text}
                  </p>
                ) : null}
                <input
                  ref={fileRef}
                  className="file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => onPickPhoto(event.target.files?.[0])}
                />
              </div>
            </section>
            ) : null}

            {editorTab === 'polish' ? (
            <section className="step step-clean">
              <p className="step-lede">Fonts, size, photo, and extras — watch the live preview.</p>
              <fieldset>
                <legend>Title style</legend>
                <div className="title-style-row" role="listbox" aria-label="Title style">
                  {TEXT_STYLES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={textStyleId === item.id}
                      className={
                        textStyleId === item.id ? 'title-style-chip is-selected' : 'title-style-chip'
                      }
                      data-style={item.id}
                      title={item.hint}
                      onClick={() => setTextStyleId(item.id)}
                    >
                      <span className="title-style-sample" aria-hidden>
                        Aa
                      </span>
                      <span className="title-style-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>Title font</legend>
                <div className="font-menu" role="listbox" aria-label="Title font">
                  {FONTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={fontId === item.id}
                      className={fontId === item.id ? 'font-pick is-selected' : 'font-pick'}
                      style={{ fontFamily: item.css, fontWeight: item.weight }}
                      onClick={() => setFontId(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="size-row">
                <label className="size-field">
                  Title size (px at 1280w)
                  <input
                    type="number"
                    min={TITLE_FONT_SIZE_MIN}
                    max={TITLE_FONT_SIZE_MAX}
                    step={1}
                    value={titleFontSizePx}
                    onChange={(event) =>
                      setTitleFontSizePx(clampTitleFontSize(Number(event.target.value)))
                    }
                  />
                </label>
                <label className="size-slider">
                  <span className="sr-only">Title size slider</span>
                  <input
                    type="range"
                    min={TITLE_FONT_SIZE_MIN}
                    max={TITLE_FONT_SIZE_MAX}
                    value={titleFontSizePx}
                    onChange={(event) =>
                      setTitleFontSizePx(clampTitleFontSize(Number(event.target.value)))
                    }
                  />
                </label>
              </div>
              <p className="field-help">
                Range {TITLE_FONT_SIZE_MIN}–{TITLE_FONT_SIZE_MAX}. Try 96–120 for YouTube titles; go
                bigger for Shorts.
              </p>

              <details className="fold-panel">
                <summary>Advanced layout &amp; extras</summary>
                <div className="fold-body">
                  <fieldset>
                    <legend>Photo placement</legend>
                    <div className="choice-row">
                      {LAYOUTS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={item.id === layout ? 'choice is-selected' : 'choice'}
                          role="radio"
                          aria-checked={item.id === layout}
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
                          className={item.id === photoShape ? 'choice is-selected' : 'choice'}
                          role="radio"
                          aria-checked={item.id === photoShape}
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
                    <div className="choice-row colors" role="radiogroup" aria-label="Accent color">
                      {COLOR_PRESETS.map((item) => {
                        const selected =
                          item.value === '' ? accentOverride === '' : accentOverride === item.value
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={selected ? 'swatch is-selected' : 'swatch'}
                            role="radio"
                            aria-checked={selected}
                            onClick={() => setAccentOverride(item.value)}
                            title={item.label}
                            style={
                              item.value
                                ? { background: item.value, color: '#101820' }
                                : { background: niche.accent, color: '#101820' }
                            }
                          >
                            {item.id === 'look' ? 'From mood' : item.label}
                          </button>
                        )
                      })}
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

                  <fieldset>
                    <legend>Stickers (up to 3)</legend>
                    <div className="sticker-row">
                      {STICKERS.map((sticker) => (
                        <button
                          key={sticker.id}
                          type="button"
                          className={
                            stickers.some((item) => item.id === sticker.id)
                              ? 'sticker active'
                              : 'sticker'
                          }
                          aria-pressed={stickers.some((item) => item.id === sticker.id)}
                          onClick={() => toggleSticker(sticker.id)}
                          title={sticker.hint}
                        >
                          {sticker.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </details>
            </section>
            ) : null}

            <section className="step save-step">
              <header>
                <div>
                  <h2>Download</h2>
                  <p>
                    Free preview PNG anytime. Clean exports need Creator ({planPriceLabel('creator')}) or
                    Pro ({planPriceLabel('pro')}) — see{' '}
                    <Link to="/pricing">pricing</Link>.
                  </p>
                </div>
              </header>

              <div className="plan-box">
                <p>{entitlementStatusLabel(entitlement)}</p>
                {entitlement.email ? (
                  <p className="plan-box-sub">{entitlement.email}</p>
                ) : null}
              </div>

              <div className="download-actions-row">
                <button type="submit" className="primary">
                  Save free preview
                </button>
                <button type="button" className="chip solid" onClick={requestCleanSave}>
                  Save clean (no mark)
                </button>
              </div>
              <p className="hint editor-status" role="status">
                {status}
              </p>
            </section>
          </form>

          <div className="preview-panel">
            <p className="preview-label">Live preview · {platform.label}</p>
            <div className="preview-viewport">
            <div
              className={`preview-wrap ${platform.orientation}`}
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
            <p className="preview-hint">Drag the title block or stickers directly on the canvas.</p>
          </div>
        </section>
        </section>

        <div className="mobile-save-dock" aria-label="Quick save">
          <button type="button" className="primary" onClick={saveMarked}>
            Save preview
          </button>
          <button type="button" className="chip solid" onClick={requestCleanSave}>
            Clean save
          </button>
        </div>

        <LazyReveal staggerMs={60} variant="blur-up">
          <Testimonials />
        </LazyReveal>
        <LazyReveal variant="fade-scale">
          <FaqAccordion />
        </LazyReveal>
      </main>

      <SiteFooter buildLabel={`${PRODUCT_NAME_FULL} · UI ${UI_BUILD}`} />

      {modal !== 'none' ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setModal('none')}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            {modal === 'login' ? (
              <form onSubmit={onSimpleLogin}>
                <h2 id="modal-title">Sign in</h2>
                <p>
                  Light account only — we store your name and email on this device
                  {import.meta.env.VITE_API_BASE ? ' and sync to the Thumbric backend JSON.' : '.'} No
                  password. Full auth comes later when traffic grows.
                </p>
                <label>
                  Name
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    placeholder="Your name"
                    required
                    autoFocus
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={emailDraft}
                    onChange={(event) => setEmailDraft(event.target.value)}
                    placeholder="you@email.com"
                    required
                  />
                </label>
                <div className="actions">
                  <button type="submit" className="primary">
                    Save &amp; continue
                  </button>
                  <button type="button" className="chip" onClick={() => setModal('none')}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : modal === 'register' ? (
              <form onSubmit={onRegister}>
                <h2 id="modal-title">Register to remove the mark</h2>
                <p>
                  Free users can always save a preview. Register with email, then choose Creator or Pro on
                  the pricing page for clean PNGs without the watermark.
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
                <h2 id="modal-title">Unlock clean exports</h2>
                <p>
                  {entitlement.email
                    ? `Signed in as ${entitlement.email}.`
                    : 'Register first, then pick a plan.'}{' '}
                  Creator includes {CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean PNGs per month. Pro is unlimited.
                </p>
                <p className="hint">
                  Stripe checkout connects next. Demo unlock below stores your plan in this browser for 30
                  days.
                </p>
                <div className="actions modal-plan-actions">
                  <button type="button" className="chip solid" onClick={() => onDemoPlan('creator')}>
                    Demo Creator · {planPriceLabel('creator')}
                  </button>
                  <button type="button" className="primary" onClick={() => onDemoPlan('pro')}>
                    Demo Pro · {planPriceLabel('pro')}
                  </button>
                  <Link className="chip" to="/pricing" onClick={() => setModal('none')}>
                    View full pricing
                  </Link>
                  <button type="button" className="chip ghost" onClick={() => setModal('none')}>
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
