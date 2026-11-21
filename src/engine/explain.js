// Learner-state-aware explanation builder (deterministic baseline; AI may polish it asynchronously).
export function explanationLevel(mastery, attempts) {
  if (!attempts || mastery < 0.4) return "foundation";
  return mastery < 0.75 ? "core" : "advanced";
}

const HEADLINES = {
  none: "Correct — nicely done.",
  flawed: "Right answer — but your reasoning needs a fix.",
  misconception: "You were close — but there's a mental-model issue worth fixing.",
  knowledge_gap: "This one is new territory — let's build it up step by step.",
  calculation_error: "Your concept is right; a calculation slip crept in.",
  careless_error: "You know this — it looks like a small slip.",
};

function followUp({ errorType, concept, prerequisite, misconception }) {
  switch (errorType) {
    case "misconception":
      return `Let's test this with a simpler example. Mentiq will give you an easy question on “${concept.name}” aimed at: ${misconception?.name ?? "the idea above"}.`;
    case "knowledge_gap":
      return prerequisite
        ? `Let's rebuild from the foundation: ${prerequisite.name} first, then back to ${concept.name}.`
        : `We'll start with an easier ${concept.name} question to build the basic idea.`;
    case "calculation_error":
      return "Redo it with every value written down and units converted. Mentiq will give you a similar numerical question to confirm.";
    case "careless_error":
      return "Re-read the question once more before submitting. A similar question is next to confirm it was just a slip.";
    default:
      return "Keep going — if you keep this up Mentiq will raise the difficulty.";
  }
}

export function buildExplanation({ question, concept, grade, analysis, mastery, attempts, reasoning, prerequisite }) {
  const level = explanationLevel(mastery, attempts);
  const { errorType, misconception, flawedReasoning } = analysis;
  const numeric = grade.kind === "numeric";
  const key = grade.isCorrect ? (flawedReasoning ? "flawed" : "none") : errorType;
  const sections = [];

  if (!grade.isCorrect || flawedReasoning) {
    const quote = reasoning?.trim() ? ` Your reasoning: “${reasoning.trim().slice(0, 220)}”.` : "";
    sections.push({
      key: "thought", title: "What you thought",
      body: grade.blank ? "You didn't submit a complete answer." : `You answered ${numeric ? grade.rawAnswer : `“${grade.chosenText ?? grade.rawAnswer}”`}.${quote}`,
    });
    const why =
      misconception ? misconception.description
        : errorType === "calculation_error" ? `The method is sound, but the arithmetic slipped. ${analysis.signals[0] ?? ""}`
        : errorType === "careless_error" ? `This looks like an isolated slip rather than a gap. ${analysis.signals[0] ?? ""}`
        : "There isn't a consistent wrong idea here — the concept simply hasn't been built yet, and that's completely fine.";
    sections.push({ key: "why", title: misconception ? "Why that reasoning fails" : "What happened", body: why.trim() });
  }

  const conceptBody = misconception ? misconception.correctModel : concept.summary;
  sections.push({
    key: "concept", title: "The correct concept",
    body: level === "advanced" && concept.formulas.length ? `${conceptBody} Key relations: ${concept.formulas.join(" · ")}.` : conceptBody,
  });

  if (numeric) {
    if (level === "foundation" && concept.intuition) sections.push({ key: "simple", title: "In simple terms", body: concept.intuition });
    sections.push({ key: "example", title: "Worked example", body: question.explanation });
  } else {
    sections.push({
      key: "simple", title: "In simple terms",
      body: level === "foundation" && concept.intuition ? `${question.explanation} ${concept.intuition}` : question.explanation,
    });
    if (level !== "advanced" && concept.intuition && level !== "foundation") sections.push({ key: "example", title: "Think of it this way", body: concept.intuition });
  }

  if (!grade.isCorrect || flawedReasoning) {
    sections.push({ key: "followup", title: "Follow-up", body: followUp({ errorType: flawedReasoning ? "misconception" : errorType, concept, prerequisite, misconception }) });
  } else {
    sections.push({ key: "followup", title: "Next", body: followUp({ errorType: "none", concept }) });
  }

  return {
    level, headline: HEADLINES[key], sections,
    intervention: misconception ? { name: misconception.name, steps: misconception.intervention } : null,
  };
}
