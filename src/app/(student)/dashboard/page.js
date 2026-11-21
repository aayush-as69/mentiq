import Link from "next/link";
import { MisconceptionList } from "@/components/student/MisconceptionList";
import { PlanList } from "@/components/student/PlanList";
import { ReviewList } from "@/components/student/ReviewList";
import { Badge, ButtonLink, Card, EmptyState, PageHeader, SectionTitle, Stat } from "@/components/ui/primitives";
import { LineChart } from "@/components/ui/Charts";
import { MasteryBar, MasteryRing } from "@/components/ui/Mastery";
import { requireRole } from "@/lib/auth";
import { getProgressAnalytics } from "@/services/analytics";
import { getGamification } from "@/services/gamification";
import { getLearnerSnapshot } from "@/services/learner";
import { getTodayPlan } from "@/services/plan";

export const metadata = { title: "Dashboard" };

function ConceptBars({ items, empty }) {
  if (!items.length) return <p className="text-sm text-slate-500">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((c) => (
        <li key={c.slug}>
          <div className="mb-1 flex justify-between text-sm"><Link href={`/concepts?c=${c.slug}`} className="font-medium text-slate-800 hover:text-indigo-600">{c.name}</Link></div>
          <MasteryBar value={c.mastery} attempts={c.attempts} label={`${c.name} mastery`} />
        </li>
      ))}
    </ul>
  );
}

export default async function DashboardPage() {
  const session = await requireRole(["student"]);
  const [snapshot, plan, analytics, game] = await Promise.all([getLearnerSnapshot(session.id), getTodayPlan(session.id), getProgressAnalytics(session.id), getGamification(session.id)]);
  const first = session.name.split(" ")[0];

  if (!snapshot.profile?.diagnosticCompletedAt) {
    return (
      <>
        <PageHeader eyebrow="Dashboard" title={`Welcome, ${first}`} />
        <EmptyState title="Your learner model is empty" body="No learning history yet. Complete your diagnostic to build your learner model." action={<ButtonLink href="/diagnostic">Start diagnostic</ButtonLink>} />
      </>
    );
  }

  const started = snapshot.concepts.filter((c) => c.attempts > 0);
  const weak = started.filter((c) => c.mastery < 0.65).sort((a, b) => a.mastery - b.mastery).slice(0, 3);
  const strong = started.filter((c) => c.mastery >= 0.7).sort((a, b) => b.mastery - a.mastery).slice(0, 3);
  const mastered = snapshot.concepts.filter((c) => c.status === "mastered").length;
  const reviews = started.filter((c) => c.schedule).sort((a, b) => new Date(a.schedule.dueAt) - new Date(b.schedule.dueAt)).slice(0, 5);
  const overall = snapshot.model?.overallMastery ?? 0;
  const liveMisconceptions = snapshot.misconceptions.filter((m) => m.status !== "resolved").slice(0, 3);
  const series = [{ name: "Overall mastery", color: "#4f46e5", points: analytics.masteryOverTime.map((p) => ({ label: p.date, value: p.mastery })) }];
  const earned = game.badges.filter((b) => b.earned);

  return (
    <>
      <PageHeader eyebrow="Dashboard" title={`Hello, ${first}`} description="Here's what Mentiq currently understands about your learning — and what to do next."
        actions={<><ButtonLink href="/practice">Start practice</ButtonLink><ButtonLink href="/learner-model" variant="secondary">My learner model</ButtonLink></>} />

      <form action="/tutor" className="mb-6 flex gap-2" role="search">
        <label className="sr-only" htmlFor="ask">Ask Mentiq</label>
        <input id="ask" name="q" placeholder="Ask Mentiq anything about Class 10 Physics — answers adapt to what you know…" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        <button className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Ask</button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4 p-4"><MasteryRing value={overall} size={96} stroke={10} /><div><p className="text-xs font-medium text-slate-500">Overall mastery</p><p className="text-xs text-slate-400">across {started.length} tested concepts</p></div></Card>
        <Stat label="Questions solved" value={game.stats.attempts} sub={`${game.weekly.done} this week`} />
        <Stat label="Current streak" value={`${game.stats.streak} day${game.stats.streak === 1 ? "" : "s"}`} tone="amber" sub="consecutive days of learning" />
        <Stat label="Concepts mastered" value={`${mastered} / ${snapshot.concepts.length}`} tone="emerald" sub={game.nextMilestone ? `next milestone: ${game.nextMilestone}` : "all milestones reached"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionTitle hint={plan.summary} action={<Link href="/plan" className="text-sm font-semibold text-indigo-600 hover:underline">Full plan</Link>}>Today's learning plan</SectionTitle>
            <PlanList plan={plan} showReasons={false} />
          </Card>
          <Card>
            <SectionTitle hint="Is the student actually learning?">Mastery over time</SectionTitle>
            {series[0].points.length > 1 ? <LineChart series={series} ariaLabel="Overall mastery over time" /> : <p className="py-8 text-center text-sm text-slate-500">Keep practising — your progress graph appears after a few days of history.</p>}
            <p className="mt-2 text-sm text-slate-600"><span className="font-semibold">{analytics.verdict.label}.</span> {analytics.verdict.body}</p>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card><SectionTitle>Needs attention</SectionTitle><ConceptBars items={weak} empty="Nothing is weak right now — nice." /></Card>
            <Card><SectionTitle>Mastered & strong</SectionTitle><ConceptBars items={strong} empty="Strong concepts will appear as you practise." /></Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle action={<Link href="/reviews" className="text-sm font-semibold text-indigo-600 hover:underline">All</Link>}>Upcoming reviews</SectionTitle>
            <ReviewList concepts={reviews} now={snapshot.now} />
          </Card>
          <Card>
            <SectionTitle>Misconceptions to fix</SectionTitle>
            <MisconceptionList items={liveMisconceptions} empty="No active misconceptions. Great reasoning!" />
          </Card>
          <Card>
            <SectionTitle>Weekly goal</SectionTitle>
            <p className="text-sm text-slate-600">{game.weekly.done} of {game.weekly.goal} questions this week</p>
            <MasteryBar value={game.weekly.ratio} label="Weekly goal progress" className="mt-2" />
            <div className="mt-4 flex flex-wrap gap-1.5">{earned.length ? earned.slice(0, 6).map((b) => <Badge key={b.code} tone="amber" className="py-1">★ {b.title}</Badge>) : <p className="text-sm text-slate-500">Badges appear as you hit milestones.</p>}</div>
          </Card>
        </div>
      </div>
    </>
  );
}
