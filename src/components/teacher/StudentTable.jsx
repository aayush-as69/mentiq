import Link from "next/link";
import { Badge, Card } from "@/components/ui/primitives";
import { MasteryBar } from "@/components/ui/Mastery";
import { relativeDay } from "@/lib/format";

export function StudentTable({ students, attentionIds }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>{["Student", "Overall mastery", "Questions", "Last active", ""].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-2.5"><Link href={`/teacher/students/${s.id}`} className="font-medium text-slate-900 hover:text-indigo-600">{s.name}</Link></td>
                <td className="w-56 px-4 py-2.5"><MasteryBar value={s.overall} attempts={s.totalAttempts} label={`${s.name} mastery`} /></td>
                <td className="px-4 py-2.5 tabular-nums text-slate-600">{s.totalAttempts}</td>
                <td className="px-4 py-2.5 text-slate-600">{s.lastActiveAt ? relativeDay(s.lastActiveAt) : "—"}</td>
                <td className="px-4 py-2.5 text-right">{attentionIds.has(s.id) && <Badge tone="rose">Needs attention</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
