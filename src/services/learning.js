import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { ApiError } from "@/lib/http";
import { emptyRecord, updateMastery, statusFor } from "@/engine/mastery";
import { nextReview, reviewReason } from "@/engine/spaced";
import { analyzeAttempt } from "@/engine/reasoning";
import { buildExplanation } from "@/engine/explain";
import { getHints, gradeAnswer, solutionText } from "@/engine/grading";
import { calibrate } from "@/engine/difficulty";
import { selectNext } from "@/engine/selector";
import { getSyllabus, toClientQuestion } from "@/services/syllabus";
import { loadRecentAttempts, loadSnapshot, refreshLearnerModel } from "@/services/learner";
import { refineWithAI } from "@/services/reasoningAi";

async function trackMisconception(tx, { userId, library, concept, analysis, grade, now }) {
  const sm = t.studentMisconceptions;
  if (analysis.misconception) {
    const confidence = analysis.confidence;
    await tx.insert(sm)
      .values({ userId, misconceptionId: analysis.misconception.id, occurrences: 1, correctAfter: 0, status: "active", lastConfidence: confidence, lastDetectedAt: now })
      .onConflictDoUpdate({
        target: [sm.userId, sm.misconceptionId],
        set: { occurrences: sql`${sm.occurrences} + 1`, correctAfter: 0, status: "active", lastConfidence: confidence, lastDetectedAt: now, resolvedAt: null },
      });
    return;
  }
  if (!grade.isCorrect) return;
  const ids = library.filter((m) => m.conceptSlug === concept.slug).map((m) => m.id);
  if (!ids.length) return;
  // Consecutive correct answers on the concept gradually resolve its misconceptions: improving at 2, resolved at 3.
  await tx.update(sm)
    .set({
      correctAfter: sql`${sm.correctAfter} + 1`,
      status: sql`case when ${sm.correctAfter} + 1 >= 3 then 'resolved' when ${sm.correctAfter} + 1 >= 2 then 'improving' else ${sm.status} end`,
      resolvedAt: sql`case when ${sm.correctAfter} + 1 >= 3 then now() else ${sm.resolvedAt} end`,
    })
    .where(and(eq(sm.userId, userId), inArray(sm.misconceptionId, ids), ne(sm.status, "resolved")));
}

/**
 * The performance feedback loop: grade → reasoning analysis → mastery update → spaced-review update →
 * misconception tracking → persist. Returns everything the UI needs to explain what changed.
 */
export async function recordAnswer({ userId, questionId, answer, reasoning = "", selfConfidence = 0.6, timeSeconds = 0, hintsUsed = 0, context = "practice", sessionId = null, deferRefresh = false }) {
  const syllabus = await getSyllabus();
  const question = syllabus.questionById[questionId];
  if (!question) throw new ApiError(404, "That question could not be found.");
  const concept = syllabus.conceptById[question.conceptId];
  const now = new Date();

  const [[recordRow], [scheduleRow]] = await Promise.all([
    db.select().from(t.masteryRecords).where(and(eq(t.masteryRecords.userId, userId), eq(t.masteryRecords.conceptId, concept.id))).limit(1),
    db.select().from(t.reviewSchedules).where(and(eq(t.reviewSchedules.userId, userId), eq(t.reviewSchedules.conceptId, concept.id))).limit(1),
  ]);
  const prev = recordRow ?? emptyRecord();
  const seconds = Math.max(0, Math.min(3600, Math.round(timeSeconds)));
  const hints = Math.max(0, Math.min(4, Math.round(hintsUsed)));
  const text = String(reasoning ?? "").slice(0, 1500);

  const grade = gradeAnswer(question, answer);
  let analysis = analyzeAttempt({ question, concept, grade, reasoning: text, selfConfidence, timeSeconds: seconds, mastery: prev.mastery, attempts: prev.attempts, library: syllabus.misconceptions });
  analysis = await refineWithAI({ analysis, grade, reasoning: text, question, concept, library: syllabus.misconceptions });

  const next = updateMastery(prev, {
    isCorrect: grade.isCorrect, difficulty: question.difficulty, selfConfidence, hintsUsed: hints, timeSeconds: seconds,
    expectedSeconds: question.estimatedSeconds, errorType: analysis.errorType, flawedReasoning: analysis.flawedReasoning,
  });
  const review = nextReview(scheduleRow ?? null, { isCorrect: grade.isCorrect, flawedReasoning: analysis.flawedReasoning, mastery: next.mastery, difficulty: question.difficulty, hintsUsed: hints, now });

  const attemptId = await db.transaction(async (tx) => {
    const [attempt] = await tx.insert(t.questionAttempts).values({
      userId, questionId, conceptId: concept.id, sessionId, context, answer: grade.rawAnswer.slice(0, 500), isCorrect: grade.isCorrect,
      timeSeconds: seconds, selfConfidence, hintsUsed: hints, errorType: analysis.errorType, difficulty: question.difficulty,
      questionType: question.type, masteryBefore: prev.mastery, masteryAfter: next.mastery,
    }).returning({ id: t.questionAttempts.id });

    if (text.trim() || analysis.misconception) {
      await tx.insert(t.reasoningAttempts).values({
        attemptId: attempt.id, userId, reasoning: text || "(no written reasoning)", misconceptionId: analysis.misconception?.id ?? null,
        errorType: analysis.errorType, confidence: analysis.confidence, provider: analysis.provider ?? "rules",
        analysis: { signals: analysis.signals, flawedReasoning: analysis.flawedReasoning },
      });
    }

    const { delta, ...recordValues } = next;
    await tx.insert(t.masteryRecords).values({ userId, conceptId: concept.id, ...recordValues, lastPracticedAt: now, updatedAt: now })
      .onConflictDoUpdate({ target: [t.masteryRecords.userId, t.masteryRecords.conceptId], set: { ...recordValues, lastPracticedAt: now, updatedAt: now } });
    await tx.insert(t.masterySnapshots).values({ userId, conceptId: concept.id, mastery: next.mastery });
    await tx.insert(t.reviewSchedules).values({ userId, conceptId: concept.id, ...review })
      .onConflictDoUpdate({ target: [t.reviewSchedules.userId, t.reviewSchedules.conceptId], set: review });

    await trackMisconception(tx, { userId, library: syllabus.misconceptions, concept, analysis, grade, now });
    if (sessionId) {
      await tx.update(t.learningSessions)
        .set({ questionsAnswered: sql`${t.learningSessions.questionsAnswered} + 1`, correctCount: sql`${t.learningSessions.correctCount} + ${grade.isCorrect ? 1 : 0}`, endedAt: now })
        .where(and(eq(t.learningSessions.id, sessionId), eq(t.learningSessions.userId, userId)));
    }
    return attempt.id;
  });

  if (!deferRefresh) await refreshLearnerModel(userId);

  const prerequisite = syllabus.conceptBySlug[concept.prerequisites[0]] ?? null;
  const explanation = buildExplanation({ question, concept, grade, analysis, mastery: prev.mastery, attempts: prev.attempts, reasoning: text, prerequisite });
  const misconception = analysis.misconception;

  return {
    attemptId, isCorrect: grade.isCorrect, flawedReasoning: analysis.flawedReasoning, errorType: analysis.errorType,
    correctAnswer: grade.expectedText, signals: analysis.signals, hintsUsed: hints,
    concept: { slug: concept.slug, name: concept.name },
    misconception: misconception ? { code: misconception.code, name: misconception.name, confidence: analysis.confidence, severity: misconception.severity, concept: concept.name, correctModel: misconception.correctModel } : null,
    explanation,
    mastery: { before: prev.mastery, after: next.mastery, delta: next.delta, confidence: next.confidence, trend: next.trend, status: statusFor(next.mastery, next.attempts), attempts: next.attempts },
    review: { dueAt: review.dueAt, intervalDays: review.intervalDays, lastResult: review.lastResult, reason: reviewReason({ concept, schedule: review, mastery: next.mastery, now }) },
    questionId,
  };
}

