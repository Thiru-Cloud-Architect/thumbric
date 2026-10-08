# Thumbric Design System

Central tokens live in `src/App.css` `:root` and `src/index.css`.

## Color — sky studio (active)

Soft cool sky surfaces with mild purple accents. **Not** coral-on-black.

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#e8f2fc` | Page base |
| `--bg-soft` | `#eef1ff` | Soft panels |
| `--raise` / `--raise-2` | `#f7faff` / `#ffffff` | Cards |
| `--ink` | `#152033` | Primary text |
| `--muted` | `#5a6b82` | Secondary text |
| `--accent` / `--cta` | `#6d5efc` | Mild purple actions / selected |
| `--accent-bright` | `#8b7cff` | Hover / bright accent |
| `--accent-2` | `#5b8def` | Sky secondary |
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
