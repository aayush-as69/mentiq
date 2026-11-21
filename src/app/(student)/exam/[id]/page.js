import { notFound, redirect } from "next/navigation";
import { ExamRunner } from "@/components/student/ExamRunner";
import { PageHeader } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth";
import { ApiError } from "@/lib/http";
import { getExamSession } from "@/services/exam";

export const metadata = { title: "Exam in progress" };

export default async function ExamAttemptPage({ params }) {
  const session = await requireRole(["student"]);
  const { id } = await params;
  let data;
  try {
    data = await getExamSession(session.id, Number(id));
  } catch (error) {
    if (error instanceof ApiError) notFound();
    throw error;
  }
  if (data.attempt.status === "submitted") redirect(`/exam/results/${id}`);
  return (
    <>
      <PageHeader eyebrow="Exam in progress" title={data.exam.title} />
      <ExamRunner attemptId={data.attempt.id} questions={data.questions} endsAt={data.endsAt} initialAnswers={data.attempt.answers} initialMarked={data.attempt.marked} />
    </>
  );
}
