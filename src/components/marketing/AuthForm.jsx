"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Notice } from "@/components/ui/primitives";
import { api } from "@/lib/client";

const inputClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export function AuthForm({ mode }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const signup = mode === "signup";

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const { redirect } = await api(`/api/auth/${mode}`, { method: "POST", body: form });
      router.push(redirect);
      router.refresh();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {signup && (
        <label className="block text-sm font-medium text-slate-700">Your name
          <input name="name" autoComplete="name" required className={inputClass} placeholder="Aarav Mehta" />
        </label>
      )}
      <label className="block text-sm font-medium text-slate-700">Email
        <input name="email" type="email" autoComplete="email" required className={inputClass} placeholder="you@school.edu" />
      </label>
      <label className="block text-sm font-medium text-slate-700">Password
        <input name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} required minLength={signup ? 8 : 1} className={inputClass} placeholder={signup ? "At least 8 characters" : "Your password"} />
      </label>
      {error && <Notice tone="rose">{error}</Notice>}
      <Button type="submit" disabled={busy} className="w-full">{busy ? "One moment…" : signup ? "Create account" : "Sign in"}</Button>
      <p className="text-center text-sm text-slate-600">
        {signup ? "Already have an account?" : "New to Mentiq?"}{" "}
        <Link href={signup ? "/login" : "/signup"} className="font-semibold text-indigo-600 hover:underline">{signup ? "Sign in" : "Create an account"}</Link>
      </p>
    </form>
  );
}
