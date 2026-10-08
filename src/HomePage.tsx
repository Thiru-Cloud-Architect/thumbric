import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { flushSync } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  CREATOR_CLEAN_DOWNLOADS_PER_MONTH,
  TRIAL_DAYS,
  activateDemoPlan,
  activateDemoTrial,
  canDownloadClean,
  cleanDownloadsLeft,
  consumeCleanDownload,
  entitlementStatusLabel,
  isPaid,
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
  FreeToolsSection,
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
import {
  AI_LOOK_TARGET,
  AI_RATE_LIMIT_COOLDOWN_SEC,
  AI_SCENE_PRESETS,
  AI_STYLES,
  generateAiThumbnailVariants,
  getAiStyle,
  isAiRateLimitedError,
  suggestAiStyle,
  titleFromScene,
  type AiGeneratedImage,
  type AiStyleId,
} from './aiThumbnail'
import { resolveAiBackend } from './aiConfig'
import {
  TITLE_FILL_PRESETS,
  TITLE_OUTLINE_AUTO,
  TITLE_OUTLINE_MAX,
  TITLE_OUTLINE_MIN,
  TITLE_POSITION_PRESETS,
  clampOutlineWidth,
  type TitleAlign,
} from './titleKit'
import {
  loadSimpleUser,
  registerSimpleUser,
  simpleAuthIsDeviceOnly,
  type SimpleUser,
} from './simpleAuth'
import { consumeAiHandoff, loadImageFromUrl } from './aiHandoff'
import { track } from './analytics'
import { DocumentHead } from './DocumentHead'
import { DOWNLOAD_PREFIX, PRODUCT_NAME_FULL, UI_BUILD } from './brand'
import {
  HASH_NAV_EVENT,
  focusHashTarget,
  goToHash,
  normalizeHash,
  scrollToElementId,
  type HashNavDetail,
} from './nav'
import './App.css'

const POPULAR: NicheId[] = ['tech', 'finance', 'gaming', 'cooking', 'travel', 'fitness', 'education', 'vlog']

