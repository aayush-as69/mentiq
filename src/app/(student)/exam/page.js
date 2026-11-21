import Link from "next/link";
import { ExamStart } from "@/components/student/ExamStart";
import { Badge, Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth";
import { DIFFICULTY_LABELS, pct, relativeDay } from "@/lib/format";
import { getExamDefinition, listExamAttempts } from "@/services/exam";
import { getStudentProfile } from "@/services/students";

export const metadata = { title: "Exam mode" };

export default async function ExamPage() {
  const session = await requireRole(["student"]);
  const [exam, attempts, profile] = await Promise.all([getExamDefinition(), listExamAttempts(session.id), getStudentProfile(session.id)]);
  if (!exam) return <EmptyState title="No exam available" body="An administrator hasn't published a mock exam yet." />;
  const open = attempts.find((a) => a.status === "in_progress");
  const past = attempts.filter((a) => a.status === "submitted");

  return (
    <>
      <PageHeader eyebrow="Exam mode" title={exam.title} description="A timed, full-syllabus simulation. Afterwards Mentiq shows concept-level results and rebuilds your study plan." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <dl className="grid grid-cols-3 gap-4">
            <div><dt className="text-sm text-slate-500">Duration</dt><dd className="font-display text-2xl font-semibold">{exam.durationMinutes} min</dd></div>
            <div><dt className="text-sm text-slate-500">Questions</dt><dd className="font-display text-2xl font-semibold">{exam.questionCount}</dd></div>
            <div><dt className="text-sm text-slate-500">Target</dt><dd className="font-display text-2xl font-semibold">{profile?.targetScore ? `${profile.targetScore}%` : "—"}</dd></div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">{Object.entries(exam.distribution).map(([lvl, share]) => <Badge key={lvl}>{Math.round(share * 100)}% {DIFFICULTY_LABELS[lvl]}</Badge>)}</div>
          <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-slate-600"><li>Navigate freely and mark questions for review.</li><li>No hints during the exam. The timer runs on the server clock.</li><li>Every answer updates your learner model when you submit.</li></ul>
          <div className="mt-6"><ExamStart resume={Boolean(open)} /></div>
          {open && <p className="mt-2 text-sm text-amber-700">You have an exam in progress — <Link className="font-semibold underline" href={`/exam/${open.id}`}>continue it</Link>.</p>}
        </Card>
        <Card>
          <SectionTitle>Past attempts</SectionTitle>
          {past.length === 0 ? <p className="text-sm text-slate-500">No exams yet. Your first result will include a concept-level breakdown.</p> : (
            <ul className="divide-y divide-slate-100">{past.map((a) => <li key={a.id}><Link href={`/exam/results/${a.id}`} className="flex items-center justify-between py-2.5 text-sm hover:text-indigo-600"><span>{relativeDay(a.submittedAt)}</span><span className="font-semibold tabular-nums">{pct(a.score)}</span></Link></li>)}</ul>
          )}
        </Card>
      </div>
    </>
  );
}
