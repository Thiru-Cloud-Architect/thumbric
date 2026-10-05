export type TextStyleId = 'classic' | 'thick' | 'minimal'

export type TextStyle = {
  id: TextStyleId
  label: string
  hint: string
}

export const TEXT_STYLES: TextStyle[] = [
  { id: 'classic', label: 'Classic', hint: 'White title + dark outline' },
  { id: 'thick', label: 'Bold outline', hint: 'Extra stroke for mobile' },
  { id: 'minimal', label: 'Minimal', hint: 'Thinner outline, cleaner' },
]

export function getTextStyle(id: TextStyleId) {
  return TEXT_STYLES.find((item) => item.id === id) ?? TEXT_STYLES[0]
}
