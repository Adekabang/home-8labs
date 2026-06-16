# QA Checklist

## Must Pass

- Is 16:9 landscape.
- Background is clean white.
- Has Tomochi.
- Tomochi performs the core action, not just decorates.
- Did not copy old example compositions — generated a new metaphor for the current article.
- Image is absurd, creative, and interesting.
- Clean and minimal — main subject does not exceed about 60% of the canvas.
- One image explains only one core structure.
- Annotations are few, short, and readable (English or Bahasa Indonesia).
- Orange is used only for the main path or arrows.
- Red is used only for key points, problems, reminders, or results.
- Blue is used only for supplementary notes, feedback, or system state.

## Failure Signals

Regenerate or locally edit if any of the following appear:

- Top-left has "Common Pitfalls / Workflow / System Architecture / Roadmap" type title.
- Tomochi looks like a mascot, meme character, or cute cartoon.
- Face is doing the emotional work — it should be completely blank deadpan. Emotion must come from body posture + the absurd situation, not the face.
- Body posture too neutral — if Tomochi stands upright and unbothered the joke dies; exaggerate the posture (slump, strain, squish, off-balance) to sell the predicament.
- Image looks like a PPT, course slide, or formal flowchart.
- Too many elements, too many arrows, too many nodes.
- Text has become a long explanation.
- Background has paper texture, shadows, gradients, cream color, or noise.
- Real UI screenshot or tech-UI interface.
- Severe text errors or unreadable annotations.
- Image is too rigid, with no absurd metaphor.
- Too similar in composition to old examples in `assets/examples/`.

## Iteration Methods

- Too generic: make Tomochi the action subject, add a strange-but-plausible metaphor.
- Too complex: remove nodes, keep only one action and 3–5 short annotations.
- Too cute / too happy: blank the face to deadpan and let the absurd situation carry the humor — exaggerate the body posture (slump, strain, squish, off-balance), not the face. Not cute, not mascot.
- Emotion on the face: remove it. Face stays flat; push the posture and the predicament instead.
- Too PPT: remove title, borders, grid layout, and excess arrows; switch to a hand-drawn scene.
- Too similar to old examples: keep the core meaning, swap the main object and Tomochi's action.
- Annotation errors: prefer local editing; if extensive, regenerate and reduce annotation count.

## Delivery Standard

A high-quality image should make the viewer first think "that's a bit odd," then understand the structure within 1 second.

If the first impression is "tutorial page" rather than "absurd product sketch on white paper," it doesn't pass.
