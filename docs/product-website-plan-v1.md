# DKM Learning Hub — product website plan v1

Last updated: 2026-06-25 17:33 UTC
Owner: Dennis Marfo Kojo
Agents: Hermès, Claude Code

## Purpose of this document

This file is the durable handoff for the product/site side of DKM Learning Hub. If a chat loses context, starts over, or tokens run out, resume here before taking action.

It complements:

- `HANDOFF.md` — operational handoff and infra next actions.
- `docs/architecture.md` — backend/data architecture.
- `docs/live-infra-status-2026-05-29.md` — last known live infra state.
- `dennismarfo/dkm-brand` — DKM visual/editorial source of truth.

## Current direction

DKM Learning Hub should become a branded mini-LMS / knowledge hub, not just a folder of standalone HTML files.

The first public-facing experience should package the existing AI architecture course material into a premium DKM learning product:

- landing page
- course library or featured course entry
- course detail page
- module/lesson pages
- interactive glossary and quizzes
- final exam / assessment
- resource / template area
- community or newsletter CTA

## Source material already identified

Google Drive folder:

- Name: `DKM KnowledgeHub ` with a trailing space.
- Folder ID: `11QMNA85bJk1dvW_-sdL6t1AAZnd4LK-J`
- URL: `https://drive.google.com/drive/folders/11QMNA85bJk1dvW_-sdL6t1AAZnd4LK-J`

Files found and downloaded in a previous session:

- `examen-final-ia.html`
- `architecture-ia-tome1.html`
- `architecture-ia-tome2.html`
- `architecture-ia-tome3.html`

Local audit/download folder from previous work:

- `/opt/data/tmp/dkm_kh_drive_audit/`

Content summary:

- Beginner-friendly interactive learning path on AI architecture.
- Tome 1: neuron, IA / ML / DL, tokens, attention, tool use, agents, MCP, prompt injection.
- Tome 2 and Tome 3 continue the architecture journey.
- Final exam includes progress, palette, score ring, breakdown by section, correction, restart.

Important: these HTML files should be treated as source/reference material to transform, not as final site architecture.

## Brand source of truth

Primary repo:

- `dennismarfo/dkm-brand`

Key brand invariants from `dkm-brand`:

- French, tutoiement, expert accessible.
- Positioning: IA, automatisation, build in public, God first.
- Palette: Sand `#F4E59A`, Ink `#2A1A12`, Terracotta `#C8553D`.
- Ratio: Sand / accent / ink = 80 / 5 / 15.
- Fonts: DM Serif Display for display/italic accents, Inter for UI/body, JetBrains Mono for eyebrows/tags.
- Avoid generic generated-template feeling.
- One italic terracotta accent per block maximum.

Additional DA retained for this product context:

- clean premium educational interface
- AI-SaaS cockpit clarity
- floating rounded cards
- KPI / benchmark / progress tables where useful
- Inter / Geist-compatible UI feel
- black or ink CTA blocks
- social-first but concrete, not abstract
- dashboard/course UI that feels assembled, intentional, premium

Useful design references loaded for implementation:

- Vercel: precision, white canvas, Geist, shadow-as-border.
- Notion: warm neutral education/product experience.
- Mintlify: documentation-as-product, learning/content clarity.

Do not blindly copy those references. Blend them with DKM’s brand system.

## Product framing

Working name:

- DKM Learning Hub

Suggested public promise:

- Learn AI architecture from first principles, then turn knowledge into workflows, agents, and business leverage.

Potential course title:

- Architecture IA: du neurone à l’agent

Product principle:

- Education that leads to implementation.
- Every module should connect concept → mental model → example → quiz → practical application.

## MVP site scope

V1 should prioritize a small but solid experience:

1. Homepage / landing
   - DKM Learning Hub positioning.
   - Featured course: Architecture IA.
   - Value proposition for beginners and builders.
   - CTA: start course / join community / get resources.

