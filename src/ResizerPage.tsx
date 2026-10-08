import { useEffect, useMemo, useRef, useState } from 'react'
import { ToolShell } from './ToolShell'
import { loadImageFromUrl } from './aiHandoff'
import { track } from './analytics'
import { DOWNLOAD_PREFIX } from './brand'

type FitMode = 'cover' | 'contain'
type QualityTier = 'high' | 'balanced' | 'light'

type SizePreset = {
  id: string
  label: string
  blurb: string
  width: number
  height: number
  group: 'platform' | 'scale'
}

const PLATFORM_SIZES: SizePreset[] = [
  {
    id: 'youtube',
    label: 'YouTube full',
    blurb: '1280×720',
    width: 1280,
    height: 720,
    group: 'platform',
  },
  {
    id: 'youtube-50',
    label: 'YouTube 50%',
    blurb: '640×360 · half size',
    width: 640,
    height: 360,
    group: 'scale',
  },
  {
    id: 'youtube-25',
    label: 'YouTube 25%',
    blurb: '320×180 · phone tile',
    width: 320,
    height: 180,
    group: 'scale',
  },
  {
    id: 'shorts',
    label: 'Shorts',
    blurb: '1080×1920',
    width: 1080,
    height: 1920,
    group: 'platform',
  },
  {
    id: 'square',
    label: 'Square',
    blurb: '1080×1080',
    width: 1080,
    height: 1080,
    group: 'platform',
  },
  {
    id: 'og',
    label: 'Social / OG',
    blurb: '1200×630',
    width: 1200,
    height: 630,
    group: 'platform',
  },
]

const QUALITY_TIERS: {
  id: QualityTier
  label: string
  blurb: string
  mime: 'image/png' | 'image/jpeg'
  quality: number
  ext: string
}[] = [
  {
    id: 'high',
    label: 'High',
    blurb: 'PNG · sharpest · larger file',
    mime: 'image/png',
    quality: 1,
    ext: 'png',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    blurb: 'JPEG ~82% · good for Studio',
    mime: 'image/jpeg',
    quality: 0.82,
    ext: 'jpg',
  },
  {
    id: 'light',
    label: 'Light',
    blurb: 'JPEG ~65% · smallest download',
    mime: 'image/jpeg',
    quality: 0.65,
    ext: 'jpg',
  },
]

function coverDraw(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  fit: FitMode,
) {
  ctx.fillStyle = '#0d0a0a'
  ctx.fillRect(0, 0, width, height)
  const scale =
    fit === 'cover'
      ? Math.max(width / image.width, height / image.height)
      : Math.min(width / image.width, height / image.height)
  const dw = image.width * scale
  const dh = image.height * scale
  const dx = (width - dw) / 2
  const dy = (height - dh) / 2
  ctx.drawImage(image, dx, dy, dw, dh)
}

