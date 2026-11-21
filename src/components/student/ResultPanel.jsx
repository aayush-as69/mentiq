"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { MasteryBar, StatusPill } from "@/components/ui/Mastery";
import { api } from "@/lib/client";
import { ERROR_TYPES, TREND, cn, pct, relativeDay } from "@/lib/format";

export function ResultPanel({ result, question, answer, reasoning, onNext }) {
  const [aiNote, setAiNote] = useState(null);
  const verdict = result.isCorrect ? (result.flawedReasoning ? "amber" : "emerald") : "rose";
  const error = ERROR_TYPES[result.errorType];
  const delta = Math.round(result.mastery.delta * 100);

  useEffect(() => {
    if (!result.aiAvailable || result.isCorrect) return;
    api("/api/practice/feedback", { method: "POST", body: { questionId: question.id, answer, reasoning, errorType: result.errorType, misconceptionCode: result.misconception?.code ?? null, mastery: result.mastery.before } })
      .then((r) => setAiNote(r.text)).catch(() => null);
  }, [result, question.id, answer, reasoning]);

  return (
    <div className="animate-fade-up space-y-4" aria-live="polite">
      <Card className={cn("border-2", { emerald: "border-emerald-300 bg-emerald-50/60", amber: "border-amber-300 bg-amber-50/60", rose: "border-rose-300 bg-rose-50/60" }[verdict])}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={verdict}>{result.isCorrect ? (result.flawedReasoning ? "Correct answer · flawed reasoning" : "Correct") : "Incorrect"}</Badge>
          {result.errorType !== "none" && <Badge tone={error.tone}>{error.label}</Badge>}
          {result.hintsUsed > 0 && <Badge>{result.hintsUsed} hint{result.hintsUsed > 1 ? "s" : ""} used</Badge>}
        </div>
        <h2 className="font-display mt-3 text-2xl font-semibold text-slate-900">{result.explanation.headline}</h2>
        {!result.isCorrect && <p className="mt-2 text-slate-700"><span className="font-semibold">Correct answer:</span> {result.correctAnswer}</p>}
        {result.errorType !== "none" && <p className="mt-1 text-sm text-slate-600">{error.hint}.{result.signals[0] ? ` ${result.signals[0]}` : ""}</p>}
      </Card>

      {result.misconception && (
        <Card className="border-rose-200 bg-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Misconception detected</p>
          <p className="font-display mt-1 text-xl font-semibold text-slate-900">{result.misconception.name}</p>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div><dt className="text-slate-500">Confidence</dt><dd className="font-semibold">{pct(result.misconception.confidence)}</dd></div>
            <div><dt className="text-slate-500">Affected concept</dt><dd className="font-semibold">{result.misconception.concept}</dd></div>
            <div><dt className="text-slate-500">Severity</dt><dd className="font-semibold">{["", "Low", "Medium", "High"][result.misconception.severity]}</dd></div>
          </dl>
          {result.explanation.intervention && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-700">Recommended intervention</p>
              <ol className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                {result.explanation.intervention.steps.map((step, i) => (
                  <li key={step} className="flex items-center gap-2"><span className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-800">{step}</span>{i < result.explanation.intervention.steps.length - 1 && <span aria-hidden className="text-slate-400">→</span>}</li>
                ))}
              </ol>
            </div>
          )}
        </Card>
      )}

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Learner model updated</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-slate-900">{result.concept.name}</p>
          <StatusPill status={result.mastery.status} />
        </div>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
          {pct(result.mastery.before)} <span aria-hidden className="text-slate-400">→</span> {pct(result.mastery.after)}
          <span className={cn("ml-2 text-base", delta >= 0 ? "text-emerald-600" : "text-rose-600")}>{delta >= 0 ? "+" : ""}{delta} pts</span>
        </p>
        <MasteryBar value={result.mastery.after} className="mt-2" label="Mastery after this answer" />
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-slate-500">Confidence</dt><dd className="font-semibold">{pct(result.mastery.confidence)}</dd></div>
          <div><dt className="text-slate-500">Recent trend</dt><dd className={cn("font-semibold", TREND[result.mastery.trend].text)}>{TREND[result.mastery.trend].label}</dd></div>
          <div><dt className="text-slate-500">Next review</dt><dd className="font-semibold">{relativeDay(result.review.dueAt)}</dd></div>
        </dl>
        <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600"><span className="font-semibold text-slate-700">Why review then?</span> {result.review.reason}</p>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Explanation tailored to your level</p>
        <div className="mt-3 space-y-4">
          {result.explanation.sections.map((s) => (
            <div key={s.key}><h3 className="text-sm font-semibold text-slate-900">{s.title}</h3><p className="mt-1 whitespace-pre-line text-slate-700">{s.body}</p></div>
          ))}
          {aiNote && <div className="rounded-xl bg-indigo-50 p-4"><h3 className="text-sm font-semibold text-indigo-900">Personal note · AI-generated, grounded in the syllabus</h3><p className="mt-1 whitespace-pre-line text-sm text-indigo-900">{aiNote}</p></div>}
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button onClick={onNext} className="px-6">Next question →</Button>
      </div>
    </div>
  );
}
