import { HEIGHT, WIDTH, type Niche } from './niches'

export type ThumbInput = {
  title: string
  eyebrow: string
  niche: Niche
  watermark: boolean
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
      if (lines.length === maxLines - 1) break
    }
  }
  if (lines.length < maxLines) lines.push(current)
  const used = lines.join(' ').split(/\s+/).length
  if (used < words.length) {
    const last = lines[lines.length - 1]
    lines[lines.length - 1] = `${last.replace(/\s+\S*$/, '')}…`.replace(/^…$/, '…')
  }
  return lines
}

function drawShape(ctx: CanvasRenderingContext2D, niche: Niche) {
  const x = 70
  const y = 120
  const w = 430
  const h = 480
  ctx.save()
  ctx.fillStyle = niche.panel
  roundRect(ctx, x, y, w, h, 36)
  ctx.fill()
  ctx.strokeStyle = `${niche.accent}55`
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.translate(x + w / 2, y + h / 2)
  ctx.fillStyle = niche.accent
  ctx.strokeStyle = niche.accent
  ctx.lineWidth = 18
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (niche.shape) {
    case 'bars':
      for (let i = 0; i < 4; i++) {
        const bh = 60 + i * 42
        roundRect(ctx, -140 + i * 70, 140 - bh, 42, bh, 12)
        ctx.fill()
      }
      break
    case 'coins':
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.arc(-70 + i * 70, 20 - i * 30, 58 - i * 4, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    case 'book':
      roundRect(ctx, -120, -110, 240, 220, 18)
      ctx.fill()
      ctx.fillStyle = niche.panel
      roundRect(ctx, -90, -70, 180, 24, 8)
      ctx.fill()
      roundRect(ctx, -90, -20, 140, 24, 8)
      ctx.fill()
      break
    case 'pad':
      roundRect(ctx, -130, -90, 260, 160, 28)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-40, -20)
      ctx.lineTo(50, 0)
      ctx.lineTo(-40, 20)
      ctx.closePath()
      ctx.fill()
      break
    case 'flame':
      ctx.beginPath()
      ctx.moveTo(0, 120)
      ctx.bezierCurveTo(-120, 40, -90, -80, 0, -120)
      ctx.bezierCurveTo(90, -80, 120, 40, 0, 120)
      ctx.fill()
      ctx.fillStyle = niche.panel
      ctx.beginPath()
      ctx.moveTo(0, 70)
      ctx.bezierCurveTo(-50, 20, -30, -40, 0, -60)
      ctx.bezierCurveTo(30, -40, 50, 20, 0, 70)
      ctx.fill()
      break
    case 'camera':
      roundRect(ctx, -140, -70, 280, 160, 28)
      ctx.fill()
      ctx.fillStyle = niche.panel
      ctx.beginPath()
      ctx.arc(0, 10, 48, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'bolt':
      ctx.beginPath()
      ctx.moveTo(20, -130)
      ctx.lineTo(-50, 10)
      ctx.lineTo(10, 10)
      ctx.lineTo(-20, 130)
      ctx.lineTo(60, -10)
      ctx.lineTo(0, -10)
      ctx.closePath()
      ctx.fill()
      break
    case 'spark':
      for (let i = 0; i < 8; i++) {
        ctx.save()
        ctx.rotate((Math.PI / 4) * i)
        roundRect(ctx, -14, -120, 28, 90, 12)
        ctx.fill()
        ctx.restore()
      }
      ctx.beginPath()
      ctx.arc(0, 0, 36, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'note':
      roundRect(ctx, -40, -120, 90, 140, 18)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(-20, 70, 70, 45, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(70, 50, 55, 36, 0, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'laugh':
      ctx.beginPath()
      ctx.arc(0, 0, 110, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = niche.panel
      ctx.beginPath()
      ctx.arc(-40, -20, 16, 0, Math.PI * 2)
      ctx.arc(40, -20, 16, 0, Math.PI * 2)
      ctx.fill()
      ctx.lineWidth = 14
      ctx.strokeStyle = niche.panel
      ctx.beginPath()
      ctx.arc(0, 20, 48, 0.15 * Math.PI, 0.85 * Math.PI)
      ctx.stroke()
      break
    case 'boltnews':
      roundRect(ctx, -150, -90, 300, 60, 16)
      ctx.fill()
      roundRect(ctx, -150, -10, 220, 36, 12)
      ctx.fill()
      roundRect(ctx, -150, 50, 180, 36, 12)
      ctx.fill()
      break
    case 'plane':
      ctx.beginPath()
      ctx.moveTo(-140, 20)
      ctx.lineTo(20, -20)
      ctx.lineTo(140, -50)
      ctx.lineTo(60, 10)
      ctx.lineTo(100, 70)
      ctx.lineTo(40, 40)
      ctx.lineTo(-40, 80)
      ctx.lineTo(-10, 20)
      ctx.closePath()
      ctx.fill()
      break
    case 'ball':
      ctx.beginPath()
      ctx.arc(0, 0, 110, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = niche.panel
      ctx.lineWidth = 10
      ctx.beginPath()
      ctx.arc(0, 0, 110, 0, Math.PI * 2)
      ctx.moveTo(-110, 0)
      ctx.lineTo(110, 0)
      ctx.moveTo(0, -110)
      ctx.lineTo(0, 110)
      ctx.stroke()
      break
    case 'wheel':
      ctx.beginPath()
      ctx.arc(0, 0, 110, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = niche.panel
      ctx.beginPath()
      ctx.arc(0, 0, 45, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = niche.panel
      ctx.lineWidth = 14
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.cos((i * Math.PI * 2) / 5) * 100, Math.sin((i * Math.PI * 2) / 5) * 100)
        ctx.stroke()
      }
      break
    case 'bag':
      roundRect(ctx, -110, -40, 220, 160, 28)
      ctx.fill()
      ctx.strokeStyle = niche.accent
      ctx.lineWidth = 16
      ctx.beginPath()
      ctx.arc(0, -40, 55, Math.PI, 0)
      ctx.stroke()
      break
    case 'heart':
      ctx.beginPath()
      ctx.moveTo(0, 90)
      ctx.bezierCurveTo(-140, 10, -100, -100, 0, -40)
      ctx.bezierCurveTo(100, -100, 140, 10, 0, 90)
      ctx.fill()
      break
    case 'rise':
      ctx.beginPath()
      ctx.moveTo(-130, 90)
      ctx.lineTo(-40, 20)
      ctx.lineTo(10, 50)
      ctx.lineTo(130, -80)
      ctx.lineTo(130, -20)
      ctx.lineTo(40, 80)
      ctx.lineTo(-10, 50)
      ctx.lineTo(-80, 100)
      ctx.closePath()
      ctx.fill()
      break
    case 'wrench':
      roundRect(ctx, -30, -120, 60, 200, 20)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(0, -110, 55, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = niche.panel
      ctx.beginPath()
      ctx.arc(0, -110, 22, 0, Math.PI * 2)
      ctx.fill()
      break
  }
  ctx.restore()
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

export function renderThumbnail(ctx: CanvasRenderingContext2D, input: ThumbInput) {
  const { niche, watermark } = input
  const title = input.title.trim() || 'YOUR TITLE HERE'
  const eyebrow = (input.eyebrow.trim() || niche.badge).toUpperCase()

  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  gradient.addColorStop(0, niche.background[0])
  gradient.addColorStop(0.55, niche.background[1])
  gradient.addColorStop(1, niche.background[2])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.fillStyle = `${niche.accent}18`
  ctx.beginPath()
  ctx.arc(1040, 120, 220, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(1180, 620, 180, 0, Math.PI * 2)
  ctx.fill()

  drawShape(ctx, niche)

  ctx.fillStyle = niche.accent
  roundRect(ctx, 560, 150, 18, 420, 9)
  ctx.fill()

  ctx.fillStyle = niche.accent
  ctx.font = '700 28px "DM Sans", sans-serif'
  ctx.fillText(eyebrow, 610, 210)

  ctx.fillStyle = niche.ink
  ctx.font = '400 92px "Bebas Neue", Impact, sans-serif'
  const lines = wrapLines(ctx, title.toUpperCase(), 560, 3)
  let y = 300
  for (const line of lines) {
    ctx.fillText(line, 610, y)
    y += 96
  }

  ctx.fillStyle = niche.muted
  ctx.font = '500 24px "DM Sans", sans-serif'
  ctx.fillText('1280 × 720  ·  YouTube ready', 610, 640)

  if (watermark) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '500 22px "JetBrains Mono", monospace'
    ctx.fillText('ThumbForge free', 40, HEIGHT - 36)
  }
}

export function createThumbnailDataUrl(input: ThumbInput): string {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser.')
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
