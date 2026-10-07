import type { FontId } from './fonts'
import { getFont, scaledTitleFontSize } from './fonts'
import type { LayoutId, PhotoShapeId } from './layout'
import type { Niche } from './niches'
import type { Platform } from './platforms'
import type { PlacedSticker, StickerId } from './stickers'
import { DOWNLOAD_PREFIX, WATERMARK_LABEL } from './brand'
import type { TextStyleId } from './textStyle'
import { getTextStyle } from './textStyle'
import { splitTitleLines, TITLE_OUTLINE_AUTO, type TitleAlign } from './titleKit'

export type TextPosition = {
  x: number
  y: number
}

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
  stickers: PlacedSticker[]
  fontId: FontId
  titleFontSizePx: number
  textStyleId: TextStyleId
  textPos: TextPosition
  titleAlign?: TitleAlign
  titleLine2?: string
  titleFill?: string
  /** -1 = follow the style chip; 0 = no outline; 1+ = px at 1280-wide. */
  titleOutlineWidth?: number
  titleOutlineColor?: string
  titleShadow?: boolean
  showSafeZones?: boolean
  activeStickerIndex?: number
  highlightText?: boolean
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
    const photoH =
      orientation === 'vertical' ? Math.round(H * 0.44) : Math.round(H * 0.48)
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

  const photoW = Math.round(W * 0.36)
  const gutter = Math.round(pad * 1.85)
  if (layout === 'photo-right') {
    return {
      photo: { x: W - pad - photoW, y: pad, w: photoW, h: H - pad * 2 },
      text: { x: pad, y: pad, w: W - photoW - pad - gutter - pad, h: H - pad * 2 },
    }
  }

  return {
    photo: { x: pad, y: pad, w: photoW, h: H - pad * 2 },
    text: { x: pad + photoW + gutter, y: pad, w: W - photoW - pad - gutter - pad, h: H - pad * 2 },
  }
}

export function defaultTextPosition(platform: Platform, layout: LayoutId): TextPosition {
  const text = layoutBoxes(platform, layout).text
  const padX = Math.round(text.w * 0.07)
  const padY = Math.round(text.h * 0.04)
  return {
    x: (text.x + padX) / platform.width,
    y: (text.y + padY) / platform.height,
  }
}

export function clampTextPosition(
  platform: Platform,
  layout: LayoutId,
  textPos: TextPosition,
): TextPosition {
  // Clamp against the full canvas — not the layout text column.
  // photo-full's layout text box starts ~55–58% down; clamping to that
  // region blocked dragging the title into the upper third.
  const text = layoutBoxes(platform, layout).text
  const W = platform.width
  const H = platform.height
  const margin = Math.round(Math.min(W, H) * 0.03)
  // Keep a sliver of the title block on-canvas so it cannot vanish off-edge.
  const keepX = Math.min(Math.round(text.w * 0.35), Math.round(W * 0.22))
  const keepY = Math.min(Math.round(text.h * 0.35), Math.round(H * 0.2))
  const minX = margin / W
  const minY = margin / H
  const maxX = Math.max(minX, (W - margin - keepX) / W)
  const maxY = Math.max(minY, (H - margin - keepY) / H)
  return {
    x: Math.min(maxX, Math.max(minX, textPos.x)),
    y: Math.min(maxY, Math.max(minY, textPos.y)),
  }
}

