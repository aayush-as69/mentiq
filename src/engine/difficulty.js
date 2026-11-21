// Dynamic difficulty calibration: learn which levels the student is genuinely ready for.
import { clamp } from "./mastery.js";

export const LEVELS = [
  { level: 1, label: "Easy" },
  { level: 2, label: "Medium" },
  { level: 3, label: "Hard" },
  { level: 4, label: "Advanced" },
];
export const levelLabel = (level) => LEVELS[(level || 1) - 1]?.label ?? "Medium";

/** attempts: newest first, each { difficulty, isCorrect, hintsUsed }. Recent evidence weighs more. */
export function calibrate(attempts) {
  const stats = LEVELS.map((l) => ({ ...l, weight: 0, score: 0, count: 0 }));
  attempts.forEach((a, index) => {
    const s = stats[(a.difficulty || 2) - 1];
    const w = Math.pow(0.95, index);
    s.weight += w;
    s.score += w * (a.isCorrect ? ((a.hintsUsed ?? 0) >= 2 ? 0.6 : 1) : 0);
    s.count += 1;
  });

  const levels = stats.map((s) => {
    const accuracy = s.weight ? s.score / s.weight : null;
    const status = s.count === 0 ? "untested" : s.count < 3 ? "building" : accuracy >= 0.7 ? "ready" : accuracy < 0.5 ? "not_ready" : "building";
    return { level: s.level, label: s.label, attempts: s.count, accuracy, status };
  });

  const highestReady = [...levels].reverse().find((l) => l.status === "ready")?.level ?? 0;
  const total = attempts.length;
  const recommended = highestReady ? Math.min(4, highestReady + 1) : total ? 1 : 2;
  const verdict =
    highestReady === 0
      ? "Still building a foundation — Easy questions come first."
      : highestReady === 4
        ? "Handling Advanced application questions well."
        : `Ready for ${levelLabel(highestReady)} questions but not yet for ${levelLabel(highestReady + 1)} ones.`;

  return { levels, recommended, highestReady, totalAttempts: total, verdict };
}

/**
 * Chooses a difficulty for one concept. Mastery sets the baseline; recent results on that concept
 * can hold or shift it — a single success never triggers a big jump, repeated success does.
 */
export function targetDifficulty({ mastery, started, recentOnConcept, calibration, hasMisconception, challenge }) {
  let level = !started ? 2 : mastery < 0.4 ? 1 : mastery < 0.65 ? 2 : mastery < 0.85 ? 3 : 4;
  let reason = started ? `Mastery of ${Math.round(mastery * 100)}% suggests ${levelLabel(level)} questions.` : "New concept — starting at Medium to measure your level.";

  if (hasMisconception) {
    level = Math.min(level, 2);
    reason = "An active misconception — starting with a simpler conceptual check before harder problems.";
  }

  const [last] = recentOnConcept;
  if (last) {
    let streak = 0;
    for (const a of recentOnConcept) {
      if (a.isCorrect && (a.hintsUsed ?? 0) < 2) streak += 1;
      else break;
    }
    const recentWrong = recentOnConcept.slice(0, 3).filter((a) => !a.isCorrect).length;
    if (!last.isCorrect) {
      level = Math.min(level, last.difficulty);
      if (recentWrong >= 2 && last.difficulty > 1) level = last.difficulty - 1;
      reason = recentWrong >= 2 ? "Repeated misses — stepping down one level to rebuild confidence." : "Your last answer was incorrect — staying at this level until it is solid.";
    } else if (streak >= 2) {
      level = Math.max(level, Math.min(4, last.difficulty + 1));
      reason = `${streak} correct in a row at ${levelLabel(last.difficulty)} — moving up.`;
    } else if (!hasMisconception) {
      level = Math.max(level, last.difficulty);
      reason = `One success at ${levelLabel(last.difficulty)} — consolidating before a bigger jump.`;
    }
  }

  if (challenge) {
    level += 1;
    reason = "Challenge mode — one level above your usual.";
  }

  const cap = calibration.totalAttempts < 12 ? 4 : Math.min(4, calibration.recommended + 1);
  if (level > cap) reason += ` Capped at ${levelLabel(cap)} because ${levelLabel(cap + 1)} accuracy isn't there yet.`;
  return { level: clamp(level, 1, cap), reason };
}
