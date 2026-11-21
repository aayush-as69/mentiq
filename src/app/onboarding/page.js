import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { OnboardingForm } from "@/components/student/OnboardingForm";
import { PageHeader } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth";
import { getStudentProfile } from "@/services/students";

export const metadata = { title: "Set up your profile" };

export default async function OnboardingPage() {
  const session = await requireRole(["student"]);
  const profile = await getStudentProfile(session.id);
  if (profile?.onboardedAt) redirect(profile.diagnosticCompletedAt ? "/dashboard" : "/diagnostic");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8"><Logo /></div>
      <PageHeader eyebrow="Step 1 of 2" title={`Welcome, ${session.name.split(" ")[0]}`} description="Tell Mentiq about your goals so your plan fits your life. You can change this later." />
      <main id="main"><OnboardingForm name={session.name} /></main>
    </div>
  );
}
