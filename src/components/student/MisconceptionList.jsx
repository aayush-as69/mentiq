import Link from "next/link";
import { Badge } from "@/components/ui/primitives";
import { pct } from "@/lib/format";

const STATUS = { active: ["rose", "Active"], improving: ["amber", "Improving"], resolved: ["emerald", "Resolved"] };

export function MisconceptionList({ items, empty = "No misconceptions detected yet. Explaining your reasoning in practice helps Mentiq find them." }) {
  if (!items.length) return <p className="text-sm text-slate-500">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((m) => (
        <li key={m.code} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900">{m.name}</p>
            <Badge tone={STATUS[m.status][0]}>{STATUS[m.status][1]}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">{m.conceptName} · seen {m.occurrences}× · last confidence {pct(m.lastConfidence)}</p>
          {m.status !== "resolved" && (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-slate-500">{m.correctAfter}/3 correct answers on this concept to resolve</span>
              <Link href={`/practice?concept=${m.conceptSlug}&fix=${m.code}`} className="font-semibold text-indigo-600 hover:underline">Fix it →</Link>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
