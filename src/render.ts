import type { LayoutId, PhotoShapeId } from './layout'
import type { Niche } from './niches'
import type { Platform } from './platforms'
import type { StickerId } from './stickers'

export type ThumbInput = {
  title: string
  tag: string
  niche: Niche
  platform: Platform
  layout: LayoutId
  photoShape: PhotoShapeId
  accentOverride: string
  watermark: boolean
  photo: HTMLImageElement | null
  stickers: StickerId[]
}

type Box = { x: number; y: number; w: number; h: number }

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
        lines.push(trimToWidth(ctx, rest, maxWidth))
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

function accentOf(input: ThumbInput) {
  return input.accentOverride || input.niche.accent
}

function layoutBoxes(platform: Platform, layout: LayoutId): { photo: Box; text: Box } {
  const { width: W, height: H, orientation } = platform
  const pad = Math.round(Math.min(W, H) * 0.05)

  if (layout === 'photo-full') {
    return {
      photo: { x: 0, y: 0, w: W, h: H },
      text: {
        x: pad,
        y: orientation === 'vertical' ? Math.round(H * 0.58) : Math.round(H * 0.55),
        w: W - pad * 2,
        h: Math.round(H * 0.35),
      },
    }
  }

  if (layout === 'photo-top' || orientation === 'vertical') {
    const photoH = layout === 'photo-top' || orientation === 'vertical' ? Math.round(H * 0.48) : Math.round(H * 0.5)
    return {
      photo: { x: pad, y: pad, w: W - pad * 2, h: photoH - pad },
      text: { x: pad, y: photoH + pad, w: W - pad * 2, h: H - photoH - pad * 2 },
    }
  }

  if (orientation === 'square') {
    const photoW = Math.round(W * 0.46)
    if (layout === 'photo-right') {
      return {
        photo: { x: W - pad - photoW, y: pad, w: photoW, h: H - pad * 2 },
        text: { x: pad, y: pad, w: W - photoW - pad * 3, h: H - pad * 2 },
      }
    }
    return {
      photo: { x: pad, y: pad, w: photoW, h: H - pad * 2 },
      text: { x: pad * 2 + photoW, y: pad, w: W - photoW - pad * 3, h: H - pad * 2 },
    }
  }

  const photoW = Math.round(W * 0.38)
  if (layout === 'photo-right') {
    return {
      photo: { x: W - pad - photoW, y: pad, w: photoW, h: H - pad * 2 },
      text: { x: pad, y: pad, w: W - photoW - pad * 3, h: H - pad * 2 },
    }
  }

  return {
    photo: { x: pad, y: pad, w: photoW, h: H - pad * 2 },
    text: { x: pad * 2 + photoW, y: pad, w: W - photoW - pad * 3, h: H - pad * 2 },
  }
}

function photoRadius(shape: PhotoShapeId, box: Box) {
  if (shape === 'circle') return Math.min(box.w, box.h) / 2
  if (shape === 'soft') return Math.min(box.w, box.h) * 0.28
  if (shape === 'square') return Math.min(24, Math.min(box.w, box.h) * 0.04)
  return Math.min(box.w, box.h) * 0.08
}

