import { QuestionForm, ValidateToggle } from "@/components/admin/AdminControls";
import { Badge, Card, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth";
import { DIFFICULTY_LABELS, TYPE_LABELS } from "@/lib/format";
import { getSyllabus } from "@/services/syllabus";

export const metadata = { title: "Question bank" };

export default async function AdminQuestionsPage() {
  await requireRole(["admin"]);
  const syllabus = await getSyllabus();
  return (
    <>
      <PageHeader eyebrow="Question bank" title="Questions & validation" description="Only validated questions reach students. Metadata is checked on creation: the correct answer must match an option, and an explanation is required." />
      <Card className="mb-6"><SectionTitle>Add a question</SectionTitle><QuestionForm concepts={syllabus.concepts.map((c) => ({ slug: c.slug, name: c.name }))} /></Card>
      <Card className="overflow-hidden p-0">
        <div className="p-5 pb-3"><SectionTitle>{syllabus.questions.length} questions</SectionTitle></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{["Code", "Concept", "Difficulty", "Type", "Objective", "Status"].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {syllabus.questions.map((q) => (
                <tr key={q.id}>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-700">{q.code}</td><td className="px-4 py-2.5 font-medium text-slate-900">{q.conceptName}</td>
                  <td className="px-4 py-2.5"><Badge>{DIFFICULTY_LABELS[q.difficulty]}</Badge></td><td className="px-4 py-2.5 text-slate-600">{TYPE_LABELS[q.type]}</td>
                  <td className="px-4 py-2.5 text-slate-600">{q.learningObjective}</td><td className="px-4 py-2.5"><ValidateToggle questionId={q.id} validated={q.validated} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
