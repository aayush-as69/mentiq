"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { QuestionCard } from "@/components/student/QuestionCard";
import { Button, Card, Notice } from "@/components/ui/primitives";
import { api } from "@/lib/client";
import { cn } from "@/lib/format";

const clock = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function ExamRunner({ attemptId, questions, endsAt, initialAnswers, initialMarked }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [marked, setMarked] = useState(initialMarked);
  const [remaining, setRemaining] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const latest = useRef({ answers, marked });
  latest.current = { answers, marked };
  const question = questions[index];

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError("");
    try {
      const { redirect } = await api(`/api/exam/${attemptId}/submit`, { method: "POST", body: latest.current });
      router.push(redirect);
      router.refresh();
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  }, [attemptId, router]);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, Math.floor((endsAt - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  useEffect(() => { if (remaining === 0 && !submitting) submit(); }, [remaining, submitting, submit]);

  const save = () => api(`/api/exam/${attemptId}`, { method: "PATCH", body: latest.current }).catch(() => null);
  const go = (i) => { save(); setIndex(i); };
  const toggleMark = () => setMarked((m) => (m.includes(question.id) ? m.filter((x) => x !== question.id) : [...m, question.id]));
  const answeredCount = questions.filter((q) => (answers[q.id] ?? "").trim()).length;
  const low = remaining !== null && remaining < 300;

  if (submitting) {
    return <Card className="mx-auto max-w-lg py-12 text-center" role="status"><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /><h2 className="font-display text-2xl font-semibold">Scoring your exam…</h2><p className="mt-2 text-slate-600">Updating your learner model with every answer.</p></Card>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="lg:col-span-3">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">Question {index + 1} of {questions.length}</p>
          <p className={cn("rounded-lg px-3 py-1 font-mono text-lg font-semibold tabular-nums", low ? "bg-rose-100 text-rose-700" : "bg-slate-900 text-white")} role="timer" aria-label="Time remaining">{remaining === null ? "--:--" : clock(remaining)}</p>
        </div>
        <Card key={question.id} className="animate-fade-up p-6 sm:p-8">
          <QuestionCard question={question} answer={answers[question.id] ?? ""} onAnswer={(a) => setAnswers((s) => ({ ...s, [question.id]: a }))} showReasoning={false} showConfidence={false} showMeta={false} />
        </Card>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="secondary" disabled={index === 0} onClick={() => go(index - 1)}>← Previous</Button>
            <Button variant="secondary" disabled={index === questions.length - 1} onClick={() => go(index + 1)}>Next →</Button>
          </div>
          <Button variant={marked.includes(question.id) ? "dark" : "secondary"} onClick={toggleMark} aria-pressed={marked.includes(question.id)}>{marked.includes(question.id) ? "⚑ Marked for review" : "⚐ Mark for review"}</Button>
        </div>
      </div>

      <aside className="space-y-4" aria-label="Question navigation">
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-700">{answeredCount} / {questions.length} answered</p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => {
              const done = (answers[q.id] ?? "").trim();
              return (
                <button key={q.id} type="button" onClick={() => go(i)} aria-label={`Question ${i + 1}${done ? ", answered" : ""}${marked.includes(q.id) ? ", marked" : ""}`} aria-current={i === index}
                  className={cn("relative h-9 rounded-lg border text-sm font-semibold transition", i === index ? "border-indigo-600 ring-2 ring-indigo-200" : "border-slate-200", done ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50")}>
                  {i + 1}{marked.includes(q.id) && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400" />}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">Filled = answered · amber dot = marked for review</p>
        </Card>
        {error && <Notice tone="rose">{error}</Notice>}
        {!confirming ? <Button variant="dark" className="w-full" onClick={() => setConfirming(true)}>Submit exam</Button> : (
          <Card className="border-amber-300 bg-amber-50">
            <p className="text-sm font-semibold text-amber-900">Submit now?</p>
            <p className="mt-1 text-sm text-amber-800">{questions.length - answeredCount} unanswered{marked.length ? `, ${marked.length} marked for review` : ""}. You can't change answers after submitting.</p>
            <div className="mt-3 flex gap-2"><Button onClick={submit} className="flex-1">Yes, submit</Button><Button variant="secondary" onClick={() => setConfirming(false)}>Keep going</Button></div>
          </Card>
        )}
      </aside>
    </div>
  );
}
