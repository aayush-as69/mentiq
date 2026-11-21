import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth";
import { getNotifications } from "@/services/notifications";
import { getStudentProfile } from "@/services/students";

const NAV = [
  { href: "/dashboard", label: "Dashboard" }, { href: "/practice", label: "Practice" }, { href: "/learner-model", label: "Learner model" },
  { href: "/concepts", label: "Concepts" }, { href: "/plan", label: "Plan" }, { href: "/reviews", label: "Reviews" },
  { href: "/tutor", label: "Tutor" }, { href: "/exam", label: "Exam" }, { href: "/progress", label: "Progress" },
];

export default async function StudentLayout({ children }) {
  const session = await requireRole(["student"]);
  const profile = await getStudentProfile(session.id);
  if (!profile?.onboardedAt) redirect("/onboarding");
  const notifications = await getNotifications(session.id);
  return <AppShell session={session} nav={NAV} notifications={notifications} roleLabel="Student" home="/dashboard">{children}</AppShell>;
}
