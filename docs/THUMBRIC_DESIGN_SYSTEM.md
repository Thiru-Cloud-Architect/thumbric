# Thumbric Design System

Central tokens live in `src/App.css` (`:root` / `[data-theme]`) and `src/index.css`.
Theme preference: `localStorage` key `thumbric-theme` = `light` | `dark`, applied as `data-theme` on `<html>` (early script in `index.html`).

## Color — light (deepened sky studio)

Soft cool sky surfaces with mild purple accents. **Not** coral-on-black. Wash deepened slightly so the page does not read as blank white.

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#d4e6fb` | Page base |
| `--bg-soft` | `#e6edf8` | Soft field |
| `--raise` / `--raise-2` | `#eef3fb` / `#f7faff` | Cards / elevated |
| `--card` | `#f7faff` | Card surfaces |
| `--ink` | `#152033` | Primary text |
| `--muted` | `#4a5d76` | Secondary text |
| `--accent` / `--cta` | `#6366f1` | Mild purple actions / selected |
| `--accent-bright` | `#818cf8` | Hover / bright accent |
| `--accent-2` | `#0ea5e9` | Sky links / secondary |
| `--accent-sky` | `#38bdf8` | Gradient sky stop |
| `--stage` | `#e0e9f5` | Canvas / preview wells |
| `--line` | `rgba(74, 93, 118, 0.22)` | Borders |
| `--shadow` | soft cool slate | Elevation |

## Color — dark (cool navy / slate)

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#0f172a` | Page base |
| `--bg-soft` | `#132033` | Soft field |
| `--raise` / `--raise-2` | `#1a2740` / `#22314c` | Elevated cards |
| `--card` | `#1a2740` | Card surfaces |
| `--ink` | `#e8eef8` | Primary text |
| `--muted` | `#94a3b8` | Secondary text |
| `--accent` / `--cta` | `#818cf8` | Mild purple (brighter for contrast) |
| `--accent-bright` | `#a5b4fc` | Hover |
| `--accent-2` | `#38bdf8` | Sky links |
| `--stage` | `#15253a` | Canvas wells |

Page atmosphere: sky-blue + lavender radials over cool navy. CTAs keep sky→purple gradients.

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
- `.theme-toggle` — light/dark control next to Sign in
- `.preview-tool` — editor chrome
- `.inspector-*` — properties panel
- Focus: purple outline on interactive controls

## Motion

- Prefer short transform/opacity (≤200ms)
- Progressive onboarding tips, not long tutorials
