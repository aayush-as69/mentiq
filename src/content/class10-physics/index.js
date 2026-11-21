export { subject, chapters, concepts } from "./concepts.js";
export { misconceptions } from "./misconceptions.js";
import { questions as baseQuestions } from "./questions.js";
import { extraQuestions } from "./questions-extra.js";

export const questions = [...baseQuestions, ...extraQuestions];

/** Default expected solving time (seconds) per question type and difficulty. */
export function estimateSeconds(type, difficulty) {
  const base = { mcq: 40, conceptual: 60, assertion_reasoning: 75, short_answer: 70, numerical: 110, application: 150 }[type] ?? 60;
  return Math.round(base * (0.85 + difficulty * 0.15));
}

/** Mock exam definition for this syllabus. */
export const exam = {
  title: "Class 10 Physics — Full Syllabus Mock",
  durationMinutes: 30,
  questionCount: 20,
  distribution: { 1: 0.25, 2: 0.4, 3: 0.25, 4: 0.1 },
};
