export type TextStyleId =
  | 'classic'
  | 'thick'
  | 'minimal'
  | 'yellow-pop'
  | 'accent-fill'
  | 'white-glow'
  | 'red-alert'
  | 'no-outline'

export type TextStyle = {
  id: TextStyleId
  label: string
  hint: string
}

export const TEXT_STYLES: TextStyle[] = [
  { id: 'classic', label: 'White + black outline', hint: 'Default YouTube style' },
  { id: 'thick', label: 'Extra thick outline', hint: 'Best for small phone previews' },
  { id: 'minimal', label: 'No outline', hint: 'Clean; needs a simple background' },
  { id: 'yellow-pop', label: 'Yellow + black outline', hint: 'High contrast, very clickable' },
  { id: 'accent-fill', label: 'Accent color fill', hint: 'Uses your accent / mood color' },
  { id: 'white-glow', label: 'White + soft shadow', hint: 'No hard outline' },
  { id: 'red-alert', label: 'Red + white outline', hint: 'News / urgent vibe' },
  { id: 'no-outline', label: 'Flat white', hint: 'Bold font only' },
]

export function getTextStyle(id: TextStyleId) {
  return TEXT_STYLES.find((item) => item.id === id) ?? TEXT_STYLES[0]
}
