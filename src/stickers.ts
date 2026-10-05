export type StickerId =
  | 'arrow'
  | 'new'
  | 'fire'
  | 'wow'
  | 'rupee'
  | 'vs'
  | 'click'
  | 'live'
  | 'hot'
  | 'free'
  | 'pro'
  | 'tip'
  | 'part'
  | 'yes'
  | 'no'
  | 'love'
  | 'go'
  | 'day1'
  | '100'
  | 'alert'

export type Sticker = {
  id: StickerId
  label: string
  hint: string
}

export const STICKERS: Sticker[] = [
  { id: 'arrow', label: 'Arrow', hint: 'Point to the face' },
  { id: 'new', label: 'NEW', hint: 'Fresh video badge' },
  { id: 'fire', label: '🔥', hint: 'Hot / trending' },
  { id: 'wow', label: 'WOW', hint: 'Big reaction' },
  { id: 'rupee', label: '₹', hint: 'Money videos' },
  { id: 'vs', label: 'VS', hint: 'Compare two things' },
  { id: 'click', label: 'CLICK', hint: 'Call to watch' },
  { id: 'live', label: 'LIVE', hint: 'Streaming / live now' },
  { id: 'hot', label: 'HOT', hint: 'Trending topic' },
  { id: 'free', label: 'FREE', hint: 'Giveaway / free tip' },
  { id: 'pro', label: 'PRO', hint: 'Advanced tip' },
  { id: 'tip', label: 'TIP', hint: 'Quick advice' },
  { id: 'part', label: 'PART 1', hint: 'Series marker' },
  { id: 'yes', label: 'YES', hint: 'Do this' },
  { id: 'no', label: 'NO', hint: 'Avoid this' },
  { id: 'love', label: '❤', hint: 'Feel-good video' },
  { id: 'go', label: 'GO', hint: 'Start now' },
  { id: 'day1', label: 'DAY 1', hint: 'Challenge start' },
  { id: '100', label: '100%', hint: 'Results claim' },
  { id: 'alert', label: '!', hint: 'Warning / must see' },
]
