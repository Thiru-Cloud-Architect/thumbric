import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { track } from './analytics'
import {
  AI_LOOK_TARGET,
  AI_RATE_LIMIT_COOLDOWN_SEC,
  generateAiThumbnailVariants,
  isAiRateLimitedError,
  type AiGeneratedImage,
  type AiStyleId,
} from './aiThumbnail'
import { consumeAiHandoff, objectUrlToDataUrl, saveAiHandoff } from './aiHandoff'
import { buildCreativeBrief, visualHintForConcept, type CreativeBrief } from './creativeBrief'
import { getNiche } from './niches'
import { getPlatform } from './platforms'
import { ToolShell } from './ToolShell'
import {
  YOUTUBE_FRAME_HONESTY,
  looksLikeYoutubeUrl,
  resolveYoutubeMeta,
  sceneBriefFromInput,
  type YoutubeMeta,
} from './youtubeUrl'

type Phase = 'compose' | 'busy' | 'ready' | 'err'

const LOOKS: Array<{ id: AiStyleId; label: string }> = [
  { id: 'cartoon', label: 'Illustration' },
  { id: 'dark-moody', label: 'Filmic' },
  { id: 'product-hero', label: 'Minimal' },
  { id: 'kids-fun', label: 'Vibrant' },
  { id: 'face-reaction', label: 'Face' },
]

const EXAMPLES = [
  'Smartphone in hand, tech review shot',
  'Creator cooking in a home kitchen',
  'Neon gaming desk, shocked reaction',
]

const LOADING_LINES = [
  'Analysing idea…',
  'Building high-CTR packaging…',
  'Preparing your thumbnail…',
  'Refining the cover concept…',
] as const

function attachConcepts(items: AiGeneratedImage[], brief: CreativeBrief | null) {
  if (!brief) return items
  return items.map((item, index) => {
    const concept = brief.concepts[index]
    if (!concept) return item
    return {
      ...item,
      lookLabel: concept.strategy,
      lookWhy: concept.why,
      lookHeadline: concept.headline,
    }
  })
}

