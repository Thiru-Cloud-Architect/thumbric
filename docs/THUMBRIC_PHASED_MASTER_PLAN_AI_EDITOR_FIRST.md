# THUMBRIC — PHASED PRODUCT MASTER PLAN
## Normal Professional Editor + AI Creative Assistant First
### Cursor Agent Implementation Directive

**Date:** 2026-10-08

---

# 1. EXECUTIVE DECISION

This document supersedes the previous instruction to implement the entire long-term Thumbric roadmap immediately.

## The product strategy is now explicitly phased.

### Primary product

> **Thumbric = Professional thumbnail editor + AI creative assistant**

### NOT the primary product

> “Upload your video and let AI make everything.”

Video understanding remains an optional future capability.

This is important because many creators:

- do not want to upload unpublished videos
- work with confidential client content
- may not want to give a third-party service access to their YouTube channel
- may simply have an idea rather than a finished video
- may already have screenshots/photos/assets and only need a thumbnail

Therefore:

> **Video upload and YouTube URL analysis must NEVER be required to use Thumbric.**

The core product must be excellent without access to the user's video.

---

# 2. NORTH-STAR PRODUCT EXPERIENCE

A creator should be able to enter Thumbric and choose:

```text
What do you want to do?

┌────────────────────────────────────┐
│ ✨ Create with AI                  │
│ Tell us about your video           │
│                                    │
│ [ Describe your video...          ]│
│                                    │
│ + Add photo   + Add image          │
│ + Add reference                     │
│                                    │
│       Create 3 concepts →           │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 🎨 Design from scratch             │
│ Use the professional editor        │
│                                    │
│       Start designing →            │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 🩺 Improve my thumbnail             │
│ Upload an existing thumbnail       │
│                                    │
│       Analyze & improve →          │
└────────────────────────────────────┘
```

Optional future capability:

```text
🎬 Understand my video
Paste a YouTube URL or upload video
```

This should be presented as an optional advanced workflow.

---

# 3. PRODUCT PHILOSOPHY

Do not build:

> AI replaces the designer.

Build:

> **AI gives the creator a brilliant starting point and helps them improve it.**

The ideal loop:

```text
Human idea
   ↓
AI creative concepts
   ↓
Human chooses
   ↓
Professional editor
   ↓
AI refinement
   ↓
Human refinement
   ↓
AI improvement
   ↓
Mobile preview
   ↓
Export
```

This is the core product moat.

---

# 4. PHASED ROADMAP

## PHASE 0 — AUDIT CURRENT PRODUCT

**Do not make major feature changes before completing this.**

Agents must inspect:

1. Current live site
2. Current repository
3. Current AI implementation
4. Current editor
5. Current auth
6. Current backend
7. Current SEO
8. Current pricing
9. Current mobile UI
10. Current analytics

Produce:

`AUDIT_REPORT.md`

Classify every issue:

- P0 — broken/trust/correctness/core workflow
- P1 — major product/UX problem
- P2 — polish/growth
- P3 — future

Do not rebuild working components without evidence that they need rebuilding.

---

# 5. PHASE 1 — CORE PRODUCT
# AI + PROFESSIONAL THUMBNAIL EDITOR

This is the immediate priority.

Do NOT implement video upload/YouTube analysis as a dependency for Phase 1.

---

# 6. PHASE 1A — AI CREATIVE GENERATION

Primary input:

> **Tell Thumbric about your video**

Example:

> “My video is about 5 mistakes people make when buying their first house.”

Optional assets:

- User photo
- Product image
- Screenshot
- Logo
- Existing thumbnail
- Reference thumbnail
- Background

Then:

**Create 3 concepts**

---

# 7. AI MUST CREATE STRATEGIES, NOT JUST IMAGES

This is critical.

Do NOT generate three visually similar images.

The AI should first create a structured creative brief.

Example:

```json
{
  "topic": "First-time home buying mistakes",
  "audience": "First-time home buyers",
  "promise": "Avoid expensive mistakes",
  "primary_hook": "Danger / warning",
  "concepts": [
    {
      "strategy": "Warning",
      "emotion": "fear",
      "visual": "house + red warning",
      "text": "DON'T BUY YET"
    },
    {
      "strategy": "Money",
      "emotion": "concern",
      "visual": "money + house",
      "text": "5 COSTLY MISTAKES"
    },
    {
      "strategy": "Contrarian",
      "emotion": "curiosity",
      "visual": "unexpected buying decision",
      "text": "THEY LIED TO YOU"
    }
  ]
}
```

