import Link from "next/link";
import { notFound } from "next/navigation";
import { MisconceptionList } from "@/components/student/MisconceptionList";
import { Badge, Card, PageHeader, SectionTitle, Stat } from "@/components/ui/primitives";
import { LineChart } from "@/components/ui/Charts";
import { MasteryBar } from "@/components/ui/Mastery";
import { requireRole } from "@/lib/auth";
import { ApiError } from "@/lib/http";
import { cn, pct, relativeDay } from "@/lib/format";
import { getProgressAnalytics } from "@/services/analytics";
import { getStudentForTeacher } from "@/services/teacher";

export const metadata = { title: "Student profile" };

export default async function TeacherStudentPage({ params }) {
  const session = await requireRole(["teacher"]);
  const { id } = await params;
  let data;
  try {
    data = await getStudentForTeacher(session.id, Number(id));
  } catch (error) {
    if (error instanceof ApiError) notFound();
    throw error;
  }
  if (!data) notFound();
  const { student, snapshot, attempts, classroom } = data;
  const analytics = await getProgressAnalytics(student.id);
  const started = snapshot.concepts.filter((c) => c.attempts > 0);
  const weak = [...started].sort((a, b) => a.mastery - b.mastery).slice(0, 5);
  const model = snapshot.model;

  return (
    <>
      <PageHeader eyebrow={<Link href="/teacher" className="hover:underline">← {classroom.name}</Link>} title={student.name} description={student.email} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Overall mastery" value={pct(model?.overallMastery)} tone="indigo" />
        <Stat label="Questions answered" value={analytics.totalAttempts} />
        <Stat label="Learning streak" value={`${analytics.streak} days`} tone="amber" />
        <Stat label="Learning velocity" value={`${model ? (model.learningVelocity * 100).toFixed(1) : "0.0"} pts/wk`} sub="average gain per concept" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card><SectionTitle>Weak concepts</SectionTitle>{weak.length ? <ul className="space-y-3">{weak.map((c) => <li key={c.slug}><div className="mb-1 flex justify-between text-sm"><span className="font-medium">{c.name}</span><span className="text-slate-500">next review {c.schedule ? relativeDay(c.schedule.dueAt) : "—"}</span></div><MasteryBar value={c.mastery} label={`${c.name} mastery`} /></li>)}</ul> : <p className="text-sm text-slate-500">No learning history yet.</p>}</Card>
        <Card><SectionTitle hint="Detected from the student's written reasoning">Misconceptions</SectionTitle><MisconceptionList items={snapshot.misconceptions} empty="No misconceptions detected." /></Card>
        <Card>
          <SectionTitle>Learning progress</SectionTitle>
          {analytics.masteryOverTime.length > 1 ? <LineChart series={[{ name: "Mastery", color: "#4f46e5", points: analytics.masteryOverTime.map((p) => ({ label: p.date, value: p.mastery })) }]} ariaLabel="Student mastery over time" /> : <p className="py-6 text-center text-sm text-slate-500">Not enough history yet.</p>}
          <p className="mt-2 text-sm text-slate-600"><span className="font-semibold">{analytics.verdict.label}.</span> {analytics.verdict.body}</p>
        </Card>
        <Card>
          <SectionTitle>Recent performance</SectionTitle>
          {attempts.length ? <ul className="divide-y divide-slate-100">{attempts.map((a) => <li key={a.id} className="flex items-center justify-between gap-2 py-2 text-sm"><span className="flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", a.isCorrect ? "bg-emerald-500" : "bg-rose-500")} />{a.conceptName}</span><span className="flex items-center gap-2">{!a.isCorrect && a.errorType !== "none" && <Badge tone="slate">{a.errorType.replace("_", " ")}</Badge>}<span className="text-slate-500">{relativeDay(a.createdAt)}</span></span></li>)}</ul> : <p className="text-sm text-slate-500">No attempts yet.</p>}
        </Card>
      </div>
    </>
  );
}
