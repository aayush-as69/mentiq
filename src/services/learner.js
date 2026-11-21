import { cache } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { emptyRecord, misconceptionRisk, retentionEstimate, statusFor } from "@/engine/mastery";
import { summarizeModel } from "@/engine/learnerModel";
import { getSyllabus } from "@/services/syllabus";

/** Recent question attempts, newest first, enriched with concept/chapter slugs. */
export async function loadRecentAttempts(userId, limit = 80) {
  const [syllabus, rows] = await Promise.all([
    getSyllabus(),
    db.select().from(t.questionAttempts).where(eq(t.questionAttempts.userId, userId)).orderBy(desc(t.questionAttempts.createdAt), desc(t.questionAttempts.id)).limit(limit),
  ]);
  return rows.map((a) => {
    const concept = syllabus.conceptById[a.conceptId];
    return { ...a, conceptSlug: concept?.slug, conceptName: concept?.name, chapterSlug: concept?.chapterSlug, questionCode: syllabus.questionById[a.questionId]?.code };
  });
}
export const getRecentAttempts = cache(loadRecentAttempts);

/** Builds the full living learner model view (concept-level state + misconceptions + schedule). */
export async function loadSnapshot(userId) {
  const now = new Date();
  const [syllabus, [profile], [model], records, schedules, studentMisc] = await Promise.all([
    getSyllabus(),
    db.select().from(t.studentProfiles).where(eq(t.studentProfiles.userId, userId)).limit(1),
    db.select().from(t.learnerModels).where(eq(t.learnerModels.userId, userId)).limit(1),
    db.select().from(t.masteryRecords).where(eq(t.masteryRecords.userId, userId)),
    db.select().from(t.reviewSchedules).where(eq(t.reviewSchedules.userId, userId)),
    db.select().from(t.studentMisconceptions).where(eq(t.studentMisconceptions.userId, userId)),
  ]);

  const recordBy = Object.fromEntries(records.map((r) => [r.conceptId, r]));
  const scheduleBy = Object.fromEntries(schedules.map((s) => [s.conceptId, s]));

  const misconceptions = studentMisc
    .map((sm) => {
      const m = syllabus.misconceptionById[sm.misconceptionId];
      return m ? { code: m.code, name: m.name, description: m.description, correctModel: m.correctModel, intervention: m.intervention, severity: m.severity, conceptSlug: m.conceptSlug, conceptName: m.conceptName, status: sm.status, occurrences: sm.occurrences, correctAfter: sm.correctAfter, lastConfidence: sm.lastConfidence, lastDetectedAt: sm.lastDetectedAt } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (a.status === "resolved") - (b.status === "resolved") || b.severity - a.severity || new Date(b.lastDetectedAt) - new Date(a.lastDetectedAt));

  const concepts = syllabus.concepts.map((c) => {
    const record = recordBy[c.id] ?? emptyRecord();
    const schedule = scheduleBy[c.id] ?? null;
    const activeMisconceptions = misconceptions.filter((m) => m.conceptSlug === c.slug && m.status !== "resolved");
    return {
      ...c, ...record, id: c.id,
      lastPracticedAt: recordBy[c.id]?.lastPracticedAt ?? null,
      status: statusFor(record.mastery, record.attempts),
      schedule, retention: retentionEstimate({ mastery: record.mastery, schedule, now }),
      activeMisconceptions, misconceptionRisk: misconceptionRisk(activeMisconceptions),
    };
  });

  return { userId, profile: profile ?? null, model: model ?? null, concepts, conceptBySlug: Object.fromEntries(concepts.map((c) => [c.slug, c])), misconceptions, now };
}
/** Memoised per request so layouts and pages share one load. */
export const getLearnerSnapshot = cache(loadSnapshot);

/** Recomputes the aggregate learner model from current concept state and attempt history. */
export async function refreshLearnerModel(userId) {
  const [snapshot, attempts] = await Promise.all([loadSnapshot(userId), loadRecentAttempts(userId, 150)]);
  const summary = summarizeModel({ concepts: snapshot.concepts, attempts });
  const values = { ...summary, updatedAt: new Date() };
  await db.insert(t.learnerModels).values({ userId, ...values }).onConflictDoUpdate({ target: t.learnerModels.userId, set: values });
  return summary;
}
