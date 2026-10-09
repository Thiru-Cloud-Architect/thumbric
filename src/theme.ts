export type ThemeId = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'thumbric-theme'

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return value === 'light' || value === 'dark'
}

/** Prefer saved choice; else prefers-color-scheme; else light. */
export function resolveTheme(
  stored: string | null | undefined,
  prefersDark: boolean,
): ThemeId {
  if (isThemeId(stored)) return stored
  return prefersDark ? 'dark' : 'light'
}

export function readStoredTheme(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

export function prefersDarkScheme(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute('data-theme', theme)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#0f172a' : '#d4e6fb')
  }
}

export function setStoredTheme(theme: ThemeId) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* ignore quota / private mode */
  }
  applyTheme(theme)
}

export function initTheme() {
  applyTheme(resolveTheme(readStoredTheme(), prefersDarkScheme()))
}

export function getActiveTheme(): ThemeId {
  const attr = document.documentElement.getAttribute('data-theme')
  return isThemeId(attr) ? attr : 'light'
}

export function toggleTheme(): ThemeId {
  const next: ThemeId = getActiveTheme() === 'dark' ? 'light' : 'dark'
  setStoredTheme(next)
  return next
}
