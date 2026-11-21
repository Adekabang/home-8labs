---
name: planetscale-style-blog
description: Write or revise a technical engineering blog post in the style of the PlanetScale engineering blog — a deep, first-principles explanation of one system mechanism, with a short hook, sentence-case headings, naive-then-better reasoning, paired numbers, honest trade-offs, and diagrams or real command output as evidence. Use when the user asks for a "PlanetScale-style" post, an engineering deep-dive blog post, or a blog draft about how a system (database, network, security control, failover, identity, storage) actually works.
---

# PlanetScale-style engineering blog post

This skill writes engineering posts that teach one mechanism well. The model is the
PlanetScale engineering blog, for example:

- "Making 768 servers look like 1" (Ben Dicken) — a scale ladder that ends in a proxy/routing design.
- "Designing a reliable unplanned failover" (Shlomi Noach) — a failure-case taxonomy that ends in a safe promotion design.
- "What gets TOASTed in Postgres", "The hidden latency inside your database",
  "Anatomy of a (Postgres) search engine", "When to choose x86-64 vs aarch64".

Imitate the *method and voice*. Do not copy sentences, titles, diagrams, or brand
elements from those posts. Do not present the draft as a PlanetScale publication.

Read [references/style-guide.md](references/style-guide.md) before drafting. It holds
the detailed voice rules, phrase patterns, and per-post structure notes.

## Workflow

1. **Pin the one mechanism.** Write one sentence: "After reading, the reader can explain
   how X does Y, and why the obvious approach fails." If you cannot write it, ask the
   user. One post explains one mechanism; spin off the rest as "a topic for a future post".
2. **Collect evidence before prose.** Gather real numbers, real command output, real
   config, and primary sources. Run commands when the environment allows. Never invent
   output, benchmark results, or latencies. Mark any illustrative figure as illustrative.
3. **Choose the arc** (see the templates below) and write an outline of 6–9 sentence-case
   H2 headings plus a figure plan (figure, tier, beats). Show the outline to the user for a long post before full drafting.
4. **Draft** following the voice rules. Target 1,800–3,000 words.
5. **Build the figures** from the figure plan: choose static, animated, or interactive per
   figure (see below). Typical counts: 3–7 static or animated figures, or up to ~12 small
   interactive ones for a scale-ladder post.
6. **Self-review** with the checklist at the end of this file and fix every miss.

## Anatomy of a post

- **Title:** specific and concrete. A declarative claim, a "how/when/what" question, or a
  wry phrase with a number in it. Sentence case.
- **Deck (description):** one sentence that states the thesis. Not a summary of sections.
- **Hook (first 1–3 short paragraphs):** one of
  - a short declarative line that names a surprising fact or scale;
  - a reproducible experiment with a surprising result;
  - a callback to a previous post ("Last time we covered the planned case. This one is harder.");
  - a plain definition followed by the thing you should not do.
- **Problem framing:** state the constraint and the naive approach. Show exactly why the
  naive approach fails, with a concrete scenario.
- **First principles:** build up from the simplest system (one server, one row, one
  packet). Add one complication per section.
- **Mechanism:** the real design, step by step. Number the steps when order matters.
- **Trade-offs and failure modes:** what it costs, when it breaks, and what it does not
  solve. Include the honest "you might not need this" case.
- **Decision guidance:** "Which one to pick", "When to skip X", or "Signs you need X".
- **Close:** a short summary of the principles, one stated limit, a pointer to a
  follow-up. An optional one-line sign-off in the post's own voice.

## Arc templates

- **Scale ladder:** small system → it grows → three named bottlenecks (H3 each) → the
  design → the full request path as a numbered list → what is still unsolved.
- **Failure taxonomy:** scenario → "How do we know it failed?" → the ways failure
  presents → why one signal is not enough → the decision → the mechanics → cleanup of the
  old component → summary and limits.
- **Experiment-first:** surprising result → byte/step accounting → threshold or rule →
  mechanism → measured comparison with the setup stated → when to skip → decision chart.
- **History-then-argument:** how we got here (eras as H3s) → the hidden cost today →
  numbers and money compared → counter-case → signs you need it.

## Voice rules (short form)

- "We" is the team that built or studied the system. "You" is the reader. Use "Let's"
  to start a walkthrough.
- Short paragraphs: 1–4 sentences. Single-sentence paragraphs for emphasis.
- Mix short punchy sentences with 20–35 word explanatory sentences.
- State strong claims flatly, then qualify the specific claim that needs it
  ("usually", "on this workload"). Do not hedge everything.
- Humor is dry and one clause long, then back to mechanics. No jokes as paragraphs.
- Define a term in **bold** at first use. Use *italics* for stress only.
- Give numbers with units and a comparison: "10–20 ms for an HDD random read vs ≤1 ms for
  an in-datacenter round trip". Never "much faster".
- Every design choice names its cost.
- Headings: sentence case, 2–6 words, often a question or a blunt claim.
- Prose first. Bullets only for 3–5 enumerated cases. Avoid Markdown tables in the body
  unless the data is truly tabular; prefer a code block of real output.
