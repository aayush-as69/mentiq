import { cache } from "react";
import { and, desc, eq, inArray, max } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { ApiError } from "@/lib/http";
import { analyzeClass } from "@/engine/classInsights";
import { getSyllabus } from "@/services/syllabus";
import { getLearnerSnapshot, getRecentAttempts } from "@/services/learner";

export const getTeacherClassroom = cache(async (teacherUserId) => {
  const [classroom] = await db.select().from(t.classrooms).where(eq(t.classrooms.teacherId, teacherUserId)).limit(1);
  return classroom ?? null;
});

/** Aggregates every learner model in the classroom. Teachers can only reach their own classroom. */
export const getClassAnalytics = cache(async (classroomId) => {
  const syllabus = await getSyllabus();
  const members = await db
    .select({ id: t.users.id, name: t.users.name, overall: t.learnerModels.overallMastery, totalAttempts: t.learnerModels.totalAttempts, velocity: t.learnerModels.learningVelocity })
    .from(t.studentProfiles)
    .innerJoin(t.users, eq(t.users.id, t.studentProfiles.userId))
    .leftJoin(t.learnerModels, eq(t.learnerModels.userId, t.users.id))
    .where(eq(t.studentProfiles.classroomId, classroomId));
  const ids = members.map((m) => m.id);
  if (!ids.length) return { ...analyzeClass({ students: [], concepts: syllabus.concepts, records: [], misconceptionRows: [], library: syllabus.misconceptions }), classroomId };

  const [records, misc, activity] = await Promise.all([
    db.select({ userId: t.masteryRecords.userId, conceptId: t.masteryRecords.conceptId, mastery: t.masteryRecords.mastery, attempts: t.masteryRecords.attempts }).from(t.masteryRecords).where(inArray(t.masteryRecords.userId, ids)),
    db.select({ userId: t.studentMisconceptions.userId, misconceptionId: t.studentMisconceptions.misconceptionId, status: t.studentMisconceptions.status, occurrences: t.studentMisconceptions.occurrences }).from(t.studentMisconceptions).where(inArray(t.studentMisconceptions.userId, ids)),
    db.select({ userId: t.questionAttempts.userId, last: max(t.questionAttempts.createdAt) }).from(t.questionAttempts).where(inArray(t.questionAttempts.userId, ids)).groupBy(t.questionAttempts.userId),
  ]);
  const lastBy = Object.fromEntries(activity.map((a) => [a.userId, a.last]));
  const students = members.map((m) => ({ id: m.id, name: m.name, overall: m.overall ?? 0, totalAttempts: m.totalAttempts ?? 0, velocity: m.velocity ?? 0, lastActiveAt: lastBy[m.id] ?? null }));
  const misconceptionRows = misc.map((r) => ({ ...r, code: syllabus.misconceptionById[r.misconceptionId]?.code })).filter((r) => r.code);

  return { ...analyzeClass({ students, concepts: syllabus.concepts, records, misconceptionRows, library: syllabus.misconceptions }), classroomId, students };
});

/** Persists the current class insights (rules-generated, flagged so teachers can see their provenance). */
export async function refreshTeacherInsights(classroomId, analysis) {
  const [latest] = await db.select({ at: max(t.teacherInsights.createdAt) }).from(t.teacherInsights).where(eq(t.teacherInsights.classroomId, classroomId));
  if (latest?.at && Date.now() - new Date(latest.at).getTime() < 10 * 60000) return;
  const syllabus = await getSyllabus();
  await db.transaction(async (tx) => {
    await tx.delete(t.teacherInsights).where(eq(t.teacherInsights.classroomId, classroomId));
    if (!analysis.insights.length) return;
    await tx.insert(t.teacherInsights).values(analysis.insights.map((i) => ({
      classroomId, conceptId: syllabus.conceptBySlug[i.conceptSlug]?.id ?? null, kind: i.kind, title: i.title, body: i.body,
      studentCount: i.studentCount, severity: i.severity, aiGenerated: false, data: { source: "learner-model aggregation" },
    })));
  });
}

export async function listInsights(classroomId) {
  return db.select().from(t.teacherInsights).where(eq(t.teacherInsights.classroomId, classroomId)).orderBy(desc(t.teacherInsights.studentCount));
}

/** Loads a student's learner model only if the student belongs to the teacher's classroom. */
export async function getStudentForTeacher(teacherUserId, studentId) {
  const classroom = await getTeacherClassroom(teacherUserId);
  if (!classroom) throw new ApiError(404, "No classroom is assigned to you.");
  const [member] = await db
    .select({ id: t.users.id, name: t.users.name, email: t.users.email })
    .from(t.studentProfiles)
    .innerJoin(t.users, eq(t.users.id, t.studentProfiles.userId))
    .where(and(eq(t.studentProfiles.userId, studentId), eq(t.studentProfiles.classroomId, classroom.id)))
    .limit(1);
  if (!member) return null;
  const [snapshot, attempts] = await Promise.all([getLearnerSnapshot(studentId), getRecentAttempts(studentId, 15)]);
  return { student: member, classroom, snapshot, attempts };
}
