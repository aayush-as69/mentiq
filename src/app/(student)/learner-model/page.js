import { ConceptMasteryTree } from "@/components/student/ConceptMasteryTree";
import { Badge, ButtonLink, Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { MasteryBar, StatusPill, TrendTag } from "@/components/ui/Mastery";
import { MisconceptionList } from "@/components/student/MisconceptionList";
import { requireRole } from "@/lib/auth";
import { DIFFICULTY_LABELS, RISK, TYPE_LABELS, cn, pct, relativeDay } from "@/lib/format";
import { getLearnerSnapshot, getRecentAttempts } from "@/services/learner";
import { getSyllabus } from "@/services/syllabus";

export const metadata = { title: "Learner model" };

const STATUS_TONE = { weak: "rose", learning: "sky", mastered: "emerald", not_started: "slate" };

export default async function LearnerModelPage() {
  const session = await requireRole(["student"]);
  const [snapshot, attempts, syllabus] = await Promise.all([getLearnerSnapshot(session.id), getRecentAttempts(session.id, 10), getSyllabus()]);
  const model = snapshot.model;

  if (!snapshot.profile?.diagnosticCompletedAt || !model?.totalAttempts) {
    return (
      <>
        <PageHeader eyebrow="Learner model" title="Your learning profile" />
        <EmptyState title="No learning history yet" body="Complete your diagnostic to build your learner model." action={<ButtonLink href="/diagnostic">Start diagnostic</ButtonLink>} />
      </>
    );
  }

  const focus = snapshot.conceptBySlug[model.currentFocusSlug];
  const started = snapshot.concepts.filter((c) => c.attempts > 0);
  const calibration = model.difficultyProfile;
  const typeStats = Object.entries(model.questionTypeStats).sort((a, b) => a[1].accuracy - b[1].accuracy);

  return (
    <>
      <PageHeader eyebrow="Learner model" title="Your learning profile" description={`How Mentiq currently understands you. Last updated ${relativeDay(model.updatedAt)} — it changes after every answer.`}
        actions={<ButtonLink href="/practice">Practise your focus</ButtonLink>} />

      {focus && (
        <Card className="mb-6 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Current focus</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold text-slate-900">Concept: {focus.name}</h2>
            <StatusPill status={focus.status} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4 lg:grid-cols-8">
            {[["Mastery", pct(focus.mastery)], ["Confidence", pct(focus.confidence)], ["Accuracy", pct(focus.accuracy)], ["Attempts", focus.attempts],
              ["Difficulty handled", focus.difficultyHandled ? DIFFICULTY_LABELS[focus.difficultyHandled] : "—"], ["Misconception risk", RISK[focus.misconceptionRisk].label],
              ["Last reviewed", focus.schedule ? relativeDay(focus.schedule.lastReviewedAt) : "—"], ["Next review", focus.schedule ? relativeDay(focus.schedule.dueAt) : "—"]].map(([k, v]) => (
              <div key={k}><dt className="text-slate-500">{k}</dt><dd className="font-semibold text-slate-900">{v}</dd></div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-slate-600">Recent trend: <TrendTag trend={focus.trend} /></p>
        </Card>
      )}

      <SectionTitle>Concept mastery</SectionTitle>
      <ConceptMasteryTree concepts={snapshot.concepts} chapters={syllabus.chapters} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Learning strengths</SectionTitle>
          {model.strengths.length ? <ul className="space-y-2">{model.strengths.map((s) => <li key={s.label} className="flex gap-2"><span className="font-bold text-emerald-600">✓</span><span><span className="font-medium text-slate-900">{s.label}</span> <span className="text-sm text-slate-500">— {s.evidence}</span></span></li>)}</ul> : <p className="text-sm text-slate-500">Strengths appear once Mentiq has enough evidence.</p>}
          <div className="mt-6"><SectionTitle>Needs improvement</SectionTitle></div>
          {model.needsImprovement.length ? <ul className="space-y-2">{model.needsImprovement.map((s) => <li key={s.label} className="flex gap-2"><span className="font-bold text-amber-600">⚠</span><span><span className="font-medium text-slate-900">{s.label}</span> <span className="text-sm text-slate-500">— {s.evidence}</span></span></li>)}</ul> : <p className="text-sm text-slate-500">No weak patterns detected yet.</p>}
        </Card>

        <Card>
          <SectionTitle hint={calibration.verdict}>Difficulty calibration</SectionTitle>
          <ul className="space-y-3">
            {calibration.levels.map((l) => (
              <li key={l.level}>
                <div className="mb-1 flex items-center justify-between text-sm"><span className="font-medium text-slate-800">{l.label}</span><span className="text-slate-500">{l.attempts ? `${l.attempts} questions` : "not tested"} · {l.status.replace("_", " ")}</span></div>
                <MasteryBar value={l.accuracy ?? 0} attempts={l.accuracy === null ? 0 : 1} label={`${l.label} accuracy`} />
              </li>
            ))}
          </ul>
          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-sm">
            <div><dt className="text-slate-500">Learning velocity</dt><dd className="font-semibold">{model.learningVelocity >= 0 ? "+" : ""}{(model.learningVelocity * 100).toFixed(1)} pts / week</dd></div>
            <div><dt className="text-slate-500">Hint reliance</dt><dd className="font-semibold">{pct(model.hintDependency)}</dd></div>
            <div><dt className="text-slate-500">Self-assessment</dt><dd className="font-semibold capitalize">{model.calibration.label?.replace("_", " ")}</dd></div>
          </dl>
        </Card>

        <Card>
          <SectionTitle hint="Question types that cause difficulty">Accuracy by question type</SectionTitle>
          <ul className="space-y-3">{typeStats.map(([type, s]) => <li key={type}><div className="mb-1 flex justify-between text-sm"><span className="font-medium text-slate-800">{TYPE_LABELS[type]}</span><span className="text-slate-500">{s.attempts} questions</span></div><MasteryBar value={s.accuracy} label={`${TYPE_LABELS[type]} accuracy`} /></li>)}</ul>
        </Card>

        <Card>
          <SectionTitle>Misconceptions Mentiq has found</SectionTitle>
          <MisconceptionList items={snapshot.misconceptions.slice(0, 5)} />
        </Card>
      </div>

      <Card className="mt-6">
        <SectionTitle hint="Each answer moves the model — this is the feedback loop at work">Latest model updates</SectionTitle>
        <ul className="divide-y divide-slate-100">
          {attempts.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
              <span className="flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", a.isCorrect ? "bg-emerald-500" : "bg-rose-500")} /><span className="font-medium text-slate-800">{a.conceptName}</span><Badge>{a.context}</Badge></span>
              <span className="tabular-nums text-slate-600">{pct(a.masteryBefore)} → <span className="font-semibold text-slate-900">{pct(a.masteryAfter)}</span> <span className="text-slate-400">· {relativeDay(a.createdAt)}</span></span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="p-5 pb-3"><SectionTitle>Every concept at a glance</SectionTitle></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{["Concept", "Status", "Mastery", "Confidence", "Accuracy", "Trend", "Risk", "Next review"].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {started.map((c) => (
                <tr key={c.slug}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-2.5"><Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge></td>
                  <td className="px-4 py-2.5 tabular-nums">{pct(c.mastery)}</td><td className="px-4 py-2.5 tabular-nums">{pct(c.confidence)}</td><td className="px-4 py-2.5 tabular-nums">{pct(c.accuracy)}</td>
                  <td className="px-4 py-2.5"><TrendTag trend={c.trend} /></td>
                  <td className={cn("px-4 py-2.5 font-medium", RISK[c.misconceptionRisk].text)}>{RISK[c.misconceptionRisk].label}</td>
                  <td className="px-4 py-2.5">{c.schedule ? relativeDay(c.schedule.dueAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
