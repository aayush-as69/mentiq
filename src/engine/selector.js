// Adaptive question engine: chooses Concept + Difficulty + Question type + Learning objective — and explains why.
import { DAY_MS } from "./mastery.js";
import { levelLabel, targetDifficulty } from "./difficulty.js";

const TYPE_PREFERENCE = {
  1: ["conceptual", "mcq", "assertion_reasoning"],
  2: ["numerical", "conceptual", "mcq", "short_answer"],
  3: ["numerical", "application", "assertion_reasoning", "mcq"],
  4: ["application", "assertion_reasoning", "numerical"],
};
const FIX_TYPES = ["conceptual", "assertion_reasoning", "short_answer", "mcq", "numerical"];

/** Priority score for every concept — the single source of truth for "what needs attention". */
export function rankConcepts(concepts, { recentAttempts = [], now = new Date() } = {}) {
  const bySlug = Object.fromEntries(concepts.map((c) => [c.slug, c]));
  return concepts
    .map((concept) => {
      const started = concept.attempts > 0;
      const mastery = started ? concept.mastery : 0.5;
      let score = (1 - mastery) * 3;
      const overdueDays = concept.schedule && started ? (new Date(now) - new Date(concept.schedule.dueAt)) / DAY_MS : null;
      if (overdueDays !== null && overdueDays >= 0) score += 1 + (Math.min(overdueDays, 7) / 7) * 1.5;
      const activeMis = concept.activeMisconceptions.filter((m) => m.status !== "resolved");
      if (activeMis.length) score += Math.max(...activeMis.map((m) => m.severity)) * 0.5 + (activeMis.some((m) => m.status === "active") ? 0.5 : 0);
      const lastTwo = recentAttempts.filter((a) => a.conceptSlug === concept.slug).slice(0, 2);
      const wrongRecent = lastTwo.filter((a) => !a.isCorrect).length;
      score += wrongRecent * 0.5;
      const weakPrereq = concept.prerequisites
        .map((slug) => bySlug[slug])
        .filter((p) => p && p.attempts > 0 && p.mastery < 0.4)
        .sort((a, b) => a.mastery - b.mastery)[0] ?? null;
      if (!started) {
        score -= 0.4;
        if (concept.prerequisites.some((slug) => !bySlug[slug]?.attempts)) score -= 1.5;
      }
      if (concept.status === "mastered" && !(overdueDays !== null && overdueDays >= 0)) score -= 2;
      return { concept, score, mastery, started, overdueDays, activeMis, wrongRecent, weakPrereq };
    })
    .sort((a, b) => b.score - a.score);
}

function decideKind(pick, redirected) {
  if (redirected) return "prerequisite";
  if (pick.activeMis.some((m) => m.status === "active")) return "misconception";
  if (pick.overdueDays !== null && pick.overdueDays >= 0) return "review";
  if (pick.wrongRecent >= 1 || (pick.started && pick.mastery < 0.6)) return "weak";
  if (!pick.started) return "explore";
  return "stretch";
}

export function buildReason({ kind, pick, redirectedFrom, misconception, difficulty, type, calibration, recentOnConcept }) {
  const c = pick.concept;
  const pct = Math.round(pick.mastery * 100);
  const points = [];
  if (pick.started) points.push(`Your ${c.name} mastery is ${pct}% and the trend is ${c.trend === "new" ? "still forming" : c.trend}.`);
  const wrong = recentOnConcept.slice(0, 5).filter((a) => !a.isCorrect).length;
  if (wrong) points.push(`You missed ${wrong} of your last ${Math.min(5, recentOnConcept.length)} ${c.name} questions.`);
  if (misconception) points.push(`Detected misconception: “${misconception.name}”.`);
  if (pick.overdueDays !== null && pick.overdueDays >= 0 && c.schedule) {
    const last = c.schedule.lastReviewedAt ? Math.round((new Date() - new Date(c.schedule.lastReviewedAt)) / DAY_MS) : null;
    points.push(`Spaced review is due${last !== null ? ` — your last recall was ${last} day${last === 1 ? "" : "s"} ago` : ""}.`);
  }
  if (redirectedFrom) points.push(`${redirectedFrom.concept.name} (mastery ${Math.round(redirectedFrom.mastery * 100)}%) builds on this, so we're strengthening the foundation first.`);
  points.push(`Difficulty: ${levelLabel(difficulty.level)} — ${difficulty.reason}`);
  points.push(`Question type: ${type.replace("_", " ")}. ${calibration.verdict}`);

  const headline = {
    misconception: `Targeting a misconception: “${misconception?.name}”`,
    prerequisite: `${c.name} is a building block for ${redirectedFrom?.concept.name ?? "your next topic"}`,
    review: `Spaced review due: ${c.name}`,
    weak: "This question targets a concept you're currently working to master.",
    explore: `New concept to measure: ${c.name}`,
    stretch: `You're ready for a stretch on ${c.name}`,
  }[kind];
  return { kind, headline, points };
}