The exact schema may differ, but the architecture should separate:

**content understanding → creative strategy → image generation → editable composition**

---

# 8. THREE-CONCEPT RULE

The three concepts must be meaningfully different.

Possible strategy families:

- Curiosity
- Emotion
- Outcome
- Transformation
- Comparison
- Contrarian
- Authority
- Before/after
- Problem/solution
- Reveal
- Warning
- Story

The AI should select the strongest three for the content.

Never call:

- same composition + different background
- same text + different color
- same image + different crop

“Three concepts.”

Those are variations, not concepts.

---

# 9. AI TEXT MUST REMAIN EDITABLE

Do NOT depend on image-generation models to render final thumbnail text.

AI should determine:

- headline
- optional subheadline
- line count
- emphasis
- placement
- text hierarchy

Then the deterministic editor renders the actual text.

Example:

```json
{
  "headline": "DON'T BUY YET",
  "placement": "left",
  "emphasis": ["DON'T"],
  "font_style": "bold",
  "line_count": 2
}
```

This ensures:

- spelling correctness
- editable text
- predictable typography
- accessibility
- localization
- reliable export

---

# 10. AI CREATIVE DIRECTOR

After generating concepts, Thumbric should explain them.

Example:

> **I found 3 ways to package your video.**

### A — The Warning

Best for creating urgency.

### B — The Money Angle

Best for emphasizing financial consequences.

### C — The Contrarian

Best for curiosity.

This explanation is important.

It makes Thumbric feel intelligent.

---

# 11. AI INPUT UX

Do not make users write perfect prompts.

Use:

```text
What is your video about?

[________________________________________]

Example:
“I tested 10 AI coding tools and found one
that was dramatically better.”

Optional:
[ + Add my photo ]
[ + Add images ]
[ + Add reference thumbnail ]

Creative direction:

[ Curiosity ] [ Emotional ] [ Premium ]
[ Dramatic ] [ Minimal ] [ Contrarian ]
[ Surprise me ]

             Create 3 concepts →
```

Allow natural language.

---

# 12. AI SHOULD WORK WITH MINIMAL INFORMATION

If the user enters:

> “My video is about investing.”

Do not immediately ask 8 questions.

Generate reasonable concepts.

If a missing detail is genuinely critical, ask ONE concise question.

Example:

> Who is the main person viewers should recognize?

Do not create a long questionnaire.

---

# 13. AI REFINEMENT INSIDE THE EDITOR

This is one of the most important Phase 1 features.

The user should be able to say:

> Make this more dramatic.

> Make the face bigger.

> Make the text shorter.

> Make it more premium.

> Make it cleaner.

> Give me a stronger hook.

> Make it look like a finance channel.

> Make the background less busy.

> Give me three different compositions.

> Make it work better on mobile.

> Remove the person.

> Change the subject.

The AI should modify the current design intelligently.

It must NOT simply create an unrelated thumbnail.

---

# 14. “MAKE IT BETTER” BUTTON

A prominent AI action:

### ✨ Improve this thumbnail

Thumbric analyzes the current design.

Example:

> I found three issues:
>
> 1. The main subject is too small.
> 2. The text is difficult to read on mobile.
> 3. The background competes with the face.

Then:

`Fix all`

or:

`Fix one by one`

This can become a signature Thumbric feature.

---

# 15. PHASE 1B — PROFESSIONAL EDITOR

The editor must feel like a focused professional creator tool.

Do NOT make it look like a toy.

Do NOT attempt to become full Canva.

Optimize specifically for thumbnail creation.

---

# 16. EDITOR LAYOUT

Desktop:

```text
┌─────────────────────────────────────────────────────────────┐
│ Back | Project | Undo Redo | Preview | Export              │
├──────────────┬───────────────────────────┬──────────────────┤
│ TOOLS        │                           │ PROPERTIES       │
│              │                           │                  │
│ Layers       │                           │ Selected object  │
│ Text         │         CANVAS            │                  │
│ Images       │                           │ Typography       │
│ Elements     │                           │ Position         │
│ AI           │                           │ Effects          │
│ Templates    │                           │                  │
├──────────────┴───────────────────────────┴──────────────────┤
│ Zoom | Fit | Safe Zone | Mobile Preview                     │
└─────────────────────────────────────────────────────────────┘
```

