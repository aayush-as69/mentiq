import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at").notNull().defaultNow();

// ───────────── Identity ─────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 16 }).notNull().default("student"), // student | teacher | admin
  createdAt: createdAt(),
});

export const sessions = pgTable("sessions", {
  token: varchar("token", { length: 64 }).primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const classrooms = pgTable("classrooms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  grade: integer("grade").notNull(),
  joinCode: varchar("join_code", { length: 24 }).notNull().unique(),
  teacherId: integer("teacher_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

export const teacherProfiles = pgTable("teacher_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  department: varchar("department", { length: 80 }),
  createdAt: createdAt(),
});

// ───────────── Syllabus (Subject → Chapter → Concept → Subconcept → Question) ─────────────
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  grade: integer("grade").notNull(),
  curriculum: varchar("curriculum", { length: 60 }).notNull(),
  description: text("description"),
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  position: integer("position").notNull().default(0),
  description: text("description"),
});

export const concepts = pgTable("concepts", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  topic: varchar("topic", { length: 80 }),
  difficulty: integer("difficulty").notNull().default(2),
  position: integer("position").notNull().default(0),
  summary: text("summary").notNull(),
  keyIdeas: jsonb("key_ideas").notNull().default([]),
  formulas: jsonb("formulas").notNull().default([]),
  intuition: text("intuition"),
  subconcepts: jsonb("subconcepts").notNull().default([]),
  keywords: jsonb("keywords").notNull().default([]),
});

export const conceptDependencies = pgTable(
  "concept_dependencies",
  {
    id: serial("id").primaryKey(),
    conceptId: integer("concept_id").notNull().references(() => concepts.id, { onDelete: "cascade" }),
    relatedConceptId: integer("related_concept_id").notNull().references(() => concepts.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 16 }).notNull().default("prerequisite"), // prerequisite | related
  },
  (t) => [uniqueIndex("concept_dep_unique").on(t.conceptId, t.relatedConceptId, t.kind)],
);

export const questions = pgTable(
  "questions",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 40 }).notNull().unique(),
    conceptId: integer("concept_id").notNull().references(() => concepts.id, { onDelete: "cascade" }),
    subconcept: varchar("subconcept", { length: 120 }),
    difficulty: integer("difficulty").notNull().default(2), // 1 easy … 4 advanced
    type: varchar("type", { length: 24 }).notNull(), // mcq | numerical | short_answer | conceptual | assertion_reasoning | application
    prompt: text("prompt").notNull(),
    options: jsonb("options"), // [{id, text}]
    correctAnswer: text("correct_answer").notNull(),
    tolerance: doublePrecision("tolerance"),
    unit: varchar("unit", { length: 24 }),
    keywords: jsonb("keywords"), // short-answer keyword groups
    explanation: text("explanation").notNull(),
    hints: jsonb("hints").notNull().default([]),
    prerequisiteSlugs: jsonb("prerequisite_slugs").notNull().default([]),
    misconceptionCodes: jsonb("misconception_codes").notNull().default([]),
    distractorMap: jsonb("distractor_map").notNull().default({}),
    wrongPatterns: jsonb("wrong_patterns").notNull().default([]),
    learningObjective: text("learning_objective").notNull(),
    estimatedSeconds: integer("estimated_seconds").notNull().default(60),
    requiresReasoning: boolean("requires_reasoning").notNull().default(false),
    isDiagnostic: boolean("is_diagnostic").notNull().default(false),
    validated: boolean("validated").notNull().default(true),
    source: varchar("source", { length: 24 }).notNull().default("curated"), // curated | ai_generated
    createdAt: createdAt(),
  },
  (t) => [index("questions_concept_idx").on(t.conceptId)],
);

export const misconceptions = pgTable("misconceptions", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  conceptId: integer("concept_id").notNull().references(() => concepts.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  triggerPatterns: jsonb("trigger_patterns").notNull().default([]),
  severity: integer("severity").notNull().default(2), // 1 low … 3 high
  baseConfidence: doublePrecision("base_confidence").notNull().default(0.85),
  correctModel: text("correct_model").notNull(),
  intervention: jsonb("intervention").notNull().default([]),
  relatedQuestionCodes: jsonb("related_question_codes").notNull().default([]),
});