function drawBackground(ctx: CanvasRenderingContext2D, input: ThumbInput) {
  const { platform, niche } = input
  const accent = accentOf(input)
  const W = platform.width
  const H = platform.height

  const gradient = ctx.createLinearGradient(0, 0, W, H)
  gradient.addColorStop(0, niche.background[0])
  gradient.addColorStop(0.45, niche.background[1])
  gradient.addColorStop(1, niche.background[2])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, W, H)

  ctx.save()
  ctx.globalAlpha = 0.24
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.ellipse(W * 0.85, H * 0.12, W * 0.28, H * 0.18, -0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(W * 0.12, H * 0.88, W * 0.24, H * 0.16, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = `${accent}40`
  ctx.lineWidth = Math.max(8, Math.round(Math.min(W, H) * 0.01))
  ctx.beginPath()
  ctx.moveTo(0, H * 0.78)
  ctx.bezierCurveTo(W * 0.25, H * 0.68, W * 0.55, H * 0.92, W, H * 0.55)
  ctx.stroke()
  ctx.restore()

  const vignette = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.42)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, W, H)
}

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  input: ThumbInput,
  box: Box,
) {
  const accent = accentOf(input)
  const radius = photoRadius(input.photoShape, box)

  ctx.save()
  if (input.photoShape === 'circle') {
    ctx.beginPath()
    ctx.arc(box.x + box.w / 2, box.y + box.h / 2, Math.min(box.w, box.h) / 2, 0, Math.PI * 2)
    ctx.clip()
  } else {
    roundRect(ctx, box.x, box.y, box.w, box.h, radius)
    ctx.clip()
  }

  if (input.photo) {
    const scale = Math.max(box.w / input.photo.width, box.h / input.photo.height)
    const dw = input.photo.width * scale
    const dh = input.photo.height * scale
    const dx = box.x + (box.w - dw) / 2
    const dy = box.y + (box.h - dh) / 2
    ctx.drawImage(input.photo, dx, dy, dw, dh)
    if (input.layout === 'photo-full') {
      const shade = ctx.createLinearGradient(0, box.y + box.h * 0.35, 0, box.y + box.h)
      shade.addColorStop(0, 'rgba(0,0,0,0)')
      shade.addColorStop(1, 'rgba(0,0,0,0.72)')
      ctx.fillStyle = shade
      ctx.fillRect(box.x, box.y, box.w, box.h)
    }
  } else {
    ctx.fillStyle = input.niche.panel
    ctx.fillRect(box.x, box.y, box.w, box.h)
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.moveTo(box.x + box.w * 0.42, box.y + box.h * 0.38)
    ctx.lineTo(box.x + box.w * 0.62, box.y + box.h * 0.5)
    ctx.lineTo(box.x + box.w * 0.42, box.y + box.h * 0.62)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = accent
  ctx.lineWidth = Math.max(6, Math.round(Math.min(box.w, box.h) * 0.02))
  if (input.photoShape === 'circle') {
    ctx.beginPath()
    ctx.arc(box.x + box.w / 2, box.y + box.h / 2, Math.min(box.w, box.h) / 2, 0, Math.PI * 2)
    ctx.stroke()
  } else {
    roundRect(ctx, box.x, box.y, box.w, box.h, radius)
    ctx.stroke()
  }
  ctx.restore()
}

function drawPunchText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fill: string,
) {
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = Math.max(12, Math.round(ctx.canvas.height * 0.012))
  ctx.strokeText(text, x, y)
  ctx.fillStyle = fill
  ctx.fillText(text, x, y)
}

function drawTextBlock(ctx: CanvasRenderingContext2D, input: ThumbInput, box: Box) {
  const accent = accentOf(input)
  const tag = (input.tag.trim() || input.niche.badge).toUpperCase()
  const title = input.title.trim() || 'YOUR TITLE HERE'
  const vertical = input.platform.orientation === 'vertical'
  const titleSize = vertical ? Math.round(box.w * 0.11) : Math.round(Math.min(box.h * 0.18, box.w * 0.12))
  const tagSize = Math.round(titleSize * 0.34)
  const maxLines = vertical ? 4 : 3

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `800 ${tagSize}px "DM Sans", sans-serif`
  drawPunchText(ctx, tag, box.x, box.y + tagSize + 8, accent)

  ctx.font = `400 ${titleSize}px "Bebas Neue", Impact, sans-serif`
  const lines = wrapLines(ctx, title.toUpperCase(), box.w, maxLines)
  let y = box.y + tagSize + titleSize + 28
  for (const line of lines) {
    drawPunchText(ctx, line, box.x, y, '#FFFFFF')
    y += titleSize + 8
  }

  const pillH = Math.round(Math.min(44, box.h * 0.1))
  const pillW = Math.min(box.w, Math.round(box.w * 0.7))
  const pillY = Math.min(box.y + box.h - pillH - 8, y + 18)
  ctx.fillStyle = accent
  roundRect(ctx, box.x, pillY, pillW, pillH, pillH / 2)
  ctx.fill()
  ctx.fillStyle = '#101820'
  ctx.font = `700 ${Math.round(pillH * 0.42)}px "DM Sans", sans-serif`
  ctx.fillText(
    `${input.platform.label} · ${input.platform.width}×${input.platform.height}`,
    box.x + 16,
    pillY + pillH * 0.68,
  )
}