Mobile:

- Canvas
- Bottom toolbar
- Bottom sheets
- Full-screen property controls

Never simply shrink the desktop editor onto mobile.

---

# 17. LAYER SYSTEM

Every object should support:

- Position
- Width
- Height
- Rotation
- Opacity
- Z-index
- Visibility
- Lock
- Type
- Style metadata

Layer types:

```text
Background
Image
Subject
Headline
Subheadline
Shape
Sticker
Logo
Effect
```

---

# 18. CORE EDITOR CONTROLS

Must support:

### Selection

- Select
- Multi-select
- Move
- Resize
- Rotate
- Duplicate
- Delete
- Lock
- Hide

### Alignment

- Left
- Center
- Right
- Top
- Middle
- Bottom
- Distribute

### Snapping

- Canvas edges
- Canvas center
- Object edges
- Object centers

### History

- Undo
- Redo

### View

- Zoom
- Fit to screen
- 50%
- 100%
- 200%

---

# 19. EDITOR MICRO-UX

This is where many “minor misses” become noticeable.

Every selected object must have:

- obvious selection outline
- sensible resize handles
- rotation handle
- snap feedback
- keyboard support
- delete action

When nothing is selected:

> Select an element to edit it.

When text is selected:

Show text-specific controls.

Do not display 30 unrelated settings at once.

Use progressive disclosure.

---

# 20. TEXT EDITING

Required:

- Direct canvas editing
- Font
- Size
- Weight
- Color
- Stroke
- Shadow
- Background/highlight
- Alignment
- Line height
- Letter spacing
- Case
- Text box resize
- Auto-fit

Presets:

- Bold YouTube
- Clean
- Cinematic
- Finance
- Gaming
- Podcast
- Minimal

---

# 21. IMAGE EDITING

Required:

- Upload
- Replace
- Crop
- Position
- Scale
- Rotate
- Flip
- Opacity
- Remove background
- Mask/crop
- Border
- Shadow

Where possible, preserve the original asset separately from the edited composition.

---

# 22. BACKGROUND REMOVAL

Make this extremely easy.

User uploads a face/photo.

One click:

### Remove background

Then:

- Replace background
- Blur background
- Gradient
- Color
- AI background
- Existing image

This is a core creator workflow.

---

# 23. TEMPLATES

Templates should not just be decorative.

Create template categories:

- Gaming
- Finance
- Education
- Tech
- Podcast
- Vlog
- Reaction
- News/commentary
- Food
- Travel
- Fitness
- Business

Each template should preserve editable layers.

---

# 24. AI + TEMPLATE HYBRID

Very important.

User selects:

> Finance template

Then:

> Create my thumbnail with this style.

AI should populate:

- Subject
- Headline
- Background
- Supporting elements

while preserving the template's design system.

This provides predictable professional results.

---

# 25. CREATOR KIT

Phase 1 can include a lightweight version.

Save:

- Logo
- Brand colors
- Preferred fonts
- Optional face photos
- Preferred thumbnail style

Then:

### Use my brand

AI/editor automatically uses the saved settings.

This should become more sophisticated in Phase 3.

---

# 26. MOBILE PREVIEW

A thumbnail must work at small size.

Add:

### Mobile Preview

At approximately:

```text
168 × 94
```

and:

```text
320 × 180
```

Show:

- Readability
- Face recognition
- Main focal point
- Clutter
- Contrast

This should be available directly from the editor.

---

# 27. YOUTUBE-STYLE PREVIEW

Provide realistic simulated placements:

- Home
- Suggested
- Search
- Mobile
- Desktop

Use generic placeholder content around the user's thumbnail.

Do not imply this is a real YouTube feed.

Label it:

> Simulated preview

---

# 28. THUMBNAIL SCORE

Do not make unsupported CTR predictions.

Use:

### Thumbnail Quality Score

Example:

```text
78 / 100

✓ Strong focal point
✓ Good contrast
⚠ Text could be larger
⚠ Background is busy
```

Categories:

- Visual hierarchy
- Focal point
- Contrast
- Text readability
- Mobile readability
- Clarity
- Curiosity
- Brand consistency

Clearly label this as a heuristic.

Do NOT say:

> “82% chance of getting clicks.”

---

# 29. PHASE 2 — THUMBNAIL DOCTOR

After Phase 1 is polished, build:

