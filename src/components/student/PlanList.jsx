import Link from "next/link";
import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/format";

const KIND = {
  review: { icon: "↻", tone: "sky", label: "Review" }, practice: { icon: "✎", tone: "indigo", label: "Practice" }, misconception: { icon: "⚠", tone: "rose", label: "Fix misconception" },
  challenge: { icon: "★", tone: "amber", label: "Challenge" }, retention: { icon: "⏱", tone: "emerald", label: "Retention" }, diagnostic: { icon: "◎", tone: "indigo", label: "Diagnostic" },
};

export function PlanList({ plan, showReasons = true }) {
  return (
    <ol className="space-y-3">
      {plan.items.map((item, i) => {
        const kind = KIND[item.kind];
        return (
          <li key={item.id} className={cn("rounded-xl border p-4 transition", item.done ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white")}>
            <div className="flex items-start gap-3">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold", item.done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600")} aria-hidden>{item.done ? "✓" : i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("font-semibold text-slate-900", item.done && "line-through decoration-emerald-400")}>{item.title}</p>
                  <Badge tone={kind.tone}>{kind.label}</Badge>
                  <span className="text-xs text-slate-500">{item.minutes} min</span>
                </div>
                {showReasons && <p className="mt-1 text-sm text-slate-600"><span className="font-medium text-slate-700">Why:</span> {item.reason}</p>}
              </div>
              {!item.done && <Link href={item.href} className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">Start</Link>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
