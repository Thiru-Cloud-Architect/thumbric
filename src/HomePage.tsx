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
  createThumbnailDataUrl,
  downloadThumbnail,
  hitTestSticker,
  hitTestTextBlock,
  renderThumbnail,
} from './render'
import {
  TEMPLATE_CATEGORIES,
  templatesForCategory,
  THUMB_TEMPLATES,
  type TemplateCategory,
  type TemplateId,
} from './templates'
import { LayersPanel } from './LayersPanel'
import { YouTubeFeedPreview } from './YouTubeFeedPreview'
import { CreatorKitPanel } from './CreatorKitPanel'
import { defaultLayerState, isLayerLocked, type LayerState } from './editorLayers'
import {
  fileToDataUrl,
  loadCreatorKit,
  saveCreatorKit,
  type CreatorKit,
} from './creatorKit'
import { snapNormalized } from './snapGuides'
import { pushThumbnailHistory } from './thumbnailHistory'
import { upsertProject } from './projects'
import { styleHintFromKit } from './creatorKit'
import { autosaveAgeLabel, loadAutosave, saveAutosave } from './autosave'
import { hasBlockingExportIssue, validateExport, type ExportCheck } from './exportValidation'
import { ShortcutsModal } from './ShortcutsModal'
import { OnboardingTips } from './OnboardingTips'
import { loadVersions, pushVersion } from './versionHistory'
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
import {
  buildCreativeBrief,
  visualHintForConcept,
  type CreativeBrief,
} from './creativeBrief'
import {
  analyzeDesignIssues,
  applyRefineAction,
  parseRefineIntent,
  refineChipList,
  type DesignIssue,
  type DesignSnapshot,
  type RefineActionId,
} from './refineActions'
import {
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
  type HistoryStack,
} from './editorHistory'
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
type EditorMode = 'ai' | 'classic' | 'improve'