- No emojis, no hype words ("blazing", "revolutionary", "seamless"), at most one or two
  exclamation marks in the whole post. Product mentions stay restrained and late.

## Code and output

- Show real commands and their real output, trimmed with `...` where needed.
- Make experiments reproducible: versions, seeds, data sizes, hardware.
- Follow a code block with a short explanation of what to notice in it.

## Diagrams, animation and interactivity

Figures carry the argument in these posts, often more than the prose. Read
[references/interactive-visuals.md](references/interactive-visuals.md) before planning figures.

- Draw in the house visual language described in the reference: monospace UPPERCASE
  labels, square boxes with an inset dashed outline, orthogonal connectors with square end
  points, one colour per kind of flow (labelled in that colour), hatch for the node that
  matters, a cylinder for stores, a "STEP n OF m" header with one sentence above the
  diagram, and an outcome box below it. Rounded cards, arrowheads, curves and generic
  flowchart styling are the usual reasons a figure looks wrong.
- **Draw the mechanism; do not describe it.** A table, a numbered list of steps or a
  timeline in a box is text, not a figure. Readers rejected exactly that substitution
  (handbook chapters 1–4, November 2026). Show the actors, decision points, data and flows,
  and let the reader step through what changes. Keep a table only for a true side-by-side
  comparison, at most one per page.
- **Choose the figure type from the claim** using [references/figure-types.md](references/figure-types.md):
  structure (topology, spotlight series, layered stack, zoom map, field anatomy…), mechanism over
  time (stepped mechanism, sequence diagram, swimlane, state machine, session replay…), quantity
  (unit grid, byte bar, page map, number line…), evidence charts (real data only), simulations and
  what-ifs, explorers, framing devices, and infrastructure/security patterns. Mix 2–4 types in a
  post; a post made only of box-and-line diagrams is a smell.
- Pick a tier per figure: **static SVG** for layouts and decision charts; **self-playing
  animated SVG** (CSS keyframes, one shared cycle, no JS) for a sequence of events such as a
  failure unfolding; **interactive widget** (click-to-replay, plays only while visible, real
  inputs) for flow, scale, or state the reader should change.
- One figure per idea or per stage. Scale-ladder posts use many small figures (10+), not a few big ones.
- Plan the figures in the outline step: list each figure, its tier, and its storyboard beats.
- Introduce each with a sentence ending in a colon, or refer to it ("in the figure above").
  Invite interaction next to a widget ("Try a few searches here").
- Alt text narrates every beat, so a reader who cannot see the motion loses nothing.
- Respect `prefers-reduced-motion`; the static first frame must make sense alone.
- Theme-aware colours for light and dark. Fixed aspect ratio so the page does not jump.
- Optional italic one-line caption under screenshots.

## Fit with this repository

In this handbook, figures already have a home: data in `docs/src/lib/figures/<page>.ts`
(`DiagramFigure` model in `model.ts`, registered in `index.ts`), rendered by
`<Figure figure="key" language="en|id" />` in `.mdx` pages. `docs/src/lib/figures.test.ts`
checks bilingual text, orthogonal lines, canvas bounds, label fit, note overlaps and that every
book chapter and foundations page is diagram-first. Chapter 5 (`chapter-05.ts`) is the
approved reference.

If the post will live in this handbook (`docs/`), the rules in `AGENTS.md` take
precedence: write the English and Indonesian pages together, cite public primary sources
near conceptual claims, do not repeat the title as a body H1 or the description as the
first paragraph, use Nimbus components, and give SVGs a viewBox, title, description and
theme-compatible colours. The `book/` "narrative book chapter" genre is the closest fit.
The separate local `security-blog/` repository is not published from here.

## Self-review checklist

- [ ] One mechanism. The one-sentence goal from step 1 is met.
- [ ] The hook is under ~60 words and is not the deck repeated.
- [ ] The naive approach appears and fails for a concrete, stated reason.
- [ ] Every number has a unit, a comparison, and a source or a stated setup.
- [ ] No invented output or benchmark. Illustrative values are labelled.
- [ ] Every design choice states its cost; there is a "you might not need this" or a limit.
- [ ] Headings are sentence case; 6–9 H2s; no heading is a generic "Introduction".
- [ ] Paragraphs are ≤4 sentences; bullets are used only for enumerations.
- [ ] Each figure has the right tier, a lead-in sentence, and beat-by-beat alt text.
- [ ] Animations share one cycle, honour reduced motion, and pause when offscreen.
- [ ] Figures follow the visual language: mono caps, square corners, inset dashed outline,
      orthogonal lines with square ends, flow colours labelled in place, outcome box.
- [ ] Screenshots checked in light, dark, 375 px width and one mid-animation frame.
- [ ] Figure types fit their claims and vary across the post; every chart names its data source.
- [ ] Interactive figures still work after client-side navigation (re-initialise on the router's page-load event).
- [ ] No emojis, hype, or copied PlanetScale text.
- [ ] The close has a summary, one limit, and a pointer forward.