/** Chooses the next practice question from the learner model and records the session. */
export async function nextQuestion(userId, { concept, fix, challenge, sessionId }) {
  const syllabus = await getSyllabus();
  const [snapshot, attempts] = await Promise.all([loadSnapshot(userId), loadRecentAttempts(userId, 80)]);
  if (!snapshot.profile?.diagnosticCompletedAt) throw new ApiError(409, "Complete your diagnostic first so Mentiq can personalise practice.");
  if (concept && !syllabus.conceptBySlug[concept]) throw new ApiError(404, "Unknown concept.");

  let session = sessionId;
  let excluded = [];
  if (session) {
    const rows = await db.select({ q: t.questionAttempts.questionId }).from(t.questionAttempts).where(and(eq(t.questionAttempts.sessionId, session), eq(t.questionAttempts.userId, userId)));
    excluded = rows.map((r) => r.q);
  } else {
    const [created] = await db.insert(t.learningSessions).values({ userId, kind: "practice", focusConceptSlug: concept ?? null }).returning({ id: t.learningSessions.id });
    session = created.id;
  }

  const weakTypes = Object.entries(snapshot.model?.questionTypeStats ?? {}).filter(([, s]) => s.attempts >= 3 && s.accuracy < 0.5).map(([type]) => type);
  const picked = selectNext({
    concepts: snapshot.concepts, questions: syllabus.questions, library: syllabus.misconceptions, recentAttempts: attempts,
    calibration: calibrate(attempts), weakTypes, options: { focusSlug: concept, fixCode: fix, challenge: Boolean(challenge), excludeQuestionIds: excluded },
  });
  if (!picked) throw new ApiError(404, "No suitable questions are available yet.");

  const target = snapshot.conceptBySlug[picked.concept.slug];
  return {
    sessionId: session, question: toClientQuestion(picked.question), reason: picked.reason, objective: picked.objective,
    difficulty: picked.difficulty.level,
    concept: { slug: target.slug, name: target.name, mastery: target.mastery, status: target.status, attempts: target.attempts },
    answeredInSession: excluded.length,
  };
}

/** Progressive hints: levels 1-3 give hints, level 4 reveals the solution. */
export async function getHint(questionId, level) {
  const syllabus = await getSyllabus();
  const question = syllabus.questionById[questionId];
  if (!question) throw new ApiError(404, "That question could not be found.");
  const concept = syllabus.conceptById[question.conceptId];
  const hints = getHints(question, concept);
  if (level <= hints.length) return { level, text: hints[level - 1], solution: false, remaining: Math.max(0, hints.length - level) };
  return { level: 4, text: solutionText(question, gradeAnswer(question, question.correctAnswer)), solution: true, remaining: 0 };
}
