import { redirect } from "next/navigation";
import { AuthForm } from "@/components/marketing/AuthForm";
import { AuthLayout } from "@/components/marketing/AuthLayout";
import { getSession, homeFor } from "@/lib/auth";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(homeFor(session.role));
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue with your learner model.">
      <AuthForm mode="login" />
    </AuthLayout>
  );
}