export function textBoxFromInput(input: ThumbInput): Box {
  const base = layoutBoxes(input.platform, input.layout).text
  const W = input.platform.width
  const H = input.platform.height
  const pos = clampTextPosition(input.platform, input.layout, input.textPos)
  return {
    x: pos.x * W,
    y: pos.y * H,
    w: base.w,
    h: base.h,
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
  base.addColorStop(0.45, niche.background[1])
  base.addColorStop(1, niche.background[2])
  ctx.fillStyle = base
  ctx.fillRect(0, 0, W, H)

  const washStrength = niche.backdrop === 'neon' ? 0.58 : niche.backdrop === 'warm' ? 0.48 : 0.4
  const wash = ctx.createRadialGradient(W * 0.22, H * 0.12, 20, W * 0.22, H * 0.12, Math.max(W, H) * 0.58)
  wash.addColorStop(0, `${accent}${Math.round(washStrength * 255)
    .toString(16)
    .padStart(2, '0')}`)
  wash.addColorStop(1, `${accent}00`)
  ctx.fillStyle = wash
  ctx.fillRect(0, 0, W, H)

  if (niche.backdrop === 'beam' || niche.backdrop === 'warm') {
    ctx.save()
    ctx.translate(W * 0.55, H * 0.08)
    ctx.rotate(-0.55)
    const streak = ctx.createLinearGradient(0, 0, W * 0.9, 0)
    streak.addColorStop(0, `${accent}00`)
    streak.addColorStop(0.5, `${accent}44`)
    streak.addColorStop(1, `${accent}00`)
    ctx.fillStyle = streak
    ctx.fillRect(-W * 0.2, 0, W * 0.9, Math.max(48, H * 0.1))
    ctx.restore()
  }

  if (niche.backdrop === 'stripe') {
    ctx.save()
    ctx.globalAlpha = 0.12
    ctx.fillStyle = accent
    const band = Math.max(28, Math.round(H * 0.07))
    for (let y = 0; y < H; y += band * 2) {
      ctx.fillRect(0, y, W, band)
    }
    ctx.restore()
  }

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = 0.14
  const bloomA = ctx.createRadialGradient(W * 0.78, H * 0.22, 8, W * 0.78, H * 0.22, W * 0.52)
  bloomA.addColorStop(0, accent)
  bloomA.addColorStop(1, `${accent}00`)
  ctx.fillStyle = bloomA
  ctx.fillRect(0, 0, W, H)
  const bloomB = ctx.createRadialGradient(W * 0.12, H * 0.78, 8, W * 0.12, H * 0.78, W * 0.48)
  bloomB.addColorStop(0, `${accent}CC`)
  bloomB.addColorStop(1, `${accent}00`)
  ctx.fillStyle = bloomB
  ctx.fillRect(0, 0, W, H)
  ctx.restore()

  if (niche.backdrop === 'grid') {
    ctx.save()
    ctx.strokeStyle = `${accent}44`
    ctx.globalAlpha = 0.22
    ctx.lineWidth = 1
    const step = Math.max(40, Math.round(Math.min(W, H) * 0.065))
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
  }

  if (niche.backdrop === 'neon') {
    ctx.save()
    ctx.globalAlpha = 0.35
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.ellipse(W * 0.82, H * 0.2, W * 0.22, H * 0.16, -0.25, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(W * 0.15, H * 0.82, W * 0.2, H * 0.14, 0.35, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  if (niche.backdrop === 'soft') {
    const soft = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, Math.max(W, H) * 0.65)
    soft.addColorStop(0, `${niche.background[1]}88`)
    soft.addColorStop(1, `${niche.background[0]}00`)
    ctx.fillStyle = soft
    ctx.fillRect(0, 0, W, H)
  }

  const vignette = ctx.createRadialGradient(
    W / 2,
    H / 2,
    Math.min(W, H) * 0.15,
    W / 2,
    H / 2,
    Math.max(W, H) * 0.82,
  )
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, niche.backdrop === 'warm' ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.24)')
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
    const panelGrad = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h)
    panelGrad.addColorStop(0, input.niche.background[1])
    panelGrad.addColorStop(0.55, input.niche.panel)
    panelGrad.addColorStop(1, input.niche.background[0])
    ctx.fillStyle = panelGrad
    ctx.fillRect(box.x, box.y, box.w, box.h)
    const innerGlow = ctx.createRadialGradient(
      box.x + box.w * 0.5,
      box.y + box.h * 0.45,
      Math.min(box.w, box.h) * 0.05,
      box.x + box.w * 0.5,
      box.y + box.h * 0.45,
      Math.min(box.w, box.h) * 0.55,
    )
    innerGlow.addColorStop(0, `${accent}33`)
    innerGlow.addColorStop(1, `${accent}00`)
    ctx.fillStyle = innerGlow
    ctx.fillRect(box.x, box.y, box.w, box.h)
    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = Math.round(Math.min(box.w, box.h) * 0.08)
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.moveTo(box.x + box.w * 0.42, box.y + box.h * 0.38)
    ctx.lineTo(box.x + box.w * 0.62, box.y + box.h * 0.5)
    ctx.lineTo(box.x + box.w * 0.42, box.y + box.h * 0.62)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  ctx.restore()

  // Full-bleed backdrops should not get a neon inset-photo border.
  if (input.layout === 'photo-full') return

  ctx.save()
  ctx.strokeStyle = accent
  ctx.shadowColor = `${accent}66`
  ctx.shadowBlur = Math.max(4, Math.round(Math.min(box.w, box.h) * 0.02))
  const lineWidth = Math.max(5, Math.round(Math.min(box.w, box.h) * 0.018))
  ctx.lineWidth = lineWidth
  const inset = lineWidth * 0.55
  if (input.photoShape === 'circle') {
    const r = Math.min(box.w, box.h) / 2 - inset
    ctx.beginPath()
    ctx.arc(box.x + box.w / 2, box.y + box.h / 2, r, 0, Math.PI * 2)
    ctx.stroke()
  } else {
    roundRect(ctx, box.x + inset, box.y + inset, box.w - inset * 2, box.h - inset * 2, radius)
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
  styleId: TextStyleId,
  accent: string,
  overrides: {
    fill?: string
    outlineWidth?: number
    outlineColor?: string
    shadow?: boolean
  } = {},
) {
  const style = getTextStyle(styleId)
  const base = Math.max(14, Math.round(ctx.canvas.height * 0.014))
  const thick = Math.round(base * 1.55)
  const classic = Math.round(base * 1.08)

  let textFill = fill
  let stroke = '#000000'
  let lineWidth = classic
  let useStroke = true
  let useShadow = false

  switch (style.id) {
    case 'thick':
      lineWidth = thick
      break
    case 'minimal':
    case 'no-outline':
      useStroke = false
      break
    case 'yellow-pop':
      textFill = '#FFE44D'
      lineWidth = thick
      break
    case 'accent-fill':
      textFill = accent
      lineWidth = thick
      break
    case 'white-glow':
      useStroke = false
      useShadow = true
      textFill = '#FFFFFF'
      break
    case 'red-alert':
      textFill = '#FF3B30'
      stroke = '#FFFFFF'
      lineWidth = Math.round(base * 1.1)
      break
    default:
      break
  }

  if (overrides.fill) textFill = overrides.fill
  if (typeof overrides.outlineWidth === 'number' && overrides.outlineWidth !== TITLE_OUTLINE_AUTO) {
    if (overrides.outlineWidth <= 0) {
      useStroke = false
    } else {
      useStroke = true
      lineWidth = Math.max(1, Math.round(overrides.outlineWidth * (ctx.canvas.width / 1280)))
    }
  }
  if (overrides.outlineColor) stroke = overrides.outlineColor
  if (typeof overrides.shadow === 'boolean') useShadow = overrides.shadow

  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.save()
  if (useShadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.85)'
    ctx.shadowBlur = Math.round(base * 1.35)
    ctx.shadowOffsetX = Math.round(base * 0.18)
    ctx.shadowOffsetY = Math.round(base * 0.18)
  }
  if (useStroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.strokeText(text, x, y)
  }
  ctx.fillStyle = textFill
  ctx.fillText(text, x, y)
  ctx.restore()
}

function measureTextBlockBounds(input: ThumbInput, box: Box): Box {
  const title = input.title.trim() || 'YOUR TITLE HERE'
  const vertical = input.platform.orientation === 'vertical'
  const font = getFont(input.fontId)
  const titleSize = scaledTitleFontSize(input.titleFontSizePx, input.platform)
  const hasTag = Boolean(input.tag.trim())
  const tagSize = hasTag ? Math.round(titleSize * 0.34) : 0
  const maxLines = vertical ? 4 : 2

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return { x: box.x, y: box.y, w: box.w, h: box.h * 0.5 }
  }

  const strokePad = Math.round(titleSize * 0.2)
  const innerW = Math.max(40, box.w - strokePad * 2)
  ctx.font = `${font.weight} ${titleSize}px ${font.css}`
  const authored = splitTitleLines(title, input.titleLine2 ?? '')
  const lines =
    authored.length >= 2
      ? authored.slice(0, maxLines).map((line) => trimToWidth(ctx, line.toUpperCase(), innerW))
      : wrapLines(ctx, (authored[0] || title).toUpperCase(), innerW, maxLines)
  const tagGap = hasTag ? tagSize + 28 : Math.round(titleSize * 0.15)
  const contentH = tagGap + titleSize + lines.length * (titleSize + 8) + 12
  const totalH = Math.min(box.h, contentH)

  return { x: box.x, y: box.y, w: box.w, h: totalH }
}

