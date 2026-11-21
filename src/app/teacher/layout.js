import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth";

const NAV = [{ href: "/teacher", label: "Class overview", exact: true }, { href: "/teacher/analytics", label: "Class analytics" }];

export default async function TeacherLayout({ children }) {
  const session = await requireRole(["teacher"]);
  return <AppShell session={session} nav={NAV} roleLabel="Teacher" home="/teacher">{children}</AppShell>;
}