function chooseQuestion({ target, redirectedFrom, questions, library, recentAttempts, calibration, weakTypes, options }) {
  const c = target.concept;
  const pool = questions.filter((q) => q.conceptSlug === c.slug && q.validated);
  if (!pool.length) return null;

  const misconception =
    (options.fixCode && library.find((m) => m.code === options.fixCode)) ||
    (target.activeMis[0] && library.find((m) => m.code === target.activeMis[0].code)) || null;
  const recentOnConcept = recentAttempts.filter((a) => a.conceptSlug === c.slug);
  const difficulty = targetDifficulty({
    mastery: target.mastery, started: target.started, recentOnConcept, calibration,
    hasMisconception: Boolean(misconception) && target.activeMis.some((m) => m.status === "active"), challenge: options.challenge,
  });

  let preferences = misconception ? FIX_TYPES : TYPE_PREFERENCE[difficulty.level];
  const weakType = !misconception && target.mastery >= 0.4 ? weakTypes.find((t) => pool.some((q) => q.type === t)) : null;
  if (weakType && recentAttempts.length % 3 === 0) preferences = [weakType, ...preferences];

  const recentIndex = new Map();
  recentAttempts.forEach((a, i) => { if (!recentIndex.has(a.questionId)) recentIndex.set(a.questionId, i); });
  const excluded = new Set(options.excludeQuestionIds ?? []);

  const scored = pool.map((q) => {
    let s = 0;
    const typeRank = preferences.indexOf(q.type);
    s += typeRank >= 0 ? 3 - typeRank * 0.7 : 0;
    s -= Math.abs(q.difficulty - difficulty.level) * 3;
    if (excluded.has(q.id)) s -= 8;
    else if (!recentIndex.has(q.id)) s += 2;
    else s -= recentIndex.get(q.id) < 10 ? 4 : 1.5;
    if (misconception && (misconception.relatedQuestionCodes.includes(q.code) || q.misconceptionCodes.includes(misconception.code))) s += 2.5;
    return { q, s: s + Math.random() * 0.3 };
  }).sort((a, b) => b.s - a.s);

  const question = scored[0].q;
  const kind = decideKind(target, Boolean(redirectedFrom));
  const reason = buildReason({ kind, pick: target, redirectedFrom, misconception: kind === "misconception" ? misconception : null, difficulty, type: question.type, calibration, recentOnConcept });
  if (weakType && question.type === weakType) reason.points.push(`${weakType.replace("_", " ")} questions have been difficult for you, so you're getting extra practice.`);
  return { question, concept: c, difficulty, reason, objective: question.learningObjective };
}

/**
 * Picks the next question. options: { focusSlug, fixCode, challenge, excludeQuestionIds }.
 * Returns null only if the question bank has nothing suitable.
 */
export function selectNext({ concepts, questions, library, recentAttempts, calibration, weakTypes = [], options = {}, now = new Date() }) {
  const ranked = rankConcepts(concepts, { recentAttempts, now });
  const bySlug = Object.fromEntries(ranked.map((r) => [r.concept.slug, r]));
  const focus = options.focusSlug ? bySlug[options.focusSlug] : null;
  const order = focus ? [focus, ...ranked.filter((r) => r !== focus)] : ranked;

  for (const pick of order.slice(0, 10)) {
    const redirect = !focus && pick.weakPrereq && pick.mastery < 0.5 ? bySlug[pick.weakPrereq.slug] : null;
    const result = chooseQuestion({
      target: redirect ?? pick, redirectedFrom: redirect ? pick : null,
      questions, library, recentAttempts, calibration, weakTypes, options,
    });
    if (result) return result;
  }
  return null;
}
