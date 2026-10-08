# Thumbric Design System

Central tokens live in `src/App.css` `:root`.

## Color

| Token | Role |
|-------|------|
| `--bg` / `--bg-soft` | Workspace / page |
| `--raise` / `--raise-2` | Panels |
| `--ink` / `--muted` | Text |
| `--accent` / `--accent-bright` / `--accent-2` | Brand accents |
| `--cta` / `--cta-hover` | Primary actions |
| `--line` | Borders |

## Typography

- UI: Plus Jakarta Sans / DM Sans
- Display titles on canvas: Bebas / Anton / Oswald (font kit)
- Mono: JetBrains Mono (watermarks, shortcuts)

## Spacing & radius

- Page padding: `clamp(1rem, 4vw, 3rem)`
- Cards/panels: 12–14px radius
- Touch targets: ≥44px on mobile docks

## Components

- `.chip` / `.chip.solid` / `.chip.ghost` — secondary actions
- `.primary` / `.btn-gradient` / `.btn-outline` — primary CTAs
- `.preview-tool` — editor chrome
- `.inspector-*` — properties panel
- Focus: 2px `#d6ff3c` outline on interactive controls

## Motion

- Prefer short transform/opacity (≤200ms)
- Progressive onboarding tips, not long tutorials
