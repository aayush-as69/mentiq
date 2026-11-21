import { cache } from "react";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { DAY_MS } from "@/lib/format";
import { getLearnerSnapshot, getRecentAttempts } from "@/services/learner";
import { getTodayPlan } from "@/services/plan";

/** Useful, non-spammy reminders: at most four, ranked by value, computed from the learner model. */
export const getNotifications = cache(async (userId) => {
  const now = new Date();
  const [snapshot, attempts, plan, [openExam]] = await Promise.all([
    getLearnerSnapshot(userId),
    getRecentAttempts(userId, 30),
    getTodayPlan(userId),
    db.select({ id: t.examAttempts.id }).from(t.examAttempts).where(and(eq(t.examAttempts.userId, userId), eq(t.examAttempts.status, "in_progress"))).limit(1),
  ]);
  const list = [];
  if (!snapshot.profile?.diagnosticCompletedAt) {
    return [{ id: "diagnostic", kind: "plan", title: "Build your learner model", body: "Take the diagnostic so Mentiq can personalise everything.", href: "/diagnostic" }];
  }

  if (openExam) list.push({ id: "exam", kind: "session", title: "Unfinished mock exam", body: "Your timer is still running — pick up where you left off.", href: `/exam/${openExam.id}` });

  const due = snapshot.concepts.filter((c) => c.attempts > 0 && c.schedule && new Date(c.schedule.dueAt) <= now);
  if (due.length) list.push({ id: "reviews", kind: "review", title: `${due.length} concept${due.length === 1 ? "" : "s"} due for review`, body: `Start with ${due[0].name} to keep recall strong.`, href: "/reviews" });

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const practicedToday = attempts.some((a) => new Date(a.createdAt) >= todayStart);
  if (!practicedToday && plan.items.length) list.push({ id: "plan", kind: "plan", title: "Today's plan is ready", body: `${plan.items.length} tasks · about ${plan.totalMinutes} minutes.`, href: "/plan" });

  const neglected = snapshot.concepts
    .filter((c) => c.status === "weak" && c.lastPracticedAt && now - new Date(c.lastPracticedAt) > 3 * DAY_MS)
    .sort((a, b) => a.mastery - b.mastery)[0];
  if (neglected) list.push({ id: `weak-${neglected.slug}`, kind: "weak", title: `${neglected.name} needs attention`, body: `Mastery is ${Math.round(neglected.mastery * 100)}% and it hasn't been practised in 3+ days.`, href: `/practice?concept=${neglected.slug}` });

  const target = snapshot.profile?.targetScore;
  const overall = snapshot.model?.overallMastery ?? 0;
  if (target && overall * 100 < target) list.push({ id: "target", kind: "milestone", title: "Exam target check-in", body: `You're at ${Math.round(overall * 100)}% mastery against a ${target}% target — ${Math.round(target - overall * 100)} points to go.`, href: "/progress" });

  return list.slice(0, 4);
});
