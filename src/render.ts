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

  const base = ctx.createLinearGradient(0, 0, W, H)
  base.addColorStop(0, niche.background[0])
  base.addColorStop(0.4, niche.background[1])
  base.addColorStop(1, niche.background[2])
  ctx.fillStyle = base
  ctx.fillRect(0, 0, W, H)

  // Soft light wash
  const wash = ctx.createRadialGradient(W * 0.2, H * 0.15, 20, W * 0.2, H * 0.15, Math.max(W, H) * 0.55)
  wash.addColorStop(0, `${accent}55`)
  wash.addColorStop(1, `${accent}00`)
  ctx.fillStyle = wash
  ctx.fillRect(0, 0, W, H)

  // Second glow opposite corner
  const glow = ctx.createRadialGradient(W * 0.9, H * 0.85, 10, W * 0.9, H * 0.85, Math.max(W, H) * 0.5)
  glow.addColorStop(0, 'rgba(255,255,255,0.16)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // Diagonal light streak
  ctx.save()
  ctx.translate(W * 0.55, H * 0.1)
  ctx.rotate(-0.55)
  const streak = ctx.createLinearGradient(0, 0, W * 0.9, 0)
  streak.addColorStop(0, `${accent}00`)
  streak.addColorStop(0.5, `${accent}33`)
  streak.addColorStop(1, `${accent}00`)
  ctx.fillStyle = streak
  ctx.fillRect(-W * 0.2, 0, W * 0.9, Math.max(40, H * 0.08))
  ctx.restore()

  // Subtle grid for depth
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.045)'
  ctx.lineWidth = 1
  const step = Math.max(36, Math.round(Math.min(W, H) * 0.06))
  for (let x = 0; x <= W; x += step) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = 0; y <= H; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  ctx.restore()

  // Accent orbs
  ctx.save()
  ctx.globalAlpha = 0.2
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.ellipse(W * 0.78, H * 0.22, W * 0.18, H * 0.14, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(W * 0.18, H * 0.78, W * 0.16, H * 0.12, 0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Bottom curve
  ctx.save()
  ctx.fillStyle = `${accent}18`
  ctx.beginPath()
  ctx.moveTo(0, H)
  ctx.quadraticCurveTo(W * 0.35, H * 0.72, W, H * 0.88)
  ctx.lineTo(W, H)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  const vignette = ctx.createRadialGradient(
    W / 2,
    H / 2,
    Math.min(W, H) * 0.18,
    W / 2,
    H / 2,
    Math.max(W, H) * 0.78,
  )
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.38)')
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
    const map: Record<Exclude<StickerId, 'arrow'>, string> = {
      new: 'NEW',
      fire: '🔥',
      wow: 'WOW',
      rupee: '₹',
      vs: 'VS',
      click: 'CLICK',
      live: 'LIVE',
      hot: 'HOT',
      free: 'FREE',
      pro: 'PRO',
      tip: 'TIP',
      part: 'PART 1',
      yes: 'YES',
      no: 'NO',
      love: '❤',
      go: 'GO',
      day1: 'DAY 1',
      '100': '100%',
      alert: '!',
    }
    const label = map[id]
    const wide = label.length > 3
    const width = wide ? unit * (label.length > 4 ? 2.15 : 1.85) : unit * (label.length === 1 ? 1.15 : 1.45)
    const fill =
      id === 'fire' || id === 'hot' || id === 'alert'
        ? '#FF4D2E'
        : id === 'live'
          ? '#FF3B5C'
          : id === 'yes' || id === 'free'
            ? '#7CFFB2'
            : id === 'no'
              ? '#FF8A7A'
              : accent
    ctx.fillStyle = fill
    roundRect(ctx, -width / 2, -unit * 0.45, width, unit * 0.9, unit * 0.22)
    ctx.fill()
    ctx.fillStyle = '#101820'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `700 ${Math.round(unit * (label.length > 4 ? 0.34 : 0.42))}px "Bebas Neue", Impact, sans-serif`
    if (id === 'fire' || id === 'love' || id === 'rupee') {
      ctx.font = `700 ${Math.round(unit * 0.5)}px "DM Sans", sans-serif`
    }
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
    drawCenteredWatermark(ctx, boxes.photo)
  }
}

function drawCenteredWatermark(
  ctx: CanvasRenderingContext2D,
  photo: { x: number; y: number; w: number; h: number },
) {
  const size = Math.max(16, Math.round(Math.min(photo.w, photo.h) * 0.045))
  const label = 'ThumbForge · free preview'
  const pad = Math.max(12, Math.round(Math.min(photo.w, photo.h) * 0.04))

  ctx.save()
  ctx.beginPath()
  ctx.rect(photo.x, photo.y, photo.w, photo.h)
  ctx.clip()

  // Keep the mark inside the photo, near the bottom — visible, but not over faces.
  ctx.font = `600 ${size}px "JetBrains Mono", monospace`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  const x = photo.x + pad
  const y = photo.y + photo.h - pad

  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.fillText(label, x + 1, y + 1)
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.fillText(label, x, y)
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
