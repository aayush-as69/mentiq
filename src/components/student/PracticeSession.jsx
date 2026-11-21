"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { QuestionCard } from "@/components/student/QuestionCard";
import { ResultPanel } from "@/components/student/ResultPanel";
import { Button, Card, ErrorState, Notice, Skeleton } from "@/components/ui/primitives";
import { MasteryBar } from "@/components/ui/Mastery";
import { api } from "@/lib/client";
import { DIFFICULTY_LABELS, pct } from "@/lib/format";

const EMPTY_DRAFT = { answer: "", reasoning: "", confidence: 0.6 };

export function PracticeSession({ concept, fix, challenge }) {
  const [phase, setPhase] = useState("loading");
  const [current, setCurrent] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [hints, setHints] = useState([]);
  const [hintBusy, setHintBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [trail, setTrail] = useState([]);
  const sessionId = useRef(null);
  const startedAt = useRef(0);
  const first = useRef(true);

  const load = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const qs = new URLSearchParams();
      if (concept) qs.set("concept", concept);
      if (fix) qs.set("fix", fix);
      if (challenge && first.current) qs.set("challenge", "1");
      if (sessionId.current) qs.set("sessionId", sessionId.current);
      const data = await api(`/api/practice/next?${qs}`);
      first.current = false;
      sessionId.current = data.sessionId;
      setCurrent(data);
      setDraft(EMPTY_DRAFT);
      setHints([]);
      setResult(null);
      startedAt.current = Date.now();
      setPhase("question");
    } catch (e) {
      setError(e.message);
      setPhase("error");
    }
  }, [concept, fix, challenge]);

  useEffect(() => { load(); }, [load]);

  const requestHint = async () => {
    setHintBusy(true);
    try {
      const hint = await api("/api/practice/hint", { method: "POST", body: { questionId: current.question.id, level: hints.length + 1 } });
      setHints((h) => [...h, hint]);
    } catch (e) {
      setError(e.message);
    } finally {
      setHintBusy(false);
    }
  };

  const submit = async () => {
    setPhase("submitting");
    setError("");
    try {
      const data = await api("/api/practice/answer", {
        method: "POST",
        body: { sessionId: sessionId.current, questionId: current.question.id, answer: draft.answer, reasoning: draft.reasoning, confidence: draft.confidence, timeSeconds: (Date.now() - startedAt.current) / 1000, hintsUsed: hints.length },
      });
      setResult(data);
      setTrail((t) => [...t, { name: data.concept.name, before: data.mastery.before, after: data.mastery.after, correct: data.isCorrect }]);
      setPhase("result");
    } catch (e) {
      setError(e.message);
      setPhase("question");
    }
  };

  if (phase === "error") return <ErrorState title="Couldn't load your next question" body={error} onRetry={load} />;
  if (phase === "loading") {
    return <div role="status" aria-label="Selecting your next question" className="grid gap-6 lg:grid-cols-3"><Skeleton className="h-96 lg:col-span-2" /><Skeleton className="h-64" /><span className="sr-only">Selecting the best next question for you…</span></div>;
  }

  const { question, reason } = current;
  const answered = trail.length;
  const correct = trail.filter((t) => t.correct).length;
  const submitting = phase === "submitting";
  const lastHint = hints.at(-1);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {phase !== "result" ? (
          <Card className="p-6 sm:p-8">
            <QuestionCard key={question.id} question={question} answer={draft.answer} onAnswer={(answer) => setDraft((d) => ({ ...d, answer }))} reasoning={draft.reasoning}
              onReasoning={(reasoning) => setDraft((d) => ({ ...d, reasoning }))} confidence={draft.confidence} onConfidence={(confidence) => setDraft((d) => ({ ...d, confidence }))} disabled={submitting} />

            {hints.length > 0 && (
              <ol className="mt-6 space-y-2" aria-label="Hints">
                {hints.map((h) => (
                  <li key={h.level} className="animate-pop rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                    <span className="font-semibold">{h.solution ? "Solution" : `Hint ${h.level}`}</span> — {h.text}
                  </li>
                ))}
              </ol>
            )}
            {error && <div className="mt-4"><Notice tone="rose">{error}</Notice></div>}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Button variant="secondary" onClick={requestHint} disabled={hintBusy || submitting || lastHint?.solution}>
                {lastHint?.solution ? "Solution shown" : hints.length >= 3 ? "Show solution" : `Need a hint? (${hints.length}/3)`}
              </Button>
              <Button onClick={submit} disabled={!draft.answer.trim() || submitting} className="px-6">{submitting ? "Analysing your answer…" : "Submit answer"}</Button>
            </div>
          </Card>
        ) : (
          <ResultPanel result={result} question={question} answer={draft.answer} reasoning={draft.reasoning} onNext={load} />
        )}
      </div>

      <aside className="space-y-4" aria-label="Session insight">
        <Card className="border-indigo-200 bg-indigo-50/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Why you're seeing this</p>
          <p className="mt-2 font-semibold text-slate-900">{reason.headline}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">{reason.points.map((p) => <li key={p} className="flex gap-2"><span aria-hidden className="text-indigo-400">•</span>{p}</li>)}</ul>
          <p className="mt-3 border-t border-indigo-100 pt-3 text-sm"><span className="font-semibold text-slate-800">Learning objective:</span> <span className="text-slate-700">{current.objective}</span></p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">This question</p>
          <p className="mt-2 text-sm text-slate-700">{current.concept.name} · {DIFFICULTY_LABELS[question.difficulty]}</p>
          <MasteryBar value={current.concept.mastery} attempts={current.concept.attempts} className="mt-2" label="Current mastery" />
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">This session</p>
          {answered === 0 ? <p className="mt-2 text-sm text-slate-500">Your mastery changes will appear here as you answer.</p> : (
            <>
              <p className="mt-2 text-sm text-slate-700">{correct} of {answered} correct</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {trail.slice(-5).map((t, i) => <li key={i} className="flex items-center justify-between gap-2"><span className="truncate text-slate-600">{t.name}</span><span className={t.after >= t.before ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>{pct(t.before)} → {pct(t.after)}</span></li>)}
              </ul>
            </>
          )}
          <Link href="/dashboard" className="mt-4 block text-sm font-semibold text-indigo-600 hover:underline">Finish session →</Link>
        </Card>
      </aside>
    </div>
  );
}
