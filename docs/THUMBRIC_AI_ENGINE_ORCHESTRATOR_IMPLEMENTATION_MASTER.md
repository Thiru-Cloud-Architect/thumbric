# THUMBRIC — AI THUMBNAIL ENGINE MASTER IMPLEMENTATION PROMPT
## AI Orchestrator + Creative Director + Image Generation + Critic + Editable Editor
### Cursor Agent Team Directive
**Date:** 2026-10-08

> **Implementation priority:** Make the AI thumbnail workflow excellent before expanding the rest of the roadmap.


## 0. EXECUTIVE DIRECTIVE

Build Thumbric as an **AI Creative Director + Professional Thumbnail Studio**, not a prompt-to-image wrapper. The AI should understand the creative strategy, generate useful visual assets, critique the result, and perform targeted edits while Thumbric's structured editor remains the source of truth.

Do not rebuild the entire app. First inspect the existing repository and current AI/editor implementation, then implement this plan vertically.

## 1. CURRENT MARKET LESSONS

Current category leaders point to four valuable patterns:

- **Pikzels:** prompt-to-thumbnail, Recreate from an existing thumbnail, natural-language Edit, scoring, One-Click Fix, Persona, reusable Style, title generation.
- **vidIQ:** YouTube-aware packaging, video/URL context, references/assets and natural-language thumbnail editing.
- **Canva:** AI generation tightly integrated with a mature professional editor.

Thumbric should learn from these without copying them.

**Thumbric wedge:** AI creative strategy + genuinely editable thumbnail composition + excellent UX.

## 2. MODEL STRATEGY

Use a provider abstraction and model router.

Current Google direction:
- **Nano Banana 2.1** (`gemini-nano-banana-2.1`): preferred high-efficiency image generation/editing workhorse for new production experimentation.
- **Nano Banana 2 / Gemini 3.1 Flash Image** (`gemini-3.1-flash-image`): high-efficiency workhorse.
- **Nano Banana 2 Lite / Gemini 3.1 Flash Lite Image** (`gemini-3.1-flash-lite-image`): fastest/cheapest option.
- **Nano Banana Pro / Gemini 3 Pro Image** (`gemini-3-pro-image`): premium option for complex visual work.

Do NOT start new production work on deprecated Gemini 2.5 Flash Image.

The exact model IDs must be validated against Google's current API before deployment.

## 3. PROVIDER ABSTRACTION

Create:

```text
AIProvider
  generateImage()
  editImage()
  analyzeImage()
  generateText()
  createDesignSpec()
  critiqueDesign()

AIProviderRouter
  GeminiProvider
  FutureProvider
  FallbackProvider
```

Do not scatter provider/model names through UI components. Model configuration belongs server-side and must be replaceable without changing product logic.

## 4. TARGET ARCHITECTURE

Implement:

```text
User idea
  ↓
Content Parser
  ↓
Creative Director
  ↓
Thumbnail Design Specification
  ↓
Concept Strategy Engine
  ↓
Asset Planner
  ↓
Image Generation
  ↓
Composition Assembler
  ↓
AI Critic
  ↓
Targeted Patch OR Regeneration
  ↓
Thumbric Editor
  ↓
Mobile Preview
  ↓
Export
```

The generated raster image is NOT the source of truth. `ThumbnailDocument` is.

## 5. CONTENT PARSER

Accept minimal natural language such as:

- “I tested 10 AI coding tools.”
- “5 mistakes first-time home buyers make.”
- “Why I quit my corporate job.”
- “Best budget phone under 20000.”

Infer:
`topic, audience, promise, subject, emotion, stakes, novelty, hook, contentType, niche`.

Do not force a questionnaire. If a missing detail is genuinely critical, ask at most one concise question.

## 6. CREATIVE DIRECTOR

The Creative Director answers:

> What is the most compelling way to package this idea visually?

Produce:
`audience, promise, tension, emotional trigger, curiosity gap, primary visual, secondary visual, recommended headline, visual metaphor, composition, color direction`.

It must create strategy, not merely paraphrase the user's prompt.

## 7. STRATEGY LIBRARY

