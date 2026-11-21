// Aggregates per-concept mastery and attempt history into the student-level learner model.
import { DAY_MS, mean } from "./mastery.js";
import { calibrate } from "./difficulty.js";
import { rankConcepts } from "./selector.js";

export const TYPE_LABELS = {
  mcq: "Factual recall", conceptual: "Conceptual questions", numerical: "Numerical problems",
  application: "Multi-step application problems", assertion_reasoning: "Assertion–reasoning", short_answer: "Short written answers",
};

export function summarizeModel({ concepts, attempts, now = new Date() }) {
  const started = concepts.filter((c) => c.attempts > 0);
  const overallMastery = mean(started.map((c) => c.mastery));

  const weekAgo = new Date(now).getTime() - 7 * DAY_MS;
  const weekGain = attempts
    .filter((a) => new Date(a.createdAt).getTime() >= weekAgo && a.masteryBefore !== null && a.masteryAfter !== null)
    .reduce((sum, a) => sum + (a.masteryAfter - a.masteryBefore), 0);
  const learningVelocity = started.length ? weekGain / started.length : 0;

  const typeStats = {};
  for (const a of attempts) {
    const s = (typeStats[a.questionType] ??= { attempts: 0, correct: 0 });
    s.attempts += 1;
    s.correct += a.isCorrect ? 1 : 0;
  }
  for (const s of Object.values(typeStats)) s.accuracy = s.correct / s.attempts;

  const recent = attempts.slice(0, 40);
  const hintDependency = mean(recent.map((a) => (a.hintsUsed ?? 0) / 4));
  const rated = recent.filter((a) => a.selfConfidence !== null && a.selfConfidence !== undefined);
  const gap = rated.length >= 5 ? mean(rated.map((a) => a.selfConfidence)) - mean(rated.map((a) => (a.isCorrect ? 1 : 0))) : 0;
  const calibration = {
    gap, samples: rated.length,
    label: rated.length < 5 ? "not_enough_data" : gap > 0.2 ? "overconfident" : gap < -0.2 ? "underconfident" : "well_calibrated",
  };

  const strengths = [];
  const needsImprovement = [];
  for (const [type, s] of Object.entries(typeStats)) {
    if (s.attempts < 3) continue;
    const label = TYPE_LABELS[type] ?? type;
    const evidence = `${Math.round(s.accuracy * 100)}% correct over ${s.attempts} questions`;
    if (s.accuracy >= 0.75) strengths.push({ label, evidence });
    else if (s.accuracy < 0.55) needsImprovement.push({ label, evidence });
  }
  const errors = attempts.slice(0, 60).reduce((acc, a) => ({ ...acc, [a.errorType]: (acc[a.errorType] ?? 0) + 1 }), {});
  if ((errors.calculation_error ?? 0) >= 3) needsImprovement.push({ label: "Unit conversion & careful arithmetic", evidence: `${errors.calculation_error} calculation slips recently` });
  if ((errors.careless_error ?? 0) >= 3) needsImprovement.push({ label: "Re-checking answers before submitting", evidence: `${errors.careless_error} careless slips on known concepts` });
  const visual = concepts.filter((c) => ["ray-diagrams", "lenses", "spherical-mirrors"].includes(c.slug) && c.attempts > 0);
  if (visual.length && mean(visual.map((c) => c.mastery)) >= 0.7) strengths.push({ label: "Visual reasoning", evidence: "Strong on mirrors, lenses and ray diagrams" });
  if (attempts.length >= 10 && hintDependency < 0.08) strengths.push({ label: "Independent problem solving", evidence: "Rarely needs hints" });
  if (hintDependency > 0.3) needsImprovement.push({ label: "Relying on hints", evidence: "Hints are used on many questions" });
  if (calibration.label === "overconfident") needsImprovement.push({ label: "Confidence calibration", evidence: "You tend to feel surer than your results justify" });

  return {
    overallMastery, learningVelocity, difficultyProfile: calibrate(attempts), strengths, needsImprovement,
    questionTypeStats: typeStats, hintDependency, calibration, totalAttempts: attempts.length,
    currentFocusSlug: rankConcepts(concepts, { recentAttempts: attempts, now })[0]?.concept.slug ?? null,
  };
}
