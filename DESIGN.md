# 8Labs Design System — Blueprint / ASCII-Grid / Isometric

> Light technical blueprint: white paper, black grotesk ink, 8Labs red as the
> single signal accent. Swiss grid, mono/ASCII registration labels, crosshair
> marks, dashed guides, diagonal hatch bands, and isometric wireframe line-art.

Reference lane: Cognivis / meinGPT / Klea — enterprise-AI blueprint, not dark cyber. (Replaces the previous dark "Crimson Infrastructure Matrix" direction.)

## Color tokens (`tailwind.config.cjs`)

| Token | Hex | Role |
| --- | --- | --- |
| `ink` | `#FFFFFF` | page background (paper) |
| `surface` | `#FAFAFA` | section background |
| `panel` | `#FFFFFF` | card background (+ hairline border) |
| `elevated` | `#F4F4F5` | tinted fill / hover cell |
| `line` | `#0A0A0A` | ink — headings, strokes, outlines |
| `cool` | `#3F3F46` | secondary / body text (≈10:1 on white) |
| `muted` | `#57575E` | metadata / mono micro labels (≈7:1, AA) |
| `grid` | `#E4E4E7` | blueprint guide lines, hairline borders |
| `red-700` / `red-ink` | `#C20E50` | **the single light-mode pink** — fills, marks, text, links, buttons |
| `red-600` | `#A10F3A` | hover (darker crimson) |

**One pink per mode (consistency rule):**
- **Light mode → crimson `#C20E50` everywhere** (buttons, links, kickers, dots, iso accents, marks). Single value, AA as both text (6:1) and fill. Accent cube fills use the crimson-family pales `#F7DCE5 / #EFC4D2 / #E6ABBE`.
- **Dark mode (docs) → hot pink `#FF2D75` everywhere** (passes AA on the dark ground). Set in `starlight.css` `[data-theme="dark"]`.
- No mixed pinks. The old split (#FF2D75 fills + #C20E50 text) is retired.
- **Button label on the accent flips per mode** via `--on-accent`: white on light crimson (6:1), ink on dark hot-pink (5.5:1). White-on-#FF2D75 fails AA, so dark buttons use ink text.

## Blueprint utilities (`global.css`)

- `.micro-label` — **monospace** uppercase tracked label (registration tags, FIG.0x).
- `.blueprint-grid` — faint black grid lines on white.
- `.bp-hatch` — diagonal hatch band (margin strips).
- `.bp-dots` — dotted halftone matrix.
- `.bp-cross` — crosshair (+) registration mark (pseudo-elements; place in a relative box).
- Focus ring + skip link: red `#FF2D75`.

## Type & surfaces

- Bricolage Grotesque (display) + Inter (body). Headings `font-medium`/`font-light`, `text-balance`; body `text-pretty`, `text-cool`.
- **Sharp corners everywhere** (`rounded-none`, radius 0) — cards, panels, buttons, inputs, frames. Only status/window dots stay `rounded-full`. No pills.
- Cards/sections: white `bg-ink`/`bg-surface`, `border-grid` hairlines, `gap-px` module grids on `bg-grid` for seamed tables.
- Buttons (`ui/link`): `primary` = solid `bg-red-700` white text; `outline` = white + `border-grid`.

## Geometry / motifs (`src/components/motifs/`, SVG line-art)

Black 1px strokes, near-white faces, one red-accented element. Shared isometric cuboid helper, distinct silhouette per use (no repeated form).
- **iso-stack** — wireframe cuboid stack + red top cube + dashed bounding box. Hero.
- **nested-sandbox-cubes** — open sandbox tray with a disposable instance ejecting (Virtual Labs).
- **dedicated-compute-core** — slotted server tower inside a dashed boundary cage (Dedicated).
- **deployment-runway** — node network climbing to a red cloud node (Elastic / Cloud).
- **signal-console** · **verification-artifact** — clear-signals / trust modules.
- **endless-grid** — perspective vanishing grid with a radial-masked clear core; CTA background (text sits in the open centre).
- `ready-state-runway` retired (orphaned).

## Motion

Build/assembly plays **once on scroll-into-view** (IntersectionObserver toggles `[data-paused]` on `svg[data-motif]`), then a **slow continuous loop**: each motif gently floats (`motif-bob`, 4.5s ease-in-out, ~12px) while in view, paused off-screen. Ambient loops (scanline/packet/pulse) per-motif. `prefers-reduced-motion` → fully static (forced `opacity:1`, no transform).

## Docs + Blog (Starlight, `src/styles/starlight.css`)

Same blueprint system as the marketing site: white paper, neutral zinc ramp, sharp corners (radius 0, no pills), hairline `#E4E4E7` borders, `border-color` hover (no lift). Accent `#FF2D75` for active/fills; **links + Client Panel button use `red-ink #C20E50`** (AA). Dark theme is first-class (toggle), retuned to `ink/surface/panel`. Header brand dot + Client Panel button match the home navbar.
