import { useRef, useState } from 'react'
import { ToolShell } from './ToolShell'
import { loadImageFromUrl } from './aiHandoff'
import { track } from './analytics'
import { DOWNLOAD_PREFIX } from './brand'

const SIZES = [
  { id: 'youtube', label: 'YouTube 1280×720', width: 1280, height: 720 },
  { id: 'shorts', label: 'Shorts 1080×1920', width: 1080, height: 1920 },
  { id: 'square', label: 'Square 1080×1080', width: 1080, height: 1080 },
] as const

export default function ResizerPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [preview, setPreview] = useState('')
  const [sizeId, setSizeId] = useState<(typeof SIZES)[number]['id']>('youtube')
  const [ready, setReady] = useState(false)

  async function onFile(file: File | undefined) {
    if (!file?.type.startsWith('image/')) return
    if (preview) URL.revokeObjectURL(preview)
    const url = URL.createObjectURL(file)
    setPreview(url)
    track('thumbnail_uploaded', { tool: 'resizer' })
    await paint(url, sizeId)
  }

  async function paint(url: string, id: (typeof SIZES)[number]['id']) {
    const spec = SIZES.find((item) => item.id === id) ?? SIZES[0]
    const image = await loadImageFromUrl(url)
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = spec.width
    canvas.height = spec.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const scale = Math.max(spec.width / image.width, spec.height / image.height)
    const dw = image.width * scale
    const dh = image.height * scale
    const dx = (spec.width - dw) / 2
    const dy = (spec.height - dh) / 2
    ctx.fillStyle = '#0d0a0a'
    ctx.fillRect(0, 0, spec.width, spec.height)
    ctx.drawImage(image, dx, dy, dw, dh)
    setReady(true)
  }

  function onSize(id: (typeof SIZES)[number]['id']) {
    setSizeId(id)
    if (preview) void paint(preview, id)
  }

  function onDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const spec = SIZES.find((item) => item.id === sizeId) ?? SIZES[0]
    const link = document.createElement('a')
    link.download = `${DOWNLOAD_PREFIX}-${spec.id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    track('thumbnail_downloaded', { tool: 'resizer', size: spec.id })
  }

  return (
    <ToolShell
      path="/youtube-thumbnail-resizer"
      kicker="Resizer"
      title={
        <>
          YouTube thumbnail resizer <span className="gradient-text">1280×720</span>
        </>
      }
      lede="Cover-crop any image to YouTube, Shorts, or square. Happens in your browser — nothing uploads to a Thumbric server."
    >
      <section className="tool-card">
        <div className="tool-actions">
          <button type="button" className="primary" onClick={() => inputRef.current?.click()}>
            Choose image
          </button>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => void onFile(event.target.files?.[0])} />
          {SIZES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={sizeId === item.id ? 'chip solid' : 'chip'}
              onClick={() => onSize(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="resize-preview">
          <canvas ref={canvasRef} className={ready ? 'is-ready' : ''} />
        </div>
        <button type="button" className="btn-gradient" disabled={!ready} onClick={onDownload}>
          Download PNG
        </button>
      </section>
    </ToolShell>
  )
}
