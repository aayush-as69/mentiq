import { PracticeSession } from "@/components/student/PracticeSession";
import { ButtonLink, EmptyState, PageHeader } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth";
import { getStudentProfile } from "@/services/students";

export const metadata = { title: "Practice" };

export default async function PracticePage({ searchParams }) {
  const session = await requireRole(["student"]);
  const params = await searchParams;
  const profile = await getStudentProfile(session.id);
  if (!profile?.diagnosticCompletedAt) {
    return <EmptyState title="Build your learner model first" body="No learning history yet. Complete your diagnostic to build your learner model — then every practice question is chosen for a reason." action={<ButtonLink href="/diagnostic">Start diagnostic</ButtonLink>} />;
  }
  return (
    <>
      <PageHeader eyebrow="Adaptive practice" title="Practice session" description="Each question is chosen from your learner model — concept, difficulty and type — and every answer updates it." />
      <PracticeSession concept={params.concept} fix={params.fix} challenge={params.challenge === "1"} />
    </>
  );
}
