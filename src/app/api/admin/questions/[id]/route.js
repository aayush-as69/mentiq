import { z } from "zod";
import { route } from "@/lib/http";
import { setQuestionValidated } from "@/services/admin";

const schema = z.object({ validated: z.boolean() });

export const PATCH = route(async ({ params, body }) => {
  await setQuestionValidated(Number(params.id), schema.parse(body).validated);
  return { ok: true };
}, { roles: ["admin"] });
