# Figure types: choose by the claim

The visual language (see `interactive-visuals.md`) is shared; the *figure type* must vary with
the claim. A post made only of box-and-line diagrams looks repetitive and misses the strongest
teaching moves. Pick each figure by asking "what does the reader need to *see* to believe this
sentence?", then find that claim below.

Sources: a survey of ~250 figures in 40 PlanetScale engineering posts (2026-11-21; screenshots
in the session scratchpad, not in the repo) plus infra/security explainers (section H). Describe
and reuse the *grammar*; never copy another publication's text, code or art.

How to read the tables: **Claim** is the sentence the figure proves. **Grammar** is what to draw.
**Interaction** is optional; every figure must also work as a static final state with a text
description (see "Accessibility" at the end — do better than the sources here).

---

## A. Structure: "how it is put together"

| Type | Claim | Grammar | Interaction | Seen in |
|---|---|---|---|---|
| Topology / flow diagram | "This is how it is wired" | Boxes with inset dashed outline, orthogonal lines, one colour per flow, line labels in the flow colour | Static, or stepped | 768 servers, failover |
| Spotlight series | "Now look at *this* component" | The same full architecture repeated through the post; one component tinted/outlined, everything else faded to ~15% | None; one copy per section | architecture-of-neki |
| Layered stack | "Each layer adds one thing" | Horizontal bands stacked (app / transport / IP / link, or OS / runtime / app); peer layers joined by dotted "logical" lines across two stacks | Step down one stack, across the wire, up the other | (handbook TCP/IP figure) |
| Nested containment + zoom | "Where the cost hides, at each scale" | Nested dashed containers (region ⊃ zone ⊃ host ⊃ CPU/disk); a "ZOOM 8× / 1,000×" readout; one figure per zoom level | Animation loop + restart | hidden-latency-inside-your-database |
| Fleet icon array | "N identical units do it in parallel" | N identical line-art units (cylinders, servers) under a hatched shared band (router) and over another (object store); repeated with one change per step | Animated flows | massively-parallel-postgres-backups |
| Packing / nesting diagram | "How many fit per unit" | Rows of numbered cells grouped by outlines per container width; or cores containing vCPUs, two architectures side by side | None | x86-64 vs aarch64 |
| Correspondence (mapping) | "Manual step X is what component Y does" | Two titled columns of dashed rows, an arrow across each row, a bracketed footer note `[ same intent, owned by … ]` | None | feedback-loops-behind-kubernetes |
| Control-loop block diagram | "This system is a feedback loop" | Summing junction (+/−) → controller → actuator → plant → sensor; signal names on the wires; concrete commands in small type under boxes | None | feedback-loops-behind-kubernetes |
| Field-anatomy string | "What each part of this identifier encodes" | The literal string (UUID, ARN, certificate DN, packet header) with each field boxed in its own colour; leader arrows to field names in matching colours | None or hover | uuid-primary-key-in-mysql |

## B. Mechanism over time: "watch it happen"

