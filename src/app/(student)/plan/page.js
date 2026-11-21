import { PlanList } from "@/components/student/PlanList";
import { ButtonLink, Card, EmptyState, Notice, PageHeader } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth";
import { getLearnerSnapshot } from "@/services/learner";
import { getTodayPlan } from "@/services/plan";

export const metadata = { title: "Study plan" };

export default async function PlanPage() {
  const session = await requireRole(["student"]);
  const [plan, snapshot] = await Promise.all([getTodayPlan(session.id), getLearnerSnapshot(session.id)]);
  if (!snapshot.profile?.diagnosticCompletedAt) {
    return <><PageHeader eyebrow="Study plan" title="Today's plan" /><EmptyState title="No plan yet" body="No learning history yet. Complete your diagnostic to build your learner model." action={<ButtonLink href="/diagnostic">Start diagnostic</ButtonLink>} /></>;
  }
  const done = plan.items.filter((i) => i.done).length;
  return (
    <>
      <PageHeader eyebrow="Study plan" title="Today's plan" description={`${plan.summary} Fits your ${snapshot.profile.dailyMinutes}-minute day (about ${plan.totalMinutes} minutes).`} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><PlanList plan={plan} /></div>
        <div className="space-y-4">
          <Card><p className="text-sm text-slate-500">Completed today</p><p className="font-display text-3xl font-semibold">{done} / {plan.items.length}</p></Card>
          <Notice title="This plan is alive">It is regenerated from your learner model every time you open it. Improve a weak concept and it disappears; miss a review and it moves to the top.</Notice>
        </div>
      </div>
    </>
  );
}
