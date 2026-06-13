# Design

## Theme

Light-first, clean and technical. White surfaces, zinc/slate neutrals, one red accent. Dark mode mirrors the same hierarchy on slate-950 surfaces. Pill-shaped interactive elements (buttons, nav links, search) are the signature shape; the navbar is a floating frosted pill.

## Color Palette

- Brand red: `#e60022` (light accent), `#ff2a4a` (dark accent), home uses Tailwind `red-700` for filled CTAs
- Brand mark: "8Labs" in near-black + red "." dot
- Light: white background, slate-900 ink, slate-600 secondary, zinc-200 borders
- Dark (docs): slate-950/`#020617` background, slate-100 ink, slate-400 secondary
- Accent tint surfaces: `#ffe3e8` (light), `#43000a` (dark)

## Typography

- Display/headings: Bricolage Grotesque Variable, bold, letter-spacing -0.015em (home heroes go tighter, up to -0.05em)
- Body: Inter Variable
- Code: system mono (Starlight default)
- Source: @fontsource-variable packages, self-hosted

## Components

- Home: Astroship-derived Astro components (`src/components/`) with Tailwind, heavily customized (pill navbar with backdrop-blur, dark hero on zinc-950, rounded-[2rem] CTA panels)
- Docs (`/docs`, `/guides`, `/blog`): Starlight 0.37 themed via `src/styles/starlight.css` custom properties + `src/components/starlight/` overrides
- Buttons: pill (`rounded-full`); filled = red-700 or black, outline = white/transparent with subtle border

## Layout

- Home: centered max-w containers, generous vertical rhythm
- Docs: Starlight three-column (sidebar / content / TOC)
- Sticky frosted header on both registers

## Motion

Minimal and functional: 150ms ease transitions on hover (background, color, slight lift on cards). No scroll-driven animation. Reduced-motion safe.
