---
target: homepage (src/pages/index.astro)
total_score: 31
p0_count: 0
p1_count: 3
timestamp: 2026-06-21T15-31-55Z
slug: src-pages-index-astro
---
# Design Critique — 8Labs homepage (src/pages/index.astro)

## Design Health Score: 31/40 (Good)

Heuristics: status 3, match 3, control 3, consistency 4, error-prev 3, recognition 3, flexibility 3, aesthetic 3, recovery 3, help 3.

## Anti-Patterns Verdict
Detector (detect.mjs over 8 homepage components + index): CLEAN, zero hits.
LLM: escaped SaaS lane, landed in second-order reflex = dark terminal-native editorial. Three named bans live:
- uppercase tracked eyebrow (micro-label) above every section
- numbered section markers I..VI as scaffolding (only architecture map is a real sequence)
- mono-as-technical (justified but stacked)

## What's working
1. Pink/red as architectural material (extruded matrix/vault/runway).
2. Distinct silhouette per section (7 SVG objects, no repeated pyramid).
3. Token discipline (one system, gap-px seams, rounded-sm).

## Priority Issues
[P1] Hero dominant visual hidden on mobile (hidden lg:flex). adapt.
[P1] Numbered + mono eyebrow on every section = AI scaffolding. Keep numerals only on architecture map. quieter/typeset.
[P1] Looping forever (animation-direction alternate !important) never settles; reserve loops for ambient bits, draw structure once. animate.
[P2] Muted micro-labels #68727F ~11px likely <4.5:1 contrast. audit.
[P2] Layout sameness: every section = frame + numbered header + gap-px grid. layout.

## Persona Red Flags
Jordan: fake-technical decoration labels (CHK/SYS/FIG/REV); "View architecture" label mismatches destination.
Casey: hero visual gone on mobile; 3 tall animated SVGs stack = battery/scroll; primary CTA top not thumb-zone.
Riley: solid; only nit is never-settling motion on long dwell.

## Minor
- Hero font-extralight at 7xl on dark reads under-weight; floor at 300.
- "View architecture" label reused for two destinations.
- No text-wrap: balance on hero headings.
