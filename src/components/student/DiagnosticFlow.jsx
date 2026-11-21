"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { QuestionCard } from "@/components/student/QuestionCard";
import { Button, Card, Notice } from "@/components/ui/primitives";
import { api } from "@/lib/client";

const MIN_TO_FINISH = 12;

export function DiagnosticFlow({ questions }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [draft, setDraft] = useState({ answer: "", reasoning: "", confidence: 0.6 });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(Date.now());
  const question = questions[index];
  const answeredCount = Object.keys(answers).length;
  const isLast = index === questions.length - 1;

  const commit = () => {
    if (!draft.answer.trim()) return answers;
    return { ...answers, [question.id]: { questionId: question.id, answer: draft.answer, reasoning: draft.reasoning, confidence: draft.confidence, timeSeconds: Math.round((Date.now() - startedAt.current) / 1000) } };
  };

  const go = (nextAnswers, nextIndex) => {
    setAnswers(nextAnswers);
    const saved = nextAnswers[questions[nextIndex]?.id];
    setDraft(saved ? { answer: saved.answer, reasoning: saved.reasoning ?? "", confidence: saved.confidence } : { answer: "", reasoning: "", confidence: 0.6 });
    setIndex(nextIndex);
    startedAt.current = Date.now();
  };

  const finish = async (final) => {
    setSubmitting(true);
    setError("");
    try {
      await api("/api/diagnostic/submit", { method: "POST", body: { answers: Object.values(final) } });
      router.push("/diagnostic");
      router.refresh();
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  const next = () => {
    const merged = commit();
    if (isLast) finish(merged);
    else go(merged, index + 1);
  };

  if (submitting) {
    return (
      <Card className="mx-auto max-w-lg py-12 text-center" role="status">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <h2 className="font-display text-2xl font-semibold">Building your learner model…</h2>
        <p className="mt-2 text-slate-600">Scoring each concept, reading your reasoning and scheduling your first reviews.</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
        <span>Question {index + 1} of {questions.length}</span>
        <span>{answeredCount} answered</span>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index + 1} aria-label="Diagnostic progress">
        <div className="h-full rounded-full bg-indigo-600 transition-[width] duration-500" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>
      <Card key={question.id} className="animate-fade-up p-6 sm:p-8">
        <QuestionCard question={question} answer={draft.answer} onAnswer={(answer) => setDraft((d) => ({ ...d, answer }))} reasoning={draft.reasoning}
          onReasoning={(reasoning) => setDraft((d) => ({ ...d, reasoning }))} confidence={draft.confidence} onConfidence={(confidence) => setDraft((d) => ({ ...d, confidence }))} />
      </Card>
      {error && <div className="mt-4"><Notice tone="rose">{error}</Notice></div>}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" disabled={index === 0} onClick={() => go(commit(), index - 1)}>← Back</Button>
        <div className="flex flex-wrap gap-2">
          {answeredCount >= MIN_TO_FINISH && !isLast && <Button variant="secondary" onClick={() => finish(commit())}>Finish now</Button>}
          {!draft.answer.trim() && !isLast && <Button variant="secondary" onClick={() => go(answers, index + 1)}>Skip</Button>}
          <Button onClick={next} disabled={isLast && Object.keys(commit()).length < 5}>{isLast ? "Finish diagnostic" : "Next →"}</Button>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">Answers aren't graded as a single score — each one updates the concept it tests. You can finish after {MIN_TO_FINISH} questions; untested concepts stay “not started”.</p>
    </div>
  );
}