### Upload existing thumbnail

Then:

> **Thumbric Doctor**

Analyze:

- focal point
- text
- contrast
- clutter
- hierarchy
- mobile readability
- subject size

Then:

### Fix it

This becomes an excellent free acquisition tool.

---

# 30. THUMBNAIL DOCTOR GROWTH FUNNEL

Ideal:

```text
Visitor
 ↓
Upload thumbnail
 ↓
Free analysis
 ↓
Score
 ↓
3 problems
 ↓
“Fix with Thumbric”
 ↓
AI creates improved version
 ↓
Signup required to save/export/history
```

This is much stronger than:

> “Sign up to use our AI generator.”

---

# 31. PHASE 3 — CREATOR PERSONALIZATION

Expand Creator Kit.

Allow:

- 3–10 face photos
- logo
- colors
- fonts
- recurring objects
- preferred layouts
- typical expressions
- style preferences

Then:

> Create my next thumbnail in my style.

The user should feel:

> “Thumbric knows how my channel looks.”

---

# 32. PHASE 4 — OPTIONAL VIDEO INTELLIGENCE

Only after the core experience is excellent.

Add:

### Understand my video

Options:

- YouTube URL
- Video upload

This is OPTIONAL.

Never require it.

---

# 33. PRIVACY-FIRST VIDEO EXPERIENCE

Clearly communicate:

> **You don't need to upload your video.**

For users who choose video:

> Choose what you share.

Explain:

- what is uploaded
- how long it is retained
- whether it is used for model training
- how to delete it

Never make unsupported privacy promises.

Provide deletion controls.

---

# 34. PHASE 5 — YOUTUBE PERFORMANCE LOOP

Future:

Connect YouTube.

Thumbric can show:

- thumbnail
- title
- impressions
- CTR
- views
- watch time
- historical performance

Then:

> This video's packaging is underperforming your channel baseline.

Then:

### Generate alternatives

Important:

Do not claim a generated thumbnail will increase CTR.

Use language like:

> “Potential improvement based on design heuristics.”

For actual experiment results, use real YouTube data.

---

# 35. PHASE 6 — A/B TESTING / LEARNING

Future workflow:

```text
A — Curiosity
B — Outcome
C — Emotion
```

Then track actual results.

Store:

- Variant
- Date
- Test
- Result
- Creative differences

Eventually Thumbric learns:

> “Your audience tends to respond better to close-up facial expressions and shorter text.”

This becomes the long-term moat.

---

# 36. OPTIONAL VIDEO ARCHITECTURE

When Phase 4 begins, use:

```text
Browser
 ↓
Signed upload URL
 ↓
Object storage
 ↓
Queue
 ↓
Video analysis worker
 ↓
Transcript/frame extraction
 ↓
Creative Brief
 ↓
Image generation
 ↓
Results
```

Do not keep giant video processing requests open in the browser.

---

# 37. AUTHENTICATION — PRODUCTION REQUIREMENTS

Current prototype-style localStorage authentication must NOT become the production source of truth.

Recommended:

### Sign in

- Continue with Google
- Continue with email

Prefer magic links initially.

Signup should be lightweight.

Do not ask for unnecessary information.

---

# 38. AUTH CONVERSION STRATEGY

Do not require signup before the first useful result.

Preferred:

```text
Visit
 ↓
Try
 ↓
Create/Analyze
 ↓
See result
 ↓
Save / Export / History
 ↓
Signup
```

Signup value proposition:

> Save your work and continue on any device.

---

# 39. ACCOUNT PAGE

Provide:

- Name
- Email
- Plan
- Usage
- Projects
- Creator Kit
- Billing
- Connected accounts
- Preferences
- Export data
- Delete account
- Logout

---

# 40. BACKEND

Production SaaS needs a real database.

Possible architecture:

## Fast path

Supabase:

- Auth
- Postgres
- Storage
- Row-level security

Cloudflare:

- CDN
- Workers
- AI proxy
- rate limiting
- caching

## Cloudflare-native

- Workers
- D1
- R2
- Queues
- Durable Objects when justified
- Turnstile
- KV for cache/config, NOT primary relational user storage

Choose one architecture and document it.

Do not create a hybrid mess without reason.

---

# 41. DATA MODEL

Minimum:

```text
users
profiles
subscriptions
usage
projects
thumbnails
thumbnail_variants
assets
creator_kits
ai_generations
generation_jobs
feedback
feature_requests
referrals
events
```

