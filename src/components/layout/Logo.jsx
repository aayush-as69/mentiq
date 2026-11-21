import Link from "next/link";

export function Logo({ href = "/", light = false }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2" aria-label="Mentiq home">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#4f46e5" />
        <path d="M8 22V10l8 8 8-8v12" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="9" r="2.2" fill="#fbbf24" />
      </svg>
      <span className={`font-display text-xl font-semibold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>Mentiq</span>
    </Link>
  );
}
