# PlanetScale engineering blog — detailed style guide

Source: an analysis of six posts read on 2026-11-20 (URLs at the end). Quotations are
kept to short fragments that show a pattern. Write new sentences; do not reuse these.

## Length and shape

| Post | Author | ~Words | H2 / H3 | Visuals |
|---|---|---|---|---|
| Making 768 servers look like 1 | Ben Dicken | 2,400 | 7 / 3 | 12 interactive iframe widgets (canvas + SVG), JSON config, SQL |
| Designing a reliable unplanned failover | Shlomi Noach | 2,500 | 9 / 0 | 3 CSS-keyframe animated SVGs, config line, WAL position block |
| The hidden latency inside your database | Simeon Griggs | 2,000 | 6 / 3 | 1 screenshot, 1 blockquote |
| What gets TOASTed in Postgres | Ahmed Darwich | 3,000 | 9 / 0 | 7 SVGs, many psql output blocks, decision chart |
| Anatomy of a (Postgres) search engine | Patrick Reynolds, Eric Ridge | 2,900 | 6 / 5 | 2 interactive iframe widgets (live search, segment merging), SQL |
| When to choose x86-64 vs aarch64 | Ahmed Darwich | 1,700 | 4 / 3 | ~3 figures, SQL |

Target: 1,800–3,000 words, 6–9 H2s, H3s only for sub-cases. Figures: 3–7 static or animated, or ~12 small interactive ones (see interactive-visuals.md).

## How the six posts are built

**Making 768 servers look like 1.** Opens with a three-word declarative about scale. A
scale ladder (a few TB → 4 shards → 256 shards → 768 servers). "Growing pains" names three
bottlenecks as H3s. A punning heading introduces sharding. A proxy section contrasts a
connection pooler with a sharding router. A question heading ("How does it know?") leads
to routing config. "The full picture" is a numbered request path. Ends with "What about
everything else?", a follow pointer, and a two-word sign-off.

**Designing a reliable unplanned failover.** Calls back to the planned-switchover post and
says the unplanned case is harder. Poses two numbered questions (is it dead? which replica?)
and answers them in order. Lists the ways failure presents (process exit, refused
connection, dropped packets, frozen process) and shows the design treats them the same. The
naive answer (promote on one failed health check) fails because it risks two writable
primaries. Mechanics: disconnect replicas, choose by WAL position, promote, fence the old
primary ("What about P?"). Summary restates the principles, admits some outages are beyond
automatic recovery, and defers "the orchestrator can fail too" to a future post.

**The hidden latency inside your database.** Thesis-as-first-line ("X is a fine choice and a
bad default" shape). A history section with one H3 per era. "Hops hiding in plain sight"
makes the argument. A cost section with exact monthly prices side by side. A counter-case
section ("You might not need …") then a "Signs you need …" checklist. Soft call to action.

**What gets TOASTed in Postgres.** A reproducible experiment: N characters stored as-is,
N+1 compressed to a tiny size. "Let's dig in!" Byte accounting with the arithmetic written
out. Threshold, then mechanism, then two algorithms compared with stated setups and
measured output. "When to skip compression". "Wrapup" ends with a decision chart.

**Anatomy of a search engine.** Plain definition, then two anti-pattern queries. An
overview of the data structure with H3s per component. Analogy kept to one sentence (the
index at the back of a book). Tokenizers, scoring, segments and merging, then how the
concepts map onto the product. Points to a deeper companion post.

**When to choose x86-64 vs aarch64.** Hook in one short sentence. A brief history aside.
Three CPU concepts, each tied to a database workload, with one analogy. A section on a
non-obvious constraint with a concrete signedness example. "Which one to pick" says
benchmark both before committing.

## Voice

- Professional, conversational, confident. Contractions are normal.
- "We" = the team. "You" = the reader, addressed often. "Let's look at how…".
- Paragraphs 1–4 sentences. Long paragraphs are rare.
- Strong claims stated flatly; qualifiers attached only to the claim that needs them.
- Opinion appears as a blunt one-line judgment, for example a line saying complex
  software is hard to get right, or that nothing is as fast as doing nothing.
- Humor is a single dry clause: a two-word sound effect after a cliffhanger, an ironic
  "Incredibly, we haven't yet touched on …", a parenthetical "a.k.a. renting someone else's
  computer". Then straight back to mechanics.
- Honesty about cost even in product-adjacent posts: "Yes, but it happens only once per …".
- Each author keeps a personal tilt: enumerative and rigorous; experimental and
  byte-precise; opinionated and witty; textbook-like with "Quick aside:"; narrative.
  Pick one tilt per post and keep it.

## Explanation techniques

- **First principles:** start from one server / one row / one packet; add one complication
  per section.
- **Naive, then better:** present the obvious answer as a fair attempt, then break it with a
  concrete scenario.
- **Analogy:** one or two sentences, never an extended metaphor.
- **Worked arithmetic:** write the sum out ("24-byte header + 8 + 8 + 1 + 4 = 45").
- **Paired numbers:** "301 pages, 1 ms" vs "6,234 pages, 16 ms"; price A vs price B.
- **Failure taxonomy:** enumerate how failure presents, then unify.
- **Explicit limits:** say what the design does not solve.

## Visuals

- Figures are introduced by a lead-in ending in a colon ("…like this:") or referenced
  ("as shown above", "Try it in the figure above").
- Alt text is long and step-by-step; it carries the information.
- Italic one-line captions under screenshots.
- Real command output in code blocks; plain-text aligned tables inside code blocks rather
  than Markdown tables.
- Bold "Note" callouts for asides.
- Interactive figures where the platform supports them, with prose inviting the reader to
  try them.

## Phrase patterns (shapes, not text to copy)

- Setup: "Let's look at…", "Consider first…", "Suppose our cluster has…", "Here's what happens when…"
- Pivot: "But…", "So,…", "Enter <technology>.", "Quick aside:", "Back to our original question."
- Connector: "This is where X helps.", "That's what we solved with…"
- Rhetorical Q&A: a question heading, answered in the first sentence ("Because P may return.").
- Enumeration: "We have two problems, though:" followed by a numbered list.
- Contrast: "X is not Y. It's Z.", "Not X, but Y."
- Deflate: "Yes, but…"
- Close: a short sign-off tied to the topic ("Happy <verb>ing."), "Stay tuned."

## Avoid

- Emojis; Title Case headings; hype adjectives; "In this post we will…" openers.
- Bullet-heavy bodies; Markdown tables used for prose.
- Unsupported comparatives ("much faster", "way more reliable").
- Invented output or benchmarks.
- Hedging every sentence.
- More than one or two exclamation marks.
- Product pitch before the mechanism is explained.

## URLs read

- https://planetscale.com/blog/making-768-servers-look-like-1
- https://planetscale.com/blog/designing-a-reliable-unplanned-failover
- https://planetscale.com/blog/the-hidden-latency-inside-your-database
- https://planetscale.com/blog/what-gets-toasted-in-postgres
- https://planetscale.com/blog/anatomy-of-a-postgres-search-engine
- https://planetscale.com/blog/when-to-choose-x86-64-vs-aarch64