| Type | Claim | Grammar | Interaction | Seen in |
|---|---|---|---|---|
| Stepped mechanism | "Watch this happen / this is refused" | The topology with per-step state: packets, × marks, outcome box, "STEP n OF m" header | Step buttons, click to replay | failover, 768 servers |
| Sequence diagram (lanes) | "The order of interleaved operations causes the outcome" | Actors as lanes (vertical or horizontal pills); arrows between lanes carry the message/SQL and the reply, coloured per actor | Replay / step | database-transactions (phantom read) |
| Swimlane timeline (Gantt) | "What overlaps in time / what holds progress back" | Labelled lanes on faint time ticks; bars for activity, ticks for events, a pinned "horizon" line; small multiples for scenarios | Animation + replay | processes-and-threads, postgres queue health, deadlocks (retry/backoff/jitter raster) |
| State machine | "The states a thing can be in and how it moves" | Circles or rounded states, labelled transitions; static variant: several events converging on one state with an italic footnote | Animated transition / none | processes-and-threads, subtransactions |
| Dual-terminal session replay | "Two clients see different things at the same moment" | Two dark terminal windows side by side; commands type out; results appear per session | Play / replay | database-transactions |
| Storage-state + session script | "What the system records when each command runs" | A table of normally hidden state (xmin/xmax, undo log, ACL bits) beside session panels; arrow from the active statement to the row it touches; session colours reused everywhere | Step / replay | database-transactions (MVCC) |
| Lock-table / resource slideshow | "How the deadlock (or race) forms" | A table of resources with per-actor badges (A LOCK / B WAIT); each actor's commands faded at the side with the current line lit; final red verdict | Slide dots, replay | deadlocks-and-downtime |
| Query / request walkthrough | "How one request is resolved" | Actors + data tables; the command in the caption; a segmented progress bar of steps | Steps | shard groups (lookup) |
| Health grid + log replay | "Replaying the log heals damaged state" | A grid of unit icons with a status legend (healthy / out of sync / corrupted) beside a log list with start/end markers | Animation | postgres-backups-under-the-hood |
| Concurrent streams over time | "Two processes run at once; the result is where they meet" | Two horizontal fill tracks on a time axis, a start tick and a "now" line | Animation | postgres-backups-under-the-hood |
| Per-actor progress bars | "Who is ahead, who is behind" | One bar per replica/actor (received vs applied), a tick for the decisive position | Step through time | failover (WAL positions) |

## C. Quantity and scale: "look how many / how big"

| Type | Claim | Grammar | Interaction | Seen in |
|---|---|---|---|---|
| Unit / scale grid | "Look how many" | One mark per unit (768 squares, 256 shard icons); colour a subset to show where load lands | Re-layout when the count changes; animated dots | 768 servers |
| Race bars | "N units finish in 1/N the time" | Bars per configuration split into per-unit segments, time labels at the end (~22 h / ~2.8 h / ~42 min) | Animation | massively-parallel backups |
| Byte / segment bar | "Where the bytes go" | A row of cells per byte/block; braces with sizes; the delta highlighted (+9 B) | Static or step rows | TOAST |
| 2-D page / memory map | "Where bytes live inside a page / what an operation rewrites" | A page rectangle: header, pointers growing down, data growing up, arrows pointer → data; before/after panels joined by a labelled arrow | Static / step | postgresql-mvcc, neki wire format |
| Counter-space number line | "How close we are to the cliff" | An axis 0 … 2^31 … 2^32 with markers (current, oldest, limit) and a dashed FUTURE bracket; red = danger | Play / pause | xid wraparound |
| Share bar (100%) | "This is the share of the whole" | One hatched bar, segments labelled by leader lines with name and % | Static | turning-point-for-postgres |

## D. Evidence charts: "the data says so"

Charts plot **real, sourced numbers only** (name source and date under the chart). One claim per
chart, marked on the chart (band, callout, recoloured series).

| Type | Claim | Grammar | Interaction | Seen in |
|---|---|---|---|---|
| Line chart with turning-point band | "The trend changed at this moment" | Mono axes, square markers, legend on top, a shaded band and coloured axis label at the turning point | Static / hover values | turning-point-for-postgres |
| Event-annotated time series | "Throughput collapses while condition X holds" | Line with dashed vertical event lines ("overflow starts / ends") and boxed plateau callouts (~7,200 → ~160 → ~8,200 TPS) | None | dangers-of-postgres-subtransactions |
| Grouped bars | "Config × variant comparison" | Grouped bars with values on bars, a setup line in the title, specs in x labels; one chart per configuration | None | benchmarking posts |
| Log–log scaling chart | "It scales linearly" | One line, point markers, log axes | Hover | 118M QPS on Neki |
| Series-picker overlay | "Compare any two configurations over a run" | A rail of sparkline thumbnails acting as a clickable legend; selected series overlaid as translucent areas | Click thumbnails | benchmarking-postgres |
| Percentile toggle | "The tail is where it hurts" | Noisy time series per variant; segmented P50 / P90 / P95 / P99 toggle; log/linear toggle | Toggles | tin-v106 |
| Flame-graph pair | "Where the CPU time goes" | Two flame graphs side by side, the hot frame solid accent, a full-width summary bar below, source note | None | subtransactions |
| Conceptual curve | "This is the shape of the law" | Unnumbered axes, the curve recoloured where the regime changes, labels on the curve; say it is conceptual | Static | 768 servers (USL) |
| Step-signal comparison | "Two strategies diverge when events are missed" | Stacked step lines (desired / strategy A / strategy B), value badges at transitions, bracketed action notes | None | feedback loops (edge vs level) |
| Evidence screenshot | "This actually happened" | Real dashboard/console capture, identifiers blurred, an italic one-line caption; or a short screen recording | None | real-fail-rate-of-ebs |

