# Thumbric Design System

Central tokens live in `src/App.css` `:root` and `src/index.css`.

## Color — sky studio (active)

Soft cool sky surfaces with mild purple accents. **Not** coral-on-black.

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#e3f0ff` | Page base |
| `--bg-soft` | `#f0f5ff` | Soft panels |
| `--raise` / `--raise-2` | `#f7faff` / `#ffffff` | Cards |
| `--ink` | `#152033` | Primary text |
| `--muted` | `#5a6b82` | Secondary text |
| `--accent` / `--cta` | `#6366f1` | Mild purple actions / selected |
| `--accent-bright` | `#818cf8` | Hover / bright accent |
| `--accent-2` | `#0ea5e9` | Sky links / secondary |
| `--accent-sky` | `#38bdf8` | Gradient sky stop |
| `--line` | `rgba(90, 107, 130, 0.18)` | Borders |
| `--shadow` | soft cool slate | Elevation |

Page atmosphere: sky blue + lavender radial washes over a cool light gradient.

## Typography

- UI: Plus Jakarta Sans / DM Sans
- Display titles on canvas: Bebas / Anton / Oswald (font kit)
- Mono: JetBrains Mono (watermarks, shortcuts)

## Spacing & radius

- Page padding: `clamp(1rem, 4vw, 3rem)`
- Cards/panels: 16–24px radius
- Touch targets: ≥44px on mobile docks

## Components

- `.chip` / `.chip.solid` / `.chip.ghost` — secondary actions
- `.primary` / `.btn-gradient` / `.btn-outline` — primary CTAs (purple/sky)
- `.preview-tool` — editor chrome
- `.inspector-*` — properties panel
- Focus: purple outline on interactive controls

## Motion

- Prefer short transform/opacity (≤200ms)
- Progressive onboarding tips, not long tutorials