export default function AiThumbnailMakerPage() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [styleId, setStyleId] = useState<AiStyleId>('cartoon')
  const [phase, setPhase] = useState<Phase>('compose')
  const [statusLine, setStatusLine] = useState('')
  const [errorText, setErrorText] = useState('')
  const [variants, setVariants] = useState<AiGeneratedImage[]>([])
  const [pick, setPick] = useState(0)
  const [brief, setBrief] = useState<CreativeBrief | null>(null)
  const [youtubeMeta, setYoutubeMeta] = useState<YoutubeMeta | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [photoName, setPhotoName] = useState('')
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const runIdRef = useRef(0)
  const objectUrls = useRef<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const loadTick = useRef(0)

  const niche = useMemo(() => getNiche('vlog'), [])
  const platform = useMemo(() => getPlatform('youtube'), [])
  const urlMode = looksLikeYoutubeUrl(input)
  const canGenerate = input.trim().length >= 3 && phase !== 'busy' && cooldown === 0
  const chosen = variants[pick] ?? variants[0] ?? null

  useEffect(() => {
    track('landing_page_view', { path: '/ai-thumbnail-maker' })
    const handoff = consumeAiHandoff()
    if (handoff?.hint) setInput(handoff.hint)
    if (handoff?.photoDataUrl) {
      setPhotoDataUrl(handoff.photoDataUrl)
      setPhotoName('Reference photo')
    }
    return () => {
      abortRef.current?.abort()
      for (const url of objectUrls.current) URL.revokeObjectURL(url)
    }
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])

  useEffect(() => {
    if (phase !== 'busy') return
    setStatusLine(LOADING_LINES[0]!)
    loadTick.current = 0
    const timer = window.setInterval(() => {
      loadTick.current += 1
      setStatusLine(LOADING_LINES[loadTick.current % LOADING_LINES.length]!)
    }, 2200)
    return () => window.clearInterval(timer)
  }, [phase])

  async function onPhotoPick(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorText('Photo upload accepts JPG or PNG only. Video files are not required for AI.')
      setPhase('err')
      return
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = () => reject(new Error('Could not read that photo.'))
        reader.readAsDataURL(file)
      })
      setPhotoDataUrl(dataUrl)
      setPhotoName(file.name)
      setErrorText('')
      if (phase === 'err') setPhase('compose')
    } catch {
      setErrorText('Could not read that photo.')
      setPhase('err')
    }
  }

  async function runGenerate() {
    if (!canGenerate) return

    abortRef.current?.abort()
    const controller = new AbortController()
    const runId = ++runIdRef.current
    abortRef.current = controller
    setPhase('busy')
    setErrorText('')
    setPick(0)
    setYoutubeMeta(null)
    for (const url of objectUrls.current) URL.revokeObjectURL(url)
    objectUrls.current = []
    setVariants([])
    setStatusLine(LOADING_LINES[0]!)

    let meta: YoutubeMeta | null = null
    if (urlMode) {
      setStatusLine('Analysing idea…')
      meta = await resolveYoutubeMeta(input, controller.signal)
      if (runId !== runIdRef.current) return
      setYoutubeMeta(meta)
    }

    const sceneText = sceneBriefFromInput(input, meta)
    const nextBrief = buildCreativeBrief(sceneText || input || 'YouTube video idea')
    setBrief(nextBrief)
    const primaryHint =
      nextBrief?.concepts[0] != null
        ? visualHintForConcept(nextBrief, nextBrief.concepts[0])
        : sceneText

    setStatusLine('Building high-CTR packaging…')

    try {
      const batch = await generateAiThumbnailVariants(
        {
          title: nextBrief?.concepts[0]?.headline || meta?.title || input || 'Thumbnail',
          niche,
          platform,
          hint: primaryHint,
          styleId,
        },
        {
          count: AI_LOOK_TARGET,
          signal: controller.signal,
          onProgress: (done, total) => {
            if (runId !== runIdRef.current) return
            setStatusLine(
              done >= total
                ? 'Preparing your thumbnail…'
                : LOADING_LINES[Math.min(done + 1, LOADING_LINES.length - 1)]!,
            )
          },
          onItem: (item, index) => {
            if (runId !== runIdRef.current) return
            objectUrls.current.push(item.objectUrl)
            const tagged = attachConcepts([item], nextBrief)[0]!
            setVariants((current) => {
              const next = [...current]
              next[index] = tagged
              return next.slice(0, AI_LOOK_TARGET)
            })
          },
        },
      )
      if (runId !== runIdRef.current) return

      const merged = attachConcepts(batch.results.slice(0, AI_LOOK_TARGET), nextBrief)
      for (const item of merged) {
        if (!objectUrls.current.includes(item.objectUrl)) objectUrls.current.push(item.objectUrl)
      }
      setVariants(merged)
      if (batch.rateLimited) setCooldown(AI_RATE_LIMIT_COOLDOWN_SEC)
      setPhase('ready')
      setStatusLine('')
      track('concepts_generated', {
        tool: 'ai-thumbnail-maker',
        count: merged.length,
        studio: batch.usedStudioFallback,
        youtube: Boolean(meta),
      })
      track('thumbnail_generated', { tool: 'ai-thumbnail-maker', looks: merged.length })
    } catch (error) {
      if (runId !== runIdRef.current) return
      if (error instanceof DOMException && error.name === 'AbortError' && controller.signal.aborted) {
        setPhase('compose')
        setStatusLine('')
        return
      }
      const message = error instanceof Error ? error.message : 'Could not create that thumbnail.'
      const rateLimited = isAiRateLimitedError(error) || /busy|try again in a minute/i.test(message)
      setErrorText(message)
      setPhase('err')
      track('generation_failed', { tool: 'ai-thumbnail-maker', rateLimited })
      if (rateLimited) setCooldown(AI_RATE_LIMIT_COOLDOWN_SEC)
    } finally {
      if (runId === runIdRef.current) {
        if (abortRef.current === controller) abortRef.current = null
      }
    }
  }

  async function finishInEditor() {
    if (!chosen) return
    const headline = chosen.lookHeadline || brief?.concepts[pick]?.headline || youtubeMeta?.title || ''
    let handoffPhoto = photoDataUrl ?? undefined
    if (!handoffPhoto && chosen.objectUrl) {
      try {
        handoffPhoto = await objectUrlToDataUrl(chosen.objectUrl)
      } catch {
        handoffPhoto = undefined
      }
    }
    saveAiHandoff({
      hint: input.trim() || primaryFallbackHint(brief),
      title: headline,
      styleId: 'auto',
      photoDataUrl: handoffPhoto,
      source: 'ai-thumbnail-maker',
      mode: 'classic',
    })
    track('cta_click', { tool: 'ai-thumbnail-maker', cta: 'finish_in_editor' })
    navigate({ pathname: '/', hash: '#editor' })
  }

  async function downloadHd() {
    if (!chosen?.objectUrl) return
    try {
      const response = await fetch(chosen.objectUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'thumbric-ai-thumbnail.png'
      anchor.click()
      URL.revokeObjectURL(url)
      track('cta_click', { tool: 'ai-thumbnail-maker', cta: 'download_hd' })
    } catch {
      setErrorText('Could not download that image. Try Finish in editor instead.')
      setPhase('err')
    }
  }

  function resetCompose() {
    setPhase('compose')
    setStatusLine('')
    setErrorText('')
  }

  return (
    <ToolShell
      path="/ai-thumbnail-maker"
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Tools', to: '/tools' },
        { label: 'AI Thumbnail Maker' },
      ]}
      kicker="AI Thumbnail Maker"
      title="Free AI thumbnail maker"
      lede="Describe the shot or paste a YouTube URL. You get one cover, then you can download it or open it in the editor."
    >
      {phase === 'ready' && chosen ? (
        <section className="ai-canva-result" aria-label="Thumbnail result">
          <img src={chosen.objectUrl} alt="Generated thumbnail" />
          {chosen.lookHeadline ? <p className="ai-canva-hook">Suggested title: {chosen.lookHeadline}</p> : null}
          {variants.length > 1 ? (
            <div className="ai-canva-thumbs" role="listbox" aria-label="Other covers">
              {variants.map((item, index) => (
                <button
                  key={`${item.seed}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === pick}
                  className={index === pick ? 'is-selected' : ''}
                  onClick={() => setPick(index)}
                >
                  <img src={item.objectUrl} alt="" />
                </button>
              ))}
            </div>
          ) : null}
          <div className="ai-canva-actions">
            <button type="button" className="btn-gradient" onClick={() => void downloadHd()}>
              Download
            </button>
            <button type="button" className="btn-outline" onClick={() => void finishInEditor()}>
              Open in editor
            </button>
            <button
              type="button"
              className="btn-outline"
              disabled={cooldown > 0}
              onClick={() => {
                resetCompose()
                void runGenerate()
              }}
            >
              {cooldown > 0 ? `Wait ${cooldown}s` : 'Try again'}
            </button>
          </div>
        </section>
      ) : (
        <section className="ai-canva" aria-label="Create a thumbnail">
          <label className="ai-canva-prompt">
            <span className="sr-only">Describe your thumbnail or paste a YouTube URL</span>
            <textarea
              id="ai-maker-hint"
              rows={2}
              value={input}
              disabled={phase === 'busy'}
              onChange={(event) => {
                setInput(event.target.value)
                if (phase === 'err') {
                  setPhase('compose')
                  setErrorText('')
                }
              }}
              placeholder="Describe the thumbnail, or paste a YouTube URL"
            />
          </label>
          <div className="ai-canva-examples">
            <span>Try these</span>
            {EXAMPLES.map((example) => (
              <button key={example} type="button" onClick={() => setInput(example)} disabled={phase === 'busy'}>
                {example}
              </button>
            ))}
          </div>
          <div className="ai-canva-styles" role="listbox" aria-label="Look">
            {LOOKS.map((look) => (
              <button
                key={look.id}
                type="button"
                role="option"
                aria-selected={styleId === look.id}
                className={styleId === look.id ? 'is-selected' : ''}
                onClick={() => setStyleId(look.id)}
                disabled={phase === 'busy'}
              >
                {look.label}
              </button>
            ))}
          </div>
          {urlMode ? <p className="ai-canva-note">{YOUTUBE_FRAME_HONESTY}</p> : null}
          {youtubeMeta?.title && phase === 'busy' ? (
            <p className="ai-canva-note" role="status">
              Using title: <strong>{youtubeMeta.title}</strong>
            </p>
          ) : null}
          <div className="ai-canva-actions">
            <button
              type="button"
              className="btn-gradient"
              disabled={!canGenerate}
              aria-busy={phase === 'busy'}
              onClick={() => void runGenerate()}
            >
              {phase === 'busy' ? 'Creating…' : cooldown > 0 ? `Try again in ${cooldown}s` : 'Create a thumbnail with AI'}
            </button>
            {phase === 'busy' ? (
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  abortRef.current?.abort()
                  setPhase('compose')
                  setStatusLine('')
                }}
              >
                Stop
              </button>
            ) : (
              <Link className="btn-outline" to={{ pathname: '/', hash: '#editor' }}>
                Open editor
              </Link>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) => void onPhotoPick(event.target.files?.[0])}
          />
          <button type="button" className="ai-canva-photo" disabled={phase === 'busy'} onClick={() => fileRef.current?.click()}>
            {photoName ? `Reference photo: ${photoName}` : 'Add a reference photo'}
          </button>
          {phase === 'busy' ? (
            <p className="ai-canva-note" role="status">
              <span className="ai-inline-spinner" aria-hidden /> {statusLine || 'Preparing your thumbnail…'}
            </p>
          ) : null}
          {phase === 'err' && errorText ? (
            <p className="tool-error" role="alert">
              {errorText}
            </p>
          ) : null}
        </section>
      )}
    </ToolShell>
  )
}

function primaryFallbackHint(brief: CreativeBrief | null) {
  if (!brief?.concepts[0]) {
    return 'expressive creator looking at camera, dramatic key light, empty space for a title'
  }
  return visualHintForConcept(brief, brief.concepts[0])
}
