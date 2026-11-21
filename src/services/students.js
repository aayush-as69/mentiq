import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { ApiError } from "@/lib/http";

export const getStudentProfile = cache(async (userId) => {
  const [profile] = await db.select().from(t.studentProfiles).where(eq(t.studentProfiles.userId, userId)).limit(1);
  return profile ?? null;
});

export async function saveOnboarding(userId, input) {
  const [subject] = await db.select().from(t.subjects).limit(1);
  let classroomId = null;
  if (input.joinCode) {
    const [classroom] = await db.select().from(t.classrooms).where(eq(t.classrooms.joinCode, input.joinCode.trim().toUpperCase())).limit(1);
    if (!classroom) throw new ApiError(400, "That classroom code wasn't found. Check with your teacher or leave it blank.");
    classroomId = classroom.id;
  }
  const values = {
    classroomId, subjectId: subject?.id ?? null, grade: input.grade, exam: input.exam, confidence: input.confidence, goals: input.goals,
    pace: input.pace, dailyMinutes: input.dailyMinutes, targetScore: input.targetScore ?? null, weeklyGoal: input.weeklyGoal, onboardedAt: new Date(),
  };
  await db.insert(t.studentProfiles).values({ userId, ...values }).onConflictDoUpdate({ target: t.studentProfiles.userId, set: values });
  await db.insert(t.learnerModels).values({ userId }).onConflictDoNothing();
}
