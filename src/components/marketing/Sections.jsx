import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { Badge, ButtonLink } from "@/components/ui/primitives";
import { LineChart } from "@/components/ui/Charts";
import { MasteryBar } from "@/components/ui/Mastery";

function SectionHead({ id, eyebrow, title, body }) {
  return (
    <div id={id} className="mx-auto max-w-2xl scroll-mt-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">{eyebrow}</p>
      <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-slate-600">{body}</p>
    </div>
  );
}

export function LandingNav({ session, startHref }) {
  const link = "rounded-md px-1 py-0.5 transition-colors hover:text-white";
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#060914]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo light />
        <nav aria-label="Sections" className="hidden items-center gap-7 text-sm font-medium text-slate-400 md:flex">
          <a href="#how-it-works" className={link}>How it works</a>
          <a href="#learner-model" className={link}>Learner model</a>
          <a href="#misconceptions" className={link}>Misconceptions</a>
          <a href="#teachers" className={link}>Teachers</a>
        </nav>
        <div className="flex items-center gap-2">
          {!session && <Link href="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">Sign in</Link>}
          <Link href={session ? "/dashboard" : startHref} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-indigo-100">
            {session ? "Open app" : "Start diagnostic"}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Hero({ startHref }) {
  return (
    <section className="relative overflow-hidden bg-[#060914] text-white">
      {/* depth: two soft light sources and a faint dot grid that fades out */}
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[640px] w-[640px] rounded-full bg-indigo-600/30 blur-[140px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-52 left-[-10%] h-[480px] w-[480px] rounded-full bg-rose-500/10 blur-[140px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.09)_1px,transparent_0)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:pb-28 lg:pt-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-sm font-medium text-indigo-200 ring-1 ring-white/10">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Class 10 Physics, adaptive exam prep
          </span>
          <h1 className="font-display mt-6 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="sr-only">Mentiq: </span>
            AI that learns how you learn.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
            An adaptive exam-prep tutor that understands what you know, detects what you misunderstand, and builds your next learning step around you.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={startHref} className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400">
              Start diagnostic
            </Link>
            <Link href="#how-it-works" className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/10">
              See how Mentiq works
            </Link>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-5 border-t border-white/10 pt-6 text-sm">
            {[["Understand", "what you actually know"], ["Adapt", "what you practise next"], ["Improve", "measured, not guessed"]].map(([t, d]) => (
              <div key={t}><dt className="font-display text-lg font-semibold text-white">{t}</dt><dd className="mt-0.5 text-slate-400">{d}</dd></div>
            ))}
          </dl>
        </div>
        <div className="animate-fade-up [animation-delay:150ms]">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

const LOOP = [
  ["Question", "Chosen for a reason from your model"], ["Answer + reasoning", "You explain how you got there"], ["Reasoning analysis", "Misconception, gap, slip or carelessness?"],
  ["Learner model update", "Mastery, confidence, schedule"], ["Next question", "Targeted at what you just revealed"], ["New performance", "The loop repeats — the model stays alive"],
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHead id="how-it-works" eyebrow="How it works" title="Every answer teaches Mentiq something" body="Not a chatbot with content. A feedback loop that rebuilds your learner model after every meaningful answer." />
      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LOOP.map(([title, body], i) => (
          <li key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">{i + 1}</span>
            <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function LearnerModelSection() {
  const rows = [["Mastery", "42%"], ["Confidence", "36%"], ["Accuracy", "45%"], ["Recent trend", "↗ Improving"], ["Misconception risk", "High"], ["Next review", "Tomorrow"]];
  return (
    <section className="bg-slate-950 py-20 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p id="learner-model" className="scroll-mt-24 text-xs font-semibold uppercase tracking-widest text-indigo-300">Learner model</p>
          <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">Concept-level understanding, not a single score</h2>
          <p className="mt-4 text-slate-300">Mentiq tracks mastery, confidence, accuracy, difficulty handled, mistake patterns, retention and learning velocity for every concept — and never treats the diagnostic as your permanent profile.</p>
        </div>
        <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm font-semibold text-indigo-200">Concept: Lens Formula</p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            {rows.map(([k, v]) => <div key={k} className="rounded-xl bg-white/5 px-4 py-3"><dt className="text-xs text-slate-400">{k}</dt><dd className="mt-0.5 font-semibold">{v}</dd></div>)}
          </dl>
        </div>
      </div>
    </section>
  );
}

export function MisconceptionSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHead id="misconceptions" eyebrow="Misconception detection" title="Mentiq reads your reasoning, not just your answer" body="It separates a knowledge gap from a misconception, a calculation error from a careless slip — and responds differently to each." />
      <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Student reasoning</p>
          <p className="mt-2 rounded-xl bg-slate-50 p-4 text-slate-800">“The image is virtual because the object is beyond 2F.”</p>
          <div className="mt-4 flex flex-wrap gap-2"><Badge tone="rose">Incorrect</Badge><Badge tone="slate">Concept: Lenses — image formation</Badge></div>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Detected misconception · 87% confidence</p>
          <p className="mt-2 font-semibold text-rose-950">Confusing object position with image characteristics.</p>
          <ol className="mt-3 space-y-1 text-sm text-rose-900"><li>1. Review image formation</li><li>2. Solve a guided ray-diagram question</li><li>3. Attempt a similar question</li></ol>
        </div>
      </div>
      <ul className="mx-auto mt-6 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[["Knowledge gap", "Doesn't know the concept yet", "amber"], ["Misconception", "Holds an incorrect mental model", "rose"], ["Calculation error", "Understands, slipped on the maths", "sky"], ["Careless error", "An isolated slip", "slate"]].map(([t, d, tone]) => (
          <li key={t} className="rounded-xl border border-slate-200 bg-white p-4"><Badge tone={tone}>{t}</Badge><p className="mt-2 text-sm text-slate-600">{d}</p></li>
        ))}
      </ul>
    </section>
  );
}

export function AdaptiveSection() {
  const levels = [["Easy", 0.9], ["Medium", 0.75], ["Hard", 0.35]];
  const ladder = [["Today", "Learn"], ["Tomorrow", "Review"], ["Day 4", "Review"], ["Day 9", "Review"], ["Day 20", "Review"]];
  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Adaptive practice</p>
          <h3 className="font-display mt-2 text-2xl font-semibold">Difficulty that follows evidence</h3>
          <p className="mt-2 text-sm text-slate-600">Every question has a reason, a difficulty and a learning objective. Difficulty doesn’t rise after every correct answer — it rises when you’re ready.</p>
          <div className="mt-5 space-y-3">{levels.map(([l, v]) => <div key={l}><div className="mb-1 text-sm font-medium">{l}</div><MasteryBar value={v} label={l} /></div>)}</div>
          <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900">Ready for Medium questions — not yet ready for Advanced application questions.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Spaced repetition</p>
          <h3 className="font-display mt-2 text-2xl font-semibold">Review right before you forget</h3>
          <p className="mt-2 text-sm text-slate-600">Intervals grow when you recall successfully and shrink when you don’t, adjusted for mastery and difficulty.</p>
          <ol className="mt-5 flex flex-wrap gap-2">
            {ladder.map(([d, k], i) => <li key={d} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center"><div className="text-xs text-slate-500">{d}</div><div className={`text-sm font-semibold ${i ? "text-sky-700" : "text-emerald-700"}`}>{k}</div></li>)}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function TeacherSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p id="teachers" className="scroll-mt-24 text-xs font-semibold uppercase tracking-widest text-indigo-600">Teacher intelligence</p>
          <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">See the whole class’s thinking</h2>
          <p className="mt-4 text-slate-600">Learner models aggregate into concept heatmaps, shared misconceptions and intervention recommendations — so the next lesson targets what the class actually misunderstands.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Top misconception · Class 10-A</p>
          <p className="mt-2 font-display text-xl font-semibold">“Virtual image means inverted image”</p>
          <p className="mt-1 text-sm text-slate-600">Affected concept: Lens / Image Formation</p>
          <p className="mt-4 text-4xl font-semibold text-rose-600">14 <span className="text-base font-medium text-slate-500">students</span></p>
        </div>
      </div>
    </section>
  );
}

export function ProgressSection() {
  const points = [["Diagnostic", 0.31], ["Targeted practice", 0.47], ["Consolidation", 0.68]].map(([label, value]) => ({ label, value }));
  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-6">
          <p className="text-sm font-semibold text-slate-700">Lens Formula mastery</p>
          <LineChart series={[{ name: "Lens Formula", color: "#4f46e5", points }]} height={200} ariaLabel="Lens Formula mastery 31 to 47 to 68 percent" />
          <p className="mt-2 text-center text-sm font-semibold text-indigo-700">31% → 47% → 68%</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Progress tracking</p>
          <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">Is the student actually learning?</h2>
          <p className="mt-4 text-slate-600">Mastery over time, accuracy, difficulty progression, retention and misconception resolution — meaningful analytics instead of vanity metrics.</p>
        </div>
      </div>
    </section>
  );
}

export function CtaSection({ startHref }) {
  return (
    <section className="bg-indigo-600 py-16 text-center text-white">
      <h2 className="font-display text-3xl font-semibold sm:text-4xl">Build your learner model in one diagnostic</h2>
      <p className="mx-auto mt-3 max-w-xl text-indigo-100">Concept-level mastery, your first misconceptions and a personal plan — in about 20 minutes.</p>
      <div className="mt-7 flex justify-center gap-3">
        <ButtonLink href={startHref} variant="secondary" className="px-6 py-3 text-base">Start Diagnostic</ButtonLink>
        <ButtonLink href="/login" variant="ghost" className="px-6 py-3 text-base text-white hover:bg-indigo-500">Try the demo</ButtonLink>
      </div>
    </section>
  );
}

export function Footer() {
  return <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">Mentiq · AI that learns how you learn · Class 10 Physics</footer>;
}
