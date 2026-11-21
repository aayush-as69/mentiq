import { Badge, ButtonLink, Card, EmptyState, Notice, PageHeader, SectionTitle, Stat } from "@/components/ui/primitives";
import { ChartLegend, LineChart, MiniBars } from "@/components/ui/Charts";
import { MasteryBar } from "@/components/ui/Mastery";
import { requireRole } from "@/lib/auth";
import { pct } from "@/lib/format";
import { getProgressAnalytics } from "@/services/analytics";
import { getGamification } from "@/services/gamification";

export const metadata = { title: "Progress" };

export default async function ProgressPage() {
  const session = await requireRole(["student"]);
  const [a, game] = await Promise.all([getProgressAnalytics(session.id), getGamification(session.id)]);

  if (a.totalAttempts === 0) {
    return <><PageHeader eyebrow="Progress" title="Is it working?" /><EmptyState title="No learning history yet" body="Complete your diagnostic to build your learner model — then progress analytics appear here." action={<ButtonLink href="/diagnostic">Start diagnostic</ButtonLink>} /></>;
  }

  const tone = { emerald: "emerald", sky: "indigo", amber: "amber", slate: "indigo" }[a.verdict.tone];
  return (
    <>
      <PageHeader eyebrow="Progress analytics" title="Is the student actually learning?" description="Real change in understanding — not time spent or questions clicked." />
      <Notice tone={tone} title={a.verdict.label}>{a.verdict.body}</Notice>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Learning streak" value={`${a.streak} days`} tone="amber" />
        <Stat label="Study time this week" value={`${a.weeklyMinutes} min`} />
        <Stat label="Recall success on reviews" value={a.retention.recallRate === null ? "—" : pct(a.retention.recallRate)} sub={`${a.retention.recallSamples} spaced recalls`} tone="emerald" />
        <Stat label="Est. retention now" value={a.retention.average === null ? "—" : pct(a.retention.average)} sub="forgetting-curve estimate" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Mastery over time</SectionTitle>
          <LineChart series={[{ name: "Overall mastery", color: "#4f46e5", points: a.masteryOverTime.map((p) => ({ label: p.date, value: p.mastery })) }]} ariaLabel="Mastery over time" />
        </Card>
        <Card>
          <SectionTitle>Accuracy over time</SectionTitle>
          <LineChart series={[{ name: "Accuracy", color: "#10b981", points: a.accuracyOverTime.map((p) => ({ label: p.date, value: p.accuracy })) }]} ariaLabel="Accuracy over time" />
        </Card>
        <Card>
          <SectionTitle hint="Average difficulty of questions attempted (1 = easy, 4 = advanced)">Difficulty progression</SectionTitle>
          <LineChart series={[{ name: "Difficulty", color: "#f59e0b", points: a.difficultyProgression.map((p) => ({ label: p.date, value: p.difficulty })) }]} max={4} percent={false} ariaLabel="Difficulty progression" />
        </Card>
        <Card>
          <SectionTitle hint="Concepts at 80%+ mastery over time">Concept progression</SectionTitle>
          <LineChart series={[{ name: "Mastered concepts", color: "#0ea5e9", points: a.masteryOverTime.map((p) => ({ label: p.date, value: p.mastered })) }]} max={Math.max(5, ...a.masteryOverTime.map((p) => p.mastered))} percent={false} ariaLabel="Mastered concepts over time" />
          <ChartLegend items={[{ name: "Concepts mastered", color: "#0ea5e9" }]} />
        </Card>
        <Card>
          <SectionTitle hint="Questions answered per day (last 14 active days)">Question completion</SectionTitle>
          <MiniBars data={a.daily} valueKey="attempts" />
        </Card>
        <Card>
          <SectionTitle>Misconception resolution</SectionTitle>
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-rose-50 p-3"><dt className="text-xs text-rose-700">Active</dt><dd className="font-display text-2xl font-semibold text-rose-700">{a.misconceptions.active}</dd></div>
            <div className="rounded-xl bg-amber-50 p-3"><dt className="text-xs text-amber-800">Improving</dt><dd className="font-display text-2xl font-semibold text-amber-800">{a.misconceptions.improving}</dd></div>
            <div className="rounded-xl bg-emerald-50 p-3"><dt className="text-xs text-emerald-700">Resolved</dt><dd className="font-display text-2xl font-semibold text-emerald-700">{a.misconceptions.resolved}</dd></div>
          </dl>
          {a.misconceptions.resolutionRate !== null && <div className="mt-4"><p className="mb-1 text-sm text-slate-600">Resolution rate</p><MasteryBar value={a.misconceptions.resolutionRate} label="Misconception resolution rate" /></div>}
        </Card>
      </div>

      <Card className="mt-6">
        <SectionTitle hint="Educational rewards — streaks, milestones and concept completion. No leaderboards.">Milestones & badges</SectionTitle>
        <div className="mb-5">
          <p className="mb-1 text-sm text-slate-600">Weekly goal: {game.weekly.done} / {game.weekly.goal} questions</p>
          <MasteryBar value={game.weekly.ratio} label="Weekly goal progress" />
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {game.badges.map((b) => (
            <li key={b.code} className={`rounded-xl border p-3 ${b.earned ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50 opacity-70"}`}>
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900"><span aria-hidden>{b.earned ? "★" : "☆"}</span>{b.title}</p>
              <p className="mt-0.5 text-xs text-slate-600">{b.description}</p>
              {b.earned ? <Badge tone="amber" className="mt-2">Earned</Badge> : <span className="mt-2 block text-xs text-slate-400">Locked</span>}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
