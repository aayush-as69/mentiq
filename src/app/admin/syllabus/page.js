import { Badge, Card, PageHeader } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth";
import { DIFFICULTY_LABELS } from "@/lib/format";
import { getSyllabus } from "@/services/syllabus";

export const metadata = { title: "Syllabus management" };

export default async function AdminSyllabusPage() {
  await requireRole(["admin"]);
  const syllabus = await getSyllabus();
  return (
    <>
      <PageHeader eyebrow="Syllabus" title={`${syllabus.subject.name} · Class ${syllabus.subject.grade}`} description={`${syllabus.subject.curriculum}. Structure: Subject → Chapter → Concept → Subconcept → Question. New subjects and classes plug into the same learner engine.`} />
      <div className="space-y-6">
        {syllabus.chapters.map((chapter) => (
          <Card key={chapter.id}>
            <h2 className="font-display text-xl font-semibold text-slate-900">{chapter.name}</h2>
            <p className="text-sm text-slate-600">{chapter.description}</p>
            <ul className="mt-4 divide-y divide-slate-100">
              {chapter.concepts.map((c) => (
                <li key={c.slug} className="grid gap-2 py-3 md:grid-cols-[1fr_2fr_auto] md:items-start">
                  <div><p className="font-medium text-slate-900">{c.name}</p><p className="text-xs text-slate-500">{c.topic} · {DIFFICULTY_LABELS[c.difficulty]}</p></div>
                  <div className="text-sm text-slate-600">
                    <p><span className="font-medium text-slate-700">Prerequisites:</span> {c.prerequisites.length ? c.prerequisites.map((s) => syllabus.conceptBySlug[s].name).join(", ") : "none"}</p>
                    <p><span className="font-medium text-slate-700">Subconcepts:</span> {c.subconcepts.join(" · ")}</p>
                  </div>
                  <div className="flex gap-2"><Badge tone="indigo">{syllabus.questions.filter((q) => q.conceptSlug === c.slug).length} questions</Badge><Badge tone="rose">{c.misconceptionCodes.length} misconceptions</Badge></div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
