import { HEIGHT, WIDTH, type Niche } from './niches'
import type { StickerId } from './stickers'

export type ThumbInput = {
  title: string
  tag: string
  niche: Niche
  watermark: boolean
  photo: HTMLImageElement | null
  stickers: StickerId[]
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ['YOUR TITLE']
  const lines: string[] = []
  let current = words[0]
  for (let i = 1; i < words.length; i++) {
    const next = `${current} ${words[i]}`
    if (ctx.measureText(next).width <= maxWidth) {
      current = next
    } else {
      lines.push(current)
      current = words[i]
      if (lines.length === maxLines - 1) {
        const rest = [current, ...words.slice(i + 1)].join(' ')
        lines.push(trimToWidth(ctx, `${rest}`, maxWidth))
        return lines
      }
    }
  }
  if (lines.length < maxLines) lines.push(current)
  return lines
}

function trimToWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let value = text
  while (value.length > 1 && ctx.measureText(`${value}…`).width > maxWidth) {
    value = value.slice(0, -1)
  }
  return `${value}…`
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function drawBackground(ctx: CanvasRenderingContext2D, niche: Niche) {
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  gradient.addColorStop(0, niche.background[0])
  gradient.addColorStop(0.45, niche.background[1])
  gradient.addColorStop(1, niche.background[2])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.save()
  ctx.globalAlpha = 0.22
  ctx.fillStyle = niche.accent
  ctx.beginPath()
  ctx.ellipse(1080, 80, 280, 180, -0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(180, 640, 260, 160, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = `${niche.accent}33`
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.moveTo(0, 560)
  ctx.bezierCurveTo(320, 480, 640, 700, WIDTH, 420)
  ctx.stroke()
  ctx.restore()

  const vignette = ctx.createRadialGradient(640, 360, 180, 640, 360, 760)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
}

function drawPhotoOrShape(
  ctx: CanvasRenderingContext2D,
  niche: Niche,
  photo: HTMLImageElement | null,
) {
  const x = 56
  const y = 90
  const w = 470
  const h = 540

  ctx.save()
  roundRect(ctx, x, y, w, h, 42)
  ctx.clip()

  if (photo) {
    const scale = Math.max(w / photo.width, h / photo.height)
    const dw = photo.width * scale
    const dh = photo.height * scale
    const dx = x + (w - dw) / 2
    const dy = y + (h - dh) / 2
    ctx.drawImage(photo, dx, dy, dw, dh)
    const shade = ctx.createLinearGradient(x, y, x + w, y)
    shade.addColorStop(0, 'rgba(0,0,0,0.15)')
    shade.addColorStop(1, 'rgba(0,0,0,0.35)')
    ctx.fillStyle = shade
    ctx.fillRect(x, y, w, h)
  } else {
    ctx.fillStyle = niche.panel
    ctx.fillRect(x, y, w, h)
    drawFallbackIcon(ctx, niche, x + w / 2, y + h / 2)
  }
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = niche.accent
  ctx.lineWidth = 8
  roundRect(ctx, x, y, w, h, 42)
  ctx.stroke()
  ctx.restore()
}

function drawFallbackIcon(ctx: CanvasRenderingContext2D, niche: Niche, cx: number, cy: number) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.fillStyle = niche.accent
  ctx.strokeStyle = niche.accent
  ctx.lineWidth = 18
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Keep a bold default mark when there is no photo.
  ctx.beginPath()
  ctx.moveTo(-40, -20)
  ctx.lineTo(50, 0)
  ctx.lineTo(-40, 20)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, 120, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function drawPunchText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fill: string,
  stroke = '#000000',
) {
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.strokeStyle = stroke
  ctx.lineWidth = 18
  ctx.strokeText(text, x, y)
  ctx.fillStyle = fill
  ctx.fillText(text, x, y)
}

function drawStickers(ctx: CanvasRenderingContext2D, niche: Niche, stickers: StickerId[]) {
  const slots = [
    { x: 470, y: 120 },
    { x: 980, y: 150 },
    { x: 1040, y: 470 },
    { x: 430, y: 520 },
  ]

  stickers.slice(0, 4).forEach((id, index) => {
    const slot = slots[index]
    drawSticker(ctx, niche, id, slot.x, slot.y, index % 2 === 0 ? -12 : 10)
  })
}

function drawSticker(
  ctx: CanvasRenderingContext2D,
  niche: Niche,
  id: StickerId,
  x: number,
  y: number,
  angle: number,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((angle * Math.PI) / 180)

  if (id === 'arrow') {
    ctx.fillStyle = niche.accent
    ctx.beginPath()
    ctx.moveTo(-20, -70)
    ctx.lineTo(20, -70)
    ctx.lineTo(20, 10)
    ctx.lineTo(55, 10)
    ctx.lineTo(0, 80)
    ctx.lineTo(-55, 10)
    ctx.lineTo(-20, 10)
    ctx.closePath()
    ctx.fill()
  } else {
    const label =
      id === 'new'
        ? 'NEW'
        : id === 'fire'
          ? '🔥'
          : id === 'wow'
            ? 'WOW'
            : id === 'rupee'
              ? '₹'
              : id === 'vs'
                ? 'VS'
                : 'CLICK'
    const width = id === 'fire' || id === 'rupee' ? 120 : 160
    ctx.fillStyle = id === 'fire' ? '#FF4D2E' : niche.accent
    roundRect(ctx, -width / 2, -42, width, 84, 22)
    ctx.fill()
    ctx.fillStyle = '#101820'
    ctx.font =
      id === 'fire' || id === 'rupee'
        ? '700 48px "DM Sans", sans-serif'
        : '700 42px "Bebas Neue", Impact, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 0, 4)
  }

  ctx.restore()
}

export function renderThumbnail(ctx: CanvasRenderingContext2D, input: ThumbInput) {
  const { niche, watermark, photo, stickers } = input
  const title = input.title.trim() || 'YOUR TITLE HERE'
  const tag = (input.tag.trim() || niche.badge).toUpperCase()

  drawBackground(ctx, niche)
  drawPhotoOrShape(ctx, niche, photo)

  // Accent bar and copy block
  ctx.fillStyle = niche.accent
  roundRect(ctx, 560, 150, 18, 420, 9)
  ctx.fill()

  ctx.font = '800 30px "DM Sans", sans-serif'
  drawPunchText(ctx, tag, 610, 205, niche.accent, '#000')

  ctx.font = '400 96px "Bebas Neue", Impact, sans-serif'
  const lines = wrapLines(ctx, title.toUpperCase(), 560, 3)
  let y = 310
  for (const line of lines) {
    drawPunchText(ctx, line, 610, y, '#FFFFFF', '#000000')
    y += 98
  }

  ctx.fillStyle = niche.accent
  roundRect(ctx, 610, 620, 280, 40, 20)
  ctx.fill()
  ctx.fillStyle = '#101820'
  ctx.font = '700 20px "DM Sans", sans-serif'
  ctx.fillText('YouTube ready · 1280×720', 628, 647)

  drawStickers(ctx, niche, stickers)

  if (watermark) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '500 20px "JetBrains Mono", monospace'
    ctx.fillText('ThumbForge free', 40, HEIGHT - 28)
  }
}

export function createThumbnailDataUrl(input: ThumbInput): string {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('This browser cannot create the image.')
  renderThumbnail(ctx, input)
  return canvas.toDataURL('image/png')
}

export function downloadThumbnail(input: ThumbInput, filename = 'thumbforge-youtube.png') {
  const url = createThumbnailDataUrl(input)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  try {
    const image = await loadImage(url)
    return image
  } finally {
    // Keep object URL until image decode finishes; revoke after a tick.
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('That photo could not be opened. Try a JPG or PNG.'))
    image.src = url
  })
}
