import { redirect } from "next/navigation";
import { AuthForm } from "@/components/marketing/AuthForm";
import { AuthLayout } from "@/components/marketing/AuthLayout";
import { getSession, homeFor } from "@/lib/auth";

export const metadata = { title: "Create your account" };

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect(homeFor(session.role));
  return (
    <AuthLayout title="Create your account" subtitle="Takes a minute. Your diagnostic builds your first learner model.">
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}
