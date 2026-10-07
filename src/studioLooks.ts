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

function focalForVariant(index: number) {
  const variants = [
    { x: 0.28, y: 0.42, scale: 1 },
    { x: 0.72, y: 0.4, scale: 1 },
    { x: 0.5, y: 0.36, scale: 1.18 },
  ]
  return variants[((index % variants.length) + variants.length) % variants.length]!
}

/** Soft cinematic mass — a poster plate, not clip-art silhouettes. */
function paintHeroVolume(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  size: number,
  palette: StudioPalette,
) {
  ctx.save()
  const core = ctx.createRadialGradient(fx, fy, size * 0.04, fx, fy, size * 0.55)
  core.addColorStop(0, rgba(palette.rim, 0.55))
  core.addColorStop(0.22, rgba(palette.glow, 0.42))
  core.addColorStop(0.58, rgba(palette.mid, 0.22))
  core.addColorStop(1, rgba(palette.deep, 0))
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.ellipse(fx, fy, size * 0.42, size * 0.5, -0.18, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalCompositeOperation = 'screen'
  const shaft = ctx.createLinearGradient(fx - size * 0.05, fy - size * 0.7, fx + size * 0.2, fy + size * 0.6)
  shaft.addColorStop(0, rgba(palette.rim, 0))
  shaft.addColorStop(0.45, rgba(palette.glow, 0.28))
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
  const { width, height, palette, variantIndex } = options
  const focal = focalForVariant(variantIndex)

  ctx.fillStyle = palette.deep
  ctx.fillRect(0, 0, width, height)

  const sky = ctx.createLinearGradient(0, 0, 0, height)
  sky.addColorStop(0, palette.sky)
  sky.addColorStop(0.45, palette.mid)
  sky.addColorStop(1, palette.deep)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, width, height)

  const gx = width * focal.x
  const gy = height * focal.y
  const key = ctx.createRadialGradient(gx, gy, 8, gx, gy, Math.max(width, height) * 0.55)
  key.addColorStop(0, rgba(palette.glow, 0.55))
  key.addColorStop(0.45, rgba(palette.glow, 0.12))
  key.addColorStop(1, rgba(palette.deep, 0))
  ctx.fillStyle = key
  ctx.fillRect(0, 0, width, height)

  const rimX = width * (1 - focal.x)
  const rim = ctx.createRadialGradient(rimX, height * 0.18, 4, rimX, height * 0.18, width * 0.4)
  rim.addColorStop(0, rgba(palette.rim, 0.28))
  rim.addColorStop(1, rgba(palette.rim, 0))
  ctx.fillStyle = rim
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  const orbs = 10 + (variantIndex % 3)
  for (let i = 0; i < orbs; i++) {
    const ox = ((i * 97 + variantIndex * 53) % 1000) / 1000
    const oy = ((i * 61 + variantIndex * 29) % 1000) / 1000
    const r = (12 + ((i * 13) % 28)) * (width / 1280)
    ctx.fillStyle = rgba(i % 2 ? palette.glow : palette.rim, 0.08 + (i % 5) * 0.02)
    ctx.beginPath()
    ctx.arc(ox * width, oy * height * 0.72, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  const size = Math.min(width, height) * 0.78 * focal.scale
  paintHeroVolume(ctx, gx, gy, size, palette)

  const floor = ctx.createLinearGradient(0, height * 0.62, 0, height)
  floor.addColorStop(0, rgba(palette.deep, 0))
  floor.addColorStop(1, rgba(palette.deep, 0.82))
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
      pixels.data[i + 3] = 28
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
    Math.min(width, height) * 0.18,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.72,
  )
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, `rgba(0,0,0,${0.28 + variantIndex * 0.06})`)
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
      canvas.toBlob(finish, 'image/jpeg', 0.9)
      return
    }
    try {
      finish(dataUrlToBlob(canvas.toDataURL('image/jpeg', 0.9)))
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
