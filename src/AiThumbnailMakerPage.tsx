import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  looksLikeYoutubeUrl,
  resolveYoutubeMeta,
  sceneBriefFromInput,
  type YoutubeMeta,
} from './youtubeUrl'

type Phase = 'compose' | 'busy' | 'ready' | 'err'

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
  const [phase, setPhase] = useState<Phase>('compose')
  const [statusLine, setStatusLine] = useState('')
  const [errorText, setErrorText] = useState('')
  const [variants, setVariants] = useState<AiGeneratedImage[]>([])
  const [pick, setPick] = useState(0)
  const [brief, setBrief] = useState<CreativeBrief | null>(null)
  const [youtubeMeta, setYoutubeMeta] = useState<YoutubeMeta | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const runIdRef = useRef(0)
  const objectUrls = useRef<string[]>([])
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
    if (handoff?.photoDataUrl) setPhotoDataUrl(handoff.photoDataUrl)
    // UI QA / walkthrough stub — never claims paid face-swap or YouTube frames.
    if (new URLSearchParams(window.location.search).get('demoResult') === '1') {
      const stub =
        'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
            <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7db8ff"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs>
            <rect width="1280" height="720" fill="url(#g)"/>
            <text x="80" y="340" fill="#fff" font-family="DM Sans, sans-serif" font-size="72" font-weight="800">Your thumbnail</text>
            <text x="80" y="420" fill="#f7faff" font-family="DM Sans, sans-serif" font-size="36" font-weight="600">Demo preview · open in editor</text>
          </svg>`,
        )
      const image = new Image()
      image.src = stub
      setVariants([
        {
          image,
          objectUrl: stub,
          prompt: 'demo-result-stub',
          seed: 0,
          styleId: 'auto',
          lookLabel: 'Demo',
          lookWhy: 'UI preview stub',
          lookHeadline: 'Your thumbnail',
          source: 'studio',
        } satisfies AiGeneratedImage,
      ])
      setPhase('ready')
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
          styleId: 'auto' satisfies AiStyleId,
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
      lede="One field: paste a YouTube link or describe the scene. We create a cover you can download or finish in the editor."
      hideMoreTools
    >
      {phase === 'ready' && chosen ? (
        <section className="ai-canva-result" aria-label="Thumbnail result">
          <p className="ai-canva-hook">Your thumbnail is ready</p>
          <img src={chosen.objectUrl} alt="Generated thumbnail" />
          <div className="ai-canva-actions">
            <button type="button" className="btn-gradient" onClick={() => void downloadHd()}>
              Download
            </button>
            <button type="button" className="btn-outline" onClick={() => void finishInEditor()}>
              Open in editor
            </button>
          </div>
          <button
            type="button"
            className="ai-text-btn"
            disabled={cooldown > 0}
            onClick={() => {
              resetCompose()
              void runGenerate()
            }}
          >
            {cooldown > 0 ? `Try again in ${cooldown}s` : 'Try again'}
          </button>
          {errorText ? (
            <p className="tool-error" role="alert">
              {errorText}
            </p>
          ) : null}
        </section>
      ) : (
        <section className="ai-canva" aria-label="Create a thumbnail">
          <label className="ai-canva-prompt">
            <span className="sr-only">Paste a YouTube link, or describe the scene</span>
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
              placeholder="Paste a YouTube link, or describe the scene"
            />
          </label>
          <div className="ai-canva-actions">
            <button
              type="button"
              className="btn-gradient"
              disabled={!canGenerate}
              aria-busy={phase === 'busy'}
              onClick={() => void runGenerate()}
            >
              {phase === 'busy' ? statusLine || 'Creating…' : cooldown > 0 ? `Try again in ${cooldown}s` : 'Create thumbnail'}
            </button>
          </div>
          {urlMode ? (
            <p className="ai-canva-note">
              {youtubeMeta?.title
                ? `Using title: ${youtubeMeta.title}. Frame pull from YouTube is not available yet — we package from the idea.`
                : 'YouTube links use the video title when available. We do not pull private frames yet.'}
            </p>
          ) : (
            <p className="ai-canva-note">Tip: keep the idea short — subject, emotion, and one bold claim.</p>
          )}
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
