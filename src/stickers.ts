export type StickerId = 'arrow' | 'new' | 'fire' | 'wow' | 'rupee' | 'vs' | 'click'

export type Sticker = {
  id: StickerId
  label: string
  hint: string
}

export const STICKERS: Sticker[] = [
  { id: 'arrow', label: 'Arrow', hint: 'Point to the face' },
  { id: 'new', label: 'NEW', hint: 'Fresh video badge' },
  { id: 'fire', label: 'Fire', hint: 'Hot / trending look' },
  { id: 'wow', label: 'WOW', hint: 'Big reaction' },
  { id: 'rupee', label: '₹', hint: 'Money videos' },
  { id: 'vs', label: 'VS', hint: 'Compare two things' },
  { id: 'click', label: 'CLICK', hint: 'Call to watch' },
]
