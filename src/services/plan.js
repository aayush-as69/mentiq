import { cache } from "react";
import { db } from "@/db";
import * as t from "@/db/schema";
import { buildPlan } from "@/engine/plan";
import { isoDay } from "@/lib/format";
import { getLearnerSnapshot, getRecentAttempts } from "@/services/learner";

/** Today's plan, regenerated from the live learner model (so it changes as the student improves). */
export const getTodayPlan = cache(async (userId) => {
  const now = new Date();
  const [snapshot, attempts] = await Promise.all([getLearnerSnapshot(userId), getRecentAttempts(userId, 60)]);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const todayCounts = {};
  for (const a of attempts) {
    if (new Date(a.createdAt) >= startOfToday && a.context === "practice") todayCounts[a.conceptSlug] = (todayCounts[a.conceptSlug] ?? 0) + 1;
  }
  const plan = buildPlan({
    concepts: snapshot.concepts, dailyMinutes: snapshot.profile?.dailyMinutes ?? 45, todayCounts,
    diagnosticDone: Boolean(snapshot.profile?.diagnosticCompletedAt), recentAttempts: attempts, now,
  });
  const values = { items: plan.items, summary: plan.summary, generatedAt: now };
  await db.insert(t.studyPlans).values({ userId, planDate: isoDay(now), ...values })
    .onConflictDoUpdate({ target: [t.studyPlans.userId, t.studyPlans.planDate], set: values });
  return plan;
});