Future:

```text
youtube_channels
youtube_videos
experiments
experiment_variants
```

---

# 42. AI GENERATION RECORD

Store:

```text
generation_id
user_id
project_id
status
provider
model
prompt_version
input_type
input_asset_ids
started_at
completed_at
latency
estimated_cost
retry_count
error_code
output_asset_ids
```

This is necessary for:

- debugging
- quality evaluation
- billing
- support
- model comparison
- prompt iteration

---

# 43. AI PROVIDER ABSTRACTION

Do not couple the whole app to one provider.

Interfaces:

```text
ImageGenerationProvider
VisionProvider
TextReasoningProvider
BackgroundRemovalProvider
```

The provider can be changed later.

---

# 44. AI QUALITY BENCHMARK

Create an internal test set.

At least 100 prompts covering:

- Finance
- Tech
- Gaming
- Education
- Food
- Travel
- Fitness
- Business
- Podcast
- Vlog
- Indian creators
- Tamil creators
- Faceless channels

Evaluate:

- prompt adherence
- subject correctness
- composition
- text correctness
- thumbnail suitability
- mobile readability
- concept diversity
- visual quality

Every major prompt/model change should be regression-tested.

---

# 45. AI FEEDBACK

After generation:

> How did we do?

👍 Great
😐 Could be better
👎 Missed the mark

If negative:

- Didn't understand
- Face wrong
- Text wrong
- Composition poor
- Too generic
- Not enough variety
- Not professional
- Too slow
- Other

Store the feedback with:

- generation ID
- prompt version
- model
- user
- project

---

# 46. BUG REPORTING

Provide:

### Report a problem

Automatically attach where appropriate:

- app version
- browser
- device class
- route
- error ID
- generation ID

Do not upload private assets automatically.

---

# 47. FEATURE REQUESTS

Provide:

### Request a feature

Fields:

- Request
- Why
- Frequency
- Optional screenshot

Eventually allow voting.

---

# 48. PRICING

Do not overcomplicate pricing in Phase 1.

Start with:

### Free

For trying Thumbric.

- Limited AI generations
- Basic editor
- Basic analysis

### Creator

For active creators.

- More generations
- No watermark
- History
- Creator Kit
- Advanced AI

### Pro

For serious creators.

- Higher usage
- Advanced AI
- Experiments
- YouTube features later

### Agency

Later.

Do not promise unlimited AI generation until actual inference costs are understood.

---

# 49. USAGE / CREDIT SYSTEM

Server-side source of truth.

Track:

```text
credits_granted
credits_used
credits_refunded
credits_expired
```

Never rely on:

```text
localStorage.generationsRemaining
```

for billing.

---

# 50. PAYMENT

Eventually support:

- Monthly
- Annual
- Trial if viable
- Upgrade
- Downgrade
- Cancellation
- Failed payment
- Refund
- Webhook reconciliation

Evaluate:

- Stripe
- Razorpay

based on actual customer geography and current payment availability.

Paid access must be granted only after verified backend payment state.

---

# 51. SECURITY

Required:

- Server-side authorization
- Secure sessions
- Rate limiting
- Upload validation
- MIME validation
- Size limits
- Signed URLs
- Secret management
- No API keys in frontend
- CSP
- Security headers
- CORS controls
- Abuse prevention
- Sanitized errors
- Request IDs

---

# 52. LIVE UI AUDIT — MANDATORY

Before implementation, agents must test the current deployed site.

Use browser automation.

Test:

- Chrome desktop
- mobile viewport
- 320px
- 375px
- 390px
- 430px
- tablet
- desktop

Check:

- visual layout
- console errors
- network errors
- broken images
- font loading
- overflow
- route errors
- accessibility
- loading states
- error states

Capture screenshots of defects.

---

# 53. CURRENT UI QUALITY BAR

Every screen must answer:

> What should the user do next?

Avoid:

- dead ends
- unexplained icons
- tiny controls
- inconsistent spacing
- inconsistent buttons
- inconsistent typography
- accidental scrollbars
- clipped content
- unclear loading
- unclear errors
- excessive empty space
- overstuffed panels

---

# 54. HOMEPAGE

Primary positioning:

# Create thumbnails that earn the click.

Supporting:

> Give Thumbric your idea, assets or existing thumbnail. Create strong concepts with AI, then refine them in a professional editor.

