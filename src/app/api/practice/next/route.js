import { route } from "@/lib/http";
import { nextQuestion } from "@/services/learning";

export const dynamic = "force-dynamic";

export const GET = route(async ({ request, session }) => {
  const params = new URL(request.url).searchParams;
  const sessionId = Number(params.get("sessionId")) || null;
  return nextQuestion(session.id, {
    concept: params.get("concept") || undefined, fix: params.get("fix") || undefined, challenge: params.get("challenge") === "1", sessionId,
  });
}, { roles: ["student"], limit: { name: "next", max: 60, windowMs: 60_000 } });
