<div align="center">

# 🧠 Mentiq

### AI that learns how you learn

An adaptive exam-prep tutor built around a **living learner model** — it tracks what each student knows, why they get things wrong, and what to practise next. Currently covers **Class 10 Physics (CBSE / NCERT)**.

[![CI](https://github.com/aayush-as69/mentiq/actions/workflows/ci.yml/badge.svg)](https://github.com/aayush-as69/mentiq/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle%20ORM-336791?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## ✨ Features

### 🎓 For students
- **Diagnostic test** – a short onboarding quiz that seeds the learner model across the whole syllabus
- **Adaptive practice** – the next question is chosen from mastery, difficulty calibration and known misconceptions
- **Progressive hints & feedback** – three-level hints, explanations and reasoning analysis on every answer
- **Misconception tracking** – detects *why* an answer was wrong (e.g. “forgot to convert cm → m”), not just that it was
- **Spaced repetition** – a review queue that brings back concepts right before they fade
- **Mock exams** – timed full-syllabus exams with a detailed result breakdown
- **Learner model, study plan & progress** – strengths, weak spots and a prioritised plan
- **AI tutor** – ask questions in plain language, with guardrails and a deterministic fallback

### 👩‍🏫 For teachers
- **Class analytics** – class-wide mastery, common misconceptions and insight cards
- **Student drill-down** – per-student learner model and history

### 🛠️ For admins
- **Syllabus & question-bank management**, user management

---

## 🏗️ Architecture

```
answer → grade → reasoning analysis → mastery update → spaced-review update
       → misconception tracking → learner-model refresh → next-question selection
```

| Layer | Location | Notes |
|---|---|---|
| **Content** | `src/content/class10-physics` | Subject → chapter → concept → subconcept → question. Add a folder to add a subject |
| **Engine** (pure, deterministic) | `src/engine` | mastery, spaced repetition, difficulty calibration, grading, misconception detection, question selection, plan, class insights |
| **Services** | `src/services` | DB orchestration: answer pipeline, learner snapshot, exams, analytics, teacher, admin |
| **API** | `src/app/api` | REST handlers wrapped by `lib/http.js` (auth, roles, zod validation, rate limits) |
| **AI layer** | `src/lib/ai` | Pluggable provider (OpenAI / Anthropic) + guardrails. Every AI feature has a deterministic fallback |
| **UI** | `src/app`, `src/components` | Next.js App Router, Tailwind CSS |

**Design principles**
- The learning engine is **pure and deterministic** – no LLM is needed for grading or mastery.
- AI only *enhances* (explanations, tutoring); the app works fully without an API key.
- Content is data, so new subjects don't require engine changes.

---

## 🚀 Getting started

**Prerequisites:** Node.js ≥ 20 and a PostgreSQL database.

```bash
git clone https://github.com/aayush-as69/mentiq.git
cd mentiq
npm install

cp .env.example .env     # then set DATABASE_URL
npm run db:push          # create tables
npm run db:seed          # optional – the app also seeds itself on first sign-in
npm run dev
```

Open <http://localhost:3000>.

### Demo accounts

Password for all: `mentiq-demo`

| Role | Email |
|---|---|
| Student | `student@mentiq.demo` |
| Teacher | `teacher@mentiq.demo` |
| Admin | `admin@mentiq.demo` |

The login page has one-click demo buttons, including **a brand-new student** for the full diagnostic walkthrough (classroom code `10A-PHY` joins Class 10-A).

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `AI_PROVIDER` | – | `openai` or `anthropic` |
| `AI_API_KEY` | – | Provider API key (omit to use deterministic fallbacks) |
| `AI_MODEL` | – | Model name |
| `AI_BASE_URL` | – | Custom endpoint (OpenAI-compatible) |
| `COOKIE_SECURE` | – | Override secure-cookie behaviour outside production |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Sync the schema to the database |
| `npm run db:seed` | Seed syllabus and demo classroom |

---

## 📁 Project structure

```
mentiq/
├── scripts/                 # seed script
├── src/
│   ├── app/                 # routes: (student), teacher, admin, api, auth pages
│   ├── components/          # admin, layout, marketing, student, teacher, ui
│   ├── content/
│   │   └── class10-physics/ # concepts, misconceptions, questions (86)
│   ├── db/                  # Drizzle schema, client, seed
│   ├── engine/              # pure learning engine
│   ├── lib/                 # auth, http, password, AI provider + guardrails
│   └── services/            # DB orchestration
└── .github/workflows/       # CI
```

---

## 🗺️ Roadmap

- [ ] More subjects and classes (Chemistry, Maths, Class 9 / 11 / 12)
- [ ] Refactor remaining React-hooks lint warnings in the exam / practice / diagnostic components
- [ ] Automated tests for the learning engine
- [ ] Parent view and weekly progress reports
- [ ] Question-bank import / export for teachers

---

## 🤝 Contributing

Contributions are welcome. Run `npm run lint` and `npm run build` before opening a pull request — CI runs both.

## 📄 License

Released under the [MIT License](LICENSE).
