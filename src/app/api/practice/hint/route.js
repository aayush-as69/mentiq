import { z } from "zod";
import { route } from "@/lib/http";
import { getHint } from "@/services/learning";

const schema = z.object({ questionId: z.number().int(), level: z.number().int().min(1).max(4) });

export const POST = route(async ({ body }) => {
  const { questionId, level } = schema.parse(body);
  return getHint(questionId, level);
}, { roles: ["student"], limit: { name: "hint", max: 60, windowMs: 60_000 } });
