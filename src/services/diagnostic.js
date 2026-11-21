import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { ApiError } from "@/lib/http";
import { getSyllabus, toClientQuestion } from "@/services/syllabus";
import { recordAnswer } from "@/services/learning";
import { refreshLearnerModel } from "@/services/learner";

export async function getDiagnosticQuestions() {
  const syllabus = await getSyllabus();
  const order = Object.fromEntries(syllabus.concepts.map((c, i) => [c.slug, i]));
  return syllabus.questions
    .filter((q) => q.isDiagnostic && q.validated)
    .sort((a, b) => order[a.conceptSlug] - order[b.conceptSlug])
    .map(toClientQuestion);
}

/** Scores each answer through the same pipeline as practice, producing concept-level mastery (not a single %). */
export async function submitDiagnostic(userId, answers) {
  const syllabus = await getSyllabus();
  const seen = new Set();
  const valid = answers.filter((a) => {
    const q = syllabus.questionById[a.questionId];
    if (!q?.isDiagnostic || seen.has(a.questionId)) return false;
    seen.add(a.questionId);
    return true;
  });
  if (valid.length < 5) throw new ApiError(400, "Please answer at least 5 questions so Mentiq can build a meaningful learner model.");

  const [session] = await db.insert(t.learningSessions).values({ userId, kind: "diagnostic" }).returning({ id: t.learningSessions.id });
  for (const a of valid) {
    await recordAnswer({
      userId, questionId: a.questionId, answer: a.answer, reasoning: a.reasoning ?? "", selfConfidence: a.confidence ?? 0.6,
      timeSeconds: a.timeSeconds ?? 0, hintsUsed: 0, context: "diagnostic", sessionId: session.id, deferRefresh: true,
    });
  }
  await db.update(t.studentProfiles).set({ diagnosticCompletedAt: new Date() }).where(eq(t.studentProfiles.userId, userId));
  await refreshLearnerModel(userId);
  return { answered: valid.length, sessionId: session.id };
}
