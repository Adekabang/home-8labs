---
target: 8labs.id homepage
total_score: 30
p0_count: 0
p1_count: 0
timestamp: 2026-06-12T18-31-53Z
slug: src-pages-index-astro
---
## Design Health Score (8labs.id homepage)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Static marketing page; active nav states present |
| 2 | Match System / Real World | 4 | Speaks audience language ("ngoprek", honest pricing notes) |
| 3 | User Control and Freedom | 3 | Clear nav escape everywhere; external links marked |
| 4 | Consistency and Standards | 3 | Pill language consistent; eyebrow labels over-uniform |
| 5 | Error Prevention | 3 | Honest expectation-setting (backup, pricing) prevents misuse |
| 6 | Recognition Rather Than Recall | 3 | All nav labeled; product names need the catalog blurbs |
| 7 | Flexibility and Efficiency | 2 | Single path to panel; no quick product comparison |
| 8 | Aesthetic and Minimalist Design | 2 | 15 near-identical cards across 3 consecutive sections |
| 9 | Error Recovery | 3 | n/a-ish; 404 exists |
| 10 | Help and Documentation | 4 | Docs linked from hero, features, CTA, footer |
| **Total** | | **30/40** | **Good** |

## Anti-Patterns Verdict
Does NOT read as AI-generated: voice is specific and honest ("No invented customers, no filler logo wall"), mascot illustration, real constraint copy. Deterministic scan: 0 findings. BUT: uppercase tracked eyebrow on every section (ACTIVE PRODUCT CATALOG / PRICING NOTE / CAPABILITIES / TRUST... / TRUSTED BY) is the one saturated AI-scaffold tell present.

## Priority Issues
- [P2] Eyebrow kicker on all 5 sections — uniform cadence reads as template grammar. Keep at most one; vary the rest (plain h2, inline lead, or nothing).
- [P2] Card monotony: product catalog (5 cards) -> capabilities (6 cards) -> trust notes (4 cards) = card wall after hero. Capabilities section weakest: convert to 2-col compact list or split 3 leading + 3 quiet rows.
- [P2] Bottom-heavy dark rhythm: trust panel, partner panel, CTA panel are three consecutive near-black blocks.
- [P3] "Works with your technologies" micro-label: tiny, low prominence, slate-blue tint off the brand ramp.

## What's Working
- Hero: strong voice, mascot personality, honest stats strip, proper mobile stacking.
- Copy discipline: zero marketing buzzwords, concrete claims, expectation-setting.
- Brand system now continuous with /docs (pills, red, Bricolage).

## Personas
- Jordan (first-timer): product names (ElasticLabs NAT) explained by card blurbs — OK. CTA "Open Client Panel" tells what happens.
- Casey (mobile): CTAs full-width in thumb zone; heavy dark images lazy-load — OK.
- Riley (stress): claims all hedged honestly; no fake numbers to catch.
