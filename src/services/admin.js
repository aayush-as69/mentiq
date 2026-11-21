import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { ApiError } from "@/lib/http";
import { estimateSeconds } from "@/content/class10-physics";
import { getSyllabus, invalidateSyllabus } from "@/services/syllabus";

export async function getAdminOverview() {
  const [users, questions, attempts, misconceptions] = await Promise.all([
    db.select({ role: t.users.role, n: count() }).from(t.users).groupBy(t.users.role),
    db.select({ validated: t.questions.validated, n: count() }).from(t.questions).groupBy(t.questions.validated),
    db.select({ n: count() }).from(t.questionAttempts),
    db.select({ n: count() }).from(t.reasoningAttempts),
  ]);
  const syllabus = await getSyllabus();
  return {
    users: Object.fromEntries(users.map((u) => [u.role, u.n])),
    questions: { total: questions.reduce((s, q) => s + q.n, 0), validated: questions.find((q) => q.validated)?.n ?? 0 },
    attempts: attempts[0].n, reasoningAnalyses: misconceptions[0].n,
    concepts: syllabus.concepts.length, chapters: syllabus.chapters.length, misconceptions: syllabus.misconceptions.length,
  };
}

export const listUsers = () =>
  db.select({ id: t.users.id, name: t.users.name, email: t.users.email, role: t.users.role, createdAt: t.users.createdAt }).from(t.users).orderBy(desc(t.users.createdAt)).limit(100);

export async function setUserRole(actorId, userId, role) {
  if (actorId === userId) throw new ApiError(400, "You can't change your own role.");
  const [row] = await db.update(t.users).set({ role }).where(eq(t.users.id, userId)).returning({ id: t.users.id });
  if (!row) throw new ApiError(404, "User not found.");
}

/** Guardrail: a question only becomes learner-facing when its metadata is internally consistent. */
export function validateQuestion(input, concept) {
  const problems = [];
  if (!concept) problems.push("Concept does not exist.");
  if (input.options) {
    if (input.options.length < 2) problems.push("Choice questions need at least two options.");
    if (!input.options.some((o) => o.id === input.correctAnswer)) problems.push("The correct answer must match one of the option ids.");
  } else if (!input.keywords && Number.isNaN(Number(input.correctAnswer))) {
    problems.push("Numerical questions need a numeric correct answer.");
  }
  if (!input.explanation || input.explanation.length < 20) problems.push("Add an explanation of at least 20 characters.");
  return problems;
}

export async function createQuestion(input) {
  const syllabus = await getSyllabus();
  const concept = syllabus.conceptBySlug[input.conceptSlug];
  const options = input.options?.length ? input.options.map((text, i) => ({ id: "ABCD"[i], text })) : null;
  const record = {
    code: `Q-X-${Date.now().toString(36).toUpperCase()}`, conceptId: concept?.id, subconcept: input.subconcept ?? null, difficulty: input.difficulty,
    type: input.type, prompt: input.prompt, options, correctAnswer: input.correctAnswer, unit: input.unit ?? null, explanation: input.explanation,
    learningObjective: input.learningObjective, estimatedSeconds: estimateSeconds(input.type, input.difficulty),
    requiresReasoning: Boolean(options && input.type !== "mcq"), source: input.source ?? "curated",
  };
  const problems = validateQuestion(record, concept);
  if (problems.length) throw new ApiError(400, problems.join(" "));
  const [row] = await db.insert(t.questions).values({ ...record, validated: input.source !== "ai_generated" }).returning({ id: t.questions.id, code: t.questions.code });
  invalidateSyllabus();
  return row;
}

export async function setQuestionValidated(id, validated) {
  const [row] = await db.update(t.questions).set({ validated }).where(eq(t.questions.id, id)).returning({ id: t.questions.id });
  if (!row) throw new ApiError(404, "Question not found.");
  invalidateSyllabus();
}
