import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import * as t from "@/db/schema";
import { isoDay } from "@/lib/format";
import { mean } from "@/engine/mastery";
import { getLearnerSnapshot } from "@/services/learner";

export function streakFromDays(days, now = new Date()) {
  const set = new Set(days);
  const cursor = new Date(now);
  if (!set.has(isoDay(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (set.has(isoDay(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/** Answers "is the student actually learning?" with series, not vanity totals. */
export const getProgressAnalytics = cache(async (userId) => {
  const now = new Date();
  const [snapshots, attempts, snapshot] = await Promise.all([
    db.select().from(t.masterySnapshots).where(eq(t.masterySnapshots.userId, userId)).orderBy(asc(t.masterySnapshots.createdAt), asc(t.masterySnapshots.id)).limit(6000),
    db.select().from(t.questionAttempts).where(eq(t.questionAttempts.userId, userId)).orderBy(asc(t.questionAttempts.createdAt), asc(t.questionAttempts.id)).limit(4000),
    getLearnerSnapshot(userId),
  ]);

  // Mastery over time: carry each concept's latest value forward day by day.
  const latest = {};
  const masteryByDay = new Map();
  for (const s of snapshots) {
    latest[s.conceptId] = s.mastery;
    const values = Object.values(latest);
    masteryByDay.set(isoDay(s.createdAt), { date: isoDay(s.createdAt), mastery: mean(values), mastered: values.filter((v) => v >= 0.8).length, concepts: values.length });
  }
  const masteryOverTime = [...masteryByDay.values()];

  const daily = new Map();
  const lastAttemptByConcept = {};
  let recallTotal = 0;
  let recallCorrect = 0;
  for (const a of attempts) {
    const day = isoDay(a.createdAt);
    const d = daily.get(day) ?? { date: day, attempts: 0, correct: 0, difficultySum: 0, seconds: 0 };
    d.attempts += 1;
    d.correct += a.isCorrect ? 1 : 0;
    d.difficultySum += a.difficulty;
    d.seconds += a.timeSeconds;
    daily.set(day, d);
    const prev = lastAttemptByConcept[a.conceptId];
    if (prev && new Date(a.createdAt) - prev >= 86400000) {
      recallTotal += 1;
      recallCorrect += a.isCorrect ? 1 : 0;
    }
    lastAttemptByConcept[a.conceptId] = new Date(a.createdAt);
  }
  const days = [...daily.values()];
  const accuracyOverTime = days.map((d) => ({ date: d.date, accuracy: d.correct / d.attempts, attempts: d.attempts }));
  const difficultyProgression = days.map((d) => ({ date: d.date, difficulty: d.difficultySum / d.attempts }));

  const scheduled = snapshot.concepts.filter((c) => c.retention !== null);
  const misc = snapshot.misconceptions;
  const resolved = misc.filter((m) => m.status === "resolved").length;
  const weekAgo = Date.now() - 7 * 86400000;
  const weeklySeconds = attempts.filter((a) => new Date(a.createdAt).getTime() >= weekAgo).reduce((s, a) => s + a.timeSeconds, 0);
  const streak = streakFromDays(days.map((d) => d.date), now);

  // Verdict compares early vs recent evidence.
  const firstAcc = mean(attempts.slice(0, 12).map((a) => (a.isCorrect ? 1 : 0)));
  const lastAcc = mean(attempts.slice(-12).map((a) => (a.isCorrect ? 1 : 0)));
  const reference = masteryOverTime.find((p) => new Date(p.date) >= new Date(now.getTime() - 21 * 86400000)) ?? masteryOverTime[0];
  const masteryChange = masteryOverTime.length ? masteryOverTime.at(-1).mastery - reference.mastery : 0;
  const verdict =
    attempts.length < 10
      ? { label: "Not enough data yet", tone: "slate", body: "Complete more practice so Mentiq can measure real change." }
      : masteryChange >= 0.08 && lastAcc >= firstAcc
        ? { label: "Yes — measurable learning", tone: "emerald", body: `Mastery rose ${Math.round(masteryChange * 100)} points recently and accuracy on recent questions is ${Math.round(lastAcc * 100)}% (vs ${Math.round(firstAcc * 100)}% at the start).` }
        : masteryChange > 0.02
          ? { label: "Early signs of learning", tone: "sky", body: `Mastery is up ${Math.round(masteryChange * 100)} points. Keep practising weak concepts to lock it in.` }
          : { label: "Not yet — change the approach", tone: "amber", body: "Mastery is flat. Focus on the active misconceptions and use hints less, so feedback can do its work." };

  return {
    masteryOverTime, accuracyOverTime, difficultyProgression, daily: days.slice(-14).map((d) => ({ date: d.date, attempts: d.attempts, minutes: Math.round(d.seconds / 60) })),
    retention: { average: scheduled.length ? mean(scheduled.map((c) => c.retention)) : null, recallRate: recallTotal ? recallCorrect / recallTotal : null, recallSamples: recallTotal },
    misconceptions: { total: misc.length, active: misc.filter((m) => m.status === "active").length, improving: misc.filter((m) => m.status === "improving").length, resolved, resolutionRate: misc.length ? resolved / misc.length : null },
    streak, weeklyMinutes: Math.round(weeklySeconds / 60), totalAttempts: attempts.length, verdict,
  };
});
