import type { AiGeneratedImage, AiStyleId } from './aiThumbnail'

/** Crop is a fraction of the source image (0–1). */
export type LookCrop = { sx: number; sy: number; sw: number; sh: number }

export type LookGrade = {
  contrast: number
  brightness: number
  saturate: number
  sepia?: number
  hueRotate?: number
  /** Extra CSS filter bits (vignette is drawn separately). */
  extra?: string
}

export type LocalLookRecipe = {
  id: string
  label: string
  blurb: string
  crop: LookCrop
  grade: LookGrade
  vignette: number
}

/**
 * Three distinct “looks” from one successful generation.
 * Near-full crops keep a good still cinematic — quadrants are only for collage isolation.
 */
export const LOCAL_LOOK_RECIPES: LocalLookRecipe[] = [
  {
    id: 'hero',
    label: 'Punch',
    blurb: 'Full-bleed, high pop',
    crop: { sx: 0.01, sy: 0.02, sw: 0.98, sh: 0.96 },
    grade: { contrast: 1.32, brightness: 1.08, saturate: 1.42 },
    vignette: 0.28,
  },
  {
    id: 'warm',
    label: 'Warm',
    blurb: 'Tighter crop, golden grade',
    crop: { sx: 0.12, sy: 0.05, sw: 0.76, sh: 0.9 },
    grade: { contrast: 1.2, brightness: 1.12, saturate: 1.38, sepia: 0.28, hueRotate: -6 },
    vignette: 0.16,
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    blurb: 'Closer, cool contrast',
    crop: { sx: 0.18, sy: 0.07, sw: 0.68, sh: 0.86 },
    grade: { contrast: 1.42, brightness: 0.9, saturate: 0.92, hueRotate: 14 },
    vignette: 0.44,
  },
]

/** Used only when the model returns a 2×2 / split collage. */
export const COLLAGE_ISOLATION_RECIPES: LocalLookRecipe[] = [
  {
    id: 'hero',
    label: 'Punch',
    blurb: 'Top-right frame',
    crop: { sx: 0.5, sy: 0, sw: 0.5, sh: 0.5 },
    grade: { contrast: 1.2, brightness: 1.05, saturate: 1.22 },
    vignette: 0.22,
  },
  {
    id: 'warm',
    label: 'Warm',
    blurb: 'Top-left, golden grade',
    crop: { sx: 0, sy: 0, sw: 0.5, sh: 0.5 },
    grade: { contrast: 1.16, brightness: 1.07, saturate: 1.3, sepia: 0.22 },
    vignette: 0.18,
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    blurb: 'Bottom-right, cool contrast',
    crop: { sx: 0.5, sy: 0.5, sw: 0.5, sh: 0.5 },
    grade: { contrast: 1.3, brightness: 0.92, saturate: 0.96, hueRotate: 12 },
    vignette: 0.34,
  },
]

export function cssFilterForGrade(grade: LookGrade) {
  const parts = [
    `contrast(${grade.contrast})`,
    `brightness(${grade.brightness})`,
    `saturate(${grade.saturate})`,
  ]
  if (grade.sepia) parts.push(`sepia(${grade.sepia})`)
  if (grade.hueRotate) parts.push(`hue-rotate(${grade.hueRotate}deg)`)
  if (grade.extra) parts.push(grade.extra)
  return parts.join(' ')
}

function luminance(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** High contrast along the mid vertical/horizontal seams → likely a grid/split collage. */
export function collageScoreFromImageData(data: Uint8ClampedArray, width: number, height: number) {
  const seam = (axis: 'x' | 'y', t: number) => {
    const pos = axis === 'x' ? Math.round(width * t) : Math.round(height * t)
    let delta = 0
    let n = 0
    if (axis === 'x') {
      const x = Math.min(width - 2, Math.max(1, pos))
      for (let y = 0; y < height; y += 1) {
        const a = ((y * width + (x - 1)) * 4)
        const b = ((y * width + (x + 1)) * 4)
        delta += Math.abs(luminance(data[a]!, data[a + 1]!, data[a + 2]!) - luminance(data[b]!, data[b + 1]!, data[b + 2]!))
        n += 1
      }
    } else {
      const y = Math.min(height - 2, Math.max(1, pos))
      for (let x = 0; x < width; x += 1) {
        const a = (((y - 1) * width + x) * 4)
        const b = (((y + 1) * width + x) * 4)
        delta += Math.abs(luminance(data[a]!, data[a + 1]!, data[a + 2]!) - luminance(data[b]!, data[b + 1]!, data[b + 2]!))
        n += 1
      }
    }
    return n ? delta / n : 0
  }
  const vertical = (seam('x', 0.5) + seam('x', 1 / 3) + seam('x', 2 / 3)) / 3
  const horizontal = (seam('y', 0.5) + seam('y', 1 / 3) + seam('y', 2 / 3)) / 3
  return vertical + horizontal
}

export function looksLikeCollageFromImageData(data: Uint8ClampedArray, width: number, height: number) {
  return collageScoreFromImageData(data, width, height) > 28
}

export function looksLikeCollage(image: HTMLImageElement) {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 96
    canvas.height = 54
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return false
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return looksLikeCollageFromImageData(pixels.data, canvas.width, canvas.height)
  } catch {
    return false
  }
}