Primary CTA:

**Create my thumbnail — Free**

Secondary:

**Analyze my thumbnail**

Also communicate:

> **No video upload required.**

This is a valuable privacy/trust message.

---

# 55. HOMEPAGE PRODUCT DEMO

Show the actual workflow:

```text
Idea
 ↓
AI concepts
 ↓
Editor
 ↓
Mobile preview
 ↓
Export
```

Do not use a generic stock illustration as the main hero visual.

---

# 56. NAVIGATION

Recommended:

```text
Home
Create
Projects
Analyze
Tools
Pricing
Sign in
```

Primary CTA:

`Create thumbnail`

Tools can contain:

- Thumbnail Analyzer
- Thumbnail Score
- Thumbnail Resizer
- CTR Calculator
- Title Analyzer

Do not clutter the primary nav.

---

# 57. DESIGN SYSTEM

Create shared tokens for:

- color
- typography
- spacing
- radius
- shadows
- borders
- motion
- buttons
- inputs
- cards
- modals
- toasts

All pages should use the same system.

---

# 58. BUTTON STATES

Every important button needs:

- default
- hover
- pressed
- focus
- disabled
- loading
- success

Prevent duplicate submissions.

---

# 59. EMPTY STATES

Bad:

> No projects.

Good:

> **Your next thumbnail starts here.**
>
> Create with AI or start from scratch.

Button:

`Create thumbnail`

---

# 60. ERROR STATES

Bad:

> Something went wrong.

Good:

> **We couldn't generate your thumbnail.**
>
> The AI service timed out. Your credit was not charged.
>
> `Try again`

---

# 61. LOADING STATES

Use truthful stages.

Example:

> Understanding your brief…

> Planning 3 creative directions…

> Creating concept 1…

> Preparing editable layers…

> Almost ready…

Do not fake backend activity.

---

# 62. AI RESULT UI

Show:

> **We found 3 ways to package your video.**

Each result:

- thumbnail
- strategy
- best-for label
- rationale
- select
- refine
- edit
- download

---

# 63. PROJECT HISTORY

Each project card:

- thumbnail
- project/video name
- created date
- last edited
- variants
- score
- status

Actions:

- Open
- Duplicate
- Analyze
- Generate alternatives
- Delete

---

# 64. DASHBOARD

The dashboard should prioritize action.

Example:

> Good morning 👋
>
> **Create your next thumbnail**
>
> [ Describe your video ]
>
> [ Paste YouTube URL — optional ]
>
> [ Upload thumbnail to improve ]

Then recent projects.

Avoid dashboards full of vanity metrics.

---

# 65. RESPONSIVE DESIGN

Required tests:

- 320px
- 375px
- 390px
- 430px
- 768px
- 1024px
- 1440px

No horizontal page scroll.

Editor must be intentionally designed for mobile.

---

# 66. ACCESSIBILITY

Required:

- keyboard navigation
- visible focus
- labels
- semantic controls
- sufficient contrast
- touch-friendly targets
- reduced motion support
- no color-only state

---

# 67. PERFORMANCE

Use:

- lazy loading
- optimized images
- CDN
- caching
- progressive loading
- skeletons
- background AI jobs
- retry
- cancellation where supported

The interface must remain responsive while AI work is happening.

---

# 68. ANALYTICS

Track:

```text
landing_page_view
tool_started
description_submitted
asset_uploaded
reference_uploaded
creative_brief_created
generation_started
generation_completed
generation_failed
concept_selected
ai_refinement_started
ai_refinement_completed
editor_opened
thumbnail_downloaded
thumbnail_shared
mobile_preview_used
score_generated
doctor_started
doctor_completed
signup_started
signup_completed
login_completed
subscription_started
subscription_completed
subscription_cancelled
feedback_submitted
feature_request_submitted
```

Track properties:

- source
- campaign
- route
- anonymous ID
- user ID
- plan
- generation ID
- model
- prompt version
- latency
- estimated cost
- error

Respect privacy.

---

# 69. CORE FUNNEL

Measure:

```text
Visitor
 ↓
Create/Analyze
 ↓
First result
 ↓
Editor
 ↓
Download
 ↓
Signup
 ↓
Return
 ↓
Repeat generation
 ↓
Paid
 ↓
Referral
```

Primary early metric:

> **Repeat creators per month**

not page views.

---

