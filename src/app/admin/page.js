import { RoleSelect } from "@/components/admin/AdminControls";
import { Badge, Card, PageHeader, SectionTitle, Stat } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth";
import { shortDate } from "@/lib/format";
import { getAdminOverview, listUsers } from "@/services/admin";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await requireRole(["admin"]);
  const [overview, users] = await Promise.all([getAdminOverview(), listUsers()]);
  return (
    <>
      <PageHeader eyebrow="Administration" title="Platform overview" description="Syllabus, question bank, users and platform analytics." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Students" value={overview.users.student ?? 0} />
        <Stat label="Teachers" value={overview.users.teacher ?? 0} />
        <Stat label="Questions answered" value={overview.attempts} sub={`${overview.reasoningAnalyses} reasoning analyses`} tone="indigo" />
        <Stat label="Validated questions" value={`${overview.questions.validated} / ${overview.questions.total}`} tone="emerald" />
      </div>
      <Card className="mt-6 overflow-hidden p-0">
        <div className="p-5 pb-3"><SectionTitle>Users (latest 100)</SectionTitle></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{["Name", "Email", "Role", "Joined"].map((h) => <th key={h} scope="col" className="px-4 py-2.5 font-semibold">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{u.name} {u.id === session.id && <Badge tone="indigo">you</Badge>}</td>
                  <td className="px-4 py-2.5 text-slate-600">{u.email}</td>
                  <td className="px-4 py-2.5"><RoleSelect userId={u.id} role={u.role} disabled={u.id === session.id} /></td>
                  <td className="px-4 py-2.5 text-slate-600">{shortDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
