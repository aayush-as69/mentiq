import { z } from "zod";
import { GROUNDING_RULES, sanitizeAiText } from "@/lib/ai/guardrails";
import { generateText } from "@/lib/ai/provider";
import { route } from "@/lib/http";
import { getSyllabus } from "@/services/syllabus";

const schema = z.object({
  questionId: z.number().int(), answer: z.string().max(500), reasoning: z.string().max(1500).optional(),
  errorType: z.string().max(30), misconceptionCode: z.string().max(40).nullable().optional(), mastery: z.number().min(0).max(1),
});

/** Optional asynchronous AI note — the deterministic explanation is already on screen, so the UI never waits on this. */
export const POST = route(async ({ body }) => {
  const input = schema.parse(body);
  const syllabus = await getSyllabus();
  const question = syllabus.questionById[input.questionId];
  if (!question) return { text: null };
  const concept = syllabus.conceptById[question.conceptId];
  const misconception = input.misconceptionCode ? syllabus.misconceptionByCode[input.misconceptionCode] : null;
  const text = await generateText({
    system: GROUNDING_RULES,
    prompt: [
      `Concept: ${concept.name}. ${concept.summary}`, `Question: ${question.prompt}`, `Student answer: ${input.answer}`, `Student reasoning: ${input.reasoning || "(none)"}`,
      `Error type: ${input.errorType}. Student mastery: ${Math.round(input.mastery * 100)}%.`,
      misconception ? `Detected misconception: ${misconception.name}. Correct model: ${misconception.correctModel}` : "",
      "Write a 3-4 sentence personal note: what they likely thought, why it fails, and one simple example. Use only the facts above.",
    ].filter(Boolean).join("\n"),
    maxTokens: 220,
  });
  return { text: sanitizeAiText(text) };
}, { roles: ["student"], limit: { name: "feedback", max: 30, windowMs: 60_000 } });
