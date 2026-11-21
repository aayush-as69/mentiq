import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { ApiError } from "@/lib/http";
import { getSyllabus, toClientQuestion } from "@/services/syllabus";
import { recordAnswer } from "@/services/learning";
import { loadSnapshot, refreshLearnerModel } from "@/services/learner";

const WEIGHT = { 1: 1, 2: 1.25, 3: 1.5, 4: 2 };
const shuffle = (xs) => xs.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

/** Full-syllabus selection that follows the exam's difficulty distribution and spreads picks across concepts. */
function pickQuestions(syllabus, exam) {
  const picked = [];
  const perConcept = {};
  const pool = syllabus.questions.filter((q) => q.validated);
  const quotas = Object.entries(exam.distribution).map(([level, share]) => [Number(level), Math.round(share * exam.questionCount)]);
  for (const [level, quota] of quotas) {
    for (let i = 0; i < quota; i += 1) {
      const candidates = shuffle(pool.filter((q) => q.difficulty === level && !picked.includes(q)));
      candidates.sort((a, b) => (perConcept[a.conceptSlug] ?? 0) - (perConcept[b.conceptSlug] ?? 0));
      const choice = candidates[0];
      if (!choice) continue;
      picked.push(choice);
      perConcept[choice.conceptSlug] = (perConcept[choice.conceptSlug] ?? 0) + 1;
    }
  }
  return shuffle(picked);
}

export async function getExamDefinition() {
  const [exam] = await db.select().from(t.exams).where(eq(t.exams.isActive, true)).limit(1);
  return exam ?? null;
}

export async function startExam(userId) {
  const exam = await getExamDefinition();
  if (!exam) throw new ApiError(404, "No exam is available right now.");
  const [existing] = await db.select().from(t.examAttempts)
    .where(and(eq(t.examAttempts.userId, userId), eq(t.examAttempts.status, "in_progress"))).limit(1);
  if (existing) {
    const expired = Date.now() > new Date(existing.startedAt).getTime() + exam.durationMinutes * 60000 + 60000;
    if (!expired) return { attemptId: existing.id };
  }
  const syllabus = await getSyllabus();
  const questions = pickQuestions(syllabus, exam);
  const [attempt] = await db.insert(t.examAttempts).values({ examId: exam.id, userId, questionIds: questions.map((q) => q.id) }).returning({ id: t.examAttempts.id });
  return { attemptId: attempt.id };
}

async function ownedAttempt(userId, attemptId) {
  const [attempt] = await db.select().from(t.examAttempts).where(and(eq(t.examAttempts.id, attemptId), eq(t.examAttempts.userId, userId))).limit(1);
  if (!attempt) throw new ApiError(404, "Exam attempt not found.");
  return attempt;
}

export async function getExamSession(userId, attemptId) {
  const attempt = await ownedAttempt(userId, attemptId);
  const [syllabus, exam] = await Promise.all([getSyllabus(), db.select().from(t.exams).where(eq(t.exams.id, attempt.examId)).then((r) => r[0])]);
  return {
    attempt, exam,
    questions: attempt.questionIds.map((id) => toClientQuestion(syllabus.questionById[id])),
    endsAt: new Date(attempt.startedAt).getTime() + exam.durationMinutes * 60000,
  };
}

export async function saveExamProgress(userId, attemptId, { answers, marked }) {
  const attempt = await ownedAttempt(userId, attemptId);
  if (attempt.status !== "in_progress") throw new ApiError(409, "This exam has already been submitted.");
  await db.update(t.examAttempts).set({ answers, marked }).where(eq(t.examAttempts.id, attemptId));
  return { saved: true };
}

/** Grades an exam, feeds every answer into the learner model, and produces concept-level analysis. */
export async function submitExam(userId, attemptId, { answers, marked }) {
  const attempt = await ownedAttempt(userId, attemptId);
  if (attempt.status !== "in_progress") return { attemptId };
  const syllabus = await getSyllabus();
  const exam = (await db.select().from(t.exams).where(eq(t.exams.id, attempt.examId)))[0];
  const [session] = await db.insert(t.learningSessions).values({ userId, kind: "exam" }).returning({ id: t.learningSessions.id });
  const secondsEach = Math.round(Math.min(exam.durationMinutes * 60, (Date.now() - new Date(attempt.startedAt).getTime()) / 1000) / attempt.questionIds.length);

  let earned = 0;
  let total = 0;
  const byConcept = {};
  const mistakes = [];
  const errorCounts = {};
  for (const id of attempt.questionIds) {
    const q = syllabus.questionById[id];
    const given = String(answers?.[id] ?? "");
    const result = await recordAnswer({ userId, questionId: id, answer: given, selfConfidence: 0.6, timeSeconds: secondsEach, context: "exam", sessionId: session.id, deferRefresh: true });
    const weight = WEIGHT[q.difficulty] ?? 1;
    total += weight;
    if (result.isCorrect) earned += weight;
    const row = (byConcept[q.conceptSlug] ??= { slug: q.conceptSlug, name: q.conceptName, asked: 0, correct: 0 });
    row.asked += 1;
    row.correct += result.isCorrect ? 1 : 0;
    if (!result.isCorrect) {
      errorCounts[result.errorType] = (errorCounts[result.errorType] ?? 0) + 1;
      mistakes.push({ questionId: id, prompt: q.prompt, concept: q.conceptName, yourAnswer: given || "(unanswered)", correctAnswer: result.correctAnswer, errorType: result.errorType, misconception: result.misconception?.name ?? null, explanation: q.explanation });
    }
  }
  await refreshLearnerModel(userId);
  const snapshot = await loadSnapshot(userId);

  const breakdown = Object.values(byConcept).map((row) => {
    const mastery = snapshot.conceptBySlug[row.slug].mastery;
    return { ...row, accuracy: row.correct / row.asked, mastery, priority: row.correct / row.asked < 0.5 || mastery < 0.5 };
  }).sort((a, b) => a.mastery - b.mastery);

  const recommendations = breakdown.filter((b) => b.priority).slice(0, 4).map((b) => ({
    conceptSlug: b.slug, text: `Revisit ${b.name}: ${b.correct}/${b.asked} correct in the exam and mastery is now ${Math.round(b.mastery * 100)}%.`,
  }));
  const score = total ? earned / total : 0;

  await db.update(t.examAttempts).set({
    status: "submitted", submittedAt: new Date(), answers: answers ?? {}, marked: marked ?? [], score,
    conceptBreakdown: breakdown, mistakeAnalysis: { errorCounts, mistakes }, recommendations,
  }).where(eq(t.examAttempts.id, attemptId));
  return { attemptId, score };
}

export async function getExamResult(userId, attemptId) {
  const attempt = await ownedAttempt(userId, attemptId);
  if (attempt.status !== "submitted") return null;
  const exam = (await db.select().from(t.exams).where(eq(t.exams.id, attempt.examId)))[0];
  return { attempt, exam };
}

export async function listExamAttempts(userId) {
  return db.select().from(t.examAttempts).where(eq(t.examAttempts.userId, userId)).orderBy(desc(t.examAttempts.startedAt)).limit(10);
}