Maintain a controlled taxonomy:

`Curiosity, Warning, Contrarian, Transformation, Outcome, Comparison, Before/After, Problem/Solution, Reveal, Authority, Emotion, Shock, Challenge, Experiment, Discovery, Mistake, Secret, Prediction, Failure, Winner, Loss, Time Pressure, Money, Status, Fear, Surprise`.

Choose the strongest strategies for the specific content.

## 8. THREE-CONCEPT RULE

Three concepts must be genuinely different.

Example for “I tested 10 AI coding tools”:

- **Winner:** creator + winning tool, “I FOUND THE ONE”
- **Battle:** tools competing, “10 AI TOOLS”
- **Contrarian:** rejecting a popular tool, “STOP USING THIS”

Do NOT create three color variants of the same composition.

## 9. STRUCTURED DESIGN SPEC

Create a structured design spec before image generation:

```json
{
  "conceptId": "concept-a",
  "strategy": "comparison",
  "emotion": "curiosity",
  "audience": "developers",
  "promise": "find the best AI coding tool",
  "headline": "I FOUND THE ONE",
  "composition": {
    "layout": "subject-right-text-left",
    "focalPoint": "creator-face"
  },
  "visualDirection": {
    "style": "premium-tech",
    "lighting": "dramatic",
    "contrast": "high",
    "background": "dark futuristic coding environment"
  },
  "assets": [],
  "text": {
    "headline": "I FOUND THE ONE",
    "placement": "left",
    "lineCount": 2,
    "emphasis": ["ONE"]
  }
}
```

Schema may evolve; structured intent must remain.

## 10. THUMBNAILDOCUMENT

Create a canonical `ThumbnailDocument`:

```json
{
  "version": 1,
  "canvas": {"width": 1280, "height": 720},
  "background": {},
  "layers": [],
  "brandKit": {},
  "metadata": {
    "strategy": "curiosity",
    "generationId": "..."
  }
}
```

The editor owns this document.

## 11. LAYER MODEL

Minimum layer types:

`background, background-overlay, subject, secondary-subject, headline, subheadline, shape, badge, logo, effect`.

Stable IDs required.

Common properties:
`x, y, width, height, rotation, opacity, visible, locked, zIndex`.

Text:
`content, fontFamily, fontSize, fontWeight, color, stroke, strokeWidth, shadow, lineHeight, letterSpacing, alignment, case, maxWidth`.

Image:
`assetId, crop, scale, position, rotation, opacity, mask, filter`.

## 12. TEXT MUST REMAIN EDITABLE

Normal thumbnail headline/subheadline text must be rendered by Thumbric's editor, not permanently rasterized by the image model.

AI may decide:
- wording
- placement
- line count
- emphasis
- hierarchy

Benefits:
- correct spelling
- editability
- deterministic typography
- localization
- easy AI text changes.

## 13. IMAGE GENERATION

Construct image-model prompts from:

`content + strategy + designSpec + assets + brandKit + style + composition + aspect ratio + constraints`.

The image model should focus primarily on visual assets, subjects, environments, lighting and composition.

Keep the main headline area visually clean so deterministic text can be overlaid.

## 14. REFERENCE IMAGES

Support:
- creator photo
- product image
- existing thumbnail
- reference thumbnail
- logo
- background reference
- style reference
- screenshot

Classify each as:
`identity, composition, style, object, brand`.

Do not treat all references identically.

## 15. RECREATE / INSPIRE MODE

Future feature:

> Use this thumbnail as inspiration

Analyze:
`composition, subject placement, text hierarchy, color relationships, visual density, focal point, style`.

Create an original composition around the user's content/assets. Do not simply clone protected artwork or another creator's branding.

## 16. AI CRITIC

After generation, run multimodal critique.

Evaluate:
`focal point, composition, subject prominence, contrast, clutter, text-region cleanliness, visual hierarchy, emotion, curiosity, niche fit, mobile suitability, reference fidelity`.

Return structured results:

```json
{
  "score": 87,
  "issues": [
    {
      "severity": "medium",
      "area": "subject",
      "problem": "Creator is too small",
      "action": "Increase subject scale by approximately 20%"
    }
  ]
}
```

