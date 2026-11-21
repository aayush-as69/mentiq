// Learner-aware tutor (rule-based baseline). Answers are grounded in the syllabus content only and adapted
// to the student's mastery, trend, recent mistakes and active misconceptions. AI can rephrase but not extend it.
import { explanationLevel } from "./explain.js";
import { rankConcepts } from "./selector.js";

const STOP = new Set(["the", "a", "an", "is", "are", "of", "to", "and", "in", "on", "why", "how", "what", "does", "do", "when", "explain", "me", "i", "my", "can", "you", "tell", "about", "for", "it"]);
const tokens = (text) => text.toLowerCase().replace(/[^a-z0-9\s/'-]/g, " ").split(/\s+/).filter((t) => t && !STOP.has(t));

export function matchConcepts(query, concepts) {
  const q = query.toLowerCase();
  const words = new Set(tokens(query));
  return concepts
    .map((concept) => {
      let score = 0;
      for (const kw of concept.keywords) if (q.includes(kw)) score += kw.split(" ").length + 1;
      if (q.includes(concept.name.toLowerCase())) score += 4;
      for (const w of tokens(concept.name)) if (words.has(w)) score += 1;
      return { concept, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
}

const trendPhrase = { improving: "improving", declining: "slipping a little lately", steady: "holding steady", new: "still forming" };

function focusReply(concepts, recentAttempts) {
  const top = rankConcepts(concepts, { recentAttempts })[0];
  if (!top) return null;
  const c = top.concept;
  const lines = [`Your current focus is ${c.name}${top.started ? ` (mastery ${Math.round(top.mastery * 100)}%)` : ""}.`];
  if (top.activeMis[0]) lines.push(`I'm seeing a pattern: “${top.activeMis[0].name}”. Fixing that will lift several questions at once.`);
  if (top.overdueDays !== null && top.overdueDays >= 0) lines.push("It's also due for spaced review today.");
  return { text: `${lines.join(" ")}\n\nThe fastest next step is a short targeted practice set — Mentiq will pick the difficulty from your recent answers.`, conceptSlug: c.slug, suggestion: { href: `/practice?concept=${c.slug}`, label: `Practice ${c.name}` } };
}

export function composeTutorReply({ query, concepts, recentAttempts, previousConceptSlugs = [] }) {
  const q = query.toLowerCase();
  if (/^(hi|hello|hey)\b/.test(q.trim()) || /(what should i|what next|study today|my plan|where do i start|focus on)/.test(q)) {
    const focus = focusReply(concepts, recentAttempts);
    if (focus) return { ...focus, uncertain: false, grounded: true };
  }

  const matches = matchConcepts(query, concepts);
  if (!matches.length) {
    const near = concepts
      .map((c) => ({ c, overlap: tokens(`${c.name} ${c.chapterName}`).filter((w) => tokens(query).includes(w)).length }))
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 3)
      .map((x) => x.c.name);
    return {
      uncertain: true, grounded: false, conceptSlug: null, suggestion: null,
      text: `I'm not certain how to answer that from the Class 10 Physics syllabus, so I won't guess.\n\nTry naming a concept — for example: ${near.join(", ")}. Or ask “what should I study today?” and I'll use your learner model.`,
    };
  }

  const concept = matches[0].concept;
  const pct = Math.round(concept.mastery * 100);
  const started = concept.attempts > 0;
  const level = explanationLevel(concept.mastery, concept.attempts);
  const wantsWhy = /^(why|how)\b/.test(q.trim());
  const chapterMisses = recentAttempts.slice(0, 12).filter((a) => a.chapterSlug === concept.chapterSlug && !a.isCorrect).length;

  let opening;
  if (!started) opening = `${concept.name} is new territory for you, so I'll start from the basics.`;
  else if (wantsWhy && concept.mastery >= 0.55) {
    opening = `You already understand ${concept.name} fairly well (${pct}%), but ${chapterMisses ? "your recent answers in this chapter show difficulty connecting the formulas to physical intuition" : "knowing the formula is different from seeing why it works"}. Let's understand it from that angle.`;
  } else if (concept.mastery < 0.4) opening = `Your ${concept.name} mastery is ${pct}% right now, so I'll keep this simple and build up step by step.`;
  else if (concept.mastery < 0.75) opening = `You're at ${pct}% on ${concept.name} and your trend is ${trendPhrase[concept.trend] ?? "steady"}. I'll tie the key idea to the part that usually trips you up.`;
  else opening = `You have a solid grip on ${concept.name} (${pct}%). Let's go beyond the formula.`;

  const repeated = previousConceptSlugs.slice(-2).includes(concept.slug);
  const ideas = level === "foundation" ? concept.keyIdeas.slice(0, 2) : level === "core" ? concept.keyIdeas.slice(0, 3) : concept.keyIdeas;
  let body = repeated && concept.intuition
    ? `We covered this recently, so here's a different angle: ${concept.intuition}`
    : [concept.summary, ...(level === "foundation" && concept.intuition ? [`Think of it like this: ${concept.intuition}`] : []), ideas.map((i) => `• ${i}`).join("\n")].join("\n\n");
  if (level === "advanced" && concept.formulas.length) body += `\n\nKey relations: ${concept.formulas.join(" · ")}`;

  const paragraphs = [opening, body];
  const trap = concept.activeMisconceptions.find((m) => m.status !== "resolved");
  if (trap) paragraphs.push(`Watch out for a trap I've seen in your answers — “${trap.name}”. ${trap.correctModel}`);
  paragraphs.push("Try explaining the key idea back in one sentence, then check yourself with a practice question — that's how Mentiq updates what it knows about you.");

  return {
    text: paragraphs.join("\n\n"), conceptSlug: concept.slug, uncertain: false, grounded: true,
    suggestion: { href: `/practice?concept=${concept.slug}`, label: `Practice ${concept.name}` },
  };
}
