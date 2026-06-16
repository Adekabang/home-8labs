# Image Generation Prompt Template

Generate each image individually. Replace template variables based on article content — do not combine multiple images into one.

If your runtime can generate images, run each filled block directly. If it cannot (Claude Code, opencode, any text-only agent), output each filled block as a paste-ready prompt for an external image model — **Nano Banana (Gemini)** or **ChatGPT / DALL·E** — one block per image, and ask the model for 16:9.

```text
Generate one standalone 16:9 horizontal article illustration.

Visual DNA:
Pure white background. Minimalist black hand-drawn line art. Slightly wobbly pen lines. Lots of empty white space. Sparse red/orange/blue handwritten annotations in English or Bahasa Indonesia. Clean absurd product-sketch feeling. No gradients, no shadows, no paper texture, no complex background, no commercial vector style, no PPT infographic look, no cute mascot poster, no children's illustration, no realistic UI.

Recurring IP character required:
Tomochi — identical construction to the classic Xiaohei blob: small solid-fill round/bean body, thin stick legs, small thin arms. The ONLY change from the original is color: soft pink (muted warm rose / faded blush — not pastel, not vibrant, think #D4A5A5). Two small white plain dot eyes, evenly placed. Completely blank deadpan face — no eyebrows, no mouth, no sweat, no expression lines, the face never reacts. All emotion comes from BODY POSTURE and the absurd situation, never the face — exaggerate the posture (slumping, straining, bracing, squished, stretched, off-balance, flailing) to match the task. The joke is a totally deadpan blob committed to a ridiculous contraption. Slightly rough hand-drawn outline, not perfectly smooth. Tomochi must perform the core conceptual action, not stand beside it watching. Not sleepy, not panicked, not happy, not cute — flat, earnest, and committed.

Theme:
{article illustration theme}

Structure type:
{structure type: Workflow / System Partial / Before-After Contrast / Character State / Concept Metaphor / Method Layers / Map Route / Mini Comic Panels}

Core idea:
{the core meaning this image should express}

Composition:
{specific scene: where is Tomochi, what is Tomochi doing, what are the main objects, how does information flow}

Suggested elements:
{element 1} / {element 2} / {element 3} / {element 4}

Handwritten labels (English or Bahasa Indonesia):
{label 1} / {label 2} / {label 3} / {label 4} / {optional label 5}

Color use:
Black for main line art. Pink for Tomochi's body. Orange for main flow/path/arrows. Red only for key warnings/problems/results. Blue only for secondary notes or feedback/system state.

Constraints:
One image explains only one core structure. Keep the main subject around 40%-60% of the canvas. Preserve at least 35% blank white space. Use at most 5-8 short handwritten labels. Do not write a title in the top-left corner. Do not write the structure type on the image. Do not make it a formal diagram, course slide, or dense explainer. Do not copy prior examples or reuse known case compositions unless explicitly requested; invent a fresh visual metaphor for this specific article. It should be clear but not instructional, interesting but not childish, strange but clean.
```

## Image Editing Prompts

Remove a top-left title:

```text
Edit the provided image. Remove only the handwritten title "{text to remove}" and its underline from the top-left corner. Fill that area with the same clean white background, matching the surrounding blank paper. Preserve everything else exactly: characters, labels, paths, line style, composition, aspect ratio, and image quality. Do not add any new text or objects.
```

Enhance Tomochi's involvement:

```text
Regenerate with same core meaning and layout, but make Tomochi the action subject, not decoration. Keep the face completely blank and deadpan — let the BODY carry everything: exaggerate the posture (slump, strain, brace, squished, off-balance) so the absurd situation reads, not the face. Keep it clean, sparse, hand-drawn. Identical Xiaohei shape, soft pink, flat and committed.
```