## 17. QUALITY SCORE

Use a **Thumbnail Quality Score**, not unsupported CTR prediction.

Initial categories:
`Visual hierarchy, Focal point, Contrast, Text readability, Mobile readability, Clarity, Curiosity, Composition, Brand consistency`.

Make it diagnostic. Do not claim scientific validity until validated.

## 18. AI INTENT ROUTER

Classify natural-language edits:

`TEXT_EDIT
SUBJECT_EDIT
BACKGROUND_EDIT
ASSET_REPLACEMENT
COLOR_EDIT
STYLE_EDIT
COMPOSITION_EDIT
NEW_VARIATION
NEW_CONCEPT
CRITIQUE`.

Examples:
“Make my face bigger.” → SUBJECT_EDIT
“Shorten the headline.” → TEXT_EDIT
“Darken the background.” → BACKGROUND_EDIT
“Give me something completely different.” → NEW_CONCEPT.

## 19. AI PATCH VS REGENERATION

Prefer deterministic editor patches for local changes:

- text
- position
- size
- color
- opacity
- crop
- layer changes
- background adjustments

Regenerate only for:
- fundamentally new visual
- changed subject
- new environment
- major composition change
- new concept.

The smallest reliable operation should win.

## 20. AI COMMAND MODEL

AI must output structured commands, never arbitrary code.

Examples:

```json
{"operation":"resize","target":"layer:subject","scale":1.2,"preserveCenter":true}
```

```json
{"operation":"replaceText","target":"layer:headline","value":"THIS ONE WINS"}
```

Validate every operation before applying it.

## 21. TRANSACTIONAL AI EDITS

A multi-operation AI edit should become one editor history transaction.

Example “Make this more dramatic”:
1. darken background
2. enlarge subject
3. strengthen headline contrast

One Undo should reverse the complete AI action.

## 22. VERSION HISTORY

Every AI action creates a recoverable version:

`Original → AI Concept → Manual Edit → AI Larger Face → AI Shorter Headline → Final`.

Provide:
`Compare, Restore, Duplicate`.

Never destroy the original.

## 23. IMPROVE THIS THUMBNAIL

Make this a signature Thumbric action:

> ✨ Improve this thumbnail

Pipeline:
`Current design → Critic → Top 3 opportunities → Fix all / Review individually`.

Example:
1. Face is too small.
2. Headline is too long.
3. Background competes with subject.

For local problems, apply actual layer patches instead of regenerating the entire image.

## 24. MAKE 3 BETTER VERSIONS

Inside the editor:

> ✨ Make 3 better versions

Create three packaging strategies while preserving the core content.

Label them clearly as:
`Curiosity, Emotion, Outcome` or other appropriate strategies.

Distinguish:
- **Concept** = different strategy
- **Variation** = same strategy, different execution
- **Refinement** = small improvement.

## 25. MOBILE CREATIVE CHECK

Before final export, render/check approximately:

`1280×720`
`320×180`
`168×94`

Critic questions:
- Is the subject still identifiable?
- Is the headline readable?
- Is the focal point obvious?
- Does the visual story survive at small size?

Offer:
> Fix for mobile.

## 26. GENERATION UX

Use meaningful stages instead of a generic spinner:

`Understanding your video…
Finding the strongest hooks…
Building three creative directions…
Creating the visuals…
Preparing editable layers…`

Messages should correspond to actual stages where practical. Do not fake precise percentage progress.

## 27. GENERATION JOB STATE

Each generation should have:

`generationId
projectId
userId/anonymousSessionId
model
provider
promptVersion
designSpecVersion
status
createdAt
startedAt
completedAt
latency
costEstimate
actualCost
errorCode`

States:
`QUEUED, PLANNING, GENERATING, CRITIQUING, ASSEMBLING, COMPLETED, FAILED, CANCELLED`.

## 28. IDEMPOTENCY AND RETRIES

Every generation request needs an idempotency key.

A browser retry must not double-charge or create duplicate jobs.

Retry transient failures:
`timeout, 429, temporary provider error`.