## E. Simulations and what-ifs: "try the parameter"

Use when the claim depends on a parameter the reader can vary. Always show the default state
statically and describe the outcome of the extremes in text.

| Type | Claim | Grammar | Interaction | Seen in |
|---|---|---|---|---|
| Parameter toggle | "What changes if I change this?" | Segmented control ("2 shards / 8 shards") that re-lays-out the figure; a marked key moves | Toggle | shard groups |
| Drag-handle partitioner | "Splitting ranges isolates the hot tenant" | A key-space ruler (00 … ff) over coloured regions holding tenant chips; draggable boundaries; click to split | Drag / click / reset | hot-shards-hotter-tenants |
| Latency race with time dilation | "X is N× slower than Y" | A requester block and device/hop bars labelled with latency; tokens shuttle; a "slowdown from real time" slider | Slider, loop | io-devices, caching |
| Pipeline with live numbers | "Requested ≠ delivered: a limiter sits in between" | Boxes on dotted links; each link carries its current number | Slider | io-devices (IOPS, replication fan-out) |
| Admission / rate-limit simulator | "Bursts are absorbed up to a size, then queue or block" | Requests tagged ADMITTED / QUEUED; a bucket with level and drain; counters | Sliders (size, rate), loop | leaky-buckets |
| Queueing simulation pair | "Gating beats admitting everything" | A container filling with work units; success/fail counters; mini strips (arrivals / completed / latency); OPEN vs GATED side by side, shared controls | Rate slider, burst/reject buttons | concurrency-vs-throughput |
| Cache simulation + stats strip | "Hit rate depends on size and access pattern" | Requester / cache / storage columns of coloured tiles; a rolling hit/miss strip with counters; small multiples per eviction policy | Click tiles; auto-run | caching |
| What-if calculator chart | "Changing the parameter moves the outcome like this" | A computed step or line chart whose slider labels match the controls of a neighbouring sandbox | Sliders | btrees (depth vs size) |
| Data-structure sandbox | "How the structure grows, splits and is searched" | Colour-coded control groups; nodes with key/value rows; search path tinted; inserts animate | Steppers, add/search/range, speed | btrees-and-database-indexes |
| Device / machine simulator | "This is what the hardware or CPU literally does" | Illustrated device or CPU+RAM with an instruction list, a program-counter arrow, data cells, a terminal; big transport buttons | Play / speed / step / reset | io-devices, processes-and-threads |

## F. Exploration: "find it yourself"

| Type | Claim | Grammar | Interaction | Seen in |
|---|---|---|---|---|
| Linked-highlight explorer | "How the layers map to each other" | Columns (logical → grouping → physical) joined by curved connectors, plus the matching config text | Point to highlight everywhere (config too), click to pin, Escape clears | shard groups |
| Index / structure explorer | "How the index answers a query" | Dictionary rows → posting lists of chips; a mode toggle; result row; segment variant with insert/update/delete | Text input, toggle, buttons | postgres search engine |
| Multi-toggle benchmark explorer | "Faster on every axis" | Segmented toggle groups (architecture × metric × scale); a playful alternate view (balls whose speed ∝ QPS) | Toggles, animation | tin-v106 |
| Live widget | "Try it yourself" | Real input and result panels in the figure language | Typing | search engine |

