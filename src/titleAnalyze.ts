export type TitleIssue = {
  id: string
  severity: 'good' | 'warn' | 'bad'
  label: string
  detail: string
}

export type TitleAnalysis = {
  title: string
  length: number
  mobilePreview: string
  score: number
  issues: TitleIssue[]
}

const POWER =
  /\b(how|why|secret|secrets|vs|versus|new|insane|shocking|truth|mistake|mistakes|free|stop|never|always|best|worst|i tried|i spent|gone wrong)\b/i

export function analyzeTitle(raw: string): TitleAnalysis {
  const title = raw.replace(/\s+/g, ' ').trim()
  const length = title.length
  const words = title ? title.split(' ') : []
  const mobilePreview = length <= 42 ? title : `${title.slice(0, 40).trim()}…`
  const issues: TitleIssue[] = []

  if (!title) {
    return {
      title,
      length: 0,
      mobilePreview: '',
      score: 0,
      issues: [{ id: 'empty', severity: 'bad', label: 'Add a title', detail: 'Paste the YouTube title you want to test.' }],
    }
  }

  if (length < 28) {
    issues.push({
      id: 'short',
      severity: 'warn',
      label: 'Short',
      detail: 'Under ~28 characters can bury the topic. Add a specific payoff.',
    })
  } else if (length <= 70) {
    issues.push({
      id: 'length',
      severity: 'good',
      label: 'Length',
      detail: `${length} characters — within the usual YouTube range.`,
    })
  } else {
    issues.push({
      id: 'long',
      severity: 'warn',
      label: 'May truncate',
      detail: 'Over 70 characters often truncates in search. Front-load the hook.',
    })
  }

  if (length > 42) {
    issues.push({
      id: 'mobile',
      severity: 'warn',
      label: 'Mobile cutoff',
      detail: `Phones often show ~40 characters. Mobile preview: “${mobilePreview}”`,
    })
  } else {
    issues.push({
      id: 'mobile-ok',
      severity: 'good',
      label: 'Mobile',
      detail: 'Fits a typical phone title line.',
    })
  }

  const caps = title.replace(/[^A-Za-z]/g, '')
  const capRatio = caps ? [...caps].filter((ch) => ch === ch.toUpperCase()).length / caps.length : 0
  if (capRatio > 0.72 && caps.length > 8) {
    issues.push({
      id: 'caps',
      severity: 'warn',
      label: 'All caps',
      detail: 'Full caps can look spammy. Mix case and save the shout for 1–2 words.',
    })
  }

  if (/\d/.test(title)) {
    issues.push({
      id: 'number',
      severity: 'good',
      label: 'Specific number',
      detail: 'Numbers often scan faster than adjectives.',
    })
  }

  if (POWER.test(title) || title.includes('?')) {
    issues.push({
      id: 'hook',
      severity: 'good',
      label: 'Hook',
      detail: 'Has a curiosity or payoff word. Pair it with a matching thumbnail.',
    })
  } else {
    issues.push({
      id: 'hook-missing',
      severity: 'warn',
      label: 'Soft hook',
      detail: 'Try a number, a “how/why”, or a clear outcome in the first 40 characters.',
    })
  }

  if (words.length > 14) {
    issues.push({
      id: 'busy',
      severity: 'warn',
      label: 'Wordy',
      detail: 'Trim filler so the first line carries the click.',
    })
  }

  const good = issues.filter((item) => item.severity === 'good').length
  const warn = issues.filter((item) => item.severity === 'warn').length
  const bad = issues.filter((item) => item.severity === 'bad').length
  const score = Math.max(0, Math.min(100, 58 + good * 10 - warn * 8 - bad * 20))

  return { title, length, mobilePreview, score, issues }
}