Do not retry:
`invalid input, policy rejection, malformed request, insufficient credits`.

Use bounded exponential backoff.

## 29. FALLBACK

Preferred flow:

`Primary model → bounded retry → fallback model/provider → recoverable user message`.

Do not silently downgrade quality without a clear internal policy.

## 30. PARTIAL SUCCESS

If 2 of 3 concepts succeed, show the 2.

Provide:
> One concept couldn't be generated.
> [Retry concept 3]

Do not throw away successful work because one candidate failed.

## 31. PRIVACY

Creators may upload unpublished videos, faces, client assets and screenshots.

Document:
- what is sent to AI providers
- retention
- deletion
- whether provider data may be used for training
- storage duration

Do not make privacy promises unsupported by the actual architecture.

## 32. NO VIDEO / YOUTUBE DEPENDENCY

The primary workflow must work with:

`text + optional image + optional face + optional reference`.

Video understanding and YouTube OAuth are future optional workflows.

Do not force either one to create a thumbnail.

## 33. CREATOR PERSONA — FUTURE

After the core workflow is excellent:

`3–5 creator photos → reusable Persona`.

Do not claim model training if this is only reference conditioning.

Persona should preserve identity while allowing different expressions/compositions.

## 34. STYLE PROFILE — FUTURE

Allow users to supply 3–5 thumbnails representing their preferred look.

Extract:
`palette, typography direction, density, framing, contrast, background style, composition patterns`.

Then:
> Create in my style.

Do not fine-tune a model unless evidence justifies the complexity.

## 35. TITLE + THUMBNAIL PACKAGING — FUTURE

Eventually:

`Video idea → title candidates → thumbnail concepts → title/thumbnail pairing → packaging analysis`.

Evaluate whether title and thumbnail complement rather than duplicate each other.

## 36. COST STRATEGY

Optimize for **cost per successful exported thumbnail**, not cost per generation.

Track:
`generation cost + retries + refinements / successful export`.

Use standard models for normal generation and premium models only when complexity or quality thresholds justify them.

## 37. CURRENT GEMINI COST BENCHMARK

Google's current pricing should be verified before production billing is implemented.

At preparation time, Google lists approximately:
- Gemini 3.1 Flash Image / Nano Banana 2: $0.067 at 1K, $0.101 at 2K, $0.151 at 4K.
- Gemini 3.1 Flash Lite Image: about $0.0336 per 1K image.
- Gemini 3 Pro Image / Nano Banana Pro: about $0.134 at 1K/2K and $0.24 at 4K.

Pricing can change. Do not hard-code these figures into user billing.

## 38. MODEL BENCHMARK

Before choosing the production default, test at least 100 representative prompts across:

`Gaming, Finance, Technology, AI, Education, Business, Real Estate, Podcast, Commentary, News, Fitness, Travel, Food, Lifestyle, Faceless YouTube`.

Compare:
`prompt adherence, composition, realism, reference fidelity, face consistency, background quality, text-region cleanliness, thumbnail suitability, mobile suitability, latency, cost`.

Store results in `AI_MODEL_BENCHMARK.md`.

## 39. HUMAN EVALUATION

For benchmark outputs, humans score 1–5:

`Hook
Clarity
Visual hierarchy
Subject quality
Composition
Emotion
Mobile readability
Originality
Niche fit
Professionalism`

Track model averages. AI critic scores alone are insufficient.

## 40. PRODUCT METRICS

Do not optimize for number of images generated.

Track:

`generation → concept selected
concept selected → editor opened
editor opened → export
export → repeat creation`.

The key early metric is successful creators returning to create another thumbnail.

## 41. MOCK AI PROVIDER

Create `MockAIProvider` with deterministic:
- generation
- critic
- patch
- failure
- timeout

Use it in CI and local development so every test does not spend API money.

## 42. PROVIDER CONTRACT TESTS

Every provider must implement the same contract.

Run contract tests against:
`Mock, Gemini, future providers`.

The UI must not care which provider generated the result.

## 43. PROMPT VERSIONING

Version prompts:

```text
prompts/
  creative-director/v1
  image-generation/v1
  critic/v1
  edit-router/v1
```

