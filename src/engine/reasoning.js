// Reasoning-based error analysis. Distinguishes misconception / knowledge gap / calculation error / careless error.
// Deterministic rules run first; an optional AI classifier (see services) can only choose from the library.
import { clamp } from "./mastery.js";

export const MISCONCEPTION_THRESHOLD = 0.58;

const regexCache = new Map();
function compile(source) {
  if (!regexCache.has(source)) {
    try { regexCache.set(source, new RegExp(source, "i")); } catch { regexCache.set(source, null); }
  }
  return regexCache.get(source);
}

export const normalizeText = (t) => String(t ?? "").toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();

export function matchTriggers(text, patterns) {
  const hits = [];
  for (const source of patterns ?? []) {
    const match = compile(source) && text.match(compile(source));
    if (match) hits.push(match[0]);
  }
  return hits;
}

const GAP_PHRASES = /(don'?t know|do not know|no idea|not sure|guess(ed|ing)?|random|can'?t (remember|recall)|haven'?t (learnt|learned|studied))/;

function numericSlip(question, grade) {
  if (grade.kind !== "numeric" || grade.numeric === null) return null;
  const expected = Number(question.correctAnswer);
  if (!expected) return null;
  const ratio = grade.numeric / expected;
  if (ratio < 0 && Math.abs(Math.abs(ratio) - 1) < 0.05) return "The magnitude is right but the sign is flipped.";
  if (Math.abs(ratio - 1) < 0.15) return "The answer is very close — probably a rounding or arithmetic slip.";
  const exponent = Math.log10(Math.abs(ratio));
  if (ratio > 0 && Math.abs(exponent - Math.round(exponent)) < 0.03 && Math.round(exponent) !== 0) return "The answer is off by a power of ten — check unit conversion.";
  return null;
}

function pickMisconception({ question, concept, grade, text, library }) {
  const candidates = [];
  for (const m of library) {
    const relevant =
      m.conceptSlug === concept.slug || question.misconceptionCodes?.includes(m.code) ||
      grade.distractorCode === m.code || grade.patternMatch?.m === m.code;
    if (!relevant) continue;
    let score = 0;
    const evidence = [];
    if (!grade.isCorrect && grade.distractorCode === m.code) {
      score += 0.55;
      evidence.push(`You chose option ${grade.chosen}, a typical answer for this misconception.`);
    }
    if (!grade.isCorrect && grade.patternMatch?.m === m.code) {
      score += 0.6;
      evidence.push(grade.patternMatch.note);
    }
    const hits = matchTriggers(text, m.triggerPatterns);
    if (hits.length) {
      score += 0.5 + 0.15 * (hits.length - 1);
      evidence.push(`Your reasoning says “${hits[0]}”.`);
    }
    if (score > 0 && m.conceptSlug === concept.slug) score += 0.05;
    if (score > 0) candidates.push({ m, score, evidence, reasoningHits: hits.length });
  }
  candidates.sort((a, b) => b.score - a.score);
  const top = candidates[0];
  if (!top) return null;
  const confidence = clamp(0.3 + 0.56 * top.score + (top.m.baseConfidence - 0.85) * 0.2, 0, 0.96);
  return { ...top, confidence };
}

/**
 * grade: output of gradeAnswer. Returns
 * { errorType: none|misconception|knowledge_gap|calculation_error|careless_error, flawedReasoning, misconception, confidence, signals }
 */
export function analyzeAttempt({ question, concept, grade, reasoning, selfConfidence, timeSeconds, mastery, attempts, library }) {
  const text = normalizeText(`${reasoning ?? ""}`);
  const found = pickMisconception({ question, concept, grade, text, library });
  const asMisconception = (flawedReasoning) => ({
    errorType: "misconception", flawedReasoning, confidence: found.confidence, signals: found.evidence,
    misconception: { ...found.m, confidence: found.confidence },
  });

  if (grade.isCorrect) {
    if (found && found.reasoningHits > 0 && found.confidence >= 0.6) return asMisconception(true);
    return { errorType: "none", flawedReasoning: false, misconception: null, confidence: 1, signals: [] };
  }

  if (found && found.confidence >= MISCONCEPTION_THRESHOLD) return asMisconception(false);

  const signals = [];
  const slip = numericSlip(question, grade);
  if (grade.patternMatch?.err === "calculation" || slip) {
    signals.push(grade.patternMatch?.note ?? slip);
    return { errorType: "calculation_error", flawedReasoning: false, misconception: null, confidence: 0.75, signals };
  }

  const gapSignal = grade.blank || GAP_PHRASES.test(text) || GAP_PHRASES.test(normalizeText(grade.rawAnswer)) || (selfConfidence ?? 0.6) <= 0.3;
  const expectedSeconds = question.estimatedSeconds || 60;
  const rushed = timeSeconds > 0 && timeSeconds < expectedSeconds * 0.25;
  if (!gapSignal && (mastery >= 0.72 || (rushed && mastery >= 0.5)) && attempts >= 2) {
    signals.push(rushed ? "Answered much faster than usual on a concept you generally know." : `You usually handle this concept well (mastery ${Math.round(mastery * 100)}%).`);
    return { errorType: "careless_error", flawedReasoning: false, misconception: null, confidence: 0.65, signals };
  }

  signals.push(gapSignal ? "You flagged low confidence or said you weren't sure." : "No consistent misconception pattern — this looks like a gap in knowledge.");
  return { errorType: "knowledge_gap", flawedReasoning: false, misconception: null, confidence: gapSignal ? 0.8 : 0.6, signals };
}
