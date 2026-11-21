import { z } from "zod";
import { route } from "@/lib/http";
import { askTutor } from "@/services/tutor";

const schema = z.object({ message: z.string().trim().min(2, "ask a question").max(500) });

export const POST = route(async ({ session, body }) => askTutor(session.id, schema.parse(body).message), {
  roles: ["student"], limit: { name: "tutor", max: 20, windowMs: 60_000 },
});
