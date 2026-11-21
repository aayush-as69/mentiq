import { z } from "zod";
import { aiEnabled } from "@/lib/ai/provider";
import { route } from "@/lib/http";
import { recordAnswer } from "@/services/learning";

const schema = z.object({
  sessionId: z.number().int().nullable().optional(), questionId: z.number().int(), answer: z.string().max(500),
  reasoning: z.string().max(1500).optional(), confidence: z.number().min(0).max(1).default(0.6),
  timeSeconds: z.number().min(0).max(3600).default(0), hintsUsed: z.number().int().min(0).max(4).default(0),
});

export const POST = route(async ({ session, body }) => {
  const input = schema.parse(body);
  const result = await recordAnswer({
    userId: session.id, questionId: input.questionId, answer: input.answer, reasoning: input.reasoning, selfConfidence: input.confidence,
    timeSeconds: input.timeSeconds, hintsUsed: input.hintsUsed, sessionId: input.sessionId ?? null, context: "practice",
  });
  return { ...result, aiAvailable: aiEnabled() };
}, { roles: ["student"], limit: { name: "answer", max: 90, windowMs: 60_000 } });