2. Course index
   - One featured course initially.
   - Future-proof for more courses.

3. Course detail
   - Tome 1, Tome 2, Tome 3, Final Exam.
   - Progress / estimated effort / difficulty.
   - Outcomes and prerequisites.

4. Lesson/module view
   - Sidebar or chapter nav.
   - Sticky progress.
   - Glossary access.
   - Interactive cards/demos where source HTML already has them.
   - Quiz block per module.

5. Final exam
   - Question flow.
   - Score / correction.
   - Completion result.

6. Resource hub
   - Templates, prompts, frameworks, cheat sheets.
   - Can be placeholder in V1 if necessary.

## Content migration approach

Recommended approach:

1. Extract source HTML lesson data into structured JSON or MDX.
2. Preserve core pedagogy and interactions, but rewrite UI components in the DKM design system.
3. Do not keep final delivery as standalone HTML files.
4. Store source-derived content under a clear directory, for example:
   - `content/courses/architecture-ia/`
   - `content/courses/architecture-ia/tome-1.json`
   - `content/courses/architecture-ia/tome-2.json`
   - `content/courses/architecture-ia/tome-3.json`
   - `content/courses/architecture-ia/exam.json`
5. Build reusable components for:
   - LessonShell
   - ProgressRail
   - ConceptCard
   - QuizBlock
   - GlossaryModal
   - ExamFlow
   - ScoreSummary
   - ResourceCard

## Backend relationship

Current backend repo already contains a learning capture architecture:

- Supabase schema: `learning_hub`
- Table: `learning_hub.learnings`
- n8n capture workflow: Telegram / Knowledge Scout → Haiku → Supabase

That backend is about capturing and transforming new learnings. The product website/course experience is related but not identical.

Short-term recommendation:

- Keep course content as versioned repo files first.
- Use Supabase later for user progress, exam results, saved resources, and dynamic learning notes.

Potential future Supabase additions:

- `learning_hub.courses`
- `learning_hub.lessons`
- `learning_hub.user_progress`
- `learning_hub.exam_attempts`

Do not add these until the frontend content model is clearer.

## Open questions for Dennis

These should be resolved before heavy implementation:

1. Is the first public release free, gated by email, or private/community-only?
2. Should the final exam produce a shareable certificate/badge?
3. Should users log in in V1, or should progress be local-only first?
4. Should this live in `dkm-learning-hub` as the full app repo, or should a separate frontend repo be created and this repo remain backend/ops?
5. Should DKM Learning Hub visually follow the sand/terracotta brand strongly, or use a cleaner white AI-SaaS adaptation with DKM accents?

Current assumption until Dennis decides:

- Build a repo-based prototype first.
- No login in V1 prototype.
- Keep progress local or static until product direction is validated.
- Use DKM visual identity, but adapt it into a clean learning SaaS interface.

## Recommended next actions

1. Clone or inspect both repos locally:
   - `dennismarfo/dkm-learning-hub`
   - `dennismarfo/dkm-brand`
2. Re-read source HTML files from Drive/local audit folder.
3. Extract structured course inventory:
   - modules
   - glossary entries
   - quizzes
   - exam questions
   - interactive demo types
4. Decide frontend app structure:
   - likely Next.js if building a real app
   - or lightweight static React prototype if keeping scope minimal
5. Create a design brief/wireframe for homepage + course lesson view.
6. Only then implement the first prototype.

## Handoff protocol going forward

At the end of every meaningful work session:

1. Update `HANDOFF.md` with:
   - date/time
   - what changed
   - current branch/PR if any
   - next single action
   - blockers
2. If product/site direction changed, update this file.
3. If infra changed, update `docs/live-infra-status-*.md` or create a new dated status file.
4. If code is changed, prefer a branch + PR instead of silent direct edits to `main`.

This protocol exists because Dennis explicitly asked not to lose the thread if tokens/context expire.
