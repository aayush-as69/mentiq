"use client";

import { Badge } from "@/components/ui/primitives";
import { DIFFICULTY_LABELS, TYPE_LABELS, cn } from "@/lib/format";

export const CONFIDENCE_LEVELS = [
  { value: 0.25, label: "Guessing" },
  { value: 0.6, label: "Fairly sure" },
  { value: 0.9, label: "Certain" },
];

const tone = { 1: "emerald", 2: "sky", 3: "amber", 4: "rose" };

/** Shared answer surface for diagnostic, practice and exam. */
export function QuestionCard({ question, answer, onAnswer, reasoning, onReasoning, confidence, onConfidence, disabled = false, showMeta = true, showReasoning = true, showConfidence = true }) {
  const idPrefix = `q${question.id}`;
  return (
    <div>
      {showMeta && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone="indigo">{question.conceptName}</Badge>
          <Badge tone={tone[question.difficulty]}>{DIFFICULTY_LABELS[question.difficulty]}</Badge>
          <Badge>{TYPE_LABELS[question.type]}</Badge>
          <span className="text-xs text-slate-500">~{Math.max(1, Math.round(question.estimatedSeconds / 60))} min</span>
        </div>
      )}
      <p className="whitespace-pre-line text-lg font-medium leading-relaxed text-slate-900">{question.prompt}</p>

      <div className="mt-5">
        {question.answerKind === "choice" && (
          <div role="radiogroup" aria-label="Answer options" className="grid gap-2.5">
            {question.options.map((option) => (
              <button key={option.id} type="button" role="radio" aria-checked={answer === option.id} disabled={disabled} onClick={() => onAnswer(option.id)}
                className={cn("flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed", answer === option.id ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600" : "border-slate-300 bg-white hover:border-indigo-300 hover:bg-slate-50")}>
                <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", answer === option.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}>{option.id}</span>
                <span className="text-slate-800">{option.text}</span>
              </button>
            ))}
          </div>
        )}
        {question.answerKind === "number" && (
          <label className="block text-sm font-medium text-slate-700">Your answer{question.unit ? ` (in ${question.unit})` : ""}
            <input value={answer} disabled={disabled} onChange={(e) => onAnswer(e.target.value)} inputMode="decimal" autoComplete="off" placeholder="Type a number, include the sign if needed"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg tabular-nums focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50" />
          </label>
        )}
        {question.answerKind === "text" && (
          <label className="block text-sm font-medium text-slate-700">Your answer
            <textarea value={answer} disabled={disabled} onChange={(e) => onAnswer(e.target.value)} rows={3} maxLength={500}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50" />
          </label>
        )}
      </div>

      {showReasoning && (
        <label htmlFor={`${idPrefix}-reasoning`} className="mt-5 block text-sm font-medium text-slate-700">
          Explain how you reached your answer. <span className="font-normal text-slate-500">({question.requiresReasoning ? "recommended — Mentiq reads this" : "optional"})</span>
          <textarea id={`${idPrefix}-reasoning`} value={reasoning} disabled={disabled} onChange={(e) => onReasoning(e.target.value)} rows={3} maxLength={1500}
            placeholder="e.g. “I used the lens formula because…”" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50" />
        </label>
      )}

      {showConfidence && (
      <fieldset className="mt-5" disabled={disabled}>
        <legend className="text-sm font-medium text-slate-700">How confident are you?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CONFIDENCE_LEVELS.map((level) => (
            <button key={level.value} type="button" aria-pressed={confidence === level.value} onClick={() => onConfidence(level.value)}
              className={cn("rounded-full border px-4 py-1.5 text-sm font-medium transition", confidence === level.value ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")}>{level.label}</button>
          ))}
        </div>
      </fieldset>
      )}
    </div>
  );
}
