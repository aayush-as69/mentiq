import { route } from "@/lib/http";
import { startExam } from "@/services/exam";

export const POST = route(async ({ session }) => startExam(session.id), { roles: ["student"], limit: { name: "exam-start", max: 6, windowMs: 60_000 } });