function loadImageFromUrl(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not decode a styled look.'))
    image.src = src
  })
}

function punchGrade(ctx: CanvasRenderingContext2D, width: number, height: number) {
  let pixels: ImageData
  try {
    pixels = ctx.getImageData(0, 0, width, height)
  } catch {
    return
  }
  const data = pixels.data
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    const lum = luminance(r, g, b)
    const contrast = (value: number) => {
      const n = value / 255
      const bent = n < 0.5 ? 0.5 * Math.pow(n * 2, 1.12) : 1 - 0.5 * Math.pow((1 - n) * 2, 1.12)
      return Math.max(0, Math.min(255, bent * 255))
    }
    let nr = contrast(r)
    let ng = contrast(g)
    let nb = contrast(b)
    if (lum < 88) {
      nr = nr * 0.94
      ng = Math.min(255, ng * 1.04 + 4)
      nb = Math.min(255, nb * 1.08 + 6)
    } else if (lum > 168) {
      nr = Math.min(255, nr * 1.08 + 8)
      ng = Math.min(255, ng * 1.03 + 2)
      nb = nb * 0.94
    }
    data[i] = nr
    data[i + 1] = ng
    data[i + 2] = nb
  }
  ctx.putImageData(pixels, 0, 0)
}

/** Light unsharp mask so phone-tile details read. */
function sharpenCanvas(ctx: CanvasRenderingContext2D, width: number, height: number, amount = 0.28) {
  let src: ImageData
  try {
    src = ctx.getImageData(0, 0, width, height)
  } catch {
    return
  }
  const copy = new Uint8ClampedArray(src.data)
  const data = src.data
  const w = width
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const i = (y * w + x) * 4
      for (let c = 0; c < 3; c += 1) {
        const center = copy[i + c]!
        const blur =
          (copy[i + c]! * 4 +
            copy[i - 4 + c]! +
            copy[i + 4 + c]! +
            copy[i - w * 4 + c]! +
            copy[i + w * 4 + c]!) /
          8
        data[i + c] = Math.max(0, Math.min(255, center + (center - blur) * amount * 2.2))
      }
    }
  }
  ctx.putImageData(src, 0, 0)
}

/**
 * Paint one recipe from a source photo onto a 16:9 (or platform) canvas.
 * Used when the model only returns 1 image, or to restyle a successful gen.
 */
export async function stylizeLookFromImage(
  source: HTMLImageElement,
  recipe: LocalLookRecipe,
  width: number,
  height: number,
): Promise<{ image: HTMLImageElement; objectUrl: string }> {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(16, Math.round(width))
  canvas.height = Math.max(16, Math.round(height))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('This browser cannot restyle AI looks.')

  const sw = Math.max(1, source.naturalWidth || source.width)
  const sh = Math.max(1, source.naturalHeight || source.height)
  const sx = Math.min(sw - 1, Math.max(0, recipe.crop.sx * sw))
  const sy = Math.min(sh - 1, Math.max(0, recipe.crop.sy * sh))
  const cw = Math.min(sw - sx, Math.max(1, recipe.crop.sw * sw))
  const ch = Math.min(sh - sy, Math.max(1, recipe.crop.sh * sh))

  ctx.filter = cssFilterForGrade(recipe.grade)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, sx, sy, cw, ch, 0, 0, canvas.width, canvas.height)
  ctx.filter = 'none'

  punchGrade(ctx, canvas.width, canvas.height)
  sharpenCanvas(ctx, canvas.width, canvas.height)

  if (recipe.vignette > 0) {
    const g = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) * 0.22,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) * 0.74,
    )
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, `rgba(0,0,0,${recipe.vignette})`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const objectUrl = await canvasToObjectUrl(canvas)
  const image = await loadImageFromUrl(objectUrl)
  return { image, objectUrl }
}

