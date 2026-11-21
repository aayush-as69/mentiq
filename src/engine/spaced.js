// Spaced repetition: SM-2 inspired, adjusted by mastery, difficulty and hint use.
import { DAY_MS, clamp } from "./mastery.js";

const MIN_EASE = 1.3;
const MAX_EASE = 3;

function grow(interval, ease, mastery, extras) {
  return Math.max(interval + 1, Math.round(interval * ease * (0.8 + 0.4 * mastery) * extras));
}

/**
 * Computes the next review for a concept after an attempt.
 * Success lengthens the interval (1 → 3 → ×ease…); failure shortens it and lowers ease.
 */
export function nextReview(prev, { isCorrect, flawedReasoning = false, mastery, difficulty = 2, hintsUsed = 0, now = new Date() }) {
  const base = prev ?? { intervalDays: 0, ease: 2.3, repetitions: 0, lapses: 0, lastReviewedAt: null, dueAt: null };
  const success = isCorrect && !flawedReasoning && hintsUsed < 3;
  const hoursSince = base.lastReviewedAt ? (new Date(now) - new Date(base.lastReviewedAt)) / 3600000 : Infinity;
  let { intervalDays, ease, repetitions, lapses } = base;
  let dueAt;

  if (success) {
    const sameSession = hoursSince < 8 && repetitions > 0;
    if (sameSession) {
      dueAt = base.dueAt ? new Date(base.dueAt) : new Date(new Date(now).getTime() + intervalDays * DAY_MS);
    } else {
      repetitions += 1;
      if (repetitions === 1) intervalDays = 1;
      else if (repetitions === 2) intervalDays = 3;
      else intervalDays = grow(intervalDays, ease, mastery, (hintsUsed > 0 ? 0.75 : 1) * (difficulty >= 3 ? 1.1 : 1));
      ease = clamp(ease + (hintsUsed === 0 ? 0.1 : 0.03), MIN_EASE, MAX_EASE);
      dueAt = new Date(new Date(now).getTime() + intervalDays * DAY_MS);
    }
  } else {
    lapses += 1;
    ease = clamp(ease - 0.2, MIN_EASE, MAX_EASE);
    intervalDays = Math.max(1, Math.floor((intervalDays || 1) * 0.4));
    repetitions = Math.max(0, repetitions - 2);
    dueAt = new Date(new Date(now).getTime() + intervalDays * DAY_MS);
  }

  return {
    dueAt, intervalDays, ease, repetitions, lapses,
    lastReviewedAt: new Date(now),
    lastResult: success ? "recalled" : "failed",
  };
}

/** Projects the next four reviews assuming successful recall each time (for the dashboard ladder). */
export function projectLadder(schedule, mastery, now = new Date()) {
  let repetitions = schedule?.repetitions ?? 0;
  let interval = schedule?.intervalDays ?? 0;
  const ease = schedule?.ease ?? 2.3;
  let day = schedule?.dueAt ? Math.max(0, Math.ceil((new Date(schedule.dueAt) - new Date(now)) / DAY_MS)) : 0;
  const steps = [];
  for (let i = 0; i < 4; i += 1) {
    steps.push({ day, interval: i === 0 ? interval : null });
    repetitions += 1;
    interval = repetitions === 1 ? 1 : repetitions === 2 ? 3 : grow(interval, ease, mastery, 1);
    day += interval;
  }
  return steps;
}

/** Human-readable explanation of why a review is scheduled. */
export function reviewReason({ concept, schedule, mastery, now = new Date() }) {
  if (!schedule) return `${concept.name} hasn't been reviewed yet.`;
  const lastDays = schedule.lastReviewedAt ? Math.round((new Date(now) - new Date(schedule.lastReviewedAt)) / DAY_MS) : null;
  const when = lastDays === null ? "" : lastDays === 0 ? "earlier today" : `${lastDays} day${lastDays === 1 ? "" : "s"} ago`;
  if (schedule.lastResult === "failed") {
    return `You missed this on your last attempt${when ? ` (${when})` : ""}, so the interval was shortened to ${Math.round(schedule.intervalDays)} day${schedule.intervalDays === 1 ? "" : "s"}.`;
  }
  return `Your last successful recall was ${when || "recent"} and this concept is scheduled for spaced review (mastery ${Math.round(mastery * 100)}%).`;
}
