"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Card } from "@/components/ui/primitives";
import { MasteryBar, StatusPill } from "@/components/ui/Mastery";
import { DIFFICULTY_LABELS, STATUS, cn, relativeDay } from "@/lib/format";

const FILTERS = [["all", "All"], ["mastered", "Mastered"], ["learning", "Learning"], ["weak", "Weak"], ["not_started", "Not started"]];
const MIS_TONE = { active: "rose", improving: "amber", resolved: "emerald" };

export function ConceptExplorer({ chapters, concepts, initial }) {
  const [selectedSlug, setSelectedSlug] = useState(initial);
  const [filter, setFilter] = useState("all");
  const bySlug = useMemo(() => Object.fromEntries(concepts.map((c) => [c.slug, c])), [concepts]);
  const selected = bySlug[selectedSlug] ?? concepts[0];
  const counts = useMemo(() => Object.fromEntries(FILTERS.map(([k]) => [k, k === "all" ? concepts.length : concepts.filter((c) => c.status === k).length])), [concepts]);

  const Chip = ({ slug }) => {
    const c = bySlug[slug];
    return (
      <button type="button" onClick={() => setSelectedSlug(slug)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:border-indigo-300">
        <span className={cn("h-2 w-2 rounded-full", STATUS[c.status].dot)} />{c.name}
      </button>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {FILTERS.map(([key, label]) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition", filter === key ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50")}>{label} · {counts[key]}</button>
          ))}
        </div>
        <Card className="p-3">
          {chapters.map((chapter) => {
            const list = concepts.filter((c) => c.chapterId === chapter.id && (filter === "all" || c.status === filter));
            if (!list.length) return null;
            return (
              <div key={chapter.id} className="mb-3 last:mb-0">
                <p className="px-2 py-1.5 font-display text-base font-semibold text-slate-900">{chapter.name}</p>
                <ul>
                  {[...new Set(list.map((c) => c.topic))].map((topic) => (
                    <li key={topic}>
                      <p className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{topic}</p>
                      <ul>
                        {list.filter((c) => c.topic === topic).map((c) => (
                          <li key={c.slug}>
                            <button type="button" onClick={() => setSelectedSlug(c.slug)} aria-current={selected.slug === c.slug} className={cn("flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition", selected.slug === c.slug ? "bg-indigo-50" : "hover:bg-slate-50")}>
                              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", STATUS[c.status].dot)} aria-hidden />
                              <span className="flex-1 text-sm font-medium text-slate-800">{c.name}</span>
                              <span className="text-xs tabular-nums text-slate-500">{c.attempts ? `${Math.round(c.mastery * 100)}%` : "—"}</span>
                              <span className="sr-only">{STATUS[c.status].label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {filter !== "all" && counts[filter] === 0 && <p className="p-4 text-sm text-slate-500">No concepts with this status yet.</p>}
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card className="space-y-5 lg:sticky lg:top-28" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{selected.chapterName} · {selected.topic}</p>
              <h2 className="font-display text-2xl font-semibold text-slate-900">{selected.name}</h2>
            </div>
            <div className="flex gap-2"><StatusPill status={selected.status} /><Badge>{DIFFICULTY_LABELS[selected.difficulty]} concept</Badge></div>
          </div>
          <MasteryBar value={selected.mastery} attempts={selected.attempts} label={`${selected.name} mastery`} />
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div><dt className="text-slate-500">Mastery</dt><dd className="font-semibold">{selected.attempts ? `${Math.round(selected.mastery * 100)}%` : "Not started"}</dd></div>
            <div><dt className="text-slate-500">Last practiced</dt><dd className="font-semibold">{selected.lastPracticedAt ? relativeDay(selected.lastPracticedAt) : "Never"}</dd></div>
            <div><dt className="text-slate-500">Next review</dt><dd className="font-semibold">{selected.nextReview ? relativeDay(selected.nextReview) : "—"}</dd></div>
          </dl>
          <p className="text-slate-700">{selected.summary}</p>
          <ul className="space-y-1.5 text-sm text-slate-700">{selected.keyIdeas.map((i) => <li key={i} className="flex gap-2"><span className="text-indigo-400" aria-hidden>•</span>{i}</li>)}</ul>
          {selected.formulas.length > 0 && <p className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800">{selected.formulas.join("   ·   ")}</p>}

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Concept graph</p>
            <div className="flex flex-wrap items-center gap-2">
              {selected.prerequisites.length ? selected.prerequisites.map((p) => <Chip key={p} slug={p} />) : <span className="text-sm text-slate-400">No prerequisites</span>}
              <span aria-hidden className="text-slate-400">→</span>
              <span className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white">{selected.name}</span>
              <span aria-hidden className="text-slate-400">→</span>
              {selected.dependents.length ? selected.dependents.map((d) => <Chip key={d} slug={d} />) : <span className="text-sm text-slate-400">Nothing builds on this</span>}
            </div>
            <p className="mt-2 text-xs text-slate-500">Left: what to understand first · Right: what this unlocks.</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Related misconceptions</p>
            {selected.misconceptions.length ? (
              <ul className="space-y-1.5">{selected.misconceptions.map((m) => <li key={m.code} className="flex flex-wrap items-center gap-2 text-sm text-slate-700">{m.name}{m.status ? <Badge tone={MIS_TONE[m.status]}>{m.status}</Badge> : <Badge>not seen in your answers</Badge>}</li>)}</ul>
            ) : <p className="text-sm text-slate-500">No common misconceptions catalogued.</p>}
          </div>

          <Link href={`/practice?concept=${selected.slug}`} className="inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Practise {selected.name}</Link>
        </Card>
      </div>
    </div>
  );
}
