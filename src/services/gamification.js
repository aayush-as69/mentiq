import { cache } from "react";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { getLearnerSnapshot } from "@/services/learner";
import { streakFromDays } from "@/services/analytics";

const BADGES = [
  { code: "first-model", title: "Model Built", description: "Completed the diagnostic", earned: (s) => s.diagnosticDone },
  { code: "ten-solved", title: "Warm-up", description: "Solved 10 questions", earned: (s) => s.attempts >= 10 },
  { code: "hundred-solved", title: "Centurion", description: "Answered 100 questions", earned: (s) => s.attempts >= 100 },
  { code: "streak-3", title: "3-Day Streak", description: "Learned 3 days in a row", earned: (s) => s.streak >= 3 },
  { code: "streak-7", title: "Week of Focus", description: "Learned 7 days in a row", earned: (s) => s.streak >= 7 },
  { code: "master-1", title: "First Mastery", description: "Mastered your first concept", earned: (s) => s.mastered >= 1 },
  { code: "master-5", title: "Five Concepts", description: "Mastered 5 concepts", earned: (s) => s.mastered >= 5 },
  { code: "master-10", title: "Ten Concepts", description: "Mastered 10 concepts", earned: (s) => s.mastered >= 10 },
  { code: "myth-buster", title: "Myth Buster", description: "Resolved a misconception", earned: (s) => s.resolvedMisconceptions >= 1 },
  { code: "retention", title: "Retention Keeper", description: "Recalled a concept through 3 spaced reviews", earned: (s) => s.maxRepetitions >= 3 },
  { code: "exam-taker", title: "Exam Ready", description: "Completed a mock exam", earned: (s) => s.exams >= 1 },
];

/** Educational gamification: streaks, mastery milestones, weekly goal and badges — no leaderboards. */
export const getGamification = cache(async (userId) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const [snapshot, dayRows, [{ total }], [{ week }], [{ exams }], earnedRows] = await Promise.all([
    getLearnerSnapshot(userId),
    db.selectDistinct({ day: sql`to_char(${t.questionAttempts.createdAt}, 'YYYY-MM-DD')` }).from(t.questionAttempts).where(and(eq(t.questionAttempts.userId, userId), gte(t.questionAttempts.createdAt, new Date(now.getTime() - 120 * 86400000)))),
    db.select({ total: count() }).from(t.questionAttempts).where(eq(t.questionAttempts.userId, userId)),
    db.select({ week: count() }).from(t.questionAttempts).where(and(eq(t.questionAttempts.userId, userId), gte(t.questionAttempts.createdAt, weekAgo))),
    db.select({ exams: count() }).from(t.examAttempts).where(and(eq(t.examAttempts.userId, userId), eq(t.examAttempts.status, "submitted"))),
    db.select().from(t.userBadges).where(eq(t.userBadges.userId, userId)),
  ]);

  const stats = {
    diagnosticDone: Boolean(snapshot.profile?.diagnosticCompletedAt), attempts: total,
    streak: streakFromDays(dayRows.map((r) => r.day), now),
    mastered: snapshot.concepts.filter((c) => c.status === "mastered").length,
    resolvedMisconceptions: snapshot.misconceptions.filter((m) => m.status === "resolved").length,
    maxRepetitions: Math.max(0, ...snapshot.concepts.map((c) => c.schedule?.repetitions ?? 0)), exams,
  };

  const awardedAt = Object.fromEntries(earnedRows.map((b) => [b.code, b.awardedAt]));
  const fresh = BADGES.filter((b) => b.earned(stats) && !awardedAt[b.code]);
  if (fresh.length) {
    await db.insert(t.userBadges).values(fresh.map((b) => ({ userId, code: b.code }))).onConflictDoNothing();
    for (const b of fresh) awardedAt[b.code] = now;
  }

  const goal = snapshot.profile?.weeklyGoal ?? 30;
  return {
    stats, weekly: { done: week, goal, ratio: Math.min(1, week / goal) },
    badges: BADGES.map((b) => ({ code: b.code, title: b.title, description: b.description, earned: Boolean(awardedAt[b.code]), awardedAt: awardedAt[b.code] ?? null })),
    nextMilestone: [1, 5, 10, 20].find((n) => n > stats.mastered) ?? null,
  };
});
