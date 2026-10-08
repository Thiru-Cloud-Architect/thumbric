import type { ThumbnailScore } from './score'

export type DoctorProblem = {
  id: string
  title: string
  detail: string
  severity: 'high' | 'medium' | 'low'
}

/** Top 3 actionable problems from a Thumbric Score — Phase 2 Doctor funnel. */
export function topDoctorProblems(score: ThumbnailScore): DoctorProblem[] {
  const ranked = [...score.dimensions]
    .filter((d) => d.id !== 'topic' || d.score < 68)
    .sort((a, b) => a.score - b.score)

  const problems: DoctorProblem[] = ranked.slice(0, 3).map((dim) => ({
    id: dim.id,
    title:
      dim.id === 'attention'
        ? 'Weak focal point'
        : dim.id === 'mobile'
          ? 'Fails at phone size'
          : dim.id === 'emotion'
            ? 'Low emotional pull'
            : dim.id === 'text'
              ? 'Text / hierarchy muddy'
              : 'Topic focus unclear',
    detail: dim.note,
    severity: dim.score < 55 ? 'high' : dim.score < 70 ? 'medium' : 'low',
  }))

  if (problems.length < 3) {
    for (const rec of score.recommendations) {
      if (problems.length >= 3) break
      if (problems.some((p) => p.detail === rec)) continue
      problems.push({
        id: `rec-${problems.length}`,
        title: 'Suggested fix',
        detail: rec,
        severity: 'medium',
      })
    }
  }

  return problems.slice(0, 3)
}
