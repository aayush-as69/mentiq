// Generates realistic learner-model data (mastery, attempt history, snapshots, review schedules) for demo students.
import { DAY_MS, clamp, computeTrend } from "../../engine/mastery.js";

export function mulberry32(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rng, xs) => xs[Math.floor(rng() * xs.length)];
const randInt = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

/**
 * Builds one student's history. `targets` maps concept slug → final mastery (missing = not started).
 * `liveMisconceptionConcepts` is a Set of concept slugs where the student currently holds a misconception.
 */
export function buildStudentHistory({ rng, userId, targets, conceptRows, questionsBySlug, liveMisconceptionConcepts, attemptsRange, daysSpan, idleDays = 0, streakDays = 0, now }) {
  const records = [];
  const snapshots = [];
  const attempts = [];
  const schedules = [];

  for (const concept of conceptRows) {
    const final = targets[concept.slug];
    if (final === undefined) continue;
    const pool = questionsBySlug[concept.slug] ?? [];
    const n = randInt(rng, attemptsRange[0], attemptsRange[1]);
    const start = clamp(final - (0.15 + rng() * 0.25), 0.1, final);
    const lastDay = idleDays + randInt(rng, 0, 4);
    const results = [];
    let correct = 0;
    let seconds = 0;
    let hints = 0;
    let maxDifficulty = 0;
    let lastAt = null;

    for (let i = 0; i < n; i += 1) {
      const before = i === 0 ? 0.5 : start + (final - start) * (i / n);
      const after = start + (final - start) * ((i + 1) / n);
      const wanted = clamp(Math.round(1 + after * 3 + (rng() - 0.5)), 1, 4);
      const question = [...pool].sort((a, b) => Math.abs(a.difficulty - wanted) - Math.abs(b.difficulty - wanted) || rng() - 0.5)[0];
      if (!question) continue;
      const ok = rng() < clamp(after + 0.15 - (question.difficulty - 1) * 0.12, 0.1, 0.97);
      const daysAgo = n === 1 ? lastDay : daysSpan + (lastDay - daysSpan) * (i / (n - 1));
      const createdAt = new Date(now.getTime() - daysAgo * DAY_MS - randInt(rng, 0, 10) * 3600000);
      const hintsUsed = ok ? (rng() < 0.12 ? 1 : 0) : rng() < 0.3 ? 1 : 0;
      const timeSeconds = Math.round(question.estimatedSeconds * (0.6 + rng() * 0.8));
      attempts.push({
        userId, questionId: question.id, conceptId: concept.id, context: i === 0 ? "diagnostic" : "practice", answer: ok ? question.correctAnswer : "—",
        isCorrect: ok, timeSeconds, selfConfidence: pick(rng, ok ? [0.6, 0.9, 0.9] : [0.25, 0.6, 0.9]), hintsUsed,
        errorType: ok ? "none" : liveMisconceptionConcepts.has(concept.slug) && rng() < 0.7 ? "misconception" : pick(rng, ["knowledge_gap", "knowledge_gap", "calculation_error", "careless_error"]),
        difficulty: question.difficulty, questionType: question.type, masteryBefore: before, masteryAfter: after, createdAt,
      });
      snapshots.push({ userId, conceptId: concept.id, mastery: after, createdAt });
      results.push(ok ? 1 : 0);
      correct += ok ? 1 : 0;
      seconds += timeSeconds;
      hints += hintsUsed;
      if (ok && hintsUsed < 2) maxDifficulty = Math.max(maxDifficulty, question.difficulty);
      lastAt = createdAt;
    }
    if (!lastAt) continue;

    records.push({
      userId, conceptId: concept.id, mastery: final, confidence: clamp(final * 0.9 + rng() * 0.1), accuracy: correct / results.length, attempts: results.length,
      correct, avgTimeSeconds: seconds / results.length, difficultyHandled: maxDifficulty, recentResults: results.slice(-10), trend: computeTrend(results.slice(-10)),
      hintRate: hints / results.length / 4, lastPracticedAt: lastAt, updatedAt: lastAt,
    });
    const interval = final >= 0.8 ? pick(rng, [9, 20]) : final >= 0.6 ? 4 : final >= 0.4 ? 2 : 1;
    schedules.push({
      userId, conceptId: concept.id, dueAt: new Date(lastAt.getTime() + interval * DAY_MS), intervalDays: interval, ease: 2.1 + rng() * 0.5,
      repetitions: final >= 0.8 ? 3 : final >= 0.6 ? 2 : 1, lapses: final < 0.5 ? 1 : 0, lastReviewedAt: lastAt, lastResult: results.at(-1) ? "recalled" : "failed",
    });
  }

  // Guarantee a visible learning streak by adding light practice on each of the last `streakDays` days.
  for (let d = 1; d <= streakDays; d += 1) {
    for (let k = 0; k < 2; k += 1) {
      const record = pick(rng, records);
      const question = pick(rng, questionsBySlug[conceptRows.find((c) => c.id === record.conceptId).slug]);
      attempts.push({
        userId, questionId: question.id, conceptId: record.conceptId, context: "practice", answer: question.correctAnswer, isCorrect: rng() < 0.7,
        timeSeconds: Math.round(question.estimatedSeconds * 0.9), selfConfidence: 0.6, hintsUsed: 0, errorType: "none", difficulty: question.difficulty,
        questionType: question.type, masteryBefore: record.mastery, masteryAfter: record.mastery, createdAt: new Date(now.getTime() - d * DAY_MS + k * 3600000),
      });
    }
  }
  for (const a of attempts) if (!a.isCorrect && a.errorType === "none") a.errorType = "knowledge_gap";

  const lastActiveAt = attempts.reduce((latest, a) => (a.createdAt > latest ? a.createdAt : latest), new Date(0));
  return { records, snapshots, attempts, schedules, lastActiveAt };
}