## G. Framing devices

| Type | Use | Grammar |
|---|---|---|
| Before/after pair | One change, two states | Two panels, identical layout, joined by a labelled arrow `[VACUUM]`; differences in the accent colour only |
| Small multiples | One variable changed across N runs | The same widget repeated with one parameter changed; prose names the difference |
| Same input, two interpretations | "Identical bytes mean different things" | One accent box forking into two columns with the two results and their consequences |
| Branching outcome / plan comparison | "Usually A, rarely B" / "with vs without the key" | Left-to-right boxes with branch labels; or two columns split by a dashed divider, untouched parts greyed "NOT QUERIED" |
| Colour-keyed formula | "The limits combine like this" | A typeset formula whose terms match colours in the neighbouring diagram |
| Rollout flow with semantic colours | "Adopt it in this order" | Boxes coloured by risk: neutral → warn → neutral → deny |
| Hero / analogy art | Set up the metaphor | One illustration (water clock for leaky bucket, chip for CPU); sparingly, never as evidence |

## H. Infrastructure and security patterns

Observed in infrastructure and security explainers (Tailscale, Cloudflare, Sam Rose, Encore,
ngrok, Jepsen, tls13.xargs.org, explained-from-first-principles, Julia Evans' zines, USFCA
algorithm visualisations). Entries marked *(idea)* are proposed patterns for this handbook's
topics that were not seen in a source; prefer observed patterns and test ideas with readers.

### H1. Networks, paths and boundaries

| Type | Claim | Grammar | Interaction | Seen in |
|---|---|---|---|---|
| Packet-flow across zones | "Return traffic passes only if a matching packet left first" | Zones as shaded columns with a header; firewall as a thick bar; hosts as tiles with name + IP; packets as thin arrows with FROM/TO address tags; NAT box with a zigzag = rewritten; every arrow ends in a verdict line ("Rejected – no recent packet from X" / "Accepted") | A static sequence (~25 figures), each adding one element | Tailscale, How NAT traversal works |
| Same diagram, one variable changed | "Easy vs hard NAT; single vs double vs carrier-grade NAT" | Identical layout across figures; only a label or the number of layers changes | Static sequence | Tailscale NAT |
| Topology on a map | "Hub-and-spoke backhauls; mesh goes direct" | Dot-matrix geography, monospace city labels, hub as a square, routes as orthogonal arrows | Static pair | Tailscale, How it works |
| Control plane vs data plane | "Coordination is separate from traffic" | Sites as grouped cards with status dots; one dark central coordinator; external identity provider as a badge; numbered caption | Static | Tailscale, How it works |
| Identity-aware access proxy | "All access goes through one identity gate" | User + device → gate (identity providers above) → private network of apps | Static | Cloudflare Access |
| Route propagation (legit vs leaked) | "How a leak sent traffic the wrong way" | Routers as rack icons; curved paths; the legitimate announcement in green, the leaked more-specific prefixes in red with the path spelled out; a self-loop for the system that split the prefix | Static | Cloudflare, BGP route leak |
| Routing table before/after failure | "A failed link removes these routes" | Topology with a red ✕ on the link, then the routing table with the dead rows removed | Static pair | explained-from-first-principles |
| Rule-match walkthrough *(idea, from the USFCA step pattern)* | "This packet matches rule 4, not rule 2" | Packet fields on one side, the ordered rule table on the other; the current rule boxed; a verdict line; default deny at the bottom | Step back / step forward with a narrated status line | pattern: USFCA Dijkstra state table |
| Segment × layer explorer *(idea)* | "Which component lives where, and which paths are allowed" | Zone columns × layer rows; components as chips; pointing at a component highlights its allowed and denied paths and its rule rows | Point to highlight, click to pin | pattern: linked-highlight explorer (F) |