// ───────────── Students ─────────────
export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  classroomId: integer("classroom_id").references(() => classrooms.id, { onDelete: "set null" }),
  subjectId: integer("subject_id").references(() => subjects.id),
  grade: integer("grade").notNull().default(10),
  exam: varchar("exam", { length: 80 }),
  confidence: integer("confidence").notNull().default(3), // 1-5 self-rating
  goals: jsonb("goals").notNull().default([]),
  pace: varchar("pace", { length: 16 }).notNull().default("steady"),
  dailyMinutes: integer("daily_minutes").notNull().default(45),
  targetScore: integer("target_score"),
  weeklyGoal: integer("weekly_goal").notNull().default(30),
  onboardedAt: timestamp("onboarded_at"),
  diagnosticCompletedAt: timestamp("diagnostic_completed_at"),
  createdAt: createdAt(),
});

export const learnerModels = pgTable("learner_models", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  overallMastery: doublePrecision("overall_mastery").notNull().default(0),
  learningVelocity: doublePrecision("learning_velocity").notNull().default(0),
  difficultyProfile: jsonb("difficulty_profile").notNull().default({}),
  strengths: jsonb("strengths").notNull().default([]),
  needsImprovement: jsonb("needs_improvement").notNull().default([]),
  questionTypeStats: jsonb("question_type_stats").notNull().default({}),
  hintDependency: doublePrecision("hint_dependency").notNull().default(0),
  calibration: jsonb("calibration").notNull().default({}),
  currentFocusSlug: varchar("current_focus_slug", { length: 60 }),
  totalAttempts: integer("total_attempts").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const masteryRecords = pgTable(
  "mastery_records",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    conceptId: integer("concept_id").notNull().references(() => concepts.id, { onDelete: "cascade" }),
    mastery: doublePrecision("mastery").notNull().default(0.5),
    confidence: doublePrecision("confidence").notNull().default(0.5),
    accuracy: doublePrecision("accuracy").notNull().default(0),
    attempts: integer("attempts").notNull().default(0),
    correct: integer("correct").notNull().default(0),
    avgTimeSeconds: doublePrecision("avg_time_seconds").notNull().default(0),
    difficultyHandled: integer("difficulty_handled").notNull().default(0),
    recentResults: jsonb("recent_results").notNull().default([]),
    trend: varchar("trend", { length: 16 }).notNull().default("new"),
    hintRate: doublePrecision("hint_rate").notNull().default(0),
    lastPracticedAt: timestamp("last_practiced_at"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("mastery_user_concept").on(t.userId, t.conceptId)],
);

export const masterySnapshots = pgTable(
  "mastery_snapshots",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    conceptId: integer("concept_id").notNull().references(() => concepts.id, { onDelete: "cascade" }),
    mastery: doublePrecision("mastery").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("snapshots_user_time").on(t.userId, t.createdAt)],
);

export const learningSessions = pgTable("learning_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: varchar("kind", { length: 16 }).notNull().default("practice"),
  focusConceptSlug: varchar("focus_concept_slug", { length: 60 }),
  questionsAnswered: integer("questions_answered").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
});

export const questionAttempts = pgTable(
  "question_attempts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
    conceptId: integer("concept_id").notNull().references(() => concepts.id, { onDelete: "cascade" }),
    sessionId: integer("session_id").references(() => learningSessions.id, { onDelete: "set null" }),
    context: varchar("context", { length: 16 }).notNull().default("practice"), // diagnostic | practice | exam
    answer: text("answer"),
    isCorrect: boolean("is_correct").notNull(),
    timeSeconds: integer("time_seconds").notNull().default(0),
    selfConfidence: doublePrecision("self_confidence"),
    hintsUsed: integer("hints_used").notNull().default(0),
    errorType: varchar("error_type", { length: 24 }).notNull().default("none"),
    difficulty: integer("difficulty").notNull().default(2),
    questionType: varchar("question_type", { length: 24 }).notNull().default("mcq"),
    masteryBefore: doublePrecision("mastery_before"),
    masteryAfter: doublePrecision("mastery_after"),
    createdAt: createdAt(),
  },
  (t) => [index("attempts_user_time").on(t.userId, t.createdAt), index("attempts_concept").on(t.conceptId)],
);

