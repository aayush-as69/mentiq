import { z } from "zod";
import { route } from "@/lib/http";
import { saveExamProgress } from "@/services/exam";

const schema = z.object({ answers: z.record(z.string(), z.string().max(500)), marked: z.array(z.number().int()).max(60) });

export const PATCH = route(async ({ session, params, body }) => saveExamProgress(session.id, Number(params.id), schema.parse(body)), { roles: ["student"] });