function drawStickers(ctx: CanvasRenderingContext2D, input: ThumbInput, photo: Box, text: Box) {
  const accent = accentOf(input)
  const scale = Math.min(input.platform.width, input.platform.height)
  const slots = [
    { x: photo.x + photo.w * 0.82, y: photo.y + photo.h * 0.18 },
    { x: text.x + text.w * 0.78, y: text.y + text.h * 0.2 },
    { x: text.x + text.w * 0.72, y: text.y + text.h * 0.72 },
    { x: photo.x + photo.w * 0.2, y: photo.y + photo.h * 0.82 },
  ]

  input.stickers.slice(0, 4).forEach((id, index) => {
    const slot = slots[index]
    drawSticker(ctx, accent, id, slot.x, slot.y, index % 2 === 0 ? -10 : 12, scale)
  })
}

function drawSticker(
  ctx: CanvasRenderingContext2D,
  accent: string,
  id: StickerId,
  x: number,
  y: number,
  angle: number,
  scale: number,
) {
  const unit = Math.max(56, Math.round(scale * 0.08))
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((angle * Math.PI) / 180)

  if (id === 'arrow') {
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.moveTo(-unit * 0.2, -unit * 0.7)
    ctx.lineTo(unit * 0.2, -unit * 0.7)
    ctx.lineTo(unit * 0.2, unit * 0.1)
    ctx.lineTo(unit * 0.55, unit * 0.1)
    ctx.lineTo(0, unit * 0.8)
    ctx.lineTo(-unit * 0.55, unit * 0.1)
    ctx.lineTo(-unit * 0.2, unit * 0.1)
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
    const width = id === 'fire' || id === 'rupee' ? unit * 1.3 : unit * 1.7
    ctx.fillStyle = id === 'fire' ? '#FF4D2E' : accent
    roundRect(ctx, -width / 2, -unit * 0.45, width, unit * 0.9, unit * 0.22)
    ctx.fill()
    ctx.fillStyle = '#101820'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font =
      id === 'fire' || id === 'rupee'
        ? `700 ${Math.round(unit * 0.5)}px "DM Sans", sans-serif`
        : `700 ${Math.round(unit * 0.42)}px "Bebas Neue", Impact, sans-serif`
    ctx.fillText(label, 0, 2)
  }
  ctx.restore()
}

export function renderThumbnail(ctx: CanvasRenderingContext2D, input: ThumbInput) {
  const { platform } = input
  ctx.clearRect(0, 0, platform.width, platform.height)
  drawBackground(ctx, input)
  const boxes = layoutBoxes(platform, input.layout)
  if (input.layout === 'photo-full') {
    drawPhoto(ctx, input, boxes.photo)
    drawTextBlock(ctx, input, boxes.text)
  } else {
    drawPhoto(ctx, input, boxes.photo)
    drawTextBlock(ctx, input, boxes.text)
  }
  drawStickers(ctx, input, boxes.photo, boxes.text)

  if (input.watermark) {
    drawCenteredWatermark(ctx, input, boxes.photo)
  }
}

function drawCenteredWatermark(
  ctx: CanvasRenderingContext2D,
  input: ThumbInput,
  photo: { x: number; y: number; w: number; h: number },
) {
  const { platform } = input
  const size = Math.max(28, Math.round(Math.min(platform.width, platform.height) * 0.045))
  const label = 'ThumbForge · free preview'

  // Diagonal band across the photo so cropping a few millimeters does not remove it.
  ctx.save()
  ctx.translate(photo.x + photo.w / 2, photo.y + photo.h / 2)
  ctx.rotate(-Math.PI / 7)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 ${size}px "JetBrains Mono", monospace`
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  ctx.fillText(label, 3, 3)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fillText(label, 0, 0)

  // Second lighter pass lower on the photo for harder crop removal.
  ctx.font = `700 ${Math.round(size * 0.72)}px "JetBrains Mono", monospace`
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.fillText(label, 0, Math.round(photo.h * 0.28))
  ctx.restore()
}

export function createThumbnailDataUrl(input: ThumbInput): string {
  const canvas = document.createElement('canvas')
  canvas.width = input.platform.width
  canvas.height = input.platform.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('This browser cannot create the image.')
  renderThumbnail(ctx, input)
  return canvas.toDataURL('image/png')
}

export function downloadThumbnail(input: ThumbInput) {
  const url = createThumbnailDataUrl(input)
  const link = document.createElement('a')
  link.href = url
  link.download = `thumbforge-${input.platform.id}.png`
  link.click()
}