export function hitTestTextBlock(input: ThumbInput, canvasX: number, canvasY: number): boolean {
  const bounds = measureTextBlockBounds(input, textBoxFromInput(input))
  const pad = 12
  return (
    canvasX >= bounds.x - pad &&
    canvasX <= bounds.x + bounds.w + pad &&
    canvasY >= bounds.y - pad &&
    canvasY <= bounds.y + bounds.h + pad
  )
}

function drawTextBlock(ctx: CanvasRenderingContext2D, input: ThumbInput) {
  const box = textBoxFromInput(input)
  const accent = accentOf(input)
  // Only show a badge when the user typed a tag — do not auto-dump niche.badge (e.g. SHIPPED).
  const tag = input.tag.trim().toUpperCase()
  const title = input.title.trim() || 'YOUR TITLE HERE'
  const font = getFont(input.fontId)
  const titleSize = scaledTitleFontSize(input.titleFontSizePx, input.platform)
  const tagSize = Math.round(titleSize * 0.34)
  const maxLines = input.platform.orientation === 'vertical' ? 4 : 2
  const styleId = input.textStyleId
  const align: TitleAlign = input.titleAlign ?? 'left'
  const punch = {
    fill: input.titleFill || undefined,
    outlineWidth: input.titleOutlineWidth,
    outlineColor: input.titleOutlineColor || undefined,
    shadow: input.titleShadow,
  }

  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'
  const strokePad = Math.round(titleSize * 0.2)
  const innerX = box.x + strokePad
  const innerW = Math.max(40, box.w - strokePad * 2)
  const textX =
    align === 'center' ? box.x + box.w / 2 : align === 'right' ? box.x + box.w - strokePad : innerX

  ctx.save()
  ctx.beginPath()
  ctx.rect(box.x - strokePad, box.y, box.w + strokePad * 2, box.h)
  ctx.clip()

  let y = box.y + Math.round(titleSize * 0.15) + titleSize
  if (tag) {
    ctx.font = `800 ${tagSize}px "DM Sans", sans-serif`
    drawPunchText(ctx, tag, textX, box.y + tagSize + 8, accent, styleId, accent, punch)
    y = box.y + tagSize + titleSize + 28
  }

  ctx.font = `${font.weight} ${titleSize}px ${font.css}`
  const authored = splitTitleLines(title, input.titleLine2 ?? '')
  const lines =
    authored.length >= 2
      ? authored.slice(0, maxLines).map((line) => trimToWidth(ctx, line.toUpperCase(), innerW))
      : wrapLines(ctx, (authored[0] || title).toUpperCase(), innerW, maxLines)

  for (const line of lines) {
    drawPunchText(ctx, line, textX, y, '#FFFFFF', styleId, accent, punch)
    y += titleSize + 8
  }
  ctx.restore()

  if (input.highlightText) {
    const bounds = measureTextBlockBounds(input, box)
    ctx.save()
    ctx.strokeStyle = 'rgba(214, 255, 60, 0.85)'
    ctx.lineWidth = Math.max(3, Math.round(input.platform.height * 0.004))
    ctx.setLineDash([10, 8])
    roundRect(ctx, bounds.x - 6, bounds.y - 6, bounds.w + 12, bounds.h + 12, 12)
    ctx.stroke()
    ctx.restore()
  }
}

