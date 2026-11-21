import { aiEnabled, generateText } from "@/lib/ai/provider";

/**
 * Optional AI classification of free-text reasoning. It may only choose from the misconception library,
 * so the model can never invent a misconception or override deterministic scoring.
 */
export async function refineWithAI({ analysis, grade, reasoning, question, concept, library }) {
  if (!aiEnabled() || !reasoning || reasoning.trim().length < 20) return analysis;
  if (analysis.misconception && analysis.confidence >= 0.8) return analysis;

  const candidates = library.filter((m) => m.conceptSlug === concept.slug);
  if (!candidates.length) return analysis;

  const prompt = [
    `Question: ${question.prompt}`,
    `Student answer: ${grade.rawAnswer} (${grade.isCorrect ? "correct" : "incorrect"})`,
    `Student reasoning: ${reasoning.slice(0, 600)}`,
    "Candidate misconceptions:",
    ...candidates.map((m) => `- ${m.code}: ${m.name}`),
    'Reply with JSON only: {"code":"<candidate code or NONE>","confidence":<0-1>}',
  ].join("\n");

  const raw = await generateText({
    system: "You classify student physics reasoning against a fixed list of misconceptions. Respond with JSON only.",
    prompt, maxTokens: 80, timeoutMs: 6000,
  });
  if (!raw) return analysis;
  try {
    const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
    const match = candidates.find((m) => m.code === parsed.code);
    const confidence = Number(parsed.confidence);
    if (!match || !(confidence >= 0.7) || (analysis.misconception && analysis.confidence >= confidence)) return analysis;
    return {
      ...analysis, errorType: "misconception", flawedReasoning: grade.isCorrect,
      misconception: { ...match, confidence }, confidence, provider: "ai",
      signals: [...analysis.signals, "AI reasoning analysis matched this misconception from the library."],
    };
  } catch {
    return analysis;
  }
}
