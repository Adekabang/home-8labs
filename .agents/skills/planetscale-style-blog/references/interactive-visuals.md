# Animated and interactive figures

How the PlanetScale posts build their figures, observed from page HTML, SVG assets and
iframe bundles on 2026-11-20. Reproduce the *techniques* with your own drawings and code.

## Visual language (observed from rendered figures, 2026-11-20)

Studied from screenshots of the failover SVGs, the TOAST byte-layout SVGs, the 768-servers
widgets and the search widget, plus the SVG source and widget bundles. Reproduce the
*grammar*, not the brand: pick your own palette from your site's tokens.

**Canvas.** A flat, near-white panel (just off the page background), no border, no shadow,
generous padding. Nothing decorative. Dark mode is not offered there; if your site has a
theme toggle, define the same roles for dark and key them to the site's theme attribute,
not only `prefers-color-scheme` (an `<img>` SVG cannot see the site toggle — inline it).

**Type.** Everything inside the figure is monospace (SF Mono / JetBrains Mono class).
- Node names: UPPERCASE, bold-ish (600–700), slight tracking (≈0.05em), ~14–16 px at 480 wide.
- Line labels and group labels: small UPPERCASE, tracking ≈0.08em, ~11–12 px, coloured like
  the line they name ("HEALTH CHECK", "REPLICATION", "SHARD").
- Step header above the diagram: a muted kicker "STEP 1 OF 5" / "CASE 1 OF 3" (bold, tracked,
  ~12 px) and one sentence in monospace (~15 px) saying what happens in this step.
- Proportional text only below the figure (caption, scope note).

**Nodes.**
- Square corners. Never rounded.
- Thin outlines: 1.5–2 px. Ordinary node = dark outline + an *inset dashed outline* ≈6 px inside.
- Client/actor nodes: grey outline, light grey fill, grey dashed inset.
- The node that matters in this figure: outline and dashed inset in its role colour, a faint
  tint fill plus a 45° hatch (thin lines, ~7 px pitch, ~40% opacity).
- Data stores: a cylinder; the top ellipse is hatched in the store colour.
- Groups (shard, host, segment): a large dashed grey rectangle with a small caps label at
  the top-left inside.
- Inactive or "not yet relevant" nodes fade to low opacity (≈0.2) or disappear.

**Connectors.**
- Orthogonal routes only (horizontal and vertical segments), no curves, no diagonals.
- 1.5–2 px. Idle/background connections: grey dashed. Active flow: solid, in the colour of
  that kind of flow.
- End points are small filled squares (≈6–7 px) in the line colour, not arrowheads.
  Direction is shown by moving dots, not by arrowheads.
- A failed or refused link: a small square box with a × in it, sitting on the line.

**Colour = kind of flow.** One hue per flow type (for example health checks, replication,
user traffic, admin traffic, data path), plus grey for structure, red for refusal, amber
for "works but should not", and one bright accent (orange) reserved for moving traffic
dots and the selected control. Never use colour only for decoration. Label each coloured
line with its name in the same colour, which makes a separate legend unnecessary.

**Outcome box.** A bordered rectangle under the diagram with the verdict in small caps
("DO NOT PROMOTE", "DROPPED AT THE BOUNDARY"), coloured by the verdict.

**Motion.**
- Traffic is a *stream* of 2–4 dots with ~150–200 ms stagger, ~0.8–0.9 s travel,
  ease-in-out (GSAP `power2.inOut`-like), state fades ~0.2 s.
- Dropped traffic stops at the × and the × flashes; delivered dots fade out on arrival.
- The static frame (no dots) must still tell the story through line states and the
  outcome box.

**Controls.** Square-cornered, monospace, 1.5 px dark border. Selected = accent border +
faint accent tint. Numbered "01 / 02 / 03". A replay control (and click-on-diagram replay).

**Geometry.** Design at ~480 user units wide so labels stay ≥10 px on a 375 px phone.
Fewer, larger nodes beat many small ones; move detail into the step sentence.

### Implementation pitfalls we hit

- Framework-scoped CSS (Astro/Vue/Svelte) does not reach elements created later by script
  (the moving dots). Use global/unscoped selectors for them.
- `color-mix(in oklch, <hue> x%, <grey>)` can produce a wrong (pink) hue because grey has
  no hue. Mix in `srgb` for tints.
- Text over lines: place line labels on the side away from other routes; check Indonesian
  (longer) strings too.
- Verify with real screenshots: light, dark, 375 px, and one frame *mid-animation*
  (e.g. Playwright: click a step, wait ~600 ms, screenshot the figure).

## Figure types

The full catalogue of figure types (structure, mechanism over time, quantity, evidence charts,
simulations, exploration, framing devices, and infrastructure/security patterns), with the claim
each one proves, lives in [figure-types.md](figure-types.md). Choose the type there; draw it in the
visual language above.

## Three tiers they use