function drawSafeZones(ctx: CanvasRenderingContext2D, platform: Platform) {
  const W = platform.width
  const H = platform.height
  const pad = Math.round(Math.min(W, H) * 0.04)
  const badgeW = Math.round(W * 0.14)
  const badgeH = Math.round(H * 0.12)

  ctx.save()
  ctx.fillStyle = 'rgba(255, 90, 61, 0.12)'
  ctx.strokeStyle = 'rgba(255, 90, 61, 0.45)'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 6])

  ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2)
  ctx.fillRect(W - badgeW - pad, H - badgeH - pad, badgeW, badgeH)
  ctx.strokeRect(W - badgeW - pad, H - badgeH - pad, badgeW, badgeH)

  ctx.font = `600 ${Math.max(14, Math.round(H * 0.022))}px "DM Sans", sans-serif`
  ctx.fillStyle = 'rgba(255, 200, 180, 0.9)'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText('duration zone', W - pad - 6, H - pad - 6)
  ctx.restore()
}

export function stickerUnit(platform: Platform) {
  return Math.max(56, Math.round(Math.min(platform.width, platform.height) * 0.08))
}

export function hitTestSticker(
  stickers: PlacedSticker[],
  platform: Platform,
  canvasX: number,
  canvasY: number,
): number {
  const unit = stickerUnit(platform)
  const radius = unit * 0.75
  for (let i = stickers.length - 1; i >= 0; i--) {
    const item = stickers[i]
    const sx = item.x * platform.width
    const sy = item.y * platform.height
    const dx = canvasX - sx
    const dy = canvasY - sy
    if (dx * dx + dy * dy <= radius * radius) return i
  }
  return -1
}

