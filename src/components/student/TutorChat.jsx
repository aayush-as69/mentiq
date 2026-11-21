"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge, Button, Notice } from "@/components/ui/primitives";
import { api } from "@/lib/client";
import { cn } from "@/lib/format";

const STARTERS = ["What should I study today?", "Explain lenses.", "Why does current decrease when resistance increases?", "Explain the power of a lens"];

function Bubble({ message }) {
  const mine = message.role === "user";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[88%] rounded-2xl px-4 py-3", mine ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-800")}>
        {message.content.split("\n\n").map((para, i) => <p key={i} className={cn("whitespace-pre-line leading-relaxed", i > 0 && "mt-3")}>{para}</p>)}
        {!mine && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {message.meta?.suggestion && <Link href={message.meta.suggestion.href} className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">{message.meta.suggestion.label} →</Link>}
            {message.meta?.uncertain && <Badge tone="amber">Not certain — outside the syllabus</Badge>}
            <Badge tone={message.meta?.source === "ai" ? "indigo" : "slate"}>{message.meta?.source === "ai" ? "AI-polished · syllabus-grounded" : "Syllabus-grounded"}</Badge>
          </div>
        )}
      </div>
    </div>
  );
}

export function TutorChat({ initialMessages, prefill }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState(prefill ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const sent = useRef(false);

  const send = async (text) => {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setError("");
    setInput("");
    setMessages((m) => [...m, { id: `tmp-${Date.now()}`, role: "user", content: message, meta: {} }]);
    try {
      const { assistant } = await api("/api/tutor", { method: "POST", body: { message } });
      setMessages((m) => [...m, assistant]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (prefill && !sent.current) { sent.current = true; send(prefill); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, busy]);

  return (
    <div className="flex h-[70vh] min-h-[420px] flex-col rounded-2xl border border-slate-200 bg-slate-50">
      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="mx-auto max-w-md py-10 text-center">
            <h2 className="font-display text-2xl font-semibold">Ask me anything in the syllabus</h2>
            <p className="mt-2 text-sm text-slate-600">I adapt to your mastery and the mistakes I've seen — not a generic answer.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">{STARTERS.map((s) => <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm text-slate-700 hover:border-indigo-300">{s}</button>)}</div>
          </div>
        )}
        {messages.map((m) => <Bubble key={m.id} message={m} />)}
        {busy && <div className="flex"><div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500" role="status">Mentiq is checking your learner model…</div></div>}
        <div ref={endRef} />
      </div>
      {error && <div className="px-4 pb-2"><Notice tone="rose">{error}</Notice></div>}
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-slate-200 bg-white p-3">
        <label htmlFor="tutor-input" className="sr-only">Your question</label>
        <input id="tutor-input" value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder="Ask about a concept, or “what should I study today?”" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        <Button type="submit" disabled={busy || input.trim().length < 2}>Send</Button>
      </form>
    </div>
  );
}
