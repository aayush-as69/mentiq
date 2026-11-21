import { notFound, redirect } from "next/navigation";
import { PlanList } from "@/components/student/PlanList";
import { Badge, ButtonLink, Card, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { MasteryBar, MasteryRing } from "@/components/ui/Mastery";
import { requireRole } from "@/lib/auth";
import { ApiError } from "@/lib/http";
import { ERROR_TYPES, pct } from "@/lib/format";
import { getExamResult } from "@/services/exam";
import { getTodayPlan } from "@/services/plan";

export const metadata = { title: "Exam results" };

export default async function ExamResultPage({ params }) {
  const session = await requireRole(["student"]);
  const { id } = await params;
  let result;
  try {
    result = await getExamResult(session.id, Number(id));
  } catch (error) {
    if (error instanceof ApiError) notFound();
    throw error;
  }
  if (!result) redirect(`/exam/${id}`);
  const { attempt } = result;
  const plan = await getTodayPlan(session.id);
  const breakdown = attempt.conceptBreakdown ?? [];
  const { errorCounts = {}, mistakes = [] } = attempt.mistakeAnalysis ?? {};

  return (
    <>
      <PageHeader eyebrow="Exam results" title={`Score: ${pct(attempt.score)}`} description="But more importantly — here is what the exam says about each concept." actions={<ButtonLink href="/exam" variant="secondary">Back to exam mode</ButtonLink>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionTitle hint="Mastery shown is your updated learner model after this exam">Concept mastery</SectionTitle>
            <ul className="space-y-3">
              {breakdown.map((c) => (
                <li key={c.slug}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm"><span className="font-medium text-slate-800">{c.name} {c.priority && <Badge tone="rose">← priority</Badge>}</span><span className="text-slate-500">{c.correct}/{c.asked} correct in exam</span></div>
                  <MasteryBar value={c.mastery} label={`${c.name} mastery`} />
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <SectionTitle>Mistake analysis</SectionTitle>
            {mistakes.length === 0 ? <p className="text-sm text-slate-600">No mistakes — a perfect paper.</p> : (
              <>
                <div className="mb-4 flex flex-wrap gap-2">{Object.entries(errorCounts).map(([type, n]) => <Badge key={type} tone={ERROR_TYPES[type].tone}>{ERROR_TYPES[type].label}: {n}</Badge>)}</div>
                <ul className="space-y-2">
                  {mistakes.map((m) => (
                    <li key={m.questionId}>
                      <details className="rounded-xl border border-slate-200 bg-white p-4">
                        <summary className="cursor-pointer text-sm font-medium text-slate-900">{m.concept} — <span className="font-normal text-slate-600">{m.prompt.slice(0, 90)}{m.prompt.length > 90 ? "…" : ""}</span></summary>
                        <div className="mt-3 space-y-1 text-sm text-slate-700">
                          <p><span className="font-semibold">Your answer:</span> {m.yourAnswer}</p><p><span className="font-semibold">Correct:</span> {m.correctAnswer}</p>
                          {m.misconception && <p className="text-rose-700"><span className="font-semibold">Likely misconception:</span> {m.misconception}</p>}
                          <p className="text-slate-600">{m.explanation}</p>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="flex flex-col items-center text-center"><MasteryRing value={attempt.score} label="Exam score" /><p className="mt-3 text-sm text-slate-600">Weighted by difficulty — harder questions count more.</p></Card>
          <Card>
            <SectionTitle>Recommendations</SectionTitle>
            {attempt.recommendations?.length ? <ul className="space-y-2 text-sm text-slate-700">{attempt.recommendations.map((r) => <li key={r.conceptSlug} className="flex gap-2"><span className="text-rose-500">▸</span>{r.text}</li>)}</ul> : <p className="text-sm text-slate-600">No priority concepts — keep reviewing on schedule.</p>}
          </Card>
          <Card>
            <SectionTitle hint="Generated automatically from the updated model">Your next learning plan</SectionTitle>
            <PlanList plan={plan} showReasons={false} />
          </Card>
        </div>
      </div>
    </>
  );
}
