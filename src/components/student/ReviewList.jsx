import Link from "next/link";
import { Badge } from "@/components/ui/primitives";
import { relativeDay } from "@/lib/format";
import { reviewReason } from "@/engine/spaced";

export function ReviewList({ concepts, now, showReason = false, empty }) {
  if (!concepts.length) return <p className="text-sm text-slate-500">{empty ?? "No reviews scheduled yet."}</p>;
  return (
    <ul className="divide-y divide-slate-100">
      {concepts.map((c) => {
        const due = new Date(c.schedule.dueAt);
        const overdue = due <= now;
        return (
          <li key={c.slug} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="font-medium text-slate-900">{c.name}</p>
              <p className="text-xs text-slate-500">Every ~{Math.round(c.schedule.intervalDays)} day{Math.round(c.schedule.intervalDays) === 1 ? "" : "s"} · mastery {Math.round(c.mastery * 100)}%</p>
              {showReason && <p className="mt-1 text-sm text-slate-600"><span className="font-medium text-slate-700">Why review {overdue ? "today" : "then"}?</span> {reviewReason({ concept: c, schedule: c.schedule, mastery: c.mastery, now })}</p>}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <Badge tone={overdue ? "rose" : "slate"}>{overdue ? "Due" : relativeDay(due, now)}</Badge>
              {overdue && <Link href={`/practice?concept=${c.slug}`} className="text-sm font-semibold text-indigo-600 hover:underline">Review now</Link>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