type EditorSnap = {
  title: string
  titleLine2: string
  titleFontSizePx: number
  titleAlign: TitleAlign
  titleFill: string
  titleOutlineWidth: number
  titleOutlineColor: string
  titleShadow: boolean
  textStyleId: TextStyleId
  layout: LayoutId
  photoShape: PhotoShapeId
  stickers: PlacedSticker[]
  textPos: { x: number; y: number }
  fontId: FontId
  aiPick: number
}

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
  const [creativeBrief, setCreativeBrief] = useState<CreativeBrief | null>(null)
  const [aiPick, setAiPick] = useState(0)
  const [showSafeZones, setShowSafeZones] = useState(false)
  const [canvasZoom, setCanvasZoom] = useState(1)
  const [mobilePreview, setMobilePreview] = useState(false)
  const [mobilePreviewUrl, setMobilePreviewUrl] = useState('')
  const [feedPreview, setFeedPreview] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [lineHeight, setLineHeight] = useState(1.05)
  const [titleOpacity, setTitleOpacity] = useState(1)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [exportChecks, setExportChecks] = useState<ExportCheck[] | null>(null)
  const [autosaveLabel, setAutosaveLabel] = useState('Autosave on')
  const [beforeUrl, setBeforeUrl] = useState('')
  const [compareBefore, setCompareBefore] = useState(false)
  const [versions, setVersions] = useState(() => loadVersions())
  const [showMoreCanvasTools, setShowMoreCanvasTools] = useState(false)
  const [showAdvancedText, setShowAdvancedText] = useState(false)
  const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1, 2] as const
  const [layerState, setLayerState] = useState<LayerState>(() => defaultLayerState())
  const [photoTreatment, setPhotoTreatment] = useState<
    'normal' | 'blur-background' | 'brand-backdrop'
  >('normal')
  const [creatorKit, setCreatorKit] = useState<CreatorKit>(() => loadCreatorKit())
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null)
  const [textRotationDeg, setTextRotationDeg] = useState(0)
  const [snapGuides, setSnapGuides] = useState<{ vertical?: number; horizontal?: number }>({})
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('all')
  const [refineDraft, setRefineDraft] = useState('')
  const [designIssues, setDesignIssues] = useState<DesignIssue[]>([])
  const historyRef = useRef<HistoryStack<EditorSnap> | null>(null)
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
      showSafeZones,
      activeStickerIndex: activeStickerIndex ?? undefined,
      highlightText: textSelected,
      layerVisibility: layerState.visibility,
      photoTreatment,
      brandBackdrop: [creatorKit.primary, creatorKit.secondary, creatorKit.primary] as [
        string,
        string,
        string,
      ],
      logo: logoImage,
      textRotationDeg,
      snapGuides: dragging ? snapGuides : undefined,
      showGrid,
      letterSpacing,
      lineHeight,
      titleOpacity,
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
      showSafeZones,
      activeStickerIndex,
      textSelected,
      dragging,
      layerState,
      photoTreatment,
      creatorKit,
      logoImage,
      textRotationDeg,
      snapGuides,
      showGrid,
      letterSpacing,
      lineHeight,
      titleOpacity,
    ],
  )

  useEffect(() => {
    track('landing_page_view', { path: '/' })
  }, [])

  useEffect(() => {
    if (!creatorKit.logoDataUrl) {
      setLogoImage(null)
      return
    }
    const img = new Image()
    img.onload = () => setLogoImage(img)
    img.src = creatorKit.logoDataUrl
  }, [creatorKit.logoDataUrl])

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
    if (mobilePreview || feedPreview || compareBefore) {
      try {
        setMobilePreviewUrl(canvas.toDataURL('image/jpeg', 0.82))
      } catch {
        /* tainted canvas — ignore */
      }
    }
  }, [previewInput, platform.width, platform.height, mobilePreview, feedPreview, compareBefore])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      const mod = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()
      if (mod && key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undoEdit()
        return
      }
      if (mod && (key === 'y' || (key === 'z' && event.shiftKey))) {
        event.preventDefault()
        redoEdit()
        return
      }
      if (mod && key === 's') {
        event.preventDefault()
        persistAutosave()
        setStatus('Draft autosaved on this device.')
        return
      }
      if (mod && key === 'd') {
        event.preventDefault()
        duplicateActiveSticker()
        return
      }
      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault()
        setShortcutsOpen(true)
        return
      }
      if (event.key === 'Escape') {
        setTextSelected(false)
        setActiveStickerIndex(null)
        setShortcutsOpen(false)
        return
      }
      if (key === 't') {
        setEditorTab('title')
        setTextSelected(true)
        return
      }
      if (key === 'i') {
        fileRef.current?.click()
        return
      }
      if (key === '=' || key === '+') {
        event.preventDefault()
        setCanvasZoom((z) => Math.min(2, Math.round((z + 0.25) * 100) / 100))
        return
      }
      if (key === '-' || key === '_') {
        event.preventDefault()
        setCanvasZoom((z) => Math.max(0.25, Math.round((z - 0.25) * 100) / 100))
        return
      }
      if (key === '0') {
        setCanvasZoom(1)
        return
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (activeStickerIndex != null) {
          event.preventDefault()
          setStickers((current) => current.filter((_, i) => i !== activeStickerIndex))
          setActiveStickerIndex(null)
          setStatus('Sticker deleted.')
        }
        return
      }
      const step = event.shiftKey ? 0.05 : 0.01
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault()
        const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0
        const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0
        if (activeStickerIndex != null) {
          setStickers((current) =>
            current.map((item, index) =>
              index === activeStickerIndex
                ? {
                    ...item,
                    x: clampStickerPos(item.x + dx),
                    y: clampStickerPos(item.y + dy),
                  }
                : item,
            ),
          )
        } else if (textSelected || true) {
          setTextSelected(true)
          setTextPos((pos) =>
            clampTextPosition(platform, layout, {
              x: pos.x + dx,
              y: pos.y + dy,
            }),
          )
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    const draft = loadAutosave()
    if (!draft) return
    setPlatformId(draft.platformId)
    setNicheId(draft.nicheId)
    setLayout(draft.layout)
    setPhotoShape(draft.photoShape)
    setAccentOverride(draft.accentOverride)
    setFontId(draft.fontId)
    setTextStyleId(draft.textStyleId)
    setTitleFontSizePx(draft.titleFontSizePx)
    setTextPos(draft.textPos)
    setTitleAlign(draft.titleAlign)
    setTitleLine2(draft.titleLine2)
    setTitleFill(draft.titleFill)
    setTitleOutlineWidth(draft.titleOutlineWidth)
    setTitleOutlineColor(draft.titleOutlineColor)
    setTitleShadow(draft.titleShadow)
    setTitle(draft.title)
    setTag(draft.tag)
    setStickers(draft.stickers)
    setAiHint(draft.aiHint)
    setTextRotationDeg(draft.textRotationDeg)
    setLetterSpacing(draft.letterSpacing)
    setLineHeight(draft.lineHeight)
    setTitleOpacity(draft.titleOpacity)
    setAutosaveLabel(autosaveAgeLabel(draft.updatedAt))
    if (draft.photoDataUrl) {
      const img = new Image()
      img.onload = () => {
        setPhoto(img)
        setPhotoName('Restored draft photo')
      }
      img.src = draft.photoDataUrl
    }
    setStatus('Restored your last draft from this browser.')
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => persistAutosave(), 900)
    return () => window.clearTimeout(timer)
  }, [
    title,
    tag,
    platformId,
    nicheId,
    layout,
    photoShape,
    accentOverride,
    fontId,
    textStyleId,
    titleFontSizePx,
    textPos,
    titleAlign,
    titleLine2,
    titleFill,
    titleOutlineWidth,
    titleOutlineColor,
    titleShadow,
    stickers,
    aiHint,
    textRotationDeg,
    letterSpacing,
    lineHeight,
    titleOpacity,
    photoUrl,
  ])

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
    if (stickerIndex >= 0 && !isLayerLocked(layerState, 'stickers')) {
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
    if (hitTestTextBlock(previewInput, point.x, point.y) && !isLayerLocked(layerState, 'title')) {
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
        current.map((item, index) => {
          if (index !== dragIndex) return item
          const raw = {
            x: (point.x - offset.x) / platform.width,
            y: (point.y - offset.y) / platform.height,
          }
          const snapped = snapNormalized(raw)
          setSnapGuides(snapped.guides)
          return {
            ...item,
            x: clampStickerPos(snapped.point.x),
            y: clampStickerPos(snapped.point.y),
          }
        }),
      )
      event.currentTarget.style.cursor = 'grabbing'
      return
    }
    if (target === 'text') {
      const offset = dragOffsetRef.current
      const raw = {
        x: (point.x - offset.x) / platform.width,
        y: (point.y - offset.y) / platform.height,
      }
      const snapped = snapNormalized(raw)
      setSnapGuides(snapped.guides)
      setTextPos(clampTextPosition(platform, layout, snapped.point))
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
    setSnapGuides({})
    event.currentTarget.style.cursor = 'grab'
    setStatus('Placed. Drag text or stickers anytime on the preview.')
  }

  function persistAutosave() {
    let photoDataUrl: string | undefined
    try {
      if (photo && canvasRef.current) {
        // Prefer storing a small JPEG of the current canvas photo region via existing photo URL when possible.
        photoDataUrl = photoUrl.startsWith('data:') ? photoUrl : undefined
      }
    } catch {
      photoDataUrl = undefined
    }
    saveAutosave({
      version: 1,
      updatedAt: Date.now(),
      platformId,
      nicheId,
      layout,
      photoShape,
      accentOverride,
      fontId,
      textStyleId,
      titleFontSizePx,
      textPos,
      titleAlign,
      titleLine2,
      titleFill,
      titleOutlineWidth,
      titleOutlineColor,
      titleShadow,
      title,
      tag,
      stickers,
      aiHint,
      textRotationDeg,
      letterSpacing,
      lineHeight,
      titleOpacity,
      photoDataUrl,
    })
    setAutosaveLabel(autosaveAgeLabel(Date.now()))
  }

  function duplicateActiveSticker() {
    if (activeStickerIndex == null) return
    const source = stickers[activeStickerIndex]
    if (!source) return
    const copy = {
      ...source,
      x: clampStickerPos(source.x + 0.04),
      y: clampStickerPos(source.y + 0.04),
    }
    const next = [...stickers, copy].slice(-3)
    setStickers(next)
    setActiveStickerIndex(next.length - 1)
    setStatus('Sticker duplicated.')
  }

  function captureBeforeSnapshot() {
    try {
      const url = createThumbnailDataUrl({ ...previewInput, watermark: false, showSafeZones: false })
      setBeforeUrl(url)
    } catch {
      /* ignore */
    }
  }

  function requestExportWithChecks(clean: boolean) {
    const checks = validateExport(previewInput)
    setExportChecks(checks)
    if (hasBlockingExportIssue(checks)) {
      setStatus('Export paused — fix the highlighted issues or choose Export anyway.')
      return
    }
    if (clean) requestCleanSave()
    else saveMarked()
    snapshotVersion(clean ? 'Clean export' : 'Preview export')
  }

  function snapshotVersion(label: string) {
    try {
      const previewDataUrl = createThumbnailDataUrl({
        ...previewInput,
        watermark: false,
        showSafeZones: false,
      })
      pushVersion({
        label,
        previewDataUrl,
        title: title.trim() || 'Untitled',
      })
      setVersions(loadVersions())
    } catch {
      /* ignore */
    }
  }

  function alignTitle(mode: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    const next = { ...textPos }
    if (mode === 'left') next.x = 0.06
    if (mode === 'center') next.x = 0.28
    if (mode === 'right') next.x = 0.55
    if (mode === 'top') next.y = 0.08
    if (mode === 'middle') next.y = 0.38
    if (mode === 'bottom') next.y = 0.62
    setTextPos(clampTextPosition(platform, layout, next))
    setTextSelected(true)
    setStatus(`Aligned title · ${mode}`)
  }

  function surpriseMe() {
    captureBeforeSnapshot()
    const angles = [
      'contrarian take, unexpected angle, bold face reaction',
      'outcome flex, before-after energy without collage',
      'curiosity gap, one mysterious object, high contrast',
      'warning stakes, urgent color, oversized subject',
    ]
    const pick = angles[Math.floor(Math.random() * angles.length)]!
    setEditorMode('ai')
    setEditorTab('create')
    setAiHint(`${aiHint || title || 'YouTube video'}, ${pick}`)
    setStatus('Surprise direction loaded — generate 3 concepts to see it.')
    goToHash('editor-ai')
  }

  function applyBrandToCanvas() {
    setAccentOverride(creatorKit.accent)
    setFontId(creatorKit.fontId)
    setLayout(creatorKit.preferredLayout)
    setTextPos(defaultTextPosition(platform, creatorKit.preferredLayout))
    saveCreatorKit(creatorKit)
    setStatus('Brand colors, font, and preferred layout applied.')
  }

  function createInMyStyle() {
    applyBrandToCanvas()
    setEditorMode('ai')
    setEditorTab('create')
    setAiHint(styleHintFromKit(creatorKit))
    if (creatorKit.facePhotos[0]) {
      const img = new Image()
      img.onload = () => {
        setPhoto(img)
        setPhotoName('Creator kit face')
        setStatus('Loaded your face photo. Generate 3 concepts in your style.')
      }
      img.src = creatorKit.facePhotos[0]
    } else {
      setStatus('Style brief loaded — describe the video or generate concepts.')
    }
    goToHash('editor-ai')
  }

  async function onBrandLogoFile(file: File) {
    const dataUrl = await fileToDataUrl(file)
    const next = { ...creatorKit, logoDataUrl: dataUrl }
    setCreatorKit(next)
    saveCreatorKit(next)
  }

  function recordDownloadPreview(clean: boolean) {
    try {
      const previewDataUrl = createThumbnailDataUrl({
        ...previewInput,
        watermark: !clean,
      })
      const name = title.trim() || 'Untitled'
      pushThumbnailHistory({
        title: name,
        platform: platform.label,
        previewDataUrl,
        clean,
      })
      upsertProject({
        name,
        previewDataUrl,
        title: name,
        platform: platform.label,
        status: 'exported',
        variants: Math.max(1, aiVariants.length || 1),
      })
    } catch {
      /* ignore history if canvas tainted */
    }
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
    setPhotoName(
      item.lookLabel
        ? `Concept · ${item.lookLabel}`
        : `AI scene · look ${index + 1} of ${total}`,
    )
    setLayout('photo-full')
    setPhotoShape('square')
    setStickers([])
    setActiveStickerIndex(null)
    if (item.lookHeadline) {
      setTitle(item.lookHeadline)
      setTitleLine2(item.lookSubheadline ?? '')
    }
    if (item.lookPlacement) {
      const preset = TITLE_POSITION_PRESETS.find((p) => p.id === item.lookPlacement)
      if (preset) {
        setTitleAlign(preset.align)
        setTextPos({ x: preset.x, y: preset.y })
        setTextSelected(true)
      }
    }
  }

  function attachConcepts(
    images: AiGeneratedImage[],
    brief: CreativeBrief | null,
  ): AiGeneratedImage[] {
    if (!brief) return images
    return images.map((item, index) => {
      const concept = brief.concepts[index]
      if (!concept) return item
      return {
        ...item,
        lookLabel: concept.strategy,
        lookWhy: concept.why,
        lookHeadline: concept.headline,
        lookSubheadline: concept.subheadline,
        lookPlacement: concept.placement,
      }
    })
  }

  function captureEditorSnap(): EditorSnap {
    return {
      title,
      titleLine2,
      titleFontSizePx,
      titleAlign,
      titleFill,
      titleOutlineWidth,
      titleOutlineColor,
      titleShadow,
      textStyleId,
      layout,
      photoShape,
      stickers,
      textPos,
      fontId,
      aiPick,
    }
  }

  function restoreEditorSnap(snap: EditorSnap) {
    setTitle(snap.title)
    setTitleLine2(snap.titleLine2)
    setTitleFontSizePx(snap.titleFontSizePx)
    setTitleAlign(snap.titleAlign)
    setTitleFill(snap.titleFill)
    setTitleOutlineWidth(snap.titleOutlineWidth)
    setTitleOutlineColor(snap.titleOutlineColor)
    setTitleShadow(snap.titleShadow)
    setTextStyleId(snap.textStyleId)
    setLayout(snap.layout)
    setPhotoShape(snap.photoShape)
    setStickers(snap.stickers)
    setTextPos(snap.textPos)
    setFontId(snap.fontId)
    setAiPick(snap.aiPick)
  }

  function rememberBeforeChange() {
    const snap = captureEditorSnap()
    historyRef.current = historyRef.current
      ? pushHistory(historyRef.current, snap)
      : createHistory(snap)
  }

  function undoEdit() {
    if (!historyRef.current) return
    const next = undoHistory(historyRef.current)
    if (next === historyRef.current) {
      setStatus('Nothing to undo.')
      return
    }
    historyRef.current = next
    restoreEditorSnap(next.present)
    setStatus('Undid last edit.')
  }

  function redoEdit() {
    if (!historyRef.current) return
    const next = redoHistory(historyRef.current)
    if (next === historyRef.current) {
      setStatus('Nothing to redo.')
      return
    }
    historyRef.current = next
    restoreEditorSnap(next.present)
    setStatus('Redid last edit.')
  }

  function designSnapshotNow(): DesignSnapshot {
    return {
      title,
      titleLine2,
      titleFontSizePx,
      titleAlign,
      titleFill,
      titleOutlineWidth,
      titleShadow,
      textStyleId,
      layout,
      stickerCount: stickers.length,
      hasPhoto: Boolean(photo),
    }
  }

  function runImproveAnalysis() {
    const issues = analyzeDesignIssues(designSnapshotNow())
    setDesignIssues(issues)
    setStatus(
      issues.length
        ? `Found ${issues.length} improvement${issues.length === 1 ? '' : 's'} — fix all or one by one.`
        : 'Looking solid — no major heuristic issues.',
    )
    track('thumbnail_analyzed', { tool: 'editor-improve', issues: issues.length })
  }

  function commitRefine(id: RefineActionId) {
    rememberBeforeChange()
    const patch = applyRefineAction(id, designSnapshotNow())
    if (patch.title != null) setTitle(patch.title)
    if (patch.titleLine2 != null) setTitleLine2(patch.titleLine2)
    if (patch.titleFontSizePx != null) setTitleFontSizePx(patch.titleFontSizePx)
    if (patch.titleAlign != null) {
      setTitleAlign(patch.titleAlign)
      applyTitlePreset(patch.titleAlign)
    }
    if (patch.titleFill != null) setTitleFill(patch.titleFill)
    if (patch.titleOutlineWidth != null) setTitleOutlineWidth(patch.titleOutlineWidth)
    if (patch.titleShadow != null) setTitleShadow(patch.titleShadow)
    if (patch.textStyleId != null) setTextStyleId(patch.textStyleId)
    if (patch.layout != null) setLayout(patch.layout)
    if (patch.clearStickers) {
      setStickers([])
      setActiveStickerIndex(null)
    }
    setStatus(patch.status || 'Updated.')
    setDesignIssues((current) => current.filter((issue) => issue.fixId !== id))
  }

  function runRefineDraft() {
    const id = parseRefineIntent(refineDraft)
    if (!id) {
      setStatus('Try: “make it more dramatic”, “shorter text”, or “better on mobile”.')
      return
    }
    commitRefine(id)
    setRefineDraft('')
  }

  function fixAllIssues() {
    if (designIssues.length === 0) {
      runImproveAnalysis()
      return
    }
    rememberBeforeChange()
    const ids = [...new Set(designIssues.map((issue) => issue.fixId))]
    let snap = designSnapshotNow()
    for (const id of ids) {
      const patch = applyRefineAction(id, snap)
      if (patch.title != null) snap = { ...snap, title: patch.title }
      if (patch.titleLine2 != null) snap = { ...snap, titleLine2: patch.titleLine2 }
      if (patch.titleFontSizePx != null) snap = { ...snap, titleFontSizePx: patch.titleFontSizePx }
      if (patch.titleAlign != null) snap = { ...snap, titleAlign: patch.titleAlign }
      if (patch.titleFill != null) snap = { ...snap, titleFill: patch.titleFill }
      if (patch.titleOutlineWidth != null) snap = { ...snap, titleOutlineWidth: patch.titleOutlineWidth }
      if (patch.titleShadow != null) snap = { ...snap, titleShadow: patch.titleShadow }
      if (patch.textStyleId != null) snap = { ...snap, textStyleId: patch.textStyleId }
      if (patch.layout != null) snap = { ...snap, layout: patch.layout }
      if (patch.clearStickers) snap = { ...snap, stickerCount: 0 }
    }
    setTitle(snap.title)
    setTitleLine2(snap.titleLine2)
    setTitleFontSizePx(snap.titleFontSizePx)
    setTitleAlign(snap.titleAlign)
    applyTitlePreset(snap.titleAlign)
    setTitleFill(snap.titleFill)
    setTitleOutlineWidth(snap.titleOutlineWidth)
    setTitleShadow(snap.titleShadow)
    setTextStyleId(snap.textStyleId)
    setLayout(snap.layout)
    if (snap.stickerCount === 0) {
      setStickers([])
      setActiveStickerIndex(null)
    }
    setDesignIssues([])
    setStatus('Applied fixes for the listed issues.')
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

    const brief = mode === 'fresh' ? buildCreativeBrief(aiHint || title) : creativeBrief
    if (mode === 'fresh' && brief) setCreativeBrief(brief)
    const primaryHint =
      brief?.concepts[0] != null
        ? visualHintForConcept(brief, brief.concepts[0])
        : aiHint

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
        ? `Creating concept ${prior.length + 1} of ${AI_LOOK_TARGET}…`
        : 'Packaging 3 concepts — strategy first, then visuals…'
    setAiStatus({ kind: 'busy', text: busyMsg })
    setStatus(busyMsg)

    try {
      const batch = await generateAiThumbnailVariants(
        {
          title: brief?.concepts[0]?.headline || title,
          niche,
          platform,
          hint: primaryHint,
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
                ? 'Concepts are ready — pick one below.'
                : `Creating concept ${nextIndex} of ${AI_LOOK_TARGET}…`
            setAiStatus({ kind: 'busy', text })
            setStatus(text)
          },
          onWait: (lookIndex) => {
            if (runId !== aiRunIdRef.current) return
            setAiProgressDone(lookIndex)
            const text = `Concept ${lookIndex} is ready. Getting concept ${lookIndex + 1} of ${AI_LOOK_TARGET}…`
            setAiStatus({ kind: 'busy', text })
            setStatus(text)
          },
          onItem: (item, index) => {
            if (runId !== aiRunIdRef.current) return
            const tagged = attachConcepts([item], brief)[0]!
            const slot = prior.length + index
            setAiVariants((current) => {
              const next = [...current]
              next[slot] = tagged
              return next.slice(0, AI_LOOK_TARGET)
            })
            if (mode === 'fresh' && index === 0) {
              applyAiLook(tagged, 0, AI_LOOK_TARGET)
            }
          },
        },
      )
      if (runId !== aiRunIdRef.current) return

      const merged = attachConcepts(
        [...prior, ...batch.results].slice(0, AI_LOOK_TARGET),
        brief,
      )
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
        ? 'Free AI is busy — 3 concept packs are ready with editable titles.'
        : merged.length >= AI_LOOK_TARGET
          ? 'I found 3 ways to package your video — tap a concept.'
          : `Pick 1 of ${merged.length} concepts — tap to put it on the canvas.`
      setAiStatus({ kind: 'ok', text: okMsg })
      setStatus(okMsg)
      track('concepts_generated', {
        tool: 'editor-ai',
        count: merged.length,
        studio: batch.usedStudioFallback,
      })
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
      recordDownloadPreview(false)
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
      recordDownloadPreview(true)
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
          <OnboardingTips />
          <div className="editor-head editor-head-slim">
            <h2 className="editor-title">
              Thumbnail studio
            </h2>
            <p className="editor-lede">
              One canvas. Start with AI, a template, or an existing thumb — edit text last.
            </p>
          </div>
        <section className="workbench editor-workbench studio-grid" aria-label="Thumbnail studio">
          <div className="editor-mode-bar" role="tablist" aria-label="Start mode">
            <button
              id="editor-ai"
              type="button"
              role="tab"
              aria-selected={editorMode === 'ai'}
              className={editorMode === 'ai' ? 'editor-mode-pill is-active' : 'editor-mode-pill'}
              onClick={() => {
                setEditorMode('ai')
                setEditorTab('create')
              }}
            >
              Create with AI
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={editorMode === 'classic'}
              className={editorMode === 'classic' ? 'editor-mode-pill is-active' : 'editor-mode-pill'}
              onClick={() => {
                setEditorMode('classic')
                setEditorTab('create')
              }}
            >
              From scratch
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={editorMode === 'improve'}
              className={editorMode === 'improve' ? 'editor-mode-pill is-active' : 'editor-mode-pill'}
              onClick={() => {
                setEditorMode('improve')
                setEditorTab('create')
              }}
            >
              Improve
            </button>
            <p className="editor-mode-meta" aria-live="polite">
              {platform.width}×{platform.height}
              {photoName ? ` · ${photoName}` : ''}
            </p>
          </div>
          <form
            className="controls studio-tools"
            onSubmit={(event) => {
              event.preventDefault()
              requestExportWithChecks(false)
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
                  ? 'Tell Thumbric what the video is about. AI proposes 3 packaging strategies — you pick one and finish in the editor.'
                  : editorMode === 'improve'
                    ? 'Upload a thumbnail you already have, score it, then jump back here to generate stronger alternatives.'
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

              {editorMode === 'improve' ? (
              <div className="photo-box ai-scene-box">
                <div>
                  <p className="photo-title">Improve my thumbnail</p>
                  <p className="photo-help">
                    Score an existing thumbnail for contrast, face size, and title space — then
                    generate 3 stronger packaging concepts in the AI path.
                  </p>
                </div>
                <div className="photo-actions">
                  <Link className="chip solid ai-generate" to="/thumbnail-doctor">
                    Open Thumbnail Doctor →
                  </Link>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => {
                      setEditorMode('ai')
                      setEditorTab('create')
                    }}
                  >
                    Or create with AI
                  </button>
                </div>
                <p className="ai-honesty-note">
                  After you score, use <strong>Generate 3 alternatives</strong> on the score page —
                  it hands a brief back into this editor.
                </p>
              </div>
              ) : null}

              {editorMode === 'ai' ? (
              <div className="photo-box ai-scene-box">
                <div>
                  <p className="photo-title">Create with AI</p>
                  <p className="photo-help">
                    Tell us what the video is about. Thumbric builds 3 packaging strategies
                    (warning, curiosity, outcome…) with editable titles — not three crops of the
                    same image.
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
                  <legend>Creative direction</legend>
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
                  What is your video about?
                  <textarea
                    id="ai-scene-hint"
                    rows={3}
                    value={aiHint}
                    onChange={(event) => onAiHintChange(event.target.value)}
                    placeholder='e.g. “5 mistakes people make when buying their first house”'
                  />
                </label>
                {aiStyleTip ? (
                  <p className="ai-style-suggest" role="status">
                    This topic fits <strong>{getAiStyle(aiStyleTip).label}</strong> better than{' '}
                    {getAiStyle(aiStyleId).label}.
                    <button type="button" className="ai-style-suggest-btn" onClick={applySuggestedStyle}>
                      Switch style
                    </button>
                  </p>
                ) : (
                  <p className="ai-honesty-note">
                    Natural language is fine. Optional photo upload comes next. Headlines stay
                    editable on the canvas — never burned into the AI image.
                  </p>
                )}
                <div className="photo-actions">
                  <button
                    type="button"
                    className="chip solid ai-generate"
                    disabled={aiBusy}
                    aria-busy={aiBusy}
                    onClick={() => {
                      captureBeforeSnapshot()
                      void runAiThumbnail('fresh')
                    }}
                  >
                    {aiBusy
                      ? 'Creating concepts…'
                      : aiCooldownSec > 0 && aiVariants.length === 0
                        ? 'Try again'
                        : 'Create 3 concepts →'}
                  </button>
                  <button
                    type="button"
                    className="chip"
                    disabled={aiBusy}
                    title="Unexpected but relevant creative direction"
                    onClick={surpriseMe}
                  >
                    Surprise me
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
                {creativeBrief && aiVariants.length > 0 ? (
                  <div className="ai-director" role="status">
                    <p className="ai-director-kicker">Creative director</p>
                    <p className="ai-director-lead">
                      I found {aiVariants.length} ways to package{' '}
                      <strong>{creativeBrief.topic}</strong> for {creativeBrief.audience.toLowerCase()}.
                    </p>
                  </div>
                ) : null}
                <div className="ai-picker-block">
                  <p className="ai-picker-label">
                    {aiBusy
                      ? `Creating concepts… ${Math.min(aiProgressDone + 1, AI_LOOK_TARGET)} of ${AI_LOOK_TARGET}`
                      : aiVariants.length > 0
                        ? `Pick a concept · ${aiVariants.length} ready`
                        : aiStatus.kind === 'err'
                          ? 'No concepts yet — try a shorter topic'
                          : '3 concepts land here after you create'}
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
                              {item.lookLabel || `Concept ${index + 1}`}
                              {index === aiPick ? ' · selected' : ''}
                            </span>
                            {item.lookWhy ? (
                              <em className="ai-concept-why">{item.lookWhy}</em>
                            ) : null}
                            {item.lookHeadline ? (
                              <strong className="ai-concept-hook">{item.lookHeadline}</strong>
                            ) : null}
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
                <div className="template-category-row" role="tablist" aria-label="Template category">
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={templateCategory === cat.id}
                      className={templateCategory === cat.id ? 'chip solid' : 'chip'}
                      onClick={() => setTemplateCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="template-gallery" role="list">
                  {templatesForCategory(templateCategory).map((item) => {
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
                Write the hook. Drag it on the canvas — color, outline, and size live in the inspector.
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
                <legend>Style</legend>
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

              <details className="editor-advanced">
                <summary>Position, font &amp; size</summary>
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
                  Reset title position
                </button>
                <fieldset>
                  <legend>Font</legend>
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
                    Size (px at 1280w)
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
              </details>

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
                Place the photo, add stickers, then download. Advanced brand tools stay collapsed.
              </p>

              <details className="editor-advanced">
                <summary>Brand kit &amp; layers</summary>
                <LayersPanel
                  state={layerState}
                  onChange={setLayerState}
                  stickerCount={stickers.length}
                  hasLogo={Boolean(creatorKit.logoDataUrl)}
                />
                <CreatorKitPanel
                  kit={creatorKit}
                  onChange={setCreatorKit}
                  onApply={applyBrandToCanvas}
                  onLogoFile={onBrandLogoFile}
                  onCreateInMyStyle={createInMyStyle}
                />
              </details>

              <div className="fold-body">
                  <fieldset>
                    <legend>Photo / backdrop</legend>
                    <div className="choice-row">
                      {(
                        [
                          ['normal', 'Standard'],
                          ['blur-background', 'Blur background'],
                          ['brand-backdrop', 'Brand backdrop'],
                        ] as const
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          className={photoTreatment === id ? 'choice is-selected' : 'choice'}
                          onClick={() => setPhotoTreatment(id)}
                        >
                          <span>{label}</span>
                          <small>{id === 'blur-background' ? 'Full-bleed blur' : id === 'brand-backdrop' ? 'Kit colors' : 'Default'}</small>
                        </button>
                      ))}
                    </div>
                  </fieldset>

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
                <button
                  type="button"
                  className="primary"
                  onClick={() => requestExportWithChecks(false)}
                >
                  Save free preview
                </button>
                <button
                  type="button"
                  className="chip solid"
                  onClick={() => requestExportWithChecks(true)}
                >
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
              <div className="preview-chrome-copy">
                <p className="preview-label">Live canvas</p>
                <p className="preview-meta">
                  {platform.label} · {platform.width}×{platform.height}
                  {dragging ? ' · placing…' : textSelected ? ' · title selected' : ''}
                </p>
              </div>
              <div className="preview-toolbar" role="toolbar" aria-label="Canvas tools">
                <button type="button" className="preview-tool" onClick={undoEdit} title="Undo (Ctrl+Z)">
                  Undo
                </button>
                <button type="button" className="preview-tool" onClick={redoEdit} title="Redo (Ctrl+Y)">
                  Redo
                </button>
                <label className="zoom-select-wrap">
                  <span className="sr-only">Zoom</span>
                  <select
                    className="zoom-select"
                    value={canvasZoom}
                    onChange={(event) => setCanvasZoom(Number(event.target.value))}
                    aria-label="Zoom level"
                  >
                    {ZOOM_PRESETS.map((z) => (
                      <option key={z} value={z}>
                        {Math.round(z * 100)}%
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className={mobilePreview ? 'preview-tool is-on' : 'preview-tool'}
                  title="Mobile size preview"
                  onClick={() => {
                    setMobilePreview((v) => {
                      if (!v) track('mobile_preview_used', { tool: 'editor' })
                      return !v
                    })
                  }}
                >
                  Mobile
                </button>
                <button
                  type="button"
                  className={showMoreCanvasTools ? 'preview-tool is-on' : 'preview-tool'}
                  onClick={() => setShowMoreCanvasTools((v) => !v)}
                >
                  More
                </button>
              </div>
              {showMoreCanvasTools ? (
                <div className="preview-toolbar preview-toolbar-more" role="toolbar" aria-label="More canvas tools">
                  <button
                    type="button"
                    className={showSafeZones ? 'preview-tool is-on' : 'preview-tool'}
                    onClick={() => setShowSafeZones((v) => !v)}
                  >
                    Safe zone
                  </button>
                  <button
                    type="button"
                    className={showGrid ? 'preview-tool is-on' : 'preview-tool'}
                    onClick={() => setShowGrid((v) => !v)}
                  >
                    Grid
                  </button>
                  <button
                    type="button"
                    className={feedPreview ? 'preview-tool is-on' : 'preview-tool'}
                    onClick={() => setFeedPreview((v) => !v)}
                  >
                    YouTube feed
                  </button>
                  <button
                    type="button"
                    className={compareBefore && beforeUrl ? 'preview-tool is-on' : 'preview-tool'}
                    disabled={!beforeUrl}
                    onClick={() => setCompareBefore((v) => !v)}
                  >
                    Before/After
                  </button>
                  <button type="button" className="preview-tool" onClick={() => setShortcutsOpen(true)}>
                    Shortcuts
                  </button>
                </div>
              ) : null}
              <p className="autosave-pill" aria-live="polite">
                {autosaveLabel}
              </p>
            </div>
            <div className="preview-viewport">
            <div
              className={`preview-wrap ${platform.orientation}${photoDragOver ? ' is-drop' : ''}${!photo ? ' is-empty' : ''}${textSelected ? ' has-selection' : ''}`}
              style={{
                aspectRatio: `${platform.width} / ${platform.height}`,
                transform: `scale(${canvasZoom})`,
                transformOrigin: 'top center',
              }}
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
            {compareBefore && beforeUrl ? (
              <div className="before-after-strip" aria-label="Before and after comparison">
                <figure>
                  <img src={beforeUrl} alt="Before" width={240} height={135} />
                  <figcaption>Before</figcaption>
                </figure>
                <figure>
                  <img src={mobilePreviewUrl || beforeUrl} alt="After" width={240} height={135} />
                  <figcaption>After (current)</figcaption>
                </figure>
              </div>
            ) : null}
            {feedPreview && mobilePreviewUrl ? (
              <YouTubeFeedPreview
                thumbUrl={mobilePreviewUrl}
                title={title}
                channelName={creatorKit.channelName}
              />
            ) : null}
            {versions.length > 0 ? (
              <div className="version-strip" aria-label="Version history">
                <p className="version-strip-kicker">Versions (this browser)</p>
                <ul>
                  {versions.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <img src={item.previewDataUrl} alt="" width={96} height={54} />
                      <span>
                        {item.label}
                        <small>{new Date(item.ts).toLocaleString()}</small>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {mobilePreview && mobilePreviewUrl ? (
              <div className="mobile-preview-strip" aria-label="Simulated mobile sizes">
                <figure>
                  <img src={mobilePreviewUrl} alt="" width={168} height={94} />
                  <figcaption>168×94 · feed tile</figcaption>
                </figure>
                <figure>
                  <img src={mobilePreviewUrl} alt="" width={320} height={180} />
                  <figcaption>320×180 · larger card</figcaption>
                </figure>
                <p className="mobile-preview-note">Simulated preview — toggle YouTube feed for home-layout chrome.</p>
              </div>
            ) : null}
            <p className="preview-hint">
              {aiBusy
                ? 'Creating concepts — the first one lands on this canvas.'
                : textSelected
                  ? 'Title selected — drag to move, or edit size/style in the inspector.'
                  : 'Drag the title or stickers. Drop a JPG/PNG onto the canvas to replace the photo.'}
            </p>
          </div>

          <aside className="studio-inspector" aria-label="Title inspector">
            <p className="studio-inspector-kicker">Inspector</p>
            <h3 className="studio-inspector-title">{textSelected ? 'Title selected' : 'Title'}</h3>
            {!textSelected && !photo ? (
              <p className="inspector-empty">Select the title on the canvas, or generate a concept first.</p>
            ) : null}
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
            <button
              type="button"
              className="chip ghost inspector-advanced-toggle"
              onClick={() => setShowAdvancedText((v) => !v)}
            >
              {showAdvancedText ? 'Hide advanced text' : 'Advanced text'}
            </button>
            {showAdvancedText ? (
              <div className="inspector-advanced">
                <label className="inspector-field">
                  Rotation {textRotationDeg}°
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    value={textRotationDeg}
                    onChange={(event) => setTextRotationDeg(Number(event.target.value))}
                  />
                </label>
                <label className="inspector-field">
                  Letter spacing {letterSpacing}px
                  <input
                    type="range"
                    min={-4}
                    max={16}
                    value={letterSpacing}
                    onChange={(event) => setLetterSpacing(Number(event.target.value))}
                  />
                </label>
                <label className="inspector-field">
                  Line height {lineHeight.toFixed(2)}
                  <input
                    type="range"
                    min={0.85}
                    max={1.4}
                    step={0.01}
                    value={lineHeight}
                    onChange={(event) => setLineHeight(Number(event.target.value))}
                  />
                </label>
                <label className="inspector-field">
                  Opacity {Math.round(titleOpacity * 100)}%
                  <input
                    type="range"
                    min={0.2}
                    max={1}
                    step={0.05}
                    value={titleOpacity}
                    onChange={(event) => setTitleOpacity(Number(event.target.value))}
                  />
                </label>
                <div className="inspector-row">
                  <span className="inspector-label">Canvas align</span>
                  <div className="inspector-pills">
                    {(['left', 'center', 'right', 'top', 'middle', 'bottom'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className="inspector-pill"
                        onClick={() => alignTitle(mode)}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="inspector-row">
                  <span className="inspector-label">Outline color</span>
                  <input
                    className="inspector-color"
                    type="color"
                    value={titleOutlineColor}
                    onChange={(event) => setTitleOutlineColor(event.target.value)}
                  />
                </div>
              </div>
            ) : null}
            <div className="inspector-improve">
              <span className="inspector-label">Improve</span>
              <button type="button" className="chip solid ai-generate" onClick={runImproveAnalysis}>
                ✨ Improve this thumbnail
              </button>
              {designIssues.length > 0 ? (
                <ul className="inspector-issues">
                  {designIssues.map((issue) => (
                    <li key={issue.id}>
                      <span>{issue.message}</span>
                      <button type="button" className="inspector-pill" onClick={() => commitRefine(issue.fixId)}>
                        Fix
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {designIssues.length > 0 ? (
                <button type="button" className="inspector-pill" onClick={fixAllIssues}>
                  Fix all
                </button>
              ) : null}
              <label className="inspector-field refine-field">
                Refine with words
                <input
                  value={refineDraft}
                  onChange={(event) => setRefineDraft(event.target.value)}
                  placeholder='e.g. “make it more dramatic”'
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      runRefineDraft()
                    }
                  }}
                />
              </label>
              <button type="button" className="chip" onClick={runRefineDraft}>
                Apply refine
              </button>
            </div>
            <div className="inspector-polish" role="group" aria-label="One-tap refine">
              {refineChipList().map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  className="inspector-pill"
                  onClick={() => commitRefine(chip.id)}
                >
                  {chip.label}
                </button>
              ))}
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
          <button type="button" className="primary" onClick={() => requestExportWithChecks(false)}>
            Save preview
          </button>
          <button type="button" className="chip solid" onClick={() => requestExportWithChecks(true)}>
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

      <section id="video-optional" className="video-optional-section" aria-labelledby="video-optional-title">
        <div className="video-optional-inner">
          <p className="section-eyebrow">Optional · Phase 4 preview</p>
          <h2 id="video-optional-title" className="section-title">
            Understand my video — <span className="gradient-text">never required</span>
          </h2>
          <p className="section-lede">
            Thumbric works from an idea, a photo, or an existing thumbnail. You do not need to upload
            unpublished videos or connect YouTube. If you want a still from your own file, pick a frame
            locally — it stays in this browser.
          </p>
          <ul className="video-privacy-list">
            <li>What you share: only a frame or photo you choose — not your full upload by default.</li>
            <li>Retention: local browser only until you export.</li>
            <li>Training: we do not claim model training on your media.</li>
            <li>Delete: clear site data or remove the photo in the editor anytime.</li>
          </ul>
          <div className="video-optional-actions">
            <button
              type="button"
              className="chip solid"
              onClick={() => {
                setEditorMode('classic')
                setEditorTab('create')
                goToHash('editor')
                window.setTimeout(() => fileRef.current?.click(), 200)
              }}
            >
              Pick a local still frame
            </button>
            <Link className="chip" to="/roadmap">
              See roadmap for YouTube loop
            </Link>
          </div>
        </div>
      </section>
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      {exportChecks ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setExportChecks(null)}>
          <div
            className="modal-card export-check-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-check-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="export-check-title">Export quality check</h2>
            <ul className="export-check-list">
              {exportChecks.map((check) => (
                <li key={check.id} className={check.ok ? 'is-ok' : 'is-warn'}>
                  <span>{check.ok ? '✓' : '!'}</span>
                  {check.label}
                </li>
              ))}
            </ul>
            <div className="photo-actions">
              <button
                type="button"
                className="chip solid"
                onClick={() => {
                  const clipped = exportChecks.find((c) => c.id === 'clip' && !c.ok)
                  if (clipped) alignTitle('left')
                  if (exportChecks.some((c) => c.id === 'readable' && !c.ok)) {
                    setTitleFontSizePx(clampTitleFontSize(110))
                  }
                  setExportChecks(null)
                  setStatus('Applied automatic fixes where possible. Review and export again.')
                }}
              >
                Fix automatically
              </button>
              <button
                type="button"
                className="chip"
                onClick={() => {
                  setExportChecks(null)
                  saveMarked()
                  snapshotVersion('Preview export')
                }}
              >
                Export anyway
              </button>
              <button type="button" className="chip ghost" onClick={() => setExportChecks(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
