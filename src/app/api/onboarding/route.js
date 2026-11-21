import { z } from "zod";
import { route } from "@/lib/http";
import { saveOnboarding } from "@/services/students";

const optionalNumber = (min, max) => z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().int().min(min).max(max).optional());

const schema = z.object({
  grade: z.coerce.number().int().min(6).max(12).default(10),
  exam: z.string().trim().min(2, "tell us which exam you're preparing for").max(80),
  confidence: z.coerce.number().int().min(1).max(5),
  goals: z.array(z.string().trim().max(80)).max(6).default([]),
  pace: z.enum(["relaxed", "steady", "intensive"]),
  dailyMinutes: z.coerce.number().int().min(10).max(240),
  targetScore: optionalNumber(1, 100),
  weeklyGoal: z.coerce.number().int().min(5).max(200).default(30),
  joinCode: z.string().trim().max(24).optional(),
});

export const POST = route(async ({ session, body }) => {
  await saveOnboarding(session.id, schema.parse(body));
  return { redirect: "/diagnostic" };
}, { roles: ["student"] });
