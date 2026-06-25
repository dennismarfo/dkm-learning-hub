# DKM Learning Hub — frontend MVP decision v1

Last updated: 2026-06-25 18:12 UTC

## Decision

Build the first frontend MVP directly inside `dennismarfo/dkm-learning-hub`.

Use a lightweight Vite + React + TypeScript app for the first prototype instead of creating a separate repo or introducing Supabase-backed user accounts immediately.

## Why this choice

- `dkm-learning-hub` is already the source of truth for product, content, backend specs and handoff.
- The current milestone is product validation and content structure, not production auth/progress tracking.
- Vite keeps the MVP small, fast and easy to deploy as a static app.
- The local verification passed with `npm run build` and `npm audit --audit-level=moderate` with 0 vulnerabilities.
- A Next.js app can still be introduced later if the product needs server rendering, auth, dynamic metadata, paid access, or Supabase-backed progression.

## Scope implemented in this MVP

- Homepage / landing page.
- Course library placeholder.
- Featured course page for `Architecture IA : du neurone à l’agent`.
- Lesson/module route skeleton using browser history.
- Resources page placeholder.
- Course data extracted from `docs/content-inventory-v1.md` into `src/course-data.ts`.
- DKM visual direction from `dennismarfo/dkm-brand` only:
  - Sand `#F4E59A`
  - Ink `#2A1A12`
  - Terracotta `#C8553D`
  - DM Serif Display / Inter / JetBrains Mono
  - warm, premium, expert-accessible tone

## Explicit non-goals for this step

- No Supabase schema change.
- No n8n workflow change.
- No login or user progress persistence.
- No copy/paste of the old inline JavaScript from the source HTML files.
- No separate frontend repo.

## Verification

Local verification folder: `/opt/data/tmp/dkm-learning-hub-mvp`.

Commands run:

```bash
npm install
npm run build
npm audit --audit-level=moderate
```

Result:

- Build passed.
- Audit returned 0 vulnerabilities.
- Browser smoke test passed locally on `http://127.0.0.1:4177`.
- Checked homepage, course page and module navigation.

## Next recommended action

Extract the remaining 20-module source content into structured course JSON/MDX and replace the placeholder lesson body blocks with real lesson content plus reusable quiz/demo components.
