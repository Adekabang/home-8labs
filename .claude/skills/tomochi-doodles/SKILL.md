---
name: tomochi-doodles
description: Generate Tomochi-style inline illustrations for English and Bahasa Indonesia articles. Use when the user asks to generate "absurd", "Tomochi", "hand-drawn", "inline illustration", "article illustration", "illustration suggestion", "shot list", "remove title/edit image" for English or Bahasa Indonesia articles, posts, blogs, Notion documents, workflow docs, methodologies, flows, structures, states, metaphors, or ideas; default visual style uses the Tomochi IP, pure white hand-drawn art, sparse red/orange/blue annotations, clean and creative.
---

# Tomochi Doodles

## Core Purpose

Design and generate 16:9 landscape inline illustrations for English and Bahasa Indonesia articles. The goal is not commercial illustrations, PPT infographics, or cute cartoons — it's turning key judgments, flows, structures, states, or metaphors from the article into clean, absurd, creative, readable-but-not-instructional hand-drawn explanation images.

The default visual IP is "Tomochi": the original Xiaohei blob with one change — soft pink instead of black. Same shape, same thin legs, same plain white dot eyes, same completely blank deadpan face. All emotion comes from BODY POSTURE and the absurd situation, never the face — exaggerate the posture (slump, strain, squish, off-balance) so the predicament reads. The joke is a deadpan blob committed to a ridiculous task. Tomochi must participate in the core action, not just stand beside it as decoration.

## Read These References

Load as needed — do not load all at once:

- `references/style-dna.md`: Style DNA, colors, text, prohibitions.
- `references/tomochi-ip.md`: Tomochi IP appearance, personality, action library, prohibitions.
- `references/composition-patterns.md`: Structure types, original metaphor methods, anti-copy rules.
- `references/prompt-template.md`: Single-image generation prompt template.
- `references/qa-checklist.md`: Post-generation check and iteration rules.
- `assets/examples/`: Low-frequency visual calibration only — do not include in default generation path. Do not copy compositions, objects, or annotations from these examples.

## Workflow

### 1. Digest the Article

First read the user's article, link, Notion page, Markdown file, or screenshot content. Extract:

- What the core ideas are
- Which paragraphs carry cognitive turning points
- Which content is suitable for image explanation
- Which parts are text-only and don't need images

Don't illustrate everything evenly. Prioritize "cognitive anchors" based on the article type:

- **Tech / AI / Dev tools**: system diagrams with a twist, tool workflow before/after, the moment where automation kicks in, what breaks when something isn't set up right
- **Startup / Business**: decision points, the gap between assumption and reality, resource tradeoffs, growth levers vs. common traps
- **Productivity / PKM**: system layers, input→process→output loops, the difference between scattered and organized, habit/workflow breakdowns
- **Personal / Essay**: emotional state transitions, a metaphor for the central insight, the "before I understood this" vs "after" moment

Universal cognitive anchors (any topic): core judgment, two-state contrast, input/output loop, handoff path, common pitfall, role/responsibility map.

**Language**: auto-detect from the article. If the article is in Bahasa Indonesia, annotations should be in Bahasa Indonesia. If English, annotations in English. If mixed, follow the dominant language.

### 2. Output Illustration Strategy First

If the user only says "analyze how to illustrate / think about which parts need images", give a shot list first. For each image specify:

- Which paragraph it follows
- Image theme
- Core meaning
- Structure type
- What Tomochi is doing in the image
- Suggested elements
- Suggested annotation words (English or Bahasa Indonesia)

Default 4–8 images. For short articles, 1–3; for long articles, don't exceed 9. Enough is enough — avoid turning the article body into a picture book.

### 3. Single Image Generation

**First, check whether your runtime can generate images itself.**

- **If it can** (e.g. Codex `image_gen`, a Custom GPT with DALL·E, an agent with an image tool): when the user says "generate / output / make / create images", don't stop to ask for confirmation — generate each image individually. Do not combine multiple images into one.
- **If it cannot** (e.g. Claude Code, opencode, or any text-only agent): do not pretend to generate. Instead, for each image fill in the prompt template completely and output the finished, ready-to-paste prompt blocks so the user can run them in an external image model. State up front that these are paste-ready prompts. Recommend the target model:
  - **Nano Banana (Gemini image generation)**: paste one filled prompt per image. Best for the hand-drawn line look; ask for 16:9.
  - **ChatGPT / DALL·E**: paste one filled prompt per image into a chat with image generation enabled.

  Output one fenced code block per image (one image per block, never combined) so each is copy-clean. After the blocks, give a one-line note per image on what it shows. Skip step 5 (Save and Deliver) — there are no generated files to save; the user runs the prompts and saves the results themselves.

Each image explains only one core structure. Prompts must include:

- 16:9 landscape article illustration
- Pure white background
- Black hand-drawn line art
- Sparse red/orange/blue handwritten annotations in English or Bahasa Indonesia
- Lots of blank space
- Tomochi as the core action subject
- Prohibit PPT, commercial illustrations, cute/childish, complex architecture, top-left type titles

Do not copy past examples. Examples only provide style density and Tomochi's involvement mode — do not directly reuse these existing compositions: conveyor belt breakpoints, Tomochi pulling judgment lever inside content machine, Tomochi becoming a funnel sorting traffic/trust/conversion, Tomochi slicing the material fish, Tomochi leading the handoff path, Tomochi pulling three-layer information sources, three Tomochis holding megaphone/building bridge/opening door, Tomochi stamping the handoff copy toolbox, Tomochi holding sign watching common pitfalls path — unless the user explicitly asks to recreate a specific image. Each time, reinvent a strange-but-plausible metaphor fresh from the current article.

### 4. Review and Iterate

After generation, check `references/qa-checklist.md`. Regenerate or locally edit if:

- Tomochi is just decorative
- Canvas is too full
- Looks like a flowchart/PPT
- Too much annotation text or severe typos/errors
- Top-left shows "Common Pitfalls / Flowchart / System Architecture" title
- Art style is too cute, childish, or rigid
- Background is not a clean white

### 5. Save and Deliver

If the user is working in a workspace, copy final images to:

```text
assets/<article-slug>-illustrations/
```

Name sequentially:

```text
01-topic-name.png
02-topic-name.png
```

Keep original generated files — do not overwrite existing assets unless the user explicitly requests replacement.

## Output Format

Pre-generation strategy output should be short and precise. Post-generation delivery should include:

- How many images were generated
- Purpose of each image
- Save path
- Which images are most stable, which are optional

Do not explain style theory at length — let the images speak.