function canvasToObjectUrl(canvas: HTMLCanvasElement) {
  return new Promise<string>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not export a styled look.'))
          return
        }
        resolve(URL.createObjectURL(blob))
      },
      'image/jpeg',
      0.94,
    )
  })
}

export type FillLooksOptions = {
  width: number
  height: number
  prompt: string
  seed: number
  styleId: AiStyleId
  /** Keep the original as look 1 when true. Default false so looks are restyled. */
  keepOriginal?: boolean
  /** Use quadrant isolation because the source looks like a collage. */
  isolateCollage?: boolean
}

/** Keep engine lineage through local crop/grade so the UI never lies about fal vs free. */
function inheritEngineSource(
  parent: AiGeneratedImage['source'] | undefined,
): AiGeneratedImage['source'] {
  if (parent === 'premium' || parent === 'studio' || parent === 'model') return parent
  return 'grade'
}

/**
 * Always return 3 usable looks. Extra slots are composition crops + color grades
 * of the first successful image — no extra model calls.
 *
 * When we already have `target` distinct premium (fal) stills, keep those pixels —
 * restyling them into Punch/Warm/Cinematic was wiping `source: premium` and making
 * Creator runs look like free Pollinations in the UI.
 */
export async function fillLooksToTarget(
  results: AiGeneratedImage[],
  target: number,
  options: FillLooksOptions,
): Promise<AiGeneratedImage[]> {
  if (results.length === 0) return results

  const isolate = options.isolateCollage === true
  const recipes = isolate ? COLLAGE_ISOLATION_RECIPES : LOCAL_LOOK_RECIPES
  const allPremium =
    results.length >= target && results.slice(0, target).every((item) => item.source === 'premium')

  // Three unique fal concepts: ship them as-is (labels come from creative brief).
  if (allPremium && !isolate) {
    return results.slice(0, target).map((item, index) => ({
      ...item,
      lookLabel: item.lookLabel || (recipes[index] ?? recipes[0])!.label,
      source: 'premium' as const,
    }))
  }

  if (results.length >= target && !isolate) {
    const finished: AiGeneratedImage[] = []
    for (let i = 0; i < target; i++) {
      const source = results[i]!
      const recipe = recipes[i] ?? recipes[0]!
      try {
        const styled = await stylizeLookFromImage(source.image, recipe, options.width, options.height)
        finished.push({
          ...source,
          image: styled.image,
          objectUrl: styled.objectUrl,
          lookLabel: recipe.label,
          derived: Boolean(source.derived),
          source: inheritEngineSource(source.source),
        })
      } catch {
        finished.push({
          ...source,
          lookLabel: source.lookLabel ?? recipe.label,
          source: inheritEngineSource(source.source),
        })
      }
    }
    return finished
  }

  const source = results[0]
  if (!source) return results

  const keepOriginal = options.keepOriginal === true && !isolate
  const filled: AiGeneratedImage[] = keepOriginal ? [...results] : []
  const startRecipe = keepOriginal ? Math.min(results.length, recipes.length - 1) : 0
  const inherited = inheritEngineSource(source.source)
  for (let i = startRecipe; filled.length < target && i < recipes.length; i++) {
    const recipe = recipes[i]!
    try {
      const styled = await stylizeLookFromImage(source.image, recipe, options.width, options.height)
      filled.push({
        image: styled.image,
        objectUrl: styled.objectUrl,
        prompt: options.prompt,
        seed: options.seed + i * 17,
        styleId: options.styleId,
        lookLabel: recipe.label,
        derived: true,
        // Local fill of a fal still is still Pro imaging — not Pollinations.
        source: inherited === 'premium' ? 'premium' : inherited === 'studio' ? 'studio' : 'grade',
      })
    } catch {
      // Canvas/toBlob can fail in tests — skip rather than empty the picker.
    }
  }
  if (filled.length === 0) return results
  if (!keepOriginal && source.objectUrl && filled.every((item) => item.objectUrl !== source.objectUrl)) {
    try {
      URL.revokeObjectURL(source.objectUrl)
    } catch {
      /* ignore */
    }
  }
  return filled.slice(0, target)
}
