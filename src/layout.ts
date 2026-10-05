export type LayoutId = 'photo-left' | 'photo-right' | 'photo-top' | 'photo-full'
export type PhotoShapeId = 'rounded' | 'circle' | 'soft' | 'square'

export type Layout = {
  id: LayoutId
  label: string
  hint: string
}

export type PhotoShape = {
  id: PhotoShapeId
  label: string
  hint: string
}

export const LAYOUTS: Layout[] = [
  { id: 'photo-left', label: 'Photo left', hint: 'Classic YouTube' },
  { id: 'photo-right', label: 'Photo right', hint: 'Text first' },
  { id: 'photo-top', label: 'Photo top', hint: 'Great for Shorts' },
  { id: 'photo-full', label: 'Full photo', hint: 'Text on top of photo' },
]

export const PHOTO_SHAPES: PhotoShape[] = [
  { id: 'rounded', label: 'Rounded', hint: 'Soft corners' },
  { id: 'circle', label: 'Circle', hint: 'Face focus' },
  { id: 'soft', label: 'Bubble', hint: 'Extra soft' },
  { id: 'square', label: 'Square', hint: 'Sharp edges' },
]

export const COLOR_PRESETS = [
  { id: 'look', label: 'Use look colors', value: '' },
  { id: 'lime', label: 'Lime', value: '#D6FF3C' },
  { id: 'orange', label: 'Orange', value: '#FF7A3D' },
  { id: 'pink', label: 'Pink', value: '#FF4D9A' },
  { id: 'cyan', label: 'Cyan', value: '#5CC8FF' },
  { id: 'gold', label: 'Gold', value: '#F0C75E' },
  { id: 'mint', label: 'Mint', value: '#7CFFB2' },
]
