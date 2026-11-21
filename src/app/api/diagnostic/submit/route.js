import { z } from "zod";
import { route } from "@/lib/http";
import { submitDiagnostic } from "@/services/diagnostic";

const schema = z.object({
  answers: z.array(z.object({
    questionId: z.number().int(), answer: z.string().max(500), reasoning: z.string().max(1500).optional(),
    confidence: z.number().min(0).max(1).optional(), timeSeconds: z.number().min(0).max(3600).optional(),
  })).min(1).max(60),
});

export const POST = route(async ({ session, body }) => submitDiagnostic(session.id, schema.parse(body).answers), {
  roles: ["student"], limit: { name: "diagnostic", max: 5, windowMs: 60_000 },
});