export const reasoningAttempts = pgTable("reasoning_attempts", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").notNull().references(() => questionAttempts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reasoning: text("reasoning").notNull(),
  misconceptionId: integer("misconception_id").references(() => misconceptions.id, { onDelete: "set null" }),
  errorType: varchar("error_type", { length: 24 }).notNull().default("none"),
  confidence: doublePrecision("confidence").notNull().default(0),
  analysis: jsonb("analysis").notNull().default({}),
  provider: varchar("provider", { length: 24 }).notNull().default("rules"),
  createdAt: createdAt(),
});

export const studentMisconceptions = pgTable(
  "student_misconceptions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    misconceptionId: integer("misconception_id").notNull().references(() => misconceptions.id, { onDelete: "cascade" }),
    occurrences: integer("occurrences").notNull().default(1),
    correctAfter: integer("correct_after").notNull().default(0),
    status: varchar("status", { length: 16 }).notNull().default("active"), // active | improving | resolved
    lastConfidence: doublePrecision("last_confidence").notNull().default(0.8),
    firstDetectedAt: timestamp("first_detected_at").notNull().defaultNow(),
    lastDetectedAt: timestamp("last_detected_at").notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at"),
  },
  (t) => [uniqueIndex("student_misc_unique").on(t.userId, t.misconceptionId)],
);

export const studyPlans = pgTable(
  "study_plans",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    planDate: varchar("plan_date", { length: 10 }).notNull(),
    items: jsonb("items").notNull().default([]),
    summary: text("summary"),
    generatedAt: timestamp("generated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("plan_user_date").on(t.userId, t.planDate)],
);

export const reviewSchedules = pgTable(
  "review_schedules",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    conceptId: integer("concept_id").notNull().references(() => concepts.id, { onDelete: "cascade" }),
    dueAt: timestamp("due_at").notNull(),
    intervalDays: doublePrecision("interval_days").notNull().default(1),
    ease: doublePrecision("ease").notNull().default(2.3),
    repetitions: integer("repetitions").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    lastReviewedAt: timestamp("last_reviewed_at"),
    lastResult: varchar("last_result", { length: 16 }),
  },
  (t) => [uniqueIndex("review_user_concept").on(t.userId, t.conceptId), index("review_due").on(t.userId, t.dueAt)],
);

// ───────────── Exams ─────────────
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  subjectId: integer("subject_id").references(() => subjects.id),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  questionCount: integer("question_count").notNull().default(20),
  distribution: jsonb("distribution").notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
});

export const examAttempts = pgTable("exam_attempts", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 16 }).notNull().default("in_progress"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  submittedAt: timestamp("submitted_at"),
  questionIds: jsonb("question_ids").notNull().default([]),
  answers: jsonb("answers").notNull().default({}),
  marked: jsonb("marked").notNull().default([]),
  score: doublePrecision("score"),
  conceptBreakdown: jsonb("concept_breakdown"),
  mistakeAnalysis: jsonb("mistake_analysis"),
  recommendations: jsonb("recommendations"),
});

// ───────────── Teacher intelligence, gamification, tutor ─────────────
export const teacherInsights = pgTable("teacher_insights", {
  id: serial("id").primaryKey(),
  classroomId: integer("classroom_id").notNull().references(() => classrooms.id, { onDelete: "cascade" }),
  conceptId: integer("concept_id").references(() => concepts.id, { onDelete: "cascade" }),
  kind: varchar("kind", { length: 24 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body").notNull(),
  studentCount: integer("student_count").notNull().default(0),
  severity: varchar("severity", { length: 12 }).notNull().default("medium"),
  aiGenerated: boolean("ai_generated").notNull().default(false),
  data: jsonb("data").notNull().default({}),
  createdAt: createdAt(),
});

export const userBadges = pgTable(
  "user_badges",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 40 }).notNull(),
    awardedAt: timestamp("awarded_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("badge_user_code").on(t.userId, t.code)],
);

export const tutorMessages = pgTable(
  "tutor_messages",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 12 }).notNull(),
    content: text("content").notNull(),
    meta: jsonb("meta").notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [index("tutor_user_time").on(t.userId, t.createdAt)],
);
