// Deterministic answer validation. Never depends on an LLM.
export function parseNumber(raw) {
  const s = String(raw ?? "").replace(/[\u2212\u2013]/g, "-").replace(/,/g, "").trim();
  const frac = s.match(/(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (frac && Number(frac[2]) !== 0) return Number(frac[1]) / Number(frac[2]);
  const sci = s.match(/(-?\d*\.?\d+)\s*(?:x|×|\*)\s*10\^?\s*(-?\d+)/i);
  if (sci) return Number(sci[1]) * 10 ** Number(sci[2]);
  const plain = s.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/i);
  return plain ? Number(plain[0]) : null;
}

const within = (a, b, tol) => Math.abs(a - b) <= Math.max(Math.abs(b) * tol, 1e-9);

export function gradeAnswer(question, answer) {
  const raw = String(answer ?? "").trim();
  const blank = raw === "";

  if (question.options?.length) {
    const chosen = raw.toUpperCase();
    const option = question.options.find((o) => o.id === chosen);
    const expected = question.options.find((o) => o.id === question.correctAnswer);
    return {
      kind: "choice", blank: blank || !option, rawAnswer: raw, chosen: option?.id ?? null, chosenText: option?.text ?? null,
      isCorrect: chosen === question.correctAnswer,
      expectedText: expected ? `${expected.id}. ${expected.text}` : question.correctAnswer,
      distractorCode: question.distractorMap?.[chosen] ?? null, patternMatch: null,
    };
  }

  if (question.keywords?.length) {
    const text = raw.toLowerCase();
    const matched = question.keywords.filter((group) => group.some((k) => text.includes(k.toLowerCase())));
    return {
      kind: "text", blank, rawAnswer: raw, chosen: null, chosenText: raw,
      isCorrect: !blank && matched.length === question.keywords.length,
      expectedText: question.correctAnswer, distractorCode: null, patternMatch: null,
    };
  }

  const numeric = parseNumber(raw);
  const expected = Number(question.correctAnswer);
  const tolerance = question.tolerance ?? 0.02;
  return {
    kind: "numeric", blank: blank || numeric === null, rawAnswer: raw, chosen: null, chosenText: raw, numeric,
    isCorrect: numeric !== null && within(numeric, expected, tolerance),
    expectedText: `${question.correctAnswer}${question.unit ? ` ${question.unit}` : ""}`,
    distractorCode: null,
    patternMatch: numeric === null ? null : (question.wrongPatterns ?? []).find((p) => within(numeric, p.v, 0.04)) ?? null,
  };
}

/** Three progressive hints; explicit hints win, otherwise they are derived from the concept. */
export function getHints(question, concept) {
  if (question.hints?.length) return question.hints.slice(0, 3);
  const idea = concept.keyIdeas?.[0];
  if (!question.options?.length && !question.keywords?.length) {
    return [
      concept.formulas?.[0] ? `Recall the formula: ${concept.formulas[0]}.` : `Recall the key idea: ${idea}`,
      "What values do you know? List them with units and convert to a common unit.",
      "Substitute the values into the formula carefully, then check the sign and units of your answer.",
    ];
  }
  return [
    `Think about this key idea: ${idea}`,
    concept.keyIdeas?.[1] ? `Another useful fact: ${concept.keyIdeas[1]}` : "Underline what the question is really asking.",
    "Rule out the options that contradict these ideas.",
  ];
}

export const solutionText = (question, grade) => `Answer: ${grade?.expectedText ?? question.correctAnswer}. ${question.explanation}`;
