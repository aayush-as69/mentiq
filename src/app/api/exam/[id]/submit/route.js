import { z } from "zod";
import { route } from "@/lib/http";
import { submitExam } from "@/services/exam";

const schema = z.object({ answers: z.record(z.string(), z.string().max(500)), marked: z.array(z.number().int()).max(60).default([]) });

export const POST = route(async ({ session, params, body }) => {
  const result = await submitExam(session.id, Number(params.id), schema.parse(body));
  return { ...result, redirect: `/exam/results/${result.attemptId}` };
}, { roles: ["student"], limit: { name: "exam-submit", max: 6, windowMs: 60_000 } });
