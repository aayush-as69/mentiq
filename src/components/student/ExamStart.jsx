"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Notice } from "@/components/ui/primitives";
import { api } from "@/lib/client";

export function ExamStart({ resume }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const start = async () => {
    setBusy(true);
    setError("");
    try {
      const { attemptId } = await api("/api/exam/start", { method: "POST" });
      router.push(`/exam/${attemptId}`);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };
  return (
    <div>
      <Button onClick={start} disabled={busy} className="px-6 py-3 text-base">{busy ? "Preparing your exam…" : resume ? "Resume exam" : "Start timed exam"}</Button>
      {error && <div className="mt-3"><Notice tone="rose">{error}</Notice></div>}
    </div>
  );
}
