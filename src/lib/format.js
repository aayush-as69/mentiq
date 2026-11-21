export const DAY_MS = 86400000;
export const cn = (...classes) => classes.filter(Boolean).join(" ");
export const pct = (v) => `${Math.round((v ?? 0) * 100)}%`;
export const pctNum = (v) => Math.round((v ?? 0) * 100);
export const isoDay = (date) => new Date(date).toISOString().slice(0, 10);

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export function relativeDay(date, now = new Date()) {
  if (!date) return "—";
  const diff = Math.round((startOfDay(date) - startOfDay(now)) / DAY_MS);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return diff > 1 ? `In ${diff} days` : `${-diff} days ago`;
}

export const shortDate = (date) => new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export const STATUS = {
  not_started: { label: "Not started", dot: "bg-slate-300", text: "text-slate-600", bg: "bg-slate-100", bar: "bg-slate-300", ring: "#cbd5e1" },
  weak: { label: "Weak", dot: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50", bar: "bg-rose-500", ring: "#f43f5e" },
  learning: { label: "Learning", dot: "bg-sky-500", text: "text-sky-700", bg: "bg-sky-50", bar: "bg-sky-500", ring: "#0ea5e9" },
  mastered: { label: "Mastered", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", bar: "bg-emerald-500", ring: "#10b981" },
};

export const DIFFICULTY_LABELS = { 1: "Easy", 2: "Medium", 3: "Hard", 4: "Advanced" };

export const ERROR_TYPES = {
  none: { label: "Correct", tone: "emerald", hint: "" },
  misconception: { label: "Misconception", tone: "rose", hint: "An incorrect mental model" },
  knowledge_gap: { label: "Knowledge gap", tone: "amber", hint: "The concept isn't known yet" },
  calculation_error: { label: "Calculation error", tone: "sky", hint: "Understood the concept, slipped on the maths" },
  careless_error: { label: "Careless error", tone: "slate", hint: "Likely an isolated slip" },
};

export const TYPE_LABELS = {
  mcq: "Multiple choice", conceptual: "Conceptual", numerical: "Numerical", application: "Application",
  assertion_reasoning: "Assertion–reasoning", short_answer: "Short answer",
};

export const TREND = {
  improving: { label: "Improving", icon: "↗", text: "text-emerald-600" },
  steady: { label: "Steady", icon: "→", text: "text-slate-500" },
  declining: { label: "Declining", icon: "↘", text: "text-rose-600" },
  new: { label: "Too early to tell", icon: "·", text: "text-slate-400" },
};

export const RISK = {
  none: { label: "None", text: "text-emerald-600" },
  low: { label: "Low", text: "text-sky-600" },
  medium: { label: "Medium", text: "text-amber-600" },
  high: { label: "High", text: "text-rose-600" },
};