export default function ResizerPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [preview, setPreview] = useState('')
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const [sizeId, setSizeId] = useState('youtube')
  const [fit, setFit] = useState<FitMode>('cover')
  const [quality, setQuality] = useState<QualityTier>('balanced')
  const [customOn, setCustomOn] = useState(false)
  const [customW, setCustomW] = useState(1280)
  const [customH, setCustomH] = useState(720)
  const [sourceScale, setSourceScale] = useState<100 | 75 | 50 | 25 | null>(null)
  const [ready, setReady] = useState(false)
  const [approxBytes, setApproxBytes] = useState(0)

  const activeSize = useMemo(() => {
    if (sourceScale && natural) {
      return {
        id: `src-${sourceScale}`,
        label: `${sourceScale}% of original`,
        width: Math.max(1, Math.round((natural.w * sourceScale) / 100)),
        height: Math.max(1, Math.round((natural.h * sourceScale) / 100)),
      }
    }
    if (customOn) {
      return {
        id: 'custom',
        label: 'Custom',
        width: Math.max(16, Math.min(4096, Math.round(customW) || 16)),
        height: Math.max(16, Math.min(4096, Math.round(customH) || 16)),
      }
    }
    const preset = PLATFORM_SIZES.find((item) => item.id === sizeId) ?? PLATFORM_SIZES[0]!
    return { id: preset.id, label: preset.label, width: preset.width, height: preset.height }
  }, [sizeId, customOn, customW, customH, sourceScale, natural])

  const qualitySpec = QUALITY_TIERS.find((item) => item.id === quality) ?? QUALITY_TIERS[1]!

  async function onFile(file: File | undefined) {
    if (!file?.type.startsWith('image/')) return
    if (preview) URL.revokeObjectURL(preview)
    const url = URL.createObjectURL(file)
    setPreview(url)
    track('thumbnail_uploaded', { tool: 'resizer' })
    const image = await loadImageFromUrl(url)
    setNatural({ w: image.width, h: image.height })
  }

  useEffect(() => {
    if (!preview) return
    void paint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, activeSize.width, activeSize.height, fit, quality])

  async function paint() {
    if (!preview) return
    const image = await loadImageFromUrl(preview)
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = activeSize.width
    canvas.height = activeSize.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    coverDraw(ctx, image, activeSize.width, activeSize.height, fit)
    setReady(true)
    try {
      const dataUrl =
        qualitySpec.mime === 'image/png'
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', qualitySpec.quality)
      // Rough byte estimate from base64 payload
      setApproxBytes(Math.round((dataUrl.length * 3) / 4))
    } catch {
      setApproxBytes(0)
    }
  }

  function pickPlatform(id: string) {
    setSourceScale(null)
    setCustomOn(false)
    setSizeId(id)
  }

  function pickSourceScale(scale: 100 | 75 | 50 | 25) {
    setCustomOn(false)
    setSourceScale(scale)
  }

  function enableCustom() {
    setSourceScale(null)
    setCustomOn(true)
    if (natural) {
      setCustomW(natural.w)
      setCustomH(natural.h)
    }
  }

  function onDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${DOWNLOAD_PREFIX}-resize-${activeSize.width}x${activeSize.height}-${quality}.${qualitySpec.ext}`
    link.href =
      qualitySpec.mime === 'image/png'
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', qualitySpec.quality)
    link.click()
    track('thumbnail_downloaded', {
      tool: 'resizer',
      size: activeSize.id,
      quality,
      fit,
    })
  }

  const fileKb = approxBytes ? Math.max(1, Math.round(approxBytes / 1024)) : null

  return (
    <ToolShell
      path="/youtube-thumbnail-resizer"
      kicker="Resizer"
      title={
        <>
          Resize thumbnails with <span className="gradient-text">flexible sizes &amp; quality</span>
        </>
      }
      lede="Pick a platform size, shrink to 50% / 25%, scale from your original, or set custom pixels. Choose High, Balanced, or Light quality — all in the browser."
    >
      <section className="tool-card resizer-card">
        <div className="tool-actions">
          <button type="button" className="primary" onClick={() => inputRef.current?.click()}>
            Choose image
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => void onFile(event.target.files?.[0])}
          />
          {natural ? (
            <p className="hint resizer-source">
              Original {natural.w}×{natural.h}
            </p>
          ) : null}
        </div>

        <fieldset className="resizer-fieldset">
          <legend>Platform sizes</legend>
          <div className="resizer-choice-row">
            {PLATFORM_SIZES.filter((item) => item.group === 'platform').map((item) => (
              <button
                key={item.id}
                type="button"
                className={!customOn && !sourceScale && sizeId === item.id ? 'choice is-selected' : 'choice'}
                onClick={() => pickPlatform(item.id)}
              >
                <span>{item.label}</span>
                <small>{item.blurb}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="resizer-fieldset">
          <legend>Smaller YouTube exports</legend>
          <div className="resizer-choice-row">
            {PLATFORM_SIZES.filter((item) => item.group === 'scale').map((item) => (
              <button
                key={item.id}
                type="button"
                className={!customOn && !sourceScale && sizeId === item.id ? 'choice is-selected' : 'choice'}
                onClick={() => pickPlatform(item.id)}
              >
                <span>{item.label}</span>
                <small>{item.blurb}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="resizer-fieldset">
          <legend>Scale from your original</legend>
          <div className="resizer-choice-row">
            {([100, 75, 50, 25] as const).map((scale) => (
              <button
                key={scale}
                type="button"
                className={sourceScale === scale ? 'choice is-selected' : 'choice'}
                disabled={!natural}
                onClick={() => pickSourceScale(scale)}
              >
                <span>{scale}%</span>
                <small>
                  {natural
                    ? `${Math.round((natural.w * scale) / 100)}×${Math.round((natural.h * scale) / 100)}`
                    : 'Upload first'}
                </small>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="resizer-fieldset">
          <legend>Custom size</legend>
          <div className="resizer-custom-row">
            <button
              type="button"
              className={customOn ? 'chip solid' : 'chip'}
              onClick={enableCustom}
            >
              Custom pixels
            </button>
            <label>
              Width
              <input
                type="number"
                min={16}
                max={4096}
                value={customW}
                disabled={!customOn}
                onChange={(event) => setCustomW(Number(event.target.value))}
              />
            </label>
            <label>
              Height
              <input
                type="number"
                min={16}
                max={4096}
                value={customH}
                disabled={!customOn}
                onChange={(event) => setCustomH(Number(event.target.value))}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="resizer-fieldset">
          <legend>Fit</legend>
          <div className="resizer-choice-row">
            <button
              type="button"
              className={fit === 'cover' ? 'choice is-selected' : 'choice'}
              onClick={() => setFit('cover')}
            >
              <span>Cover crop</span>
              <small>Fill frame · may crop edges</small>
            </button>
            <button
              type="button"
              className={fit === 'contain' ? 'choice is-selected' : 'choice'}
              onClick={() => setFit('contain')}
            >
              <span>Contain</span>
              <small>Whole image · letterbox if needed</small>
            </button>
          </div>
        </fieldset>

        <fieldset className="resizer-fieldset">
          <legend>Picture quality (3 tiers)</legend>
          <div className="resizer-choice-row">
            {QUALITY_TIERS.map((tier) => (
              <button
                key={tier.id}
                type="button"
                className={quality === tier.id ? 'choice is-selected' : 'choice'}
                onClick={() => setQuality(tier.id)}
              >
                <span>{tier.label}</span>
                <small>{tier.blurb}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <p className="resizer-output-meta">
          Output <strong>{activeSize.width}×{activeSize.height}</strong>
          {fileKb ? <> · ~{fileKb} KB ({qualitySpec.label})</> : null}
        </p>

        <div className="resize-preview">
          <canvas ref={canvasRef} className={ready ? 'is-ready' : ''} />
        </div>
        <button type="button" className="btn-gradient" disabled={!ready} onClick={onDownload}>
          Download {qualitySpec.ext.toUpperCase()}
        </button>
      </section>
    </ToolShell>
  )
}
