/** Lightweight undo/redo stack for editor snapshots. */

export type HistoryStack<T> = {
  past: T[]
  present: T
  future: T[]
}

export function createHistory<T>(present: T): HistoryStack<T> {
  return { past: [], present, future: [] }
}

export function pushHistory<T>(stack: HistoryStack<T>, next: T, limit = 40): HistoryStack<T> {
  if (Object.is(stack.present, next)) return stack
  const past = [...stack.past, stack.present]
  if (past.length > limit) past.shift()
  return { past, present: next, future: [] }
}

export function undoHistory<T>(stack: HistoryStack<T>): HistoryStack<T> {
  if (stack.past.length === 0) return stack
  const past = [...stack.past]
  const previous = past.pop()!
  return { past, present: previous, future: [stack.present, ...stack.future] }
}

export function redoHistory<T>(stack: HistoryStack<T>): HistoryStack<T> {
  if (stack.future.length === 0) return stack
  const [next, ...future] = stack.future
  return { past: [...stack.past, stack.present], present: next!, future }
}
