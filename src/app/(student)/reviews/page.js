import { ReviewList } from "@/components/student/ReviewList";
import { ButtonLink, Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth";
import { projectLadder } from "@/engine/spaced";
import { DAY_MS } from "@/lib/format";
import { getLearnerSnapshot } from "@/services/learner";

export const metadata = { title: "Review schedule" };

const dayLabel = (d) => (d === 0 ? "Today" : d === 1 ? "Tomorrow" : `Day ${d}`);

export default async function ReviewsPage() {
  const session = await requireRole(["student"]);
  const snapshot = await getLearnerSnapshot(session.id);
  const now = snapshot.now;
  const scheduled = snapshot.concepts.filter((c) => c.attempts > 0 && c.schedule).sort((a, b) => new Date(a.schedule.dueAt) - new Date(b.schedule.dueAt));

  if (!scheduled.length) {
    return <><PageHeader eyebrow="Spaced repetition" title="Review schedule" /><EmptyState title="Nothing scheduled yet" body="No learning history yet. Complete your diagnostic to build your learner model — reviews are scheduled automatically after each concept." action={<ButtonLink href="/diagnostic">Start diagnostic</ButtonLink>} /></>;
  }
  const due = scheduled.filter((c) => new Date(c.schedule.dueAt) <= now);
  const week = scheduled.filter((c) => { const t = new Date(c.schedule.dueAt) - now; return t > 0 && t <= 7 * DAY_MS; });
  const later = scheduled.filter((c) => new Date(c.schedule.dueAt) - now > 7 * DAY_MS);
  const ladders = [...scheduled].sort((a, b) => a.mastery - b.mastery).slice(0, 3);

  return (
    <>
      <PageHeader eyebrow="Spaced repetition" title="Review schedule" description="Success lengthens the gap, a miss shortens it — adjusted for mastery, difficulty and hints." actions={due.length ? <ButtonLink href={`/practice?concept=${due[0].slug}`}>Start with {due[0].name}</ButtonLink> : null} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card><SectionTitle>Due now ({due.length})</SectionTitle><ReviewList concepts={due} now={now} showReason empty="Nothing is due. Your memory is on schedule." /></Card>
          <Card><SectionTitle>This week ({week.length})</SectionTitle><ReviewList concepts={week} now={now} showReason empty="No reviews later this week." /></Card>
          <Card><SectionTitle>Later ({later.length})</SectionTitle><ReviewList concepts={later} now={now} empty="Long intervals appear here as concepts get stronger." /></Card>
        </div>
        <Card className="h-fit">
          <SectionTitle hint="If you recall successfully each time">Projected ladders</SectionTitle>
          <div className="space-y-5">
            {ladders.map((c) => (
              <div key={c.slug}>
                <p className="mb-2 text-sm font-semibold text-slate-900">{c.name}</p>
                <ol className="flex flex-wrap gap-1.5">
                  {projectLadder(c.schedule, c.mastery, now).map((s, i) => <li key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-center"><span className="block text-[11px] text-slate-500">{dayLabel(s.day)}</span><span className="text-xs font-semibold text-sky-700">Review</span></li>)}
                </ol>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
