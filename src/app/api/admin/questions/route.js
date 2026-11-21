import { z } from "zod";
import { route } from "@/lib/http";
import { createQuestion } from "@/services/admin";

const schema = z.object({
  conceptSlug: z.string().min(1), type: z.enum(["mcq", "numerical", "conceptual", "application", "assertion_reasoning", "short_answer"]),
  difficulty: z.coerce.number().int().min(1).max(4), prompt: z.string().trim().min(10).max(1500),
  options: z.array(z.string().trim().min(1).max(300)).length(4).optional(), correctAnswer: z.string().trim().min(1).max(100),
  unit: z.string().max(24).optional(), explanation: z.string().trim().min(20).max(1500), learningObjective: z.string().trim().min(5).max(200),
  subconcept: z.string().max(120).optional(),
});

export const POST = route(async ({ body }) => createQuestion(schema.parse(body)), { roles: ["admin"] });
