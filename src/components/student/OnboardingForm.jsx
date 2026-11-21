"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Notice } from "@/components/ui/primitives";
import { api } from "@/lib/client";
import { cn } from "@/lib/format";

const GOALS = ["Score 80%+ in boards", "Fix weak numericals", "Understand concepts deeply", "Finish the syllabus on time", "Improve exam speed", "Stop making careless mistakes"];
const PACES = [["relaxed", "Relaxed", "Fewer, calmer sessions"], ["steady", "Steady", "A balanced daily routine"], ["intensive", "Intensive", "Fast, exam-focused"]];
const CONFIDENCE = ["Very low", "Low", "Okay", "Good", "Very high"];
const field = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export function OnboardingForm({ name }) {
  const router = useRouter();
  const [goals, setGoals] = useState(["Score 80%+ in boards"]);
  const [pace, setPace] = useState("steady");
  const [confidence, setConfidence] = useState(3);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const toggleGoal = (goal) => setGoals((g) => (g.includes(goal) ? g.filter((x) => x !== goal) : [...g, goal]));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const { redirect } = await api("/api/onboarding", { method: "POST", body: { ...form, goals, pace, confidence } });
      router.push(redirect);
      router.refresh();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <h2 className="font-display text-xl font-semibold">About you</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">Name<input className={cn(field, "bg-slate-50")} value={name} readOnly /></label>
          <label className="text-sm font-medium text-slate-700">Class
            <select name="grade" className={field} defaultValue="10"><option value="10">Class 10</option></select>
          </label>
          <label className="text-sm font-medium text-slate-700">Subject
            <select name="subject" className={field} defaultValue="physics"><option value="physics">Physics</option></select>
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">Exam / target
            <input name="exam" className={field} list="exams" defaultValue="CBSE Class 10 Board Exam" required />
            <datalist id="exams"><option value="CBSE Class 10 Board Exam" /><option value="School term exam" /><option value="Pre-board exam" /></datalist>
          </label>
          <label className="text-sm font-medium text-slate-700">Target score (optional)
            <input name="targetScore" type="number" min="1" max="100" placeholder="e.g. 85" className={field} />
          </label>
        </div>
        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-slate-700">How confident do you feel about Physics right now?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CONFIDENCE.map((label, i) => (
              <button key={label} type="button" aria-pressed={confidence === i + 1} onClick={() => setConfidence(i + 1)} className={cn("rounded-xl border px-4 py-2 text-sm font-medium transition", confidence === i + 1 ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")}>{label}</button>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-semibold">Your goals</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {GOALS.map((goal) => (
            <button key={goal} type="button" aria-pressed={goals.includes(goal)} onClick={() => toggleGoal(goal)} className={cn("rounded-full border px-4 py-2 text-sm font-medium transition", goals.includes(goal) ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")}>{goals.includes(goal) ? "✓ " : ""}{goal}</button>
          ))}
        </div>
        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-slate-700">Preferred learning pace</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {PACES.map(([value, label, body]) => (
              <button key={value} type="button" aria-pressed={pace === value} onClick={() => setPace(value)} className={cn("rounded-xl border p-4 text-left transition", pace === value ? "border-indigo-600 bg-indigo-50" : "border-slate-300 bg-white hover:bg-slate-50")}>
                <span className="block font-semibold text-slate-900">{label}</span><span className="block text-sm text-slate-600">{body}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">Study time per day
            <select name="dailyMinutes" className={field} defaultValue="45">{[20, 30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} minutes</option>)}</select>
          </label>
          <label className="text-sm font-medium text-slate-700">Weekly goal (questions)
            <select name="weeklyGoal" className={field} defaultValue="30">{[15, 30, 50, 80].map((m) => <option key={m} value={m}>{m} questions</option>)}</select>
          </label>
          <label className="text-sm font-medium text-slate-700">Classroom code (optional)
            <input name="joinCode" className={field} placeholder="e.g. 10A-PHY" />
          </label>
        </div>
      </Card>

      {error && <Notice tone="rose">{error}</Notice>}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">Next: a diagnostic that builds your first concept-level learner model.</p>
        <Button type="submit" disabled={busy} className="px-6">{busy ? "Saving…" : "Continue to diagnostic"}</Button>
      </div>
    </form>
  );
}