### H2. Protocols and cryptography

| Type | Claim | Grammar | Interaction | Seen in |
|---|---|---|---|---|
| Sequence (ladder) variants | "A protocol is an ordered exchange; failures change one arrow" | Two lifelines, labelled arrows; variants recolour one arrow (red = unexpected, green = recovery); sloped arrows = latency; crossing arrows = reordering; a caption per variant | Static small multiples | explained-from-first-principles, Internet |
| Numbered round-trip ladder, compared | "TLS 1.3 needs one round trip, TLS 1.2 two" | Client/server headers and lifelines, numbered circles per step, grouped messages in a bracket, a brace marking the round trip; versions side by side | Static pair | Cloudflare, TLS 1.3 |
| Attacker-in-the-middle ladder | "Unsigned negotiation allows a downgrade" | Three lanes (client / attacker / server); the attacker's edits in red italic; key icons for weak keys; red outcome at the bottom | Static | Cloudflare, TLS 1.3 (FREAK) |
| Encapsulation inside a ladder | "DNS over HTTPS = DNS inside HTTP inside TLS" | The same ladder twice; in the second, each message is nested coloured boxes (TLS ⊃ HTTP ⊃ DNS) | Static before/after | Cloudflare, DNS encryption |
| Layer-stack encapsulation flow | "Data goes down the sender's layers, across routers, up the recipient's" | Sender / router / recipient columns, one colour per layer, a payload square that gains a header at each layer | Static or stepped | explained-from-first-principles |
| Byte-by-byte dissection | "Every byte of this handshake, reproducibly" | One card per record (client green, server blue); hex bytes; sub-cards per header/extension listing byte → meaning; terminal blocks with the commands that recompute keys | Expand/collapse, "open all", show-code toggle; static HTML underneath | tls13.xargs.org |
| Annotated capture | "Plain DNS leaks the name to anyone on the path" | A real packet-capture window with red boxes around leaked fields; the encrypted capture with a green box around what is now hidden | Static evidence pair | Cloudflare, DNS encryption |
| Trust-chain story | "Why the browser trusts this certificate" | A numbered chain of speech/thought bubbles (leaf → intermediate → root → trust store) | Static comic | Julia Evans, wizardzines |
| Revocation check ladder *(idea)* | "A revoked certificate is refused only when someone checks" | Ladder client / server / CA: handshake, then CRL or OCSP fetch; stapled vs not stapled as a before/after pair; the refusal as the outcome | Steps | builds on H2 ladders |

### H3. Load, failure and resilience

