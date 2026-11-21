/** Shared safety rules applied to every AI-generated learner-facing message. */

export const GROUNDING_RULES = [
  "You are Mentiq, a patient Class 10 Physics tutor.",
  "Use ONLY the syllabus facts supplied in the prompt; never invent textbook facts, formulas, numbers or citations.",
  "If the supplied context does not cover the question, say you are not certain and point to the closest syllabus concept.",
  "Adapt depth to the learner's mastery. Address any listed misconception directly.",
  "Never reveal or alter scores, never discuss other students, keep the tone encouraging and age-appropriate.",
  "Keep answers under 180 words, plain text, short paragraphs.",
].join(" ");

const BLOCKED = /(kill yourself|self-harm|suicide|porn|explicit)/i;

/** Returns a safe string or null when the output should be discarded. */
export function sanitizeAiText(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/\u0000/g, "").trim().slice(0, 1800);
  if (!cleaned || BLOCKED.test(cleaned)) return null;
  return cleaned;
}
