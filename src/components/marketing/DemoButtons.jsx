"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Notice } from "@/components/ui/primitives";
import { api } from "@/lib/client";

const DEMOS = [
  { role: "new", title: "Start as a new student", body: "Full journey: onboarding → diagnostic → learner model" },
  { role: "student", title: "Demo student — Aarav", body: "Mixed mastery, misconceptions, history, reviews" },
  { role: "teacher", title: "Demo teacher — Class 10-A", body: "42 students, heatmap, class-wide misconceptions" },
  { role: "admin", title: "Demo admin", body: "Syllabus, question bank and user management" },
];

export function DemoButtons() {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const enter = async (role) => {
    setBusy(role);
    setError("");
    try {
      const { redirect } = await api("/api/auth/demo", { method: "POST", body: { role } });
      router.push(redirect);
      router.refresh();
    } catch (e) {
      setError(e.message);
      setBusy("");
    }
  };

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600">One-click demo</p>
      <div className="grid gap-2">
        {DEMOS.map((d) => (
          <button key={d.role} type="button" disabled={Boolean(busy)} onClick={() => enter(d.role)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-60">
            <span className="block text-sm font-semibold text-slate-900">{busy === d.role ? "Opening…" : d.title}</span>
            <span className="block text-xs text-slate-500">{d.body}</span>
          </button>
        ))}
      </div>
      {error && <div className="mt-3"><Notice tone="rose">{error}</Notice></div>}
    </div>
  );
}
