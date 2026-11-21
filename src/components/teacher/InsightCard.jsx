import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/format";

const STYLE = { high: "border-rose-200 bg-rose-50", medium: "border-amber-200 bg-amber-50", low: "border-emerald-200 bg-emerald-50" };
const LABEL = { intervention: "Intervention", misconception: "Misconception", strength: "Strength" };

export function InsightCard({ insight }) {
  return (
    <li className={cn("rounded-xl border p-4", STYLE[insight.severity])}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={insight.kind === "strength" ? "emerald" : insight.kind === "misconception" ? "rose" : "amber"}>{LABEL[insight.kind]}</Badge>
        <span className="text-xs text-slate-500">{insight.studentCount} students</span>
      </div>
      <p className="mt-2 font-semibold text-slate-900">{insight.title}</p>
      <p className="mt-1 text-sm text-slate-700">{insight.body}</p>
    </li>
  );
}
