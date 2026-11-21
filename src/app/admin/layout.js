import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth";

const NAV = [{ href: "/admin", label: "Overview", exact: true }, { href: "/admin/syllabus", label: "Syllabus" }, { href: "/admin/questions", label: "Question bank" }];

export default async function AdminLayout({ children }) {
  const session = await requireRole(["admin"]);
  return <AppShell session={session} nav={NAV} roleLabel="Admin" home="/admin">{children}</AppShell>;
}
