// Deterministic living-mastery model. Pure functions only — no database, no AI.
export const DAY_MS = 86400000;
export const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

const DIFFICULTY_OFFSET = [0.2, 0.45, 0.65, 0.85]; // mastery level at which a question is a coin-flip-ish
const HINT_CREDIT = [1, 0.8, 0.55, 0.3, 0];

export function statusFor(mastery, attempts) {
  if (!attempts) return "not_started";
  if (mastery >= 0.8) return "mastered";
  if (mastery >= 0.5) return "learning";
  return "weak";
}

/** Probability that a student at `mastery` answers a question of `difficulty` (1-4) correctly. */
export function expectedSuccess(mastery, difficulty) {
  const offset = DIFFICULTY_OFFSET[(difficulty || 2) - 1] ?? 0.45;
  return 1 / (1 + Math.exp(-6 * (mastery - offset)));
}

export function emptyRecord() {
  return {
    mastery: 0.5, confidence: 0.5, accuracy: 0, attempts: 0, correct: 0, avgTimeSeconds: 0,
    difficultyHandled: 0, recentResults: [], trend: "new", hintRate: 0,
  };
}

export function computeTrend(results) {
  if (results.length < 3) return "new";
  const last = mean(results.slice(-3));
  const prior = results.slice(-8, -3);
  if (!prior.length) return last >= 0.67 ? "improving" : last <= 0.34 ? "declining" : "steady";
  const diff = last - mean(prior);
  return diff > 0.2 ? "improving" : diff < -0.2 ? "declining" : "steady";
}

/**
 * Elo-style update: the change is proportional to (outcome − expected success), so beating a hard question
 * moves mastery more than an easy one, and learning slows as evidence accumulates.
 * evidence: { isCorrect, difficulty, selfConfidence, hintsUsed, timeSeconds, expectedSeconds, errorType, flawedReasoning }
 */
export function updateMastery(prev, evidence) {
  const n = prev.attempts;
  const learningRate = Math.max(0.14, 0.42 / Math.sqrt(1 + n * 0.6));
  const hints = Math.min(4, evidence.hintsUsed || 0);

  let outcome;
  if (evidence.isCorrect) {
    outcome = HINT_CREDIT[hints];
    if (evidence.flawedReasoning) outcome = Math.min(outcome, 0.5);
    if (evidence.expectedSeconds && evidence.timeSeconds > evidence.expectedSeconds * 2.5) outcome *= 0.9;
  } else {
    // A calculation or careless slip is weaker evidence against understanding than a misconception.
    outcome = { calculation_error: 0.4, careless_error: 0.45 }[evidence.errorType] ?? 0;
  }

  let delta = learningRate * (outcome - expectedSuccess(prev.mastery, evidence.difficulty)) * 1.4;
  delta = clamp(delta, -0.2, 0.2);
  if (evidence.isCorrect && !evidence.flawedReasoning) delta = Math.max(0, delta);
  if (evidence.isCorrect && hints >= 4) delta = 0;

  const mastery = clamp(prev.mastery + delta, 0.03, 0.98);
  const selfConfidence = evidence.selfConfidence ?? 0.6;
  const sample = evidence.isCorrect ? 0.4 + 0.6 * selfConfidence : 0.35 * (1 - selfConfidence);
  const confidence = n === 0 ? sample : clamp(prev.confidence * 0.7 + sample * 0.3);
  const solvedClean = evidence.isCorrect && !evidence.flawedReasoning;
  const recentResults = [...prev.recentResults, solvedClean ? 1 : 0].slice(-10);
  const correct = prev.correct + (evidence.isCorrect ? 1 : 0);

  return {
    mastery,
    confidence,
    accuracy: correct / (n + 1),
    attempts: n + 1,
    correct,
    avgTimeSeconds: (prev.avgTimeSeconds * n + (evidence.timeSeconds || 0)) / (n + 1),
    difficultyHandled: solvedClean && hints < 2 ? Math.max(prev.difficultyHandled, evidence.difficulty) : prev.difficultyHandled,
    recentResults,
    trend: computeTrend(recentResults),
    hintRate: (prev.hintRate * n + hints / 4) / (n + 1),
    delta: mastery - prev.mastery,
  };
}

/** Estimated probability of recalling a concept right now (forgetting curve scaled by review interval). */
export function retentionEstimate({ mastery, schedule, now = new Date() }) {
  if (!schedule?.lastReviewedAt) return null;
  const days = Math.max(0, (new Date(now) - new Date(schedule.lastReviewedAt)) / DAY_MS);
  const stability = Math.max(1, schedule.intervalDays) * (2 + 2 * mastery);
  return clamp(Math.exp(-days / stability));
}

/** Misconception risk from the student's active/improving misconceptions on a concept. */
export function misconceptionRisk(active) {
  if (!active.length) return "none";
  const live = active.filter((m) => m.status === "active");
  const maxSeverity = Math.max(...active.map((m) => m.severity));
  if (live.length >= 2 || live.some((m) => m.severity >= 3)) return "high";
  if (live.length === 1 || maxSeverity >= 3) return "medium";
  return "low";
}
