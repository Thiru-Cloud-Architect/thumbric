import { FONTS, type FontId } from './fonts'
import { LAYOUTS, PHOTO_SHAPES, type LayoutId, type PhotoShapeId } from './layout'
import { NICHES, type NicheId } from './niches'
import type { Platform } from './platforms'
import { TEXT_STYLES, type TextStyleId } from './textStyle'

export type QuickIdea = {
  nicheId: NicheId
  layout: LayoutId
  fontId: FontId
  textStyleId: TextStyleId
  photoShape: PhotoShapeId
}

const DISPLAY_FONTS = FONTS.filter((item) => item.category === 'display').map((item) => item.id)

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function layoutsFor(platform: Platform): LayoutId[] {
  if (platform.orientation === 'vertical') {
    return LAYOUTS.filter((item) => item.id === 'photo-top' || item.id === 'photo-full').map(
      (item) => item.id,
    )
  }
  return LAYOUTS.filter((item) => item.id !== 'photo-top').map((item) => item.id)
}

export function pickQuickIdea(platform: Platform): QuickIdea {
  return {
    nicheId: pick(NICHES).id,
    layout: pick(layoutsFor(platform)),
    fontId: pick(DISPLAY_FONTS),
    textStyleId: pick(TEXT_STYLES).id,
    photoShape: pick(PHOTO_SHAPES).id,
  }
}
