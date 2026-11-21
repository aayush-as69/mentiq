import { ConceptMasteryTree } from "@/components/student/ConceptMasteryTree";
import { DiagnosticFlow } from "@/components/student/DiagnosticFlow";
import { ButtonLink, Card, Notice, PageHeader } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth";
import { getDiagnosticQuestions } from "@/services/diagnostic";
import { getLearnerSnapshot } from "@/services/learner";
import { getSyllabus } from "@/services/syllabus";

export const metadata = { title: "Diagnostic" };

export default async function DiagnosticPage({ searchParams }) {
  const session = await requireRole(["student"]);
  const params = await searchParams;
  const snapshot = await getLearnerSnapshot(session.id);

  if (snapshot.profile?.diagnosticCompletedAt && !params.retake) {
    const syllabus = await getSyllabus();
    const tested = snapshot.concepts.filter((c) => c.attempts > 0);
    const weak = [...tested].sort((a, b) => a.mastery - b.mastery).slice(0, 3);
    const strong = [...tested].sort((a, b) => b.mastery - a.mastery).slice(0, 3);
    return (
      <>
        <PageHeader eyebrow="Diagnostic complete" title="Your initial learner model" description="Concept-level mastery — not a single score. This is only your starting point: Mentiq keeps updating it after every answer."
          actions={<><ButtonLink href="/learner-model" variant="secondary">View learner model</ButtonLink><ButtonLink href="/practice">Start adaptive practice</ButtonLink></>} />
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <Card><p className="text-sm font-semibold text-rose-700">Weakest so far</p><p className="mt-1 text-slate-800">{weak.map((c) => `${c.name} ${Math.round(c.mastery * 100)}%`).join(" · ")}</p></Card>
          <Card><p className="text-sm font-semibold text-emerald-700">Strongest so far</p><p className="mt-1 text-slate-800">{strong.map((c) => `${c.name} ${Math.round(c.mastery * 100)}%`).join(" · ")}</p></Card>
        </div>
        <ConceptMasteryTree concepts={snapshot.concepts} chapters={syllabus.chapters} />
        <div className="mt-6"><Notice title="Not tested yet?">{snapshot.concepts.filter((c) => c.attempts === 0).length} concepts are still “not started”. Practice will introduce them gradually. <a className="font-semibold underline" href="/diagnostic?retake=1">Retake the diagnostic</a></Notice></div>
      </>
    );
  }

  const questions = await getDiagnosticQuestions();
  return (
    <>
      <PageHeader eyebrow="Step 2 of 2" title="Physics diagnostic" description="Different concepts, difficulty levels and question types. Explain your thinking where you can — Mentiq reads it to find misconceptions." />
      <DiagnosticFlow questions={questions} />
    </>
  );
}
