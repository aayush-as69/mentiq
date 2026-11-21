import { MasteryBar, StatusPill } from "@/components/ui/Mastery";

/** Chapter → topic → concept mastery bars (the "learning profile" tree). */
export function ConceptMasteryTree({ concepts, chapters, compact = false }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {chapters.map((chapter) => {
        const list = concepts.filter((c) => c.chapterId === chapter.id);
        const topics = [...new Set(list.map((c) => c.topic))];
        return (
          <section key={chapter.id} aria-labelledby={`ch-${chapter.id}`} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 id={`ch-${chapter.id}`} className="font-display text-lg font-semibold text-slate-900">{chapter.name}</h3>
            {topics.map((topic) => (
              <div key={topic} className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{topic}</p>
                <ul className="mt-2 space-y-3 border-l-2 border-slate-100 pl-4">
                  {list.filter((c) => c.topic === topic).map((c) => (
                    <li key={c.slug}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-800">{c.name}</span>
                        {!compact && <StatusPill status={c.status} />}
                      </div>
                      <MasteryBar value={c.mastery} attempts={c.attempts} label={`${c.name} mastery`} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
