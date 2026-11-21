import { z } from "zod";
import { route } from "@/lib/http";
import { setUserRole } from "@/services/admin";

const schema = z.object({ role: z.enum(["student", "teacher", "admin"]) });

export const PATCH = route(async ({ session, params, body }) => {
  await setUserRole(session.id, Number(params.id), schema.parse(body).role);
  return { ok: true };
}, { roles: ["admin"] });