type DragTarget = 'sticker' | 'text' | null
type EditorTab = 'create' | 'title' | 'finish'
type EditorMode = 'ai' | 'classic'

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
  const [titleAlign, setTitleAlign] = useState<TitleAlign>('left')
  const [titleLine2, setTitleLine2] = useState('')
  const [titleFill, setTitleFill] = useState('')
  const [titleOutlineWidth, setTitleOutlineWidth] = useState(TITLE_OUTLINE_AUTO)
  const [titleOutlineColor, setTitleOutlineColor] = useState('#000000')
  const [titleShadow, setTitleShadow] = useState(true)
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
  const [modal, setModal] = useState<'none' | 'register' | 'pay' | 'login' | 'trial'>('none')
  const [emailDraft, setEmailDraft] = useState('')
  const [nameDraft, setNameDraft] = useState('')
  const [simpleUser, setSimpleUser] = useState<SimpleUser | null>(() => loadSimpleUser())
  const [aiHint, setAiHint] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [aiStyleId, setAiStyleId] = useState<AiStyleId>('auto')
  const [aiVariants, setAiVariants] = useState<AiGeneratedImage[]>([])
  const [aiPick, setAiPick] = useState(0)
  /** How many picker slots to show while generating / after a partial batch. */
  const [aiSlotCount, setAiSlotCount] = useState(3)
  const [aiProgressDone, setAiProgressDone] = useState(0)
  const [aiCanFetchMore, setAiCanFetchMore] = useState(false)
  const [aiAwaitingRetry, setAiAwaitingRetry] = useState(false)
  const [aiStyleTip, setAiStyleTip] = useState<AiStyleId | null>(null)
  /** Local feedback beside Generate — Download status alone is easy to miss. */
  const [aiStatus, setAiStatus] = useState<{ kind: 'idle' | 'busy' | 'ok' | 'err'; text: string }>({
    kind: 'idle',
    text: '',
  })
  const [editorTab, setEditorTab] = useState<EditorTab>(() => {
    const hash = normalizeHash(typeof window !== 'undefined' ? window.location.hash : '')
    return hash === 'editor-title' ? 'title' : 'create'
  })
  const [editorMode, setEditorMode] = useState<EditorMode>(() => {
    const hash = normalizeHash(typeof window !== 'undefined' ? window.location.hash : '')
    return hash === 'editor-ai' ? 'ai' : 'classic'
  })
  const [aiCooldownSec, setAiCooldownSec] = useState(0)
  const [photoDragOver, setPhotoDragOver] = useState(false)
  const [activeTemplateId, setActiveTemplateId] = useState<TemplateId | null>(null)
  const aiAbortRef = useRef<AbortController | null>(null)
  const aiRunIdRef = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const dragIndexRef = useRef<number | null>(null)
  const dragTargetRef = useRef<DragTarget>(null)
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

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
      titleAlign,
      titleLine2,
      titleFill,
      titleOutlineWidth,
      titleOutlineColor,
      titleShadow,
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
      titleAlign,
      titleLine2,
      titleFill,
      titleOutlineWidth,
      titleOutlineColor,
      titleShadow,
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

      if (hash === 'editor-ai') {
        flushSync(() => {
          setEditorMode('ai')
          setEditorTab('create')
        })
      } else if (hash === 'editor-title') {
        flushSync(() => setEditorTab('title'))
      } else if (hash === 'editor') {
        flushSync(() => {
          setEditorMode('classic')
          setEditorTab('create')
        })
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

  useEffect(() => {
    const handoff = consumeAiHandoff()
    if (!handoff) return
    if (handoff.hint) setAiHint(handoff.hint)
    if (handoff.title) setTitle(handoff.title)
    if (handoff.styleId) setAiStyleId(handoff.styleId)
    setEditorMode('ai')
    setEditorTab('create')
    if (handoff.photoDataUrl) {
      void loadImageFromUrl(handoff.photoDataUrl)
        .then((image) => {
          setPhoto(image)
          setPhotoUrl(handoff.photoDataUrl!)
          setPhotoName('Imported thumbnail')
        })
        .catch(() => undefined)
    }
  }, [])

  useEffect(() => {
    if (aiCooldownSec <= 0) return
    const timer = window.setTimeout(() => setAiCooldownSec((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [aiCooldownSec])

  const prevCooldownRef = useRef(0)
  useEffect(() => {
    const wasCooling = prevCooldownRef.current > 0
    prevCooldownRef.current = aiCooldownSec
    if (!wasCooling || aiCooldownSec !== 0 || aiBusy) return
    if (!aiAwaitingRetry || aiVariants.length === 0 || aiVariants.length >= AI_LOOK_TARGET) return
    setAiCanFetchMore(true)
    setAiStatus({
      kind: 'ok',
      text: 'Ready — retry remaining looks to fill the empty slots.',
    })
    setStatus('Ready — retry remaining looks to fill the empty slots.')
  }, [aiCooldownSec, aiBusy, aiAwaitingRetry, aiVariants.length])

  function applyTemplate(id: TemplateId) {
    const template = THUMB_TEMPLATES.find((item) => item.id === id)
    if (!template) return
    setPlatformId(template.platform)
    setLayout(template.layout)
    setFontId(template.fontId)
    setTextStyleId(template.textStyleId)
    setTitleFontSizePx(template.titleFontSizePx)
    setStickers([])
    setTitleAlign(template.titleAlign ?? 'left')
    if (template.sampleLine2 !== undefined) setTitleLine2(template.sampleLine2)
    setTextPos(defaultTextPosition(getPlatform(template.platform), template.layout))
    setActiveStickerIndex(null)
    setTextSelected(false)
    setActiveTemplateId(template.id)
    setEditorMode('classic')
    if (template.nicheId) setNicheId(template.nicheId)
    if (!title.trim()) setTitle(template.sampleTitle)
    if (!tag.trim()) setTag(template.sampleTag)
    setStatus(`Template “${template.label}” applied. Drop a photo or drag the title on the preview.`)
  }

  function applyTitlePreset(id: string) {
    const preset = TITLE_POSITION_PRESETS.find((item) => item.id === id)
    if (!preset) return
    setTitleAlign(preset.align)
    setTextPos({ x: preset.x, y: preset.y })
    if (layout !== 'photo-full' && platform.orientation === 'horizontal') {
      setLayout('photo-full')
    }
    setTextSelected(true)
    setStatus(`Title ${preset.label.toLowerCase()} — drag to fine-tune.`)
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
      const sticker = stickers[stickerIndex]
      dragOffsetRef.current = {
        x: point.x - sticker.x * platform.width,
        y: point.y - sticker.y * platform.height,
      }
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
      dragOffsetRef.current = {
        x: point.x - textPos.x * platform.width,
        y: point.y - textPos.y * platform.height,
      }
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
      const offset = dragOffsetRef.current
      setStickers((current) =>
        current.map((item, index) =>
          index === dragIndex
            ? {
                ...item,
                x: clampStickerPos((point.x - offset.x) / platform.width),
                y: clampStickerPos((point.y - offset.y) / platform.height),
              }
            : item,
        ),
      )
      event.currentTarget.style.cursor = 'grabbing'
      return
    }
    if (target === 'text') {
      const offset = dragOffsetRef.current
      setTextPos(
        clampTextPosition(platform, layout, {
          x: (point.x - offset.x) / platform.width,
          y: (point.y - offset.y) / platform.height,
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
    revokeAiVariants(photoUrl)
    setPhoto(null)
    setPhotoUrl('')
    setPhotoName('')
    setAiPick(0)
    setAiCanFetchMore(false)
    setAiProgressDone(0)
    setAiSlotCount(3)
    if (fileRef.current) fileRef.current.value = ''
    setStatus('Photo removed.')
  }

  function onAiHintChange(value: string) {
    setAiHint(value)
    const tip = suggestAiStyle(value, aiStyleId)
    setAiStyleTip(tip)
  }

  function applySuggestedStyle() {
    if (!aiStyleTip) return
    setAiStyleId(aiStyleTip)
    setAiStyleTip(null)
  }

  function revokeAiVariants(extraUrl?: string) {
    setAiVariants((prev) => {
      const urls = new Set(prev.map((item) => item.objectUrl))
      for (const item of prev) URL.revokeObjectURL(item.objectUrl)
      if (extraUrl && !urls.has(extraUrl)) URL.revokeObjectURL(extraUrl)
      return []
    })
  }

  function applyAiLook(item: AiGeneratedImage, index: number, total: number) {
    setAiPick(index)
    setPhoto(item.image)
    setPhotoUrl(item.objectUrl)
    setPhotoName(`AI scene · look ${index + 1} of ${total}`)
    setLayout('photo-full')
    setPhotoShape('square')
    setStickers([])
    setActiveStickerIndex(null)
  }

  function applyScenePreset(preset: (typeof AI_SCENE_PRESETS)[number]) {
    setAiHint(preset.hint)
    setAiStyleId(preset.styleId)
    setAiStyleTip(null)
    setEditorMode('ai')
    setEditorTab('create')
    setStatus(`Preset “${preset.label}” loaded. Generate when you are ready.`)
  }

  async function runAiThumbnail(mode: 'fresh' | 'more' = 'fresh') {
    if (aiBusy) return

    let styleId = aiStyleId
    const tip = suggestAiStyle(aiHint, aiStyleId)
    if (tip && mode === 'fresh') {
      styleId = tip
      setAiStyleId(tip)
      setAiStyleTip(null)
    }

    const prior = mode === 'more' ? aiVariants : []
    const wantCount =
      mode === 'more'
        ? Math.min(AI_LOOK_TARGET - prior.length, AI_LOOK_TARGET)
        : AI_LOOK_TARGET
    if (wantCount <= 0) return

    aiAbortRef.current?.abort()
    const controller = new AbortController()
    const runId = ++aiRunIdRef.current
    aiAbortRef.current = controller
    setAiBusy(true)
    setAiCanFetchMore(false)
    setAiAwaitingRetry(false)
    setAiSlotCount(AI_LOOK_TARGET)
    setAiProgressDone(prior.length)
    setEditorMode('ai')

    if (mode === 'fresh') {
      revokeAiVariants(photoUrl)
      setPhoto(null)
      setPhotoUrl('')
      setPhotoName('')
      setAiPick(0)
    }

    const busyMsg =
      mode === 'more'
        ? `Creating look ${prior.length + 1} of ${AI_LOOK_TARGET}…`
        : 'Creating 3 looks — the first lands on the canvas.'
    setAiStatus({ kind: 'busy', text: busyMsg })
    setStatus(busyMsg)

    try {
      const batch = await generateAiThumbnailVariants(
        {
          title,
          niche,
          platform,
          hint: aiHint,
          styleId,
        },
        {
          count: wantCount,
          signal: controller.signal,
          startIndex: prior.length,
          onProgress: (done, total) => {
            if (runId !== aiRunIdRef.current) return
            setAiProgressDone(prior.length + done)
            const nextIndex = prior.length + Math.min(done + 1, total)
            const text =
              done >= total
                ? 'Looks are ready — pick one below.'
                : `Creating look ${nextIndex} of ${AI_LOOK_TARGET}…`
            setAiStatus({ kind: 'busy', text })
            setStatus(text)
          },
          onWait: (lookIndex) => {
            if (runId !== aiRunIdRef.current) return
            setAiProgressDone(lookIndex)
            const text = `Look ${lookIndex} is ready. Getting look ${lookIndex + 1} of ${AI_LOOK_TARGET}…`
            setAiStatus({ kind: 'busy', text })
            setStatus(text)
          },
          onItem: (item, index) => {
            if (runId !== aiRunIdRef.current) return
            const slot = prior.length + index
            setAiVariants((current) => {
              const next = [...current]
              next[slot] = item
              return next.slice(0, AI_LOOK_TARGET)
            })
            if (mode === 'fresh' && index === 0) {
              applyAiLook(item, 0, AI_LOOK_TARGET)
              if (!title.trim()) setTitle(titleFromScene(aiHint, title))
            }
          },
        },
      )
      if (runId !== aiRunIdRef.current) return

      const merged = [...prior, ...batch.results].slice(0, AI_LOOK_TARGET)
      setAiVariants(merged)
      setAiSlotCount(AI_LOOK_TARGET)
      setAiProgressDone(merged.length)
      const pickIndex = mode === 'more' ? Math.min(aiPick, merged.length - 1) : 0
      const chosen = merged[pickIndex] ?? merged[0]
      if (chosen) applyAiLook(chosen, pickIndex, merged.length)

      const missing = AI_LOOK_TARGET - merged.length
      const canMore = missing > 0 && !batch.rateLimited && resolveAiBackend().premium
      setAiCanFetchMore(canMore)
      setAiAwaitingRetry(false)
      if (batch.rateLimited) {
        setAiCooldownSec(AI_RATE_LIMIT_COOLDOWN_SEC)
      }

      const okMsg = batch.usedStudioFallback
        ? 'Free AI is busy — 3 studio looks are ready. Style the title on the canvas.'
        : merged.length >= AI_LOOK_TARGET
          ? '3 looks ready — tap one to put it on the canvas.'
          : `Pick 1 of ${merged.length} — tap a look to put it on the canvas.`
      setAiStatus({ kind: 'ok', text: okMsg })
      setStatus(okMsg)
      track('generation_completed', {
        tool: 'editor-ai',
        looks: merged.length,
        studio: batch.usedStudioFallback,
      })
      track('thumbnail_generated', { tool: 'editor-ai', looks: merged.length })
    } catch (error) {
      if (runId !== aiRunIdRef.current) return
      if (error instanceof DOMException && error.name === 'AbortError' && controller.signal.aborted) {
        setAiStatus({ kind: 'idle', text: '' })
        return
      }
      const message = error instanceof Error ? error.message : 'Could not create those looks.'
      const rateLimited = isAiRateLimitedError(error) || /busy|try again in a minute/i.test(message)
      setAiStatus({ kind: 'err', text: message })
      setStatus(message)
      track('generation_failed', { tool: 'editor-ai', rateLimited })
      if (rateLimited) {
        setAiCooldownSec(AI_RATE_LIMIT_COOLDOWN_SEC)
        setAiAwaitingRetry(false)
      }
      if (mode === 'fresh' && prior.length === 0) {
        setAiProgressDone(0)
      }
      setAiCanFetchMore(prior.length > 0 && prior.length < AI_LOOK_TARGET && !rateLimited)
    } finally {
      if (runId === aiRunIdRef.current) {
        setAiBusy(false)
        if (aiAbortRef.current === controller) aiAbortRef.current = null
      }
    }
  }

  function pickAiVariant(index: number) {
    const item = aiVariants[index]
    if (!item) return
    applyAiLook(item, index, aiVariants.length)
  }

  function onPhotoDrop(event: ReactDragEvent) {
    event.preventDefault()
    setPhotoDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      setEditorMode('classic')
      onPickPhoto(file)
    }
  }

  async function onSimpleLogin(event: FormEvent) {
    event.preventDefault()
    try {
      track('signup_started', { tool: 'header' })
      const user = await registerSimpleUser(nameDraft, emailDraft)
      setSimpleUser(user)
      setModal('none')
      setStatus(`Signed in as ${user.name} (${user.email}).`)
      track('signup_completed', { tool: 'header' })
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not sign in.')
    }
  }

  function saveMarked() {
    try {
      downloadThumbnail({ ...previewInput, watermark: true })
      setStatus(`Saved free preview. Look in Downloads for ${DOWNLOAD_PREFIX}-${platform.id}.png`)
      track('thumbnail_downloaded', { tool: 'editor', watermark: true })
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
      track('thumbnail_downloaded', { tool: 'editor', watermark: false })
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
    track('signup_started', { tool: 'register' })
    const next = registerEmail(emailDraft)
    setEntitlement(next)
    setStatus(`Registered as ${next.email}. Pick Creator or Pro to unlock clean exports.`)
    setModal('pay')
    track('signup_completed', { tool: 'register' })
    track('subscription_started', { tool: 'register' })
  }

  function onDemoPlan(plan: 'creator' | 'pro') {
    if (!entitlement.email) {
      setModal('register')
      return
    }
    const next = activateDemoPlan(entitlement, plan)
    setEntitlement(next)
    setModal('none')
    track('subscription_completed', { plan })
    setStatus(
      plan === 'pro'
        ? `Pro unlocked (demo). Unlimited clean downloads for 30 days.`
        : `Creator unlocked (demo). ${CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean downloads per month.`,
    )
  }

  function openEditorAi() {
    goToHash('editor-ai')
  }

  function startTrialFlow() {
    if (isPaid(entitlement)) {
      const label = entitlement.trial
        ? `Your ${TRIAL_DAYS}-day trial is already active in this browser.`
        : 'Clean exports are already unlocked in this browser.'
      setStatus(label)
      openEditorAi()
      return
    }
    setEmailDraft(entitlement.email || simpleUser?.email || '')
    setModal('trial')
  }

  function onStartTrial(event: FormEvent) {
    event.preventDefault()
    if (!isValidEmail(emailDraft)) {
      setStatus('Enter a valid email to start the trial on this device.')
      return
    }
    const registered = entitlement.email ? entitlement : registerEmail(emailDraft)
    const next = activateDemoTrial(registered)
    setEntitlement(next)
    setModal('none')
    track('subscription_completed', { plan: 'trial' })
    setStatus(
      `${TRIAL_DAYS}-day trial started on this device. Clean exports are unlocked — create a thumbnail.`,
    )
    openEditorAi()
  }

  return (
    <div className="page">
      <DocumentHead path="/" />
      <SiteHeader
        userLabel={simpleUser ? simpleUser.name : null}
        onLoginClick={() => {
          setNameDraft(simpleUser?.name || '')
          setEmailDraft(simpleUser?.email || '')
          setModal('login')
        }}
      />

      <main id="top" className="page-main">
        <HeroFlashy onStartTrial={startTrialFlow} />
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
        <LazyReveal staggerMs={70} variant="soft-rise">
          <FreeToolsSection />
        </LazyReveal>
        <LazyReveal variant="slide-left">
          <PricingTeaser />
        </LazyReveal>

        <section id="editor" className="editor-section" aria-label="Thumbnail editor">
          <div className="editor-head">
            <p className="section-kicker">Studio</p>
            <h2 className="editor-title">
              Idea to finished thumbnail <span className="gradient-text">in one canvas</span>
            </h2>
            <p className="editor-lede">
              Generate a free AI backdrop or start from a photo and template — then style the title
              live. Both paths use the same {PRODUCT_NAME_FULL} canvas.
            </p>
          </div>
        <section className="workbench editor-workbench studio-grid" aria-label="Thumbnail studio">
          <div className="editor-path" role="tablist" aria-label="How to start">
            <button
              id="editor-ai"
              type="button"
              role="tab"
              aria-selected={editorMode === 'ai'}
              className={editorMode === 'ai' ? 'editor-path-card is-active' : 'editor-path-card'}
              onClick={() => {
                setEditorMode('ai')
                setEditorTab('create')
              }}
            >
              <span className="editor-path-kicker">✦ AI</span>
              <strong>AI Thumbnail creator</strong>
              <small>Describe a scene · always get 3 looks</small>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={editorMode === 'classic'}
              className={
                editorMode === 'classic' ? 'editor-path-card is-active' : 'editor-path-card'
              }
              onClick={() => {
                setEditorMode('classic')
                setEditorTab('create')
              }}
            >
              <span className="editor-path-kicker">Photo</span>
              <strong>Templates &amp; upload</strong>
              <small>Drop a still · start from a layout</small>
            </button>
          </div>
          <p className="picks-bar" aria-live="polite">
            {editorMode === 'ai' ? 'AI path' : 'Photo path'} · <strong>{platform.label}</strong> ·{' '}
            {platform.width}×{platform.height} · Look: <strong>{niche.label}</strong>
            {accentOverride ? ' · Custom accent' : ''}
            {photoName ? ` · ${photoName}` : ''}
          </p>
          <form
            className="controls studio-tools"
            onSubmit={(event) => {
              event.preventDefault()
              saveMarked()
            }}
          >
            <div className="editor-tabs" role="tablist" aria-label="Editor steps">
              <button
                id="editor-tab-create"
                type="button"
                role="tab"
                aria-selected={editorTab === 'create'}
                className={editorTab === 'create' ? 'editor-tab is-active' : 'editor-tab'}
                onClick={() => setEditorTab('create')}
                title="Scene, photo, or template"
              >
                1 · Create
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
                id="editor-tab-finish"
                type="button"
                role="tab"
                aria-selected={editorTab === 'finish'}
                className={editorTab === 'finish' ? 'editor-tab is-active' : 'editor-tab'}
                onClick={() => setEditorTab('finish')}
                title="Layout, stickers, and download"
              >
                3 · Finish
              </button>
            </div>

            {editorTab === 'create' ? (
            <section className="step step-clean">
              <p className="step-lede">
                {editorMode === 'ai'
                  ? 'Describe the scene. You always get 3 looks — pick one, then style the title on the canvas.'
                  : 'Pick a platform, tap a YouTube-style template, drop a photo. Title tools sit on the right.'}
              </p>
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

              {editorMode === 'classic' ? (
              <div className="quick-row">
                <button type="button" className="chip solid" onClick={applyQuickIdea}>
                  Quick idea
                </button>
                <p className="field-help quick-hint">Shuffle mood, layout, font &amp; title style.</p>
              </div>
              ) : null}

              {editorMode === 'ai' ? (
              <div className="photo-box ai-scene-box">
                <div>
                  <p className="photo-title">AI Thumbnail creator</p>
                  <p className="photo-help">
                    Describe a visual scene (who, where, mood). You always get 3 looks — even if
                    free AI is busy, studio stills fill the picker. Title text is added on the
                    canvas, not burned into the photo.
                  </p>
                  {photoName ? <p className="photo-name">Selected: {photoName}</p> : null}
                </div>
                <div className="scene-preset-row" role="list">
                  {AI_SCENE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      role="listitem"
                      className="chip scene-preset"
                      onClick={() => applyScenePreset(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <fieldset className="ai-style-field">
                  <legend>Style (lighting &amp; look — scene text still wins)</legend>
                  <div className="ai-style-row" role="list">
                    {AI_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        role="listitem"
                        className={
                          style.id === aiStyleId ? 'chip solid ai-style-chip is-selected' : 'chip ai-style-chip'
                        }
                        aria-pressed={style.id === aiStyleId}
                        title={style.blurb}
                        onClick={() => {
                          setAiStyleId(style.id)
                          setAiStyleTip(suggestAiStyle(aiHint, style.id))
                        }}
                      >
                        <span className="ai-style-chip-label">{style.label}</span>
                        <span className="ai-style-chip-blurb">{style.blurb}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="ai-hint-field">
                  Describe the scene for your thumbnail
                  <textarea
                    id="ai-scene-hint"
                    rows={3}
                    value={aiHint}
                    onChange={(event) => onAiHintChange(event.target.value)}
                    placeholder="e.g. cute cartoon animals playing in a sunny jungle for kids"
                  />
                </label>
                {aiStyleTip ? (
                  <p className="ai-style-suggest" role="status">
                    This scene fits <strong>{getAiStyle(aiStyleTip).label}</strong> better than{' '}
                    {getAiStyle(aiStyleId).label}.
                    <button type="button" className="ai-style-suggest-btn" onClick={applySuggestedStyle}>
                      Switch style
                    </button>
                  </p>
                ) : (
                  <p className="ai-honesty-note">
                    Animals and kids work best with <strong>Kids / fun</strong> or{' '}
                    <strong>Cartoon</strong>. Keep the scene visual — skip slogans; add those as
                    title on the canvas.
                  </p>
                )}
                <div className="photo-actions">
                  <button
                    type="button"
                    className="chip solid ai-generate"
                    disabled={aiBusy}
                    aria-busy={aiBusy}
                    onClick={() => void runAiThumbnail('fresh')}
                  >
                    {aiBusy
                      ? 'Creating looks…'
                      : aiCooldownSec > 0 && aiVariants.length === 0
                        ? 'Try again'
                        : 'Generate 3 looks'}
                  </button>
                  {aiCanFetchMore && !aiBusy && aiCooldownSec === 0 ? (
                    <button
                      type="button"
                      className="chip solid ai-retry-remaining"
                      onClick={() => void runAiThumbnail('more')}
                    >
                      More looks
                    </button>
                  ) : null}
                  {aiBusy ? (
                    <button
                      type="button"
                      className="chip"
                      onClick={() => {
                        aiAbortRef.current?.abort()
                        setAiBusy(false)
                        setAiStatus({ kind: 'idle', text: 'Stopped. Keep the looks you have.' })
                      }}
                    >
                      Stop
                    </button>
                  ) : null}
                </div>
                <div className="ai-picker-block">
                  <p className="ai-picker-label">
                    {aiBusy
                      ? `Creating looks… ${Math.min(aiProgressDone + 1, AI_LOOK_TARGET)} of ${AI_LOOK_TARGET}`
                      : aiVariants.length > 0
                        ? `Pick a look · ${aiVariants.length} ready`
                        : aiStatus.kind === 'err'
                          ? 'No looks yet — try a shorter scene'
                          : '3 looks will land here after you generate'}
                  </p>
                  <div className="ai-variant-picker" role="listbox" aria-label="Pick one of up to 3 AI looks">
                    {Array.from({ length: aiSlotCount }, (_, index) => {
                      const item = aiVariants[index]
                      if (item) {
                        return (
                          <button
                            key={`${item.seed}-${index}`}
                            type="button"
                            role="option"
                            aria-selected={index === aiPick}
                            className={index === aiPick ? 'ai-variant-card is-selected' : 'ai-variant-card'}
                            onClick={() => pickAiVariant(index)}
                          >
                            <img src={item.objectUrl} alt={`AI look ${index + 1}`} />
                            <span>
                              {item.lookLabel || `Look ${index + 1}`}
                              {item.source === 'grade'
                                ? ' · restyle'
                                : item.source === 'studio'
                                  ? ' · studio'
                                  : ''}
                              {index === aiPick ? ' · selected' : ''}
                            </span>
                          </button>
                        )
                      }
                      const loadingThis = aiBusy && index <= Math.max(aiProgressDone, 0)
                      const failedEmpty = !aiBusy && aiStatus.kind === 'err' && aiVariants.length === 0
                      return (
                        <div
                          key={`slot-${index}`}
                          className={
                            loadingThis
                              ? 'ai-variant-card is-loading'
                              : failedEmpty
                                ? 'ai-variant-card is-error'
                                : 'ai-variant-card is-empty'
                          }
                        >
                          <div className="ai-variant-placeholder">
                            {loadingThis ? (
                              <>
                                <span className="ai-inline-spinner" aria-hidden />
                                <span>Creating…</span>
                              </>
                            ) : failedEmpty ? (
                              <span>Try again</span>
                            ) : (
                              <span className="ai-look-skel" aria-hidden />
                            )}
                          </div>
                          <span>
                            {loadingThis ? 'Working' : failedEmpty ? 'Empty' : `Look ${index + 1}`}
                          </span>
                        </div>
                      )
                    })}
                  </div>
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
                <div className="editor-next-row">
                  <button type="button" className="chip solid" onClick={() => setEditorTab('title')}>
                    Next: style the title →
                  </button>
                </div>
              </div>
              ) : (
              <div className="photo-box classic-create-box">
                <div>
                  <p className="photo-title">Templates &amp; your photo</p>
                  <p className="photo-help">
                    Same live canvas as AI — tap a starter, drop a JPG/PNG, then style the title.
                    Drag files onto the preview.
                  </p>
                  {photoName ? <p className="photo-name">Selected: {photoName}</p> : null}
                </div>
                <div className="template-gallery" role="list">
                  {THUMB_TEMPLATES.map((item) => {
                    const tplPlatform = getPlatform(item.platform)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={
                          activeTemplateId === item.id ? 'template-card is-selected' : 'template-card'
                        }
                        role="listitem"
                        onClick={() => applyTemplate(item.id)}
                      >
                        <span className={`template-thumb layout-${item.layout}`} aria-hidden />
                        <span className="template-copy">
                          <strong>{item.label}</strong>
                          <small>
                            {item.blurb} · {tplPlatform.label}
                          </small>
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div className="photo-actions">
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
                  <button type="button" className="chip solid" onClick={() => setEditorTab('title')}>
                    Next: style the title →
                  </button>
                </div>
                <p className="field-help">
                  Drop a photo on the canvas, or generate an AI scene anytime from the AI path.
                </p>
              </div>
              )}

              <input
                ref={fileRef}
                className="file-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => onPickPhoto(event.target.files?.[0])}
              />

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
              <p className="step-lede">
                Two-line YouTube hook, font, and size — drag the title or use Left / Center / Right.
              </p>
              <p className="drag-affordance" aria-hidden>
                Grab the title on the preview and drag it. Inspector on the right has color, outline,
                and shadow.
              </p>

              <label>
                Short tag (optional)
                <input
                  value={tag}
                  maxLength={18}
                  onChange={(event) => setTag(event.target.value)}
                  placeholder={niche.badge}
                />
              </label>

              <label>
                Title line 1
                <textarea
                  id="title-input"
                  value={title}
                  maxLength={42}
                  rows={2}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="I SPENT $1"
                />
              </label>
              <label>
                Title line 2
                <input
                  value={titleLine2}
                  maxLength={42}
                  onChange={(event) => setTitleLine2(event.target.value)}
                  placeholder="AND THIS HAPPENED"
                />
              </label>

              <fieldset>
                <legend>Position</legend>
                <div className="choice-row" role="radiogroup" aria-label="Title position">
                  {TITLE_POSITION_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={titleAlign === preset.align ? 'choice is-selected' : 'choice'}
                      role="radio"
                      aria-checked={titleAlign === preset.align}
                      onClick={() => applyTitlePreset(preset.id)}
                    >
                      <span>{preset.label}</span>
                      <small>{preset.blurb}</small>
                    </button>
                  ))}
                </div>
              </fieldset>
              <button
                type="button"
                className="linkish"
                onClick={() => {
                  setTextPos(defaultTextPosition(platform, layout))
                  setTitleAlign('left')
                  setTextSelected(false)
                  setStatus('Title position reset for this layout.')
                }}
              >
                Reset title position on preview
              </button>

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
                bigger for Shorts. Drag the title block on the canvas to place it.
              </p>

              <div className="editor-next-row">
                <button type="button" className="chip solid" onClick={() => setEditorTab('finish')}>
                  Next: layout &amp; download →
                </button>
              </div>
            </section>
            ) : null}

            {editorTab === 'finish' ? (
            <section className="step step-clean">
              <p className="step-lede">
                Layout, photo shape, accents, and stickers — then download. Title font &amp; size
                stay on the Title tab.
              </p>

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

          <div
            className={photoDragOver ? 'preview-panel studio-stage is-drop-target' : 'preview-panel studio-stage'}
            onDragOver={(event) => {
              event.preventDefault()
              setPhotoDragOver(true)
            }}
            onDragLeave={() => setPhotoDragOver(false)}
            onDrop={onPhotoDrop}
          >
            <div className="preview-chrome">
              <p className="preview-label">Live canvas</p>
              <p className="preview-meta">
                {platform.label} · {platform.width}×{platform.height}
                {dragging ? ' · placing…' : textSelected ? ' · title selected' : ''}
              </p>
            </div>
            <div className="preview-viewport">
            <div
              className={`preview-wrap ${platform.orientation}${photoDragOver ? ' is-drop' : ''}${!photo ? ' is-empty' : ''}`}
              style={{ aspectRatio: `${platform.width} / ${platform.height}` }}
            >
              <canvas
                ref={canvasRef}
                className="preview interactive"
                width={platform.width}
                height={platform.height}
                aria-label="Thumbnail preview. Drag title and stickers to move them. Drop a photo to place it."
                onPointerDown={onCanvasPointerDown}
                onPointerMove={onCanvasPointerMove}
                onPointerUp={onCanvasPointerUp}
                onPointerCancel={onCanvasPointerUp}
              />
              {photoDragOver ? (
                <div className="canvas-drop-overlay">Drop photo to place it</div>
              ) : !photo && !aiBusy && !title.trim() ? (
                <div className="canvas-empty-hint">
                  {editorMode === 'ai' ? (
                    <>
                      <p>No backdrop yet</p>
                      <button
                        type="button"
                        className="chip solid"
                        onClick={() => {
                          setEditorTab('create')
                          window.setTimeout(() => document.getElementById('ai-scene-hint')?.focus(), 50)
                        }}
                      >
                        Describe an AI scene
                      </button>
                    </>
                  ) : (
                    <>
                      <p>Drop a photo or pick a template</p>
                      <button type="button" className="chip solid" onClick={() => fileRef.current?.click()}>
                        Upload photo
                      </button>
                    </>
                  )}
                </div>
              ) : null}
            </div>
            </div>
            <p className="preview-hint">
              {aiBusy
                ? 'Creating looks — the first one lands on this canvas.'
                : 'Drag the title or stickers. Drop a JPG/PNG onto the canvas to replace the photo.'}
            </p>
          </div>

          <aside className="studio-inspector" aria-label="Title inspector">
            <p className="studio-inspector-kicker">Inspector</p>
            <h3 className="studio-inspector-title">Title</h3>
            <div className="inspector-row">
              <span className="inspector-label">Align</span>
              <div className="inspector-pills">
                {TITLE_POSITION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={titleAlign === preset.align ? 'inspector-pill is-selected' : 'inspector-pill'}
                    onClick={() => applyTitlePreset(preset.id)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="inspector-field">
              Size {titleFontSizePx}px
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
            <div className="inspector-row">
              <span className="inspector-label">Fill</span>
              <div className="inspector-swatches">
                <button
                  type="button"
                  className={!titleFill ? 'inspector-swatch is-selected' : 'inspector-swatch'}
                  onClick={() => setTitleFill('')}
                  title="From style"
                >
                  Auto
                </button>
                {TITLE_FILL_PRESETS.map((swatch) => (
                  <button
                    key={swatch.id}
                    type="button"
                    className={titleFill === swatch.value ? 'inspector-swatch is-selected' : 'inspector-swatch'}
                    style={{ background: swatch.value }}
                    title={swatch.label}
                    onClick={() => setTitleFill(swatch.value)}
                  />
                ))}
                <input
                  className="inspector-color"
                  type="color"
                  value={titleFill || '#ffffff'}
                  onChange={(event) => setTitleFill(event.target.value)}
                  aria-label="Custom title color"
                />
              </div>
            </div>
            <label className="inspector-field">
              Outline {titleOutlineWidth < 0 ? 'auto' : `${titleOutlineWidth}px`}
              <input
                type="range"
                min={TITLE_OUTLINE_MIN}
                max={TITLE_OUTLINE_MAX}
                value={titleOutlineWidth < 0 ? 12 : titleOutlineWidth}
                onChange={(event) => setTitleOutlineWidth(clampOutlineWidth(Number(event.target.value)))}
              />
            </label>
            <div className="inspector-row">
              <span className="inspector-label">Outline color</span>
              <input
                className="inspector-color"
                type="color"
                value={titleOutlineColor}
                onChange={(event) => setTitleOutlineColor(event.target.value)}
              />
            </div>
            <label className="inspector-field">
              Font
              <select
                className="inspector-select"
                value={fontId}
                onChange={(event) => setFontId(event.target.value as FontId)}
                aria-label="Title font"
              >
                {FONTS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="inspector-check">
              <input
                type="checkbox"
                checked={titleShadow}
                onChange={(event) => setTitleShadow(event.target.checked)}
              />
              Drop shadow
            </label>
            <div className="inspector-polish" role="group" aria-label="One-tap title polish">
              <button
                type="button"
                className="inspector-pill"
                onClick={() => {
                  setTitleFontSizePx(clampTitleFontSize(titleFontSizePx + 18))
                  setStatus('Bigger type — readable on a phone tile.')
                }}
              >
                Bigger type
              </button>
              <button
                type="button"
                className="inspector-pill"
                onClick={() => {
                  setTextStyleId('yellow-pop')
                  setTitleOutlineWidth(Math.max(14, titleOutlineWidth))
                  setTitleShadow(true)
                  setStatus('Punchier title — high contrast for the feed.')
                }}
              >
                Punchier
              </button>
              <button
                type="button"
                className="inspector-pill"
                onClick={() => {
                  applyTitlePreset('left')
                  setStickers([])
                  setLayout('photo-full')
                  setStatus('Cleaner layout — full-bleed photo, title on the left.')
                }}
              >
                Cleaner
              </button>
            </div>
            {aiVariants.length > 0 ? (
              <div className="inspector-looks">
                <span className="inspector-label">Looks</span>
                <div className="inspector-look-row">
                  {aiVariants.map((item, index) => (
                    <button
                      key={`${item.seed}-${index}`}
                      type="button"
                      className={index === aiPick ? 'inspector-look is-selected' : 'inspector-look'}
                      onClick={() => pickAiVariant(index)}
                    >
                      <img src={item.objectUrl} alt="" />
                      <span>{item.lookLabel || index + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
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
            {modal === 'trial' ? (
              <form onSubmit={onStartTrial}>
                <h2 id="modal-title">Start {TRIAL_DAYS}-day trial</h2>
                <p>
                  Unlock Creator clean exports in this browser for {TRIAL_DAYS} days. No card and no
                  password — we remember your email on this device. Payments come later.
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
                    Start {TRIAL_DAYS}-day trial
                  </button>
                  <button type="button" className="chip" onClick={() => setModal('none')}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : modal === 'login' ? (
              <form onSubmit={onSimpleLogin}>
                <h2 id="modal-title">Sign in</h2>
                <p>
                  Not a full account yet. We only save your name and email on this device
                  {simpleAuthIsDeviceOnly()
                    ? ' — nothing is sent to a Thumbric server.'
                    : ', and optionally sync the same details to our backend when it is connected.'}{' '}
                  No password. You can keep using the editor without this.
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