# 70. GROWTH FEATURES — LATER

Once Phase 1 works:

## Shareable Thumbnail Score

Public page:

```text
Thumbric Score: 78/100

Before
↓
After

Made with Thumbric

Score your thumbnail →
```

This can create organic referrals.

---

# 71. SEO

Build useful landing pages:

- /youtube-thumbnail-maker
- /ai-thumbnail-maker
- /youtube-thumbnail-generator
- /youtube-thumbnail-analyzer
- /youtube-thumbnail-score
- /youtube-thumbnail-tester
- /youtube-thumbnail-resizer
- /gaming-thumbnail-maker
- /podcast-thumbnail-maker
- /finance-thumbnail-maker
- /faceless-youtube-thumbnail-maker

Each page must contain genuinely useful content and a working tool.

No thin AI-generated SEO pages.

---

# 72. ACQUISITION

Primary early acquisition:

### Free Thumbnail Doctor

### Short-form content

### Creator outreach

### Creator education

### SEO

### Community participation

Do not spend heavily on paid ads until retention is proven.

---

# 73. CREATOR OUTREACH

Target:

- 1K–100K subscriber channels
- small agencies
- niche creators

Don't send generic:

> “Try our AI tool.”

Instead:

> “I looked at your latest thumbnail and created an alternative concept. Here's what I would change…”

Then provide Thumbric link.

Goal:

- users
- feedback
- testimonials
- repeat usage

---

# 74. SHORT-FORM CONTENT

Content ideas:

- “I fixed this terrible thumbnail with AI.”
- “Which thumbnail would YOU click?”
- “3 thumbnail mistakes killing CTR.”
- “I gave AI 10 seconds to make this thumbnail.”
- “Thumbric scored this thumbnail 43/100.”
- “Can AI beat my original thumbnail?”
- “One tiny change that makes thumbnails easier to read.”

CTA:

> Try Thumbric free.

---

# 75. PRODUCT-MARKET-FIT MILESTONES

Do not obsess over ₹1 crore immediately.

### Milestone 1

100 real creators.

### Milestone 2

30 repeat creators.

### Milestone 3

10 paying users.

### Milestone 4

100 paying users.

### Milestone 5

1,000 paying users.

At each milestone ask:

- Why did they come?
- What did they use?
- What did they repeat?
- Why did they pay?
- Why did they leave?
- What do they want next?

---

# 76. LONG-TERM ₹1 CRORE+ PATH

The business eventually evolves:

```text
AI Thumbnail Generator
        ↓
AI Thumbnail Editor
        ↓
Thumbnail Intelligence
        ↓
Creator Kit
        ↓
YouTube Performance
        ↓
A/B Experiments
        ↓
AI YouTube Growth Assistant
```

The business should eventually sell:

> **Better creator outcomes**

not:

> **AI images**

---

# 77. MARKET LEADER LESSONS

Use current leaders as benchmarks, not designs to copy.

### Canva / Adobe Express

Teach us:

- editor polish matters
- templates matter
- typography matters
- asset management matters
- brand consistency matters
- users expect smooth editing

### vidIQ

Teaches:

- creators want AI to understand video context
- multiple thumbnail concepts are valuable
- reference assets/faces matter
- refinement matters
- realistic previews matter

### TubeBuddy

Teaches:

- creator-specific workflows
- simple editing
- repeatable templates
- YouTube workflow integration

### YouTube

Teaches:

- packaging matters
- experimentation matters
- actual performance should eventually inform recommendations

Thumbric should combine these principles around one focused workflow:

> **AI creative direction + professional thumbnail editing.**

---

# 78. AGENT TEAM STRUCTURE

Use agents by responsibility.

### Agent 1 — Audit / Product UX

- live site
- user flows
- UI
- mobile
- accessibility

### Agent 2 — AI

- creative brief
- concept generation
- refinement
- prompt versioning
- benchmark

### Agent 3 — Editor

- canvas
- layers
- text
- images
- templates
- undo/redo
- export

### Agent 4 — Backend/Auth

- auth
- database
- usage
- AI jobs
- storage
- security

### Agent 5 — Growth/SEO

- landing pages
- analytics
- SEO
- sharing
- conversion

### Agent 6 — QA

- browser tests
- regression
- accessibility
- mobile
- performance

Lead agent integrates changes.

---

# 79. DO NOT LET AGENTS DUPLICATE WORK

Before implementing:

