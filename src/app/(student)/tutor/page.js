import { TutorChat } from "@/components/student/TutorChat";
import { Badge, Card, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth";
import { getLearnerSnapshot } from "@/services/learner";
import { getTodayPlan } from "@/services/plan";
import { getTutorHistory } from "@/services/tutor";

export const metadata = { title: "AI tutor" };

export default async function TutorPage({ searchParams }) {
  const session = await requireRole(["student"]);
  const params = await searchParams;
  const [history, snapshot, plan] = await Promise.all([getTutorHistory(session.id), getLearnerSnapshot(session.id), getTodayPlan(session.id)]);
  const started = snapshot.concepts.filter((c) => c.attempts > 0);
  const weak = [...started].sort((a, b) => a.mastery - b.mastery).slice(0, 3);
  const live = snapshot.misconceptions.filter((m) => m.status !== "resolved").slice(0, 3);
  const focus = snapshot.conceptBySlug[snapshot.model?.currentFocusSlug];

  return (
    <>
      <PageHeader eyebrow="AI tutor" title="Ask Mentiq" description="A learner-aware tutor. Explanations change with your mastery, your recent mistakes and the misconceptions Mentiq has detected." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><TutorChat initialMessages={history.map((m) => ({ id: m.id, role: m.role, content: m.content, meta: m.meta }))} prefill={typeof params.q === "string" ? params.q.slice(0, 300) : undefined} /></div>
        <aside className="space-y-4" aria-label="What the tutor knows">
          <Card>
            <SectionTitle hint="Context the tutor uses for every answer">What Mentiq knows about you</SectionTitle>
            {started.length === 0 ? <p className="text-sm text-slate-500">Nothing yet — complete the diagnostic and the tutor will personalise its answers.</p> : (
              <dl className="space-y-3 text-sm">
                {focus && <div><dt className="text-slate-500">Current focus</dt><dd className="font-semibold">{focus.name} · {Math.round(focus.mastery * 100)}%</dd></div>}
                <div><dt className="text-slate-500">Weakest concepts</dt><dd className="font-semibold">{weak.map((c) => `${c.name} ${Math.round(c.mastery * 100)}%`).join(", ")}</dd></div>
                <div><dt className="text-slate-500">Active misconceptions</dt><dd>{live.length ? <ul className="mt-1 space-y-1">{live.map((m) => <li key={m.code}><Badge tone="rose">{m.name}</Badge></li>)}</ul> : <span className="font-semibold">None</span>}</dd></div>
                <div><dt className="text-slate-500">Today's plan</dt><dd className="font-semibold">{plan.items.map((i) => i.title).slice(0, 2).join("; ")}…</dd></div>
              </dl>
            )}
          </Card>
          <Card className="text-sm text-slate-600"><p className="font-semibold text-slate-800">Guardrails</p><p className="mt-1">Answers are grounded in the Class 10 Physics syllabus. If Mentiq isn't sure, it says so instead of guessing.</p></Card>
        </aside>
      </div>
    </>
  );
}