Every generation records:
`promptTemplateId + promptVersion + model`.

## 44. FEATURE FLAGS

Support controlled experiments for:

`AI_IMAGE_MODEL
AI_PROMPT_VERSION
AI_CRITIC_VERSION
AI_DESIGN_SPEC_VERSION`.

Measure actual user outcomes before changing defaults.

## 45. ANONYMOUS USER SUPPORT

Do not require authentication just to prove that the product works.

Use:
`anonymousSessionId`.

Allow a small free usage allowance, subject to abuse controls.

When the user wants to save persistent projects:

`anonymous session → signup → claim/merge project`.

Authentication should solve a user problem, not merely collect an email.

## 46. AUTHENTICATION TIMING

Preferred early funnel:

`Try → Create → Edit → Preview → Export → Save/history → Signup`.

Only introduce a hard signup wall earlier if abuse economics make it necessary.

## 47. AI CREATION UX

Composer:

```text
What is your video about?
[ ... ]

Add assets:
[ My photo ] [ Images ] [ Reference ] [ Existing thumbnail ]

Creative direction:
[ Curiosity ] [ Dramatic ] [ Premium ]
[ Contrarian ] [ Surprise me ]

[ Create 3 concepts ]
```

Natural language should be enough.

## 48. CONCEPT RESULTS

Show:

`I found 3 ways to package your video.`

Each card:
- thumbnail visual
- strategy
- short “why it works”
- quality score
- Open in editor

Avoid exposing technical model/provider details.

## 49. REGENERATION

If the user dislikes all concepts:

> Generate 3 new directions

The Creative Director must deliberately choose different strategies. Do not simply rerun the same prompt.

## 50. FAILURE UX

Generation failure:

> We couldn't finish this concept.
> Your project is safe.
> No generation credit was charged.
> [Try again] [Try another model] [Edit the idea]

Preserve prompt/assets and do not lose successful concepts.

## 51. SECURITY

Required:
- server-side provider API keys
- authorization
- anonymous rate limits
- request size limits
- signed asset URLs
- upload validation
- provider timeouts
- response validation
- prompt/input sanitization
- cost controls

Never expose provider credentials in frontend code.

## 52. AI COMMAND SECURITY

AI output is untrusted data.

Never allow the model to execute arbitrary JavaScript or arbitrary state mutation.

AI returns an approved command schema. The application validates:
`project ownership, layer existence, allowed operation, numeric bounds, permissions`.

Then the command executor applies it.

## 53. OBSERVABILITY

Track every generation:

`requestId
generationId
provider
model
latency
status
cost
errorCode
retryCount`.

Dashboard:
`success rate, failure rate, P50/P95 latency, cost, export conversion, regeneration rate, user feedback`.

## 54. FRONTEND STATE MACHINE

Do not represent generation using many unrelated booleans.

Use:
`idle → planning → generating → critiquing → assembling → completed/failed/cancelled`.

This prevents impossible UI states.

## 55. BILLING / CREDIT SAFETY

If credits are introduced, define a deterministic policy.

Generation requests need idempotency and reconciliation so:
- retries do not double-charge
- failed generations are handled consistently
- provider completion and credit state cannot disagree silently.

## 56. REQUIRED API CONTRACTS

Adapt to the existing architecture, but conceptually provide:

`POST /api/ai/plan
POST /api/ai/generate
POST /api/ai/critique
POST /api/ai/edit
GET /api/ai/generation/:id
POST /api/ai/generation/:id/retry`

Return structured data, not UI-formatted prose.

## 57. EDITOR HANDOFF

`Open in editor` must create a real editable document.

Whenever possible:
`background, subject, headline, subheadline, logo, shapes, effects`
should be separate layers.

If something is necessarily baked into a generated bitmap, represent it honestly as raster content. Never fake editability.

## 58. AI BACKGROUND

Support:

> Change background

while preserving creator, headline, logo and other layers.

Generate/replace only the background when the user asks for a background change.

## 59. SUBJECT REPLACEMENT

Future:

> Replace the person with me.
> Replace this product with my product.

Preserve composition, approximate scale, position and lighting intent where possible.

