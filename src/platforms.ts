export type PlatformId =
  | 'youtube'
  | 'shorts'
  | 'instagram-post'
  | 'instagram-story'
  | 'linkedin'
  | 'facebook'

export type Platform = {
  id: PlatformId
  label: string
  hint: string
  width: number
  height: number
  orientation: 'horizontal' | 'vertical' | 'square'
}

export const PLATFORMS: Platform[] = [
  {
    id: 'youtube',
    label: 'YouTube',
    hint: 'Normal video',
    width: 1280,
    height: 720,
    orientation: 'horizontal',
  },
  {
    id: 'shorts',
    label: 'Shorts / Reels',
    hint: 'Vertical video',
    width: 1080,
    height: 1920,
    orientation: 'vertical',
  },
  {
    id: 'instagram-post',
    label: 'Instagram Post',
    hint: 'Square post',
    width: 1080,
    height: 1080,
    orientation: 'square',
  },
  {
    id: 'instagram-story',
    label: 'Instagram Story',
    hint: 'Full phone screen',
    width: 1080,
    height: 1920,
    orientation: 'vertical',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    hint: 'Post / article cover',
    width: 1200,
    height: 627,
    orientation: 'horizontal',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    hint: 'Feed post',
    width: 1200,
    height: 630,
    orientation: 'horizontal',
  },
]

export function getPlatform(id: PlatformId): Platform {
  return PLATFORMS.find((platform) => platform.id === id) ?? PLATFORMS[0]
}
