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
 * Crops isolate left/center/right so a failed collage still yields usable frames.
 */
export const LOCAL_LOOK_RECIPES: LocalLookRecipe[] = [
  {
    id: 'hero',
    label: 'Hero',
    blurb: 'Tight center crop',
    crop: { sx: 0.1, sy: 0.06, sw: 0.8, sh: 0.88 },
    grade: { contrast: 1.08, brightness: 1.02, saturate: 1.12 },
    vignette: 0.22,
  },
  {
    id: 'warm',
    label: 'Warm',
    blurb: 'Left frame, golden grade',
    crop: { sx: 0, sy: 0.08, sw: 0.62, sh: 0.86 },
    grade: { contrast: 1.14, brightness: 1.06, saturate: 1.28, sepia: 0.22 },
    vignette: 0.18,
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    blurb: 'Right frame, cool contrast',
    crop: { sx: 0.38, sy: 0.04, sw: 0.62, sh: 0.9 },
    grade: { contrast: 1.28, brightness: 0.9, saturate: 0.88, hueRotate: 196 },
    vignette: 0.38,
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

function loadImageFromUrl(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not decode a styled look.'))
    image.src = src
  })
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
  ctx.drawImage(source, sx, sy, cw, ch, 0, 0, canvas.width, canvas.height)
  ctx.filter = 'none'

  if (recipe.vignette > 0) {
    const g = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) * 0.2,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) * 0.72,
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
      0.92,
    )
  })
}

export type FillLooksOptions = {
  width: number
  height: number
  prompt: string
  seed: number
  styleId: AiStyleId
  /** Keep the original as look 1 when true (default). */
  keepOriginal?: boolean
}

/**
 * Always return 3 usable looks. Extra slots are composition crops + color grades
 * of the first successful image — no extra model calls.
 */
export async function fillLooksToTarget(
  results: AiGeneratedImage[],
  target: number,
  options: FillLooksOptions,
): Promise<AiGeneratedImage[]> {
  if (results.length >= target) return results.slice(0, target)
  const source = results[0]
  if (!source) return results

  const filled = [...results]
  const startRecipe = options.keepOriginal === false ? 0 : 1
  for (let i = startRecipe; filled.length < target && i < LOCAL_LOOK_RECIPES.length; i++) {
    const recipe = LOCAL_LOOK_RECIPES[i]!
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
      })
    } catch {
      // Canvas/toBlob can fail in tests — skip rather than empty the picker.
    }
  }
  return filled
}
