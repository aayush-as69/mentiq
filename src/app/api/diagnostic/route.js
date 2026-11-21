import { route } from "@/lib/http";
import { getDiagnosticQuestions } from "@/services/diagnostic";

export const dynamic = "force-dynamic";

export const GET = route(async () => ({ questions: await getDiagnosticQuestions() }), { roles: ["student"] });