| Tier | Seen in | How it is built | When to use |
|---|---|---|---|
| 1. Static SVG | TOAST post (7 SVGs: row bytes, TOAST table, read paths, decision chart) | `<img src="…svg">` served via an image CDN | Layouts, byte maps, decision charts — anything that does not change over time |
| 2. Self-playing animated SVG | Failover post (3 SVGs: detection points of view, any-one acknowledgements, choosing a candidate) | One `.svg` file with CSS `@keyframes` inside `<style>`; ~24 keyframe sets all sharing one cycle (`animation: kN 19.5s ease-in-out infinite`); `@media (prefers-reduced-motion: reduce) { * { animation: none !important } }` | A sequence of states the reader should watch in order: a failure unfolding, messages being acknowledged, a candidate being chosen |
| 3. Interactive iframe widget | 768-servers post (12 widgets), search post (2 widgets) | `<iframe src="/blog/<slug>/iframe#<figure-id>" scrolling="no">` with a fixed aspect ratio; one small JS bundle per post renders the figure picked by the URL hash | Systems with flow (requests, traffic, shards) or a state the reader should change (type search terms, watch segments merge) |

## Tier 2 details: one-file animated SVG

- No JavaScript. Every animated element gets its own keyframe set, and **all sets share one
  duration**. A storyboard is laid out as percentages of that single cycle, so the elements
  stay in sync and the loop restarts cleanly.
- The story has clear "beats" (for example: link fails → observers disagree → quorum agrees →
  promotion). Hold each beat long enough to read (2–4 s); the whole loop is ~15–25 s.
- The static first frame must make sense on its own (reduced-motion users and print see it).
- Alt text narrates every beat ("In case 1, … In case 2, …"), because the animation
  carries the argument.

Starter:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200" role="img" aria-labelledby="t d">
  <title id="t">Replica acknowledgement</title>
  <desc id="d">The primary sends a write to three replicas. Replica 2 acknowledges first, and
  the commit returns after that one acknowledgement.</desc>
  <style>
    :root { --fg: #1f2328; --accent: #0969da; }
    @media (prefers-color-scheme: dark) { :root { --fg: #e6edf3; --accent: #4493f8; } }
    .box { fill: none; stroke: var(--fg); }
    .msg { fill: var(--accent); animation: send 12s ease-in-out infinite; }
    .ack { opacity: 0; fill: var(--accent); animation: ack 12s ease-in-out infinite; }
    /* one 12 s storyboard: 0–25% send, 25–40% ack, 40–90% hold, 90–100% reset */
    @keyframes send { 0% { transform: translateX(0) } 25%, 90% { transform: translateX(360px) } 100% { transform: translateX(0) } }
    @keyframes ack  { 0%, 25% { opacity: 0 } 40%, 90% { opacity: 1 } 100% { opacity: 0 } }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important } }
  </style>
  <!-- shapes here -->
</svg>
```

## Tier 3 details: interactive widget

Observed in the bundles:

- Plain DOM + SVG (`createElementNS`) for diagrams, `<canvas>` with `devicePixelRatio`
  scaling for dense ones (hundreds of server squares); a tween library for motion.
- **Play only while visible:** an `IntersectionObserver` plus `visibilitychange` starts and
  pauses each animation, so offscreen figures cost nothing.
- **Click to replay:** a click on the figure restarts its animation. No visible control panel.
- Real inputs where they teach: the search widget has a text field ("search terms"), a
  mode toggle, and result / segment / tombstone panels that update as you type.
- Prose invites interaction right next to the figure ("Try a few searches here").
- Each figure has a fixed aspect ratio, so the page does not jump while it loads.
- Labels come from the theme's foreground colour, so the figure works in light and dark.

Skeleton:

```js
function whileVisible(el, onChange) {
  let inView = false, last;
  const update = () => { const on = inView && !document.hidden; if (on !== last) onChange(last = on); };
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; update(); }, { threshold: 0 }).observe(el);
  document.addEventListener("visibilitychange", update);
}
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
// whileVisible(fig, on => on && !reduce ? anim.play() : anim.pause());
// fig.addEventListener("click", () => anim.restart());
```

## Choosing a tier

1. Does the idea change over time? No → tier 1.
2. Does the reader only need to *watch* the order of events? → tier 2.
3. Does understanding improve when the reader *changes an input* or sees continuous flow
   (traffic, load, many shards)? → tier 3.
4. One figure per idea. The 768 post has 12 small figures, not 3 big ones; each stage of
   the scale ladder gets its own.

## In this repository

The handbook renderer (`docs/src/lib/figures/model.ts`) draws topology/flow diagrams, stepped
mechanisms and tables. Builders in `docs/src/lib/figures/kinds.ts` compile higher-level types into the
same renderer, so they share steps, replay, client-side navigation, text alternatives, Markdown export
and the geometry tests:
- `ladder()` — sequence diagram: actors, ordered messages, refused messages with a mark (ch05/ch06/ch10/ch11).
- `timeline()` — swimlanes over time: bars, point series, events, measured spans such as RPO/RTO or an
  exposure window (ch02, ch09, support SLA).
- `rules()` — first-match rule walkthrough with a default rule (ch05).
- `explorer()` — linked-highlight columns; each step focuses one item and lights what it links to (learning path).
- `bars()` — evidence bars from measured values, linear or log scale, source in `scope` (systems basics).
Other catalogue types (line charts, unit grids, simulations, byte maps) still need a builder first; do not
fake a chart with boxes.



- Tier 1 and 2: commit SVGs with relative paths; keep viewBox, `<title>`/`<desc>`, readable
  text and theme-aware colours (AGENTS.md). Localise the title/desc and visible labels for
  the Indonesian page.
- Tier 3: build an Astro component or an MDX island, not an iframe to an external site.
  Keep it working with JavaScript disabled (static first frame + prose).
- Never animate a real screenshot or present an invented diagram as observed evidence.
