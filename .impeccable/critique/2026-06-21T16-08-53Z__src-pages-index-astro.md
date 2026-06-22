---
target: homepage light blueprint (src/pages/index.astro)
total_score: 32
p0_count: 0
p1_count: 2
timestamp: 2026-06-21T16-08-53Z
slug: src-pages-index-astro
---
# Design Critique — 8Labs homepage, light blueprint (src/pages/index.astro)

## Design Health Score: 32/40 (Good)
Heuristics: status 3, match 3, control 3, consistency 4, error-prev 3, recognition 3, flexibility 3, aesthetic 3, recovery 3, help 3.

## Anti-Patterns Verdict
Detector: CLEAN (8 components, zero hits).
LLM: flip fixed body contrast + settled motion, but kept two structural tells, now sharper (labels literally monospace):
- mono eyebrow on every section (mono-as-technical + eyebrow ban stacked)
- I..VI section numbering as scaffolding (only architecture map I-IV is a real sequence)
Lane = Cognivis/meinGPT enterprise-AI blueprint (saturating). Hot-pink #FF2D75 on sober greyscale blueprint = unusual tension (refs use cobalt for sobriety).

## What's working
1. Pivot improved legibility (black-on-white) + motion now plays once and rests (fixed prior loop P1).
2. iso-stack is a strong object (isometric wireframe + red accent cube + dashed box).
3. gap-px module grids + crosshairs feel engineered without bloat.

## Priority Issues
[P1] Contrast: muted #71717A ~4.0:1 and red-700 #FF2D75 as small text ~3.0:1 fail 4.5:1. Darken muted ~#57575E; add red-ink ~#C20E50 for text/links, reserve #FF2D75 for >=18px/fills. audit+colorize.
[P1] I-VI numbered mono eyebrows = scaffolding ban. Keep numerals only on architecture map; drop page-level numbering + kicker-on-every-section. quieter.
[P2] Blueprint registration half-applied (crosshairs hero-only). Commit site-wide or remove. layout.
[P2] Zero product imagery; ref lane grounds with a real dashboard screenshot. Add one panel/UI shot. craft.
[P2] iso-stack geometry unverified in-browser. polish hero.

## Persona Red Flags
Jordan: FIG.01/SYS-8L/REV-2026 fake-technical dressing; I-VI implies nonexistent path.
Casey: improved (iso shows on mobile now); annotation lg-only; low-contrast mono labels worst at phone size.
Riley: solid; motif SVG opacity:0 until observer fires (invisible if JS blocked on headless).

## Minor
- "View architecture" labels two destinations.
- Bricolage Grotesque warmer than refs' neutral grotesk (acceptable, committed font).
- Footer/legal/redirect swept but not visually verified.
