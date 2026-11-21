import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { composeTutorReply } from "@/engine/tutor";
import { GROUNDING_RULES, sanitizeAiText } from "@/lib/ai/guardrails";
import { aiEnabled, generateText } from "@/lib/ai/provider";
import { getLearnerSnapshot, getRecentAttempts } from "@/services/learner";

export async function getTutorHistory(userId, limit = 30) {
  const rows = await db.select().from(t.tutorMessages).where(eq(t.tutorMessages.userId, userId)).orderBy(desc(t.tutorMessages.createdAt), desc(t.tutorMessages.id)).limit(limit);
  return rows.reverse();
}

async function polishWithAi({ query, draft, concept }) {
  if (!aiEnabled() || !concept) return null;
  const learnerState = `mastery ${Math.round(concept.mastery * 100)}%, trend ${concept.trend}, active misconceptions: ${concept.activeMisconceptions.map((m) => m.name).join("; ") || "none"}`;
  const text = await generateText({
    system: GROUNDING_RULES,
    prompt: `Student question: ${query}\nLearner state for "${concept.name}": ${learnerState}\nSyllabus facts: ${concept.summary} ${concept.keyIdeas.join(" ")}\n\nDraft reply (its facts are authoritative):\n${draft}\n\nRewrite the draft in a warm, conversational tone. Keep every fact and the personalised opening. Do not add new facts.`,
    maxTokens: 450,
  });
  return sanitizeAiText(text);
}

/** Learner-aware reply: deterministic and syllabus-grounded, optionally polished by the AI provider. */
export async function askTutor(userId, query) {
  const [snapshot, attempts, history] = await Promise.all([getLearnerSnapshot(userId), getRecentAttempts(userId, 20), getTutorHistory(userId, 8)]);
  const previousConceptSlugs = history.filter((m) => m.role === "assistant" && m.meta?.conceptSlug).map((m) => m.meta.conceptSlug);
  const reply = composeTutorReply({ query, concepts: snapshot.concepts, recentAttempts: attempts, previousConceptSlugs });

  const polished = reply.uncertain ? null : await polishWithAi({ query, draft: reply.text, concept: snapshot.conceptBySlug[reply.conceptSlug] });
  const content = polished ?? reply.text;
  const meta = { conceptSlug: reply.conceptSlug, suggestion: reply.suggestion, uncertain: reply.uncertain, source: polished ? "ai" : "rules" };

  const [userMessage, assistantMessage] = await db.insert(t.tutorMessages).values([
    { userId, role: "user", content: query, meta: {} },
    { userId, role: "assistant", content, meta },
  ]).returning();
  return { user: userMessage, assistant: assistantMessage };
}
