import { InsightCard } from "@/components/teacher/InsightCard";
import { Badge, Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { MasteryBar } from "@/components/ui/Mastery";
import { requireRole } from "@/lib/auth";
import { getClassAnalytics, getTeacherClassroom } from "@/services/teacher";

export const metadata = { title: "Class analytics" };

export default async function ClassAnalyticsPage() {
  const session = await requireRole(["teacher"]);
  const classroom = await getTeacherClassroom(session.id);
  if (!classroom) return <EmptyState title="No classroom assigned" body="Ask an administrator to assign a classroom to your account." />;
  const a = await getClassAnalytics(classroom.id);
  if (!a.studentCount) return <EmptyState title="No class data yet" body="Analytics appear once students complete their diagnostic." />;

  const interventions = a.insights.filter((i) => i.kind === "intervention");
  return (
    <>
      <PageHeader eyebrow="Class-wide gap detection" title={`${classroom.name} analytics`} description={`${a.studentCount} students. Insights are computed from learner models; every number is traceable.`} />

      <SectionTitle>Concepts requiring teacher intervention</SectionTitle>
      {interventions.length ? <ul className="mb-8 grid gap-4 md:grid-cols-2">{interventions.map((i) => <InsightCard key={i.title} insight={i} />)}</ul> : <p className="mb-8 text-sm text-slate-500">No concept currently needs a whole-class intervention.</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Most difficult concepts</SectionTitle>
          <ul className="space-y-3">{a.hardest.map((c) => <li key={c.slug}><div className="mb-1 flex justify-between text-sm"><span className="font-medium text-slate-800">{c.name}</span><span className="text-slate-500">{c.struggling} of {a.studentCount} struggling</span></div><MasteryBar value={c.avgMastery} label={`${c.name} class mastery`} /></li>)}</ul>
        </Card>
        <Card>
          <SectionTitle>Already mastered by most of the class</SectionTitle>
          {a.masteredByMost.length ? <ul className="space-y-2">{a.masteredByMost.map((c) => <li key={c.slug} className="flex items-center justify-between text-sm"><span className="font-medium text-slate-800">{c.name}</span><Badge tone="emerald">{c.mastered} students</Badge></li>)}</ul> : <p className="text-sm text-slate-500">No concept is mastered by 70% of the class yet.</p>}
        </Card>
      </div>

      <Card className="mt-6">
        <SectionTitle>Most common misconceptions</SectionTitle>
        <ul className="divide-y divide-slate-100">
          {a.misconceptionStats.map((m) => (
            <li key={m.code} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-slate-900">“{m.name}”</p><Badge tone="rose">{m.students} students</Badge></div>
              <p className="mt-1 text-sm text-slate-600">Affected concept: {m.conceptName}</p>
              <p className="mt-2 text-sm text-slate-700"><span className="font-semibold">Correct model:</span> {m.correctModel}</p>
              <p className="mt-1 text-sm text-slate-700"><span className="font-semibold">Suggested intervention:</span> {m.intervention.join(" → ")}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="p-5 pb-3"><SectionTitle>Concept-level detail</SectionTitle></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{["Concept", "Class mastery", "Struggling", "Mastered", "Most common issue", "Recommendation"].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {a.conceptStats.map((c) => (
                <tr key={c.slug}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{c.name}</td>
                  <td className="w-44 px-4 py-2.5">{c.avgMastery === null ? "—" : <MasteryBar value={c.avgMastery} label={`${c.name} class mastery`} />}</td>
                  <td className="px-4 py-2.5 tabular-nums">{c.struggling}</td><td className="px-4 py-2.5 tabular-nums">{c.mastered}</td>
                  <td className="px-4 py-2.5 text-slate-600">{c.topIssue?.name ?? "—"}</td><td className="px-4 py-2.5 text-slate-600">{c.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
