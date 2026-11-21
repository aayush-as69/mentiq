"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Notice } from "@/components/ui/primitives";
import { api } from "@/lib/client";

const field = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export function RoleSelect({ userId, role, disabled }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const change = async (event) => {
    setError("");
    try {
      await api(`/api/admin/users/${userId}`, { method: "PATCH", body: { role: event.target.value } });
      router.refresh();
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <div>
      <label className="sr-only" htmlFor={`role-${userId}`}>Role</label>
      <select id={`role-${userId}`} defaultValue={role} disabled={disabled} onChange={change} className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm disabled:opacity-60">
        <option value="student">student</option><option value="teacher">teacher</option><option value="admin">admin</option>
      </select>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function ValidateToggle({ questionId, validated }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    setBusy(true);
    await api(`/api/admin/questions/${questionId}`, { method: "PATCH", body: { validated: !validated } }).catch(() => null);
    router.refresh();
    setBusy(false);
  };
  return <button type="button" onClick={toggle} disabled={busy} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${validated ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`} aria-label={validated ? "Unpublish question" : "Validate and publish question"}>{validated ? "Validated" : "Needs validation"}</button>;
}

export function QuestionForm({ concepts }) {
  const router = useRouter();
  const [type, setType] = useState("conceptual");
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const choice = type !== "numerical";

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const f = Object.fromEntries(new FormData(event.currentTarget));
    const body = {
      conceptSlug: f.conceptSlug, type, difficulty: f.difficulty, prompt: f.prompt, explanation: f.explanation, learningObjective: f.learningObjective,
      correctAnswer: choice ? f.correct : f.numeric, unit: f.unit || undefined, options: choice ? [f.a, f.b, f.c, f.d] : undefined,
    };
    try {
      const created = await api("/api/admin/questions", { method: "POST", body });
      setMessage({ tone: "emerald", text: `Created ${created.code}. It is validated and available to the adaptive engine.` });
      event.target.reset();
      router.refresh();
    } catch (e) {
      setMessage({ tone: "rose", text: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">Concept<select name="conceptSlug" className={field}>{concepts.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Type<select value={type} onChange={(e) => setType(e.target.value)} className={field}>{["mcq", "conceptual", "application", "assertion_reasoning", "numerical"].map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Difficulty<select name="difficulty" className={field} defaultValue="2"><option value="1">Easy</option><option value="2">Medium</option><option value="3">Hard</option><option value="4">Advanced</option></select></label>
      </div>
      <label className="block text-sm font-medium text-slate-700">Question<textarea name="prompt" required minLength={10} rows={3} className={field} /></label>
      {choice ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {["a", "b", "c", "d"].map((k) => <label key={k} className="text-sm font-medium text-slate-700">Option {k.toUpperCase()}<input name={k} required className={field} /></label>)}
          <label className="text-sm font-medium text-slate-700">Correct option<select name="correct" className={field}>{["A", "B", "C", "D"].map((k) => <option key={k}>{k}</option>)}</select></label>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Correct numeric answer<input name="numeric" type="number" step="any" required className={field} /></label>
          <label className="text-sm font-medium text-slate-700">Unit (optional)<input name="unit" className={field} /></label>
        </div>
      )}
      <label className="block text-sm font-medium text-slate-700">Explanation / worked solution<textarea name="explanation" required minLength={20} rows={2} className={field} /></label>
      <label className="block text-sm font-medium text-slate-700">Learning objective<input name="learningObjective" required minLength={5} className={field} /></label>
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      <Button type="submit" disabled={busy}>{busy ? "Validating…" : "Add question"}</Button>
    </form>
  );
}
