// Study-plan generation from the learner model.
import { retentionEstimate } from "./mastery.js";
import { rankConcepts } from "./selector.js";

const dayStamp = (d) => Math.floor(new Date(d).getTime() / 86400000);

/** concepts: snapshot concepts, todayCounts: { slug: attemptsToday } */
export function buildPlan({ concepts, dailyMinutes = 45, todayCounts = {}, diagnosticDone, recentAttempts = [], now = new Date() }) {
  if (!diagnosticDone) {
    return {
      summary: "Complete your diagnostic so Mentiq can build your learner model.",
      items: [{ id: "diagnostic", kind: "diagnostic", title: "Take the diagnostic", minutes: 20, href: "/diagnostic", reason: "Mentiq needs a first measurement of every concept before it can personalise your plan.", done: false }],
      totalMinutes: 20,
    };
  }

  const ranked = rankConcepts(concepts, { recentAttempts, now });
  const started = concepts.filter((c) => c.attempts > 0);
  const items = [];
  const done = (slug, target) => (todayCounts[slug] ?? 0) >= target;

  const due = started
    .filter((c) => c.schedule && new Date(c.schedule.dueAt) <= now)
    .sort((a, b) => new Date(a.schedule.dueAt) - new Date(b.schedule.dueAt))[0];
  if (due) {
    const days = Math.max(0, dayStamp(now) - dayStamp(due.schedule.lastReviewedAt ?? due.schedule.dueAt));
    items.push({
      id: `review-${due.slug}`, kind: "review", title: `Review ${due.name}`, minutes: 10, conceptSlug: due.slug,
      href: `/practice?concept=${due.slug}`, reason: `Your last successful recall was ${days} day${days === 1 ? "" : "s"} ago and this concept is scheduled for spaced review.`, done: done(due.slug, 2),
    });
  }

  const weakest = ranked.find((r) => r.started && r.mastery < 0.75 && r.concept.slug !== due?.slug) ?? ranked.find((r) => r.concept.slug !== due?.slug);
  if (weakest) {
    const c = weakest.concept;
    items.push({
      id: `practice-${c.slug}`, kind: "practice", title: `Practice ${c.name}`, minutes: 15, conceptSlug: c.slug,
      href: `/practice?concept=${c.slug}`,
      reason: weakest.started ? `Mastery is ${Math.round(weakest.mastery * 100)}% and it's one of your highest-priority concepts.` : "A new concept to measure and start learning.", done: done(c.slug, 3),
    });
  }

  const misconceptions = concepts
    .flatMap((c) => c.activeMisconceptions.filter((m) => m.status === "active").map((m) => ({ ...m, concept: c })))
    .sort((a, b) => b.severity - a.severity || b.occurrences - a.occurrences)[0];
  if (misconceptions) {
    items.push({
      id: `fix-${misconceptions.code}`, kind: "misconception", title: `Fix misconception: “${misconceptions.name}”`, minutes: 8, conceptSlug: misconceptions.concept.slug,
      href: `/practice?concept=${misconceptions.concept.slug}&fix=${misconceptions.code}`,
      reason: `Detected ${misconceptions.occurrences} time${misconceptions.occurrences === 1 ? "" : "s"} in your reasoning — targeted questions will correct the mental model.`, done: done(misconceptions.concept.slug, 2),
    });
  }

  const challenger = [...started].filter((c) => c.mastery >= 0.65).sort((a, b) => b.mastery - a.mastery)[0];
  if (challenger) {
    items.push({
      id: `challenge-${challenger.slug}`, kind: "challenge", title: `Challenge question: ${challenger.name}`, minutes: 7, conceptSlug: challenger.slug,
      href: `/practice?concept=${challenger.slug}&challenge=1`, reason: `You're at ${Math.round(challenger.mastery * 100)}% — a harder question tests whether the understanding transfers.`, done: done(challenger.slug, 1),
    });
  }

  const fading = started
    .filter((c) => c.mastery >= 0.6)
    .map((c) => ({ c, r: retentionEstimate({ mastery: c.mastery, schedule: c.schedule, now }) }))
    .filter((x) => x.r !== null)
    .sort((a, b) => a.r - b.r)[0];
  if (fading) {
    items.push({
      id: `retention-${fading.c.slug}`, kind: "retention", title: `Quick retention review: ${fading.c.name}`, minutes: 5, conceptSlug: fading.c.slug,
      href: `/practice?concept=${fading.c.slug}`, reason: `Estimated recall has slipped to ${Math.round(fading.r * 100)}% — a short refresher keeps it from fading.`, done: done(fading.c.slug, 1),
    });
  }

  // Respect the student's available time: keep the highest-value tasks that fit.
  const budget = dailyMinutes + 5;
  const fitted = [];
  let used = 0;
  for (const item of items) {
    if (used + item.minutes <= budget || fitted.length < 2) {
      fitted.push(item);
      used += item.minutes;
    }
  }
  const weakCount = started.filter((c) => c.status === "weak").length;
  const activeMis = concepts.reduce((n, c) => n + c.activeMisconceptions.filter((m) => m.status === "active").length, 0);
  return {
    items: fitted, totalMinutes: used,
    summary: `Built from your learner model: ${weakCount} weak concept${weakCount === 1 ? "" : "s"}, ${activeMis} active misconception${activeMis === 1 ? "" : "s"}${due ? ", spaced review due" : ""}.`,
  };
}
