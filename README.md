# Mentiq — AI that learns how you learn

Adaptive exam-prep tutor (Class 10 Physics) built around a **living learner model**. JavaScript + JSX only (Next.js App Router, Drizzle ORM, PostgreSQL).
`tsconfig.json` exists only so Next's toolchain and `tsc --noEmit` accept the JS sources — no TypeScript is authored.

## Run locally
```bash
npm install
cp .env.example .env        # then edit DATABASE_URL
npm run db:push             # create tables
npm run db:seed             # optional – the app also seeds itself on first sign-in
npm run dev
```
Demo accounts (password `mentiq-demo`): `student@mentiq.demo`, `teacher@mentiq.demo`, `admin@mentiq.demo`. The login page has one-click demo buttons, including **a brand-new student** for the full diagnostic walkthrough (classroom code `10A-PHY` joins Class 10-A).

## Architecture
| Layer | Where | Notes |
|---|---|---|
| Content (syllabus config) | `src/content/class10-physics` | Subject → chapter → concept → subconcept → question; add a folder for new subjects |
| Deterministic engine (pure) | `src/engine` | mastery, spaced repetition, difficulty calibration, grading, misconception detection, question selection, plan, class insights |
| Services (DB orchestration) | `src/services` | answer pipeline (`learning.js`), learner snapshot, exam, analytics, teacher, admin |
| API | `src/app/api` | REST handlers wrapped by `lib/http.js` (auth, roles, zod validation, rate limits) |
| AI layer | `src/lib/ai` | pluggable provider (`AI_PROVIDER=openai\|anthropic`, `AI_API_KEY`, `AI_MODEL`, `AI_BASE_URL`), guardrails; every AI feature has a deterministic fallback |

Feedback loop: answer → grade → reasoning analysis → mastery update → spaced-review update → misconception tracking → learner-model refresh → next-question selection.

## Content
Question bank: `src/content/class10-physics/questions.js` (core set) and `questions-extra.js` (additional MCQs with progressive hints). Both are merged in `index.js`.

## Contributing
Run `npm run lint` and `npm run build` before opening a PR (CI runs both). Licensed under MIT.