## 60. AI STYLE EDITING

Examples:
- Make it more premium.
- Make it darker.
- Make it more energetic.
- Make it look like a finance channel.

Prefer changing structured style properties or targeted assets before full regeneration.

## 61. RELEASE PHASE 1

Implement only:

`Creative Director
Design Spec
Preferred Gemini image integration
Provider abstraction
ThumbnailDocument
3 distinct concepts
AI critic
Basic AI patch operations
Generation job state
Retries
Failure recovery
Mock provider
Benchmark harness
Editable text
Basic image/background layers`.

Do not implement Persona, Recreate, YouTube analytics, A/B testing or video intelligence until this core pipeline is stable.

## 62. RELEASE PHASE 2

Then add:

`Improve this thumbnail
Make 3 better versions
Reference thumbnail
Style reference
Creator Persona
Style Profile`.

## 63. RELEASE PHASE 3

Then:

`Title generation
Title + thumbnail packaging
YouTube-aware recommendations
Historical performance
Channel intelligence`.

## 64. RELEASE PHASE 4

Then:

`YouTube connection
A/B testing
Actual performance feedback
Channel-specific learning`.

## 65. REQUIRED DOCUMENTS

Create/update:

```text
docs/THUMBRIC_AI_ARCHITECTURE.md
docs/AI_MODEL_BENCHMARK.md
docs/AI_PROMPT_ARCHITECTURE.md
docs/AI_EVALUATION_RUBRIC.md
docs/THUMBNAIL_DOCUMENT_SCHEMA.md
docs/AI_COST_MODEL.md
docs/AI_FAILURE_HANDLING.md
```

Also create `AI_CURRENT_STATE_AUDIT.md` before substantial implementation.

## 66. REQUIRED MODULE SHAPE

Adapt names to the existing repository:

```text
ai/
  orchestrator/
  providers/
  router/
  creative-director/
  image-generation/
  critic/
  edit-router/
  prompt-templates/
  schemas/
  evaluation/

editor/
  document/
  layers/
  commands/
  history/
  renderer/

generation/
  jobs/
  state-machine/
  billing/
  retries/
```

Do not create duplicate architecture if equivalent modules already exist.

## 67. END-TO-END TEST

Automate the critical flow:

`Landing → Create with AI → prompt → generation → 3 concepts → choose → editor → edit text → move subject → AI improve → mobile preview → export`.

Also test:
- provider failure
- timeout
- retry
- duplicate click
- browser refresh
- network interruption
- anonymous-to-account project handoff.

## 68. FINAL QUALITY GATE

Do not call the AI engine production-ready until:

- 3 concepts are genuinely different
- generated concepts are useful often enough in benchmark tests
- important text is editable
- local AI edits preserve intent
- full regeneration is used only when necessary
- failures preserve user work
- retries are idempotent
- provider keys are server-side
- generation cost is measurable
- mock provider works
- E2E flow passes
- mobile preview works
- export works
- users can undo AI changes.

## 69. FINAL PRODUCT EXPERIENCE

The target experience:

```text
I have an idea.
   ↓
Thumbric understands it.
   ↓
Here are three smart ways to package it.
   ↓
I choose one.
   ↓
Everything important is editable.
   ↓
Thumbric identifies weaknesses.
   ↓
Fix it.
   ↓
Show me stronger versions.
   ↓
Check mobile.
   ↓
Export.
```

The product should feel like:

> **Thumbric — an AI Creative Director and Professional Thumbnail Studio.**

Do not build another AI image generator.

## 70. CURRENT EXTERNAL REFERENCE NOTES

This directive is informed by current public product/model documentation:

- Google currently positions Nano Banana 2.1 as its high-efficiency image-generation/editing workhorse and Nano Banana Pro as the premium complex-visual option.
- Pikzels currently emphasizes Prompt, Recreate, Edit, Score, One-Click Fix, Persona and Style.
- The strategic lesson is that dedicated thumbnail products are moving from “generate an image” toward “create, evaluate, edit and iterate packaging.”

Agents should verify current provider docs/pricing at implementation time rather than treating this document's model/pricing values as permanent.