| Type | Claim | Grammar | Interaction | Seen in |
|---|---|---|---|---|
| Request/server simulation | "Round robin fails under uneven load; least-connections copes" | Server tiles shaded by capacity, a queue tube above each, a progress pie inside, latency below; a load balancer; requests as moving dots; dropped requests visible | Play / pause / reset / shuffle, speed slider; failure first, then the fix, then a playground | samwho.dev, load balancing |
| Linked result charts | "The median hides the tail" | Charts below a simulation: median, p95/p99, latency histogram, cumulative drops; series distinguished by colour **and** dash | Static, fed by the simulation | samwho.dev, load balancing |
| Retry-storm simulation | "Immediate retries take the server down; backoff and jitter don't" | Clients with countdown pies, a balancer, servers; failed requests spiky; servers restart | Failure-rate buttons, server count, global speed, playground | Encore, retries |
| Reader-driven queue | "Queue discipline decides who suffers under load" | The reader clicks to send requests; a queue tube; shapes **and** colours per class; a goals checklist that ticks itself; result bars built from the reader's own clicks; percentile toggle | Click as input | Encore, queueing |
| Orchestrator simulation + config | "A wrong probe setting causes a crash loop" | Node containing agent and containers (ready / not ready), a ready counter; beside it the config with the changed lines highlighted; prose icons match the figure's glyphs | Buttons, endpoint toggles, number inputs, playground | ngrok, health probes |
| Rate-limit metaphor + decision lane | "Where the limit is checked, and how the window counts" | Bucket with drops in/out and rule labels; two-counter sliding window; a vertical request lane with the check as a red branch and the counter update as a dotted async path | Static | Cloudflare, rate limiting |
| Fault-injection timeline | "Which acknowledged writes were lost, and when" | Operations as points (time × throughput) coloured by outcome (ok / lost / unknown); injected faults as bands along the top (kill / pause / partition); one small multiple per node; alt text states the finding | Static | Jepsen analyses |
| Outage time series per target | "The shape of the incident" | One line per destination against the clock, a cliff and a recovery | Static | Cloudflare incident reports |
| Single-attack profile | "Instant ramp, flat top, cut-off; thousands of sources" | One filled area over seconds; a companion of thousands of thin per-source lines | Static | Cloudflare DDoS report |
| Two-level breakdown bar | "Half is network-layer; of that, this mix" | A top bar split into parts, fanning into a second bar of sub-parts; percentages inside segments | Static | Cloudflare DDoS report |
| Ranked and diverging bars | "Top vectors; attack vs legitimate share" | Sorted horizontal bars with values at the ends; paired attack (red) vs legitimate (blue) per category | Static | Cloudflare DDoS report |
| RPO/RTO timeline *(idea)* | "What a restore loses and how long it takes" | Writes as points on a time axis; the last good backup as a tick; the incident as a band; writes after the backup in red (RPO); the restore as a second band ending at "service back" (RTO) | Steps or scrubber | pattern: Jepsen fault timeline |

### H4. Identity, detection and incidents *(mostly ideas built from observed grammar)*

| Type | Claim | Grammar | Interaction | Pattern source |
|---|---|---|---|---|
| Authorization decision lane *(idea)* | "Authentication passed; authorization refused here" | A vertical request lane with checkpoints (TLS → session → identity → policy → ownership); each check a branch with its verdict | Steps | Cloudflare decision lane |
| Login/SSO ladder *(idea)* | "Who redirects whom in OIDC/SAML" | Lanes browser / app / identity provider; numbered redirects; tokens as labelled chips that move between lanes | Steps | H2 ladders |
| Detection funnel with drop points *(idea)* | "Events lost before they become alerts" | Source → collector → parser → rule → alert as stages; counts on each link; a drop counter at the stage that loses events | Slider for the failure point | pipeline with live numbers (E) |
| Alert threshold chart *(idea)* | "Detection delay is the gap between the event and the alert" | A metric line with a threshold line; a brace from the incident to the first alert | Static | outage time series |
| Incident swimlane *(idea)* | "Who did what when, and where escalation stalled" | Lanes per team/system; events as ticks; evidence artefacts (call log, alert) pinned to the timeline | Scrubber | Cloudflare incident timeline, swimlane (B) |
| "Controls that would have stopped it" | "Any one of these safeguards blocks the failure" | Each control as a source with a one-line rule, arrows converging on a ⊘ block | Static | Cloudflare, BGP route leak |
| Attack path / supply-chain lanes *(idea)* | "Where the tampered artefact entered" | Lanes developer / CI / registry / deploy with an attacker lane; the altered step in red; the control that would detect it marked | Steps | attacker ladder (H2) |
| Before-and-after config | "This one line changes the behaviour" | The figure next to the config or policy, changed lines highlighted, the figure re-rendered for each version | Toggle | ngrok probes |

### H5. Hosts, containers and explanation styles

