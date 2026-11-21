"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/client";

export function LogoutButton() {
  const router = useRouter();
  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/");
    router.refresh();
  };
  return <button type="button" onClick={logout} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Sign out</button>;
}