function drawStickers(ctx: CanvasRenderingContext2D, input: ThumbInput) {
  const accent = accentOf(input)
  const scale = Math.min(input.platform.width, input.platform.height)
  const unit = stickerUnit(input.platform)

  input.stickers.slice(0, 3).forEach((item, index) => {
    const x = item.x * input.platform.width
    const y = item.y * input.platform.height
    const angle = index % 2 === 0 ? -10 : 12
    drawSticker(ctx, accent, item.id, x, y, angle, scale)
    if (input.activeStickerIndex === index) {
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'
      ctx.lineWidth = Math.max(3, Math.round(unit * 0.06))
      ctx.setLineDash([8, 6])
      ctx.beginPath()
      ctx.arc(x, y, unit * 0.78, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
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
    drawTextBlock(ctx, input)
  } else {
    drawPhoto(ctx, input, boxes.photo)
    drawTextBlock(ctx, input)
  }
  drawStickers(ctx, input)

  if (input.showSafeZones) {
    drawSafeZones(ctx, platform)
  }

  if (input.watermark) {
    drawCenteredWatermark(ctx, boxes.photo)
  }
}

function drawCenteredWatermark(
  ctx: CanvasRenderingContext2D,
  photo: { x: number; y: number; w: number; h: number },
) {
  const size = Math.max(16, Math.round(Math.min(photo.w, photo.h) * 0.045))
  const label = WATERMARK_LABEL
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

export function exportThumbInput(input: ThumbInput): ThumbInput {
  return {
    ...input,
    showSafeZones: false,
    activeStickerIndex: undefined,
    highlightText: false,
  }
}

export function createThumbnailDataUrl(input: ThumbInput): string {
  const canvas = document.createElement('canvas')
  canvas.width = input.platform.width
  canvas.height = input.platform.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('This browser cannot create the image.')
  renderThumbnail(ctx, exportThumbInput(input))
  return canvas.toDataURL('image/png')
}

export function downloadThumbnail(input: ThumbInput) {
  const url = createThumbnailDataUrl(input)
  const link = document.createElement('a')
  link.href = url
  link.download = `${DOWNLOAD_PREFIX}-${input.platform.id}.png`
  link.click()
}
