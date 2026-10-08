import type { AiGeneratedImage, AiStyleId, SceneCues } from './aiThumbnail'
import { LOCAL_LOOK_RECIPES } from './aiLooks'

export type StudioPalette = {
  sky: string
  mid: string
  deep: string
  glow: string
  rim: string
}

/** Mood colors from the selected niche, nudged by scene + style chips. */
export function studioPaletteForScene(
  hint: string,
  niche: { background: [string, string, string]; accent: string },
  styleId: string,
): StudioPalette {
  const [deep, mid, sky] = niche.background
  const h = hint.toLowerCase()
  let glow = niche.accent
  if (styleId === 'dark-moody') glow = '#7CFFF0'
  if (styleId === 'music-stage') glow = '#FFB070'
  if (styleId === 'kids-fun' || styleId === 'cartoon') glow = '#FFE44D'
  if (/\b(jungle|forest|woods|animal|puppy|kitten)\b/.test(h)) glow = '#9CFF7A'
  if (/\b(neon|gamer|rgb|cyber)\b/.test(h)) glow = '#7CFFF0'
  if (/\b(sunset|warm|golden|concert)\b/.test(h)) glow = '#FFB070'
  if (/\b(couple|romance|love)\b/.test(h)) glow = '#FF8AAE'
  return { sky, mid, deep, glow, rim: '#F7F4EE' }
}

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace('#', '').trim()
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw.padEnd(6, '0')
  const n = Number.parseInt(full.slice(0, 6), 16)
  if (!Number.isFinite(n)) return [12, 10, 18]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgba(hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

function mixHex(a: string, b: string, t: number) {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${[r, g, bl].map((n) => n.toString(16).padStart(2, '0')).join('')}`
}

function focalForVariant(index: number) {
  const variants = [
    { x: 0.3, y: 0.44, scale: 1 },
    { x: 0.7, y: 0.42, scale: 1 },
    { x: 0.5, y: 0.38, scale: 1.16 },
  ]
  return variants[((index % variants.length) + variants.length) % variants.length]!
}

function fillAtmosphere(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: StudioPalette,
  focal: { x: number; y: number },
) {
  ctx.fillStyle = palette.deep
  ctx.fillRect(0, 0, width, height)

  const sky = ctx.createLinearGradient(0, 0, 0, height)
  sky.addColorStop(0, mixHex(palette.sky, palette.glow, 0.12))
  sky.addColorStop(0.38, palette.mid)
  sky.addColorStop(1, palette.deep)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, width, height)

  const gx = width * focal.x
  const gy = height * focal.y
  const key = ctx.createRadialGradient(gx, gy, 6, gx, gy, Math.max(width, height) * 0.62)
  key.addColorStop(0, rgba(palette.glow, 0.62))
  key.addColorStop(0.4, rgba(palette.glow, 0.16))
  key.addColorStop(1, rgba(palette.deep, 0))
  ctx.fillStyle = key
  ctx.fillRect(0, 0, width, height)

  const rimX = width * (1 - focal.x)
  const rim = ctx.createRadialGradient(rimX, height * 0.12, 2, rimX, height * 0.12, width * 0.46)
  rim.addColorStop(0, rgba(palette.rim, 0.34))
  rim.addColorStop(1, rgba(palette.rim, 0))
  ctx.fillStyle = rim
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  const streak = ctx.createLinearGradient(gx - width * 0.4, gy - 8, gx + width * 0.45, gy + 8)
  streak.addColorStop(0, 'rgba(255,255,255,0)')
  streak.addColorStop(0.5, rgba(palette.rim, 0.18))
  streak.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = streak
  ctx.fillRect(0, gy - height * 0.035, width, height * 0.07)
  ctx.restore()
}

function paintBokeh(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: StudioPalette,
  variantIndex: number,
  count: number,
) {
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  for (let i = 0; i < count; i++) {
    const ox = ((i * 97 + variantIndex * 53) % 1000) / 1000
    const oy = ((i * 61 + variantIndex * 29) % 1000) / 1000
    const r = (10 + ((i * 17) % 36)) * (width / 1280)
    ctx.fillStyle = rgba(i % 2 ? palette.glow : palette.rim, 0.07 + (i % 5) * 0.018)
    ctx.beginPath()
    ctx.arc(ox * width, oy * height * 0.74, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function paintPortrait(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  size: number,
  palette: StudioPalette,
) {
  ctx.save()
  const shoulder = ctx.createRadialGradient(fx, fy + size * 0.42, size * 0.04, fx, fy + size * 0.5, size * 0.7)
  shoulder.addColorStop(0, rgba(palette.mid, 0.7))
  shoulder.addColorStop(1, rgba(palette.deep, 0))
  ctx.fillStyle = shoulder
  ctx.beginPath()
  ctx.ellipse(fx, fy + size * 0.48, size * 0.52, size * 0.28, 0, 0, Math.PI * 2)
  ctx.fill()

  const head = ctx.createRadialGradient(fx - size * 0.08, fy - size * 0.12, size * 0.04, fx, fy, size * 0.42)
  head.addColorStop(0, rgba(palette.rim, 0.8))
  head.addColorStop(0.28, rgba(palette.glow, 0.45))
  head.addColorStop(1, rgba(palette.deep, 0.05))
  ctx.fillStyle = head
  ctx.beginPath()
  ctx.ellipse(fx, fy - size * 0.04, size * 0.28, size * 0.36, -0.08, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = rgba(palette.rim, 0.55)
  ctx.beginPath()
  ctx.arc(fx - size * 0.08, fy - size * 0.1, size * 0.045, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function paintCreature(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  size: number,
  palette: StudioPalette,
) {
  ctx.save()
  const body = ctx.createRadialGradient(fx, fy + size * 0.08, size * 0.05, fx, fy, size * 0.5)
  body.addColorStop(0, rgba(palette.rim, 0.55))
  body.addColorStop(0.3, rgba(palette.glow, 0.4))
  body.addColorStop(1, rgba(palette.deep, 0))
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.ellipse(fx, fy + size * 0.06, size * 0.38, size * 0.28, 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(fx - size * 0.22, fy - size * 0.12, size * 0.2, size * 0.22, -0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = rgba(palette.rim, 0.35)
  ctx.beginPath()
  ctx.ellipse(fx - size * 0.28, fy - size * 0.28, size * 0.08, size * 0.14, -0.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(fx - size * 0.12, fy - size * 0.32, size * 0.07, size * 0.13, 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function paintProduct(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  size: number,
  palette: StudioPalette,
) {
  ctx.save()
  const floor = ctx.createRadialGradient(fx, fy + size * 0.28, 4, fx, fy + size * 0.28, size * 0.55)
  floor.addColorStop(0, rgba(palette.rim, 0.28))
  floor.addColorStop(1, rgba(palette.deep, 0))
  ctx.fillStyle = floor
  ctx.beginPath()
  ctx.ellipse(fx, fy + size * 0.32, size * 0.42, size * 0.1, 0, 0, Math.PI * 2)
  ctx.fill()

  const body = ctx.createLinearGradient(fx - size * 0.16, fy - size * 0.28, fx + size * 0.2, fy + size * 0.22)
  body.addColorStop(0, rgba(palette.rim, 0.7))
  body.addColorStop(0.45, rgba(palette.glow, 0.55))
  body.addColorStop(1, rgba(palette.deep, 0.2))
  ctx.fillStyle = body
  ctx.fillRect(fx - size * 0.16, fy - size * 0.22, size * 0.32, size * 0.42)

  ctx.globalAlpha = 0.28
  ctx.scale(1, -0.28)
  ctx.translate(0, -(fy + size * 0.32) * 2)
  ctx.fillStyle = rgba(palette.glow, 0.5)
  ctx.fillRect(fx - size * 0.16, fy - size * 0.22, size * 0.32, size * 0.42)
  ctx.restore()
}

function paintStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fx: number,
  fy: number,
  size: number,
  palette: StudioPalette,
) {
  ctx.save()
  const cone = ctx.createLinearGradient(fx, fy - size * 0.85, fx, fy + size * 0.4)
  cone.addColorStop(0, rgba(palette.rim, 0.0))
  cone.addColorStop(0.25, rgba(palette.glow, 0.32))
  cone.addColorStop(1, rgba(palette.glow, 0))
  ctx.fillStyle = cone
  ctx.beginPath()
  ctx.moveTo(fx - size * 0.06, fy - size * 0.82)
  ctx.lineTo(fx + size * 0.06, fy - size * 0.82)
  ctx.lineTo(fx + size * 0.38, fy + size * 0.4)
  ctx.lineTo(fx - size * 0.38, fy + size * 0.4)
  ctx.closePath()
  ctx.fill()

  ctx.globalCompositeOperation = 'multiply'
  const floor = ctx.createLinearGradient(0, height * 0.62, 0, height)
  floor.addColorStop(0, rgba(palette.deep, 0))
  floor.addColorStop(1, rgba(palette.deep, 0.85))
  ctx.fillStyle = floor
  ctx.fillRect(0, height * 0.58, width, height * 0.42)
  ctx.restore()

  paintPortrait(ctx, fx, fy + size * 0.04, size * 0.82, palette)
}

function paintHeroVolume(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  size: number,
  palette: StudioPalette,
) {
  ctx.save()
  const core = ctx.createRadialGradient(fx, fy, size * 0.04, fx, fy, size * 0.55)
  core.addColorStop(0, rgba(palette.rim, 0.58))
  core.addColorStop(0.22, rgba(palette.glow, 0.44))
  core.addColorStop(0.58, rgba(palette.mid, 0.22))
  core.addColorStop(1, rgba(palette.deep, 0))
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.ellipse(fx, fy, size * 0.42, size * 0.5, -0.18, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalCompositeOperation = 'screen'
  const shaft = ctx.createLinearGradient(fx - size * 0.05, fy - size * 0.7, fx + size * 0.2, fy + size * 0.6)
  shaft.addColorStop(0, rgba(palette.rim, 0))
  shaft.addColorStop(0.45, rgba(palette.glow, 0.3))
  shaft.addColorStop(1, rgba(palette.glow, 0))
  ctx.fillStyle = shaft
  ctx.beginPath()
  ctx.moveTo(fx - size * 0.08, fy - size * 0.72)
  ctx.lineTo(fx + size * 0.14, fy - size * 0.72)
  ctx.lineTo(fx + size * 0.32, fy + size * 0.55)
  ctx.lineTo(fx - size * 0.22, fy + size * 0.55)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/**
 * Paint a cinematic 16:9 poster still. Not a photograph — a usable backdrop
 * so the editor never shows an empty picker when free AI is offline.
 */
export function paintStudioLook(
  ctx: CanvasRenderingContext2D,
  options: {
    width: number
    height: number
    palette: StudioPalette
    variantIndex: number
    cues: SceneCues
    styleId: AiStyleId
  },
) {
  const { width, height, palette, variantIndex, cues, styleId } = options
  const focal = focalForVariant(variantIndex)
  fillAtmosphere(ctx, width, height, palette, focal)
  paintBokeh(ctx, width, height, palette, variantIndex, 14 + (variantIndex % 4))

  const gx = width * focal.x
  const gy = height * focal.y
  const size = Math.min(width, height) * 0.8 * focal.scale

  if (cues.nonHumanSubject || cues.animals) {
    paintCreature(ctx, gx, gy, size, palette)
  } else if (styleId === 'product-hero') {
    paintProduct(ctx, gx, gy, size, palette)
  } else if (styleId === 'music-stage') {
    paintStage(ctx, width, height, gx, gy, size, palette)
  } else if (styleId === 'face-reaction' || cues.wantsHuman) {
    paintPortrait(ctx, gx, gy, size, palette)
  } else {
    paintHeroVolume(ctx, gx, gy, size, palette)
  }

  const floor = ctx.createLinearGradient(0, height * 0.62, 0, height)
  floor.addColorStop(0, rgba(palette.deep, 0))
  floor.addColorStop(1, rgba(palette.deep, 0.78))
  ctx.fillStyle = floor
  ctx.fillRect(0, height * 0.55, width, height * 0.45)

  const grain = document.createElement('canvas')
  grain.width = 160
  grain.height = 90
  const gctx = grain.getContext('2d')
  if (gctx) {
    const pixels = gctx.createImageData(grain.width, grain.height)
    for (let i = 0; i < pixels.data.length; i += 4) {
      const v = 70 + ((i * 13 + variantIndex * 17) % 120)
      pixels.data[i] = v
      pixels.data[i + 1] = v
      pixels.data[i + 2] = v
      pixels.data[i + 3] = 26
    }
    gctx.putImageData(pixels, 0, 0)
    ctx.save()
    ctx.globalCompositeOperation = 'overlay'
    ctx.drawImage(grain, 0, 0, width, height)
    ctx.restore()
  }

  const vig = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.2,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.74,
  )
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, `rgba(0,0,0,${0.3 + variantIndex * 0.05})`)
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, width, height)
}

function dataUrlToBlob(dataUrl: string) {
  const comma = dataUrl.indexOf(',')
  const meta = dataUrl.slice(0, comma)
  const payload = dataUrl.slice(comma + 1)
  const mime = /data:([^;]+)/.exec(meta)?.[1] || 'image/jpeg'
  const binary = atob(payload)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

function canvasToObjectUrl(canvas: HTMLCanvasElement) {
  return new Promise<string>((resolve, reject) => {
    const finish = (blob: Blob | null) => {
      if (!blob) {
        reject(new Error('Could not export a studio look.'))
        return
      }
      resolve(URL.createObjectURL(blob))
    }
    if (typeof canvas.toBlob === 'function') {
      canvas.toBlob(finish, 'image/jpeg', 0.92)
      return
    }
    try {
      finish(dataUrlToBlob(canvas.toDataURL('image/jpeg', 0.92)))
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Could not export a studio look.'))
    }
  })
}

function loadImageFromUrl(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not open a studio look.'))
    image.src = src
  })
}

export type ComposeStudioOptions = {
  width: number
  height: number
  prompt: string
  seed: number
  styleId: AiStyleId
  hint: string
  niche: { background: [string, string, string]; accent: string }
  cues: SceneCues
  count?: number
}

/** Always try to return up to 3 distinct poster stills — no network. */
export async function composeStudioLooks(options: ComposeStudioOptions): Promise<AiGeneratedImage[]> {
  const count = Math.min(3, Math.max(1, options.count ?? 3))
  const results: AiGeneratedImage[] = []
  for (let i = 0; i < count; i++) {
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(16, Math.round(options.width))
    canvas.height = Math.max(16, Math.round(options.height))
    const ctx = canvas.getContext('2d')
    if (!ctx) continue
    const palette = studioPaletteForScene(options.hint, options.niche, options.styleId)
    paintStudioLook(ctx, {
      width: canvas.width,
      height: canvas.height,
      palette,
      variantIndex: i,
      cues: options.cues,
      styleId: options.styleId,
    })
    try {
      const objectUrl = await canvasToObjectUrl(canvas)
      const image = await loadImageFromUrl(objectUrl)
      const recipe = LOCAL_LOOK_RECIPES[i]
      results.push({
        image,
        objectUrl,
        prompt: options.prompt,
        seed: options.seed + i * 19,
        styleId: options.styleId,
        lookLabel: recipe?.label ?? `Look ${i + 1}`,
        derived: i > 0,
        source: 'studio',
      })
    } catch {
      // jsdom / missing toBlob — skip rather than fail the batch.
    }
  }
  return results
}