1. Search repository.
2. Identify existing components.
3. Identify existing routes.
4. Identify existing API.
5. Reuse components.
6. Refactor only when needed.

Do not create:

`EditorV2`

`EditorNew`

`EditorFinal`

unless there is a real architectural reason.

---

# 80. DEFINITION OF DONE

A feature is NOT done because:

- TypeScript compiles
- Unit tests pass
- It looks okay on desktop

A feature is done when:

- desktop works
- mobile works
- loading works
- error works
- empty state works
- keyboard works where relevant
- analytics exists
- security is reviewed
- accessibility is acceptable
- export works
- existing features still work

---

# 81. PHASE 0 AGENT PROMPT

> Read this entire document.
>
> Do NOT implement everything.
>
> First audit the live deployed Thumbric site and current repository.
>
> Produce `AUDIT_REPORT.md`.
>
> For every current route and major user flow, report:
>
> - what works
> - what is partially implemented
> - what is broken
> - what is misleading
> - what is visually poor
> - what is missing
> - severity
> - recommended fix
>
> Test actual production behavior rather than trusting README documentation.
>
> Capture screenshots of important UI problems.
>
> Then create an implementation plan for Phase 1 only.
>
> Do not implement Phase 2+ unless explicitly requested.

---

# 82. PHASE 1 AGENT PROMPT

> Implement only Phase 1 from this document.
>
> Priority order:
>
> 1. AI description → structured creative brief
> 2. Three genuinely different thumbnail concepts
> 3. Editable deterministic text
> 4. AI creative-director explanations
> 5. AI refinement inside editor
> 6. Professional editor UX
> 7. Layers
> 8. Text controls
> 9. Image controls
> 10. Undo/redo
> 11. Snapping/alignment
> 12. Templates
> 13. Mobile preview
> 14. Export
> 15. Authentication foundation
> 16. Feedback
> 17. Analytics
>
> Video upload and YouTube video understanding are NOT Phase 1 requirements.
>
> They must not delay the core experience.
>
> Do not rewrite working code unnecessarily.
>
> Preserve current features.
>
> After every major change:
>
> - lint
> - test
> - build
> - browser test
> - mobile test
> - inspect console
> - inspect network
>
> The goal is not feature quantity.
>
> The goal is:
>
> **A creator can describe a video, receive three strong creative concepts, choose one, edit every important element professionally, ask AI to improve it, preview it at small size, and export it confidently.**

---

# 83. FINAL PRODUCT VISION

Thumbric should feel like this:

### User:

> “I need a thumbnail for my video.”

### Thumbric:

> “Tell me what your video is about.”

### User:

> “I tested 10 AI coding tools and found one that is way better.”

### Thumbric:

> “I see three possible hooks.”

**A — The Winner**

> “THIS AI WON”

**B — The Shock**

> “I WAS WRONG”

**C — The Comparison**

> “10 AI TOOLS. 1 WINNER.”

Then:

> “Which direction do you want?”

User chooses B.

Thumbric creates the composition.

User:

> “Make me look more surprised.”

Thumbric adjusts the face.

User:

> “Less text.”

Thumbric changes the typography.

User:

> “Make the background cleaner.”

Thumbric adjusts it.

Then:

> **Mobile preview**

Thumbric says:

> “At small size, your headline is getting lost. Want me to increase contrast?”

User clicks:

> **Fix it**

Download.

---

# 84. THE CORE PRINCIPLE

The future of Thumbric should NOT be:

> “AI generated this image for you.”

It should be:

> **“Thumbric helped me make a better creative decision.”**

That is the difference between a disposable AI generator and a product creators return to every week.

---

# 85. FINAL PRIORITY

For now:

## DO

**Normal editor + AI editor**

**AI concept generation**

**AI refinement**

**Thumbnail analysis**

**Mobile preview**

**Professional UX**

**Real auth/backend foundation**

**Feedback**

**Analytics**

## DON'T DO YET

**Mandatory video upload**

**Mandatory YouTube connection**

**Complex channel analytics**

**Large A/B testing platform**

**Agency platform**

**API**

**Huge social network**

**Massive template marketplace**

Build the core experience first.

Then earn the right to add complexity.

---

# FINAL AGENT SUCCESS CRITERION

The next major Thumbric release should make a creator say:

> **“This is not just an AI image generator. This actually helps me make my thumbnail.”**

That is the bar.