| Type | Use | Grammar | Seen in |
|---|---|---|---|
| Concept-grid cheat sheet | Name every part of a system on one page (tables/chains/rules; namespaces/cgroups/capabilities) | Hand-lettered grid of small labelled panels, one concept each | Julia Evans, wizardzines |
| Time-stamped comic grid | Show state over time without animation (cache TTL, propagation) | Six panels labelled "30 s later… 6 min later… 2 h later" | Julia Evans, DNS |
| Character dialogue | Voice the reader's misconception before answering it | A mascot or two characters in speech bubbles; sparingly | Julia Evans; samwho.dev |
| Graph + synchronised state table | Algorithms over graphs (routing, shortest path, dependency order) | Graph, a state table, the current cell boxed, a status line narrating the step | USFCA visualisations |
| Text input drives the figure | Let the reader test their own value (a hostname, a key, an IP) | An input that hashes/looks up/routes what is typed and updates the figure | samwho.dev hashing; explained-from-first-principles tools |
| Live experiment log | Real requests arrive while the reader watches | A log the reader populates by acting (creating DNS records, sending requests) | Mess With DNS (from text) |

### Matching handbook topics to types (starting points)

- Segmentation and firewall rules → packet-flow across zones; rule-match walkthrough; segment × layer explorer.
- VPN, bastion and zero trust → topology-on-a-map pair; control plane vs data plane; access proxy.
- TLS, mTLS and PKI → round-trip ladder pair; attacker ladder; trust-chain story; revocation ladder; byte dissection in an appendix.
- Identity and authorization → login ladder; authorization decision lane; spotlight series on the checkpoint.
- DNS → encapsulation pair; annotated capture; time-stamped cache grid.
- Routing incidents → route propagation (legit vs leaked); controls that would have stopped it.
- DDoS and rate limiting → rate-limit metaphor + decision lane; request/server simulation; attack profile.
- Logging and detection → detection funnel with drop points; alert threshold chart.
- Backup and recovery → RPO/RTO timeline; fault-injection timeline; health grid + log replay (B).
- Hosts and containers → concept grid; orchestrator simulation + config.
- CI/CD and supply chain → attack-path lanes; before-and-after config; controls that would have stopped it.
- Incident response → incident swimlane with evidence artefacts; retry-storm simulation for cascades.

---

## Cross-type micro-patterns

- **Colour means identity everywhere.** Session A is always purple, B orange; operand colours match
  between a figure, its table and the prose; formula terms match diagram labels; red = refused /
  danger, green = success.
- **Label on the figure, not in a legend.** Leader lines to parts; value badges at transitions;
  callout boxes on plateaus; legends only as short status keys (HEALTHY / OUT OF SYNC / CORRUPTED).
- **Bracketed footer notes** `[ same intent, different owner ]` and an orange title with a rule.
- **Small multiples over one crowded figure**; fast/slow pairs; the prose names the one difference.
- **Global controls** (page-level speed, mode) affect every figure on the page — use sparingly.
- **Time**: animation loops with ↻ replay, typewriter terminals, slide dots or segmented progress bars,
  time-dilation sliders, stopwatches.
- **Latency/throughput honesty**: show distributions (percentile toggle, noisy series), not one average.
- **Prose contract**: a lead-in ending in a colon; direct instructions for interactives ("Click Add a
  few times…"); after the figure, point at a specific mark ("the two large boxes near the top").

## Accessibility and fallback (do better than the sources)

The surveyed posts give static images good alt text, but most interactive iframes have no title,
no caption, no `<noscript>` and no static fallback — without JavaScript they are blank. Do not copy
that:
- Every figure renders a meaningful **static final state** server-side, and a **text description**
  (steps, elements, relationships) that also feeds any Markdown/agent export.
- Controls are real buttons with labels; state changes are announced (`aria-live`); motion respects
  `prefers-reduced-motion`; nothing autoplays unless the reader starts it.
- Interactive figures re-initialise after client-side navigation (router page-load event).
- Charts state their data source and date; concept figures say they are conceptual.
- Good models: Sam Rose's simulations expose a labelled group, a hidden description, the current
  configuration and a live state summary; Jepsen's alt text states the *finding* ("about six seconds
  of acknowledged writes are lost"), not the chart type; tls13.xargs.org keeps every annotation as
  static HTML behind expand/collapse. Avoid canvas-only figures with unlabelled `div` sliders.
- Encode series by colour **and** shape or dash, so the figure survives greyscale and colour blindness.
