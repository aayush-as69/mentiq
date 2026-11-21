import Link from "next/link";
import { cn } from "@/lib/format";

export function Card({ className, children, as: Tag = "section", ...rest }) {
  return (
    <Tag className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", className)} {...rest}>
      {children}
    </Tag>
  );
}

const TONES = {
  slate: "bg-slate-100 text-slate-700", emerald: "bg-emerald-50 text-emerald-700", rose: "bg-rose-50 text-rose-700",
  amber: "bg-amber-50 text-amber-800", sky: "bg-sky-50 text-sky-700", indigo: "bg-indigo-50 text-indigo-700",
};

export function Badge({ tone = "slate", children, className }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", TONES[tone], className)}>{children}</span>;
}

const BUTTON_BASE = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
const VARIANTS = {
  primary: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700",
  secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
  dark: "bg-slate-900 text-white hover:bg-slate-800",
};

export function Button({ variant = "primary", className, ...props }) {
  return <button className={cn(BUTTON_BASE, VARIANTS[variant], className)} {...props} />;
}

export function ButtonLink({ href, variant = "primary", className, children, ...props }) {
  return (
    <Link href={href} className={cn(BUTTON_BASE, VARIANTS[variant], className)} {...props}>
      {children}
    </Link>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">{eyebrow}</p>}
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ children, action, hint }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">{children}</h2>
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, sub, tone = "slate" }) {
  const color = { slate: "text-slate-900", emerald: "text-emerald-600", rose: "text-rose-600", indigo: "text-indigo-600", amber: "text-amber-600" }[tone];
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={cn("font-display mt-1 text-3xl font-semibold tabular-nums", color)}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </Card>
  );
}

export function EmptyState({ title, body, action, icon = "◌" }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
      <div aria-hidden className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-xl text-indigo-500">{icon}</div>
      <h3 className="font-display text-xl font-semibold text-slate-900">{title}</h3>
      {body && <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{body}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", body, onRetry }) {
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
      <h2 className="font-display text-xl font-semibold text-rose-900">{title}</h2>
      <p className="mt-2 text-sm text-rose-800">{body ?? "Try again in a moment. If the problem continues, refresh the page or sign in again."}</p>
      {onRetry && <Button variant="danger" className="mt-5" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div aria-hidden className={cn("animate-pulse rounded-xl bg-slate-200/70", className)} />;
}

export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="space-y-6">
      <div className="space-y-3"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-80 max-w-full" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      <div className="grid gap-4 lg:grid-cols-3"><Skeleton className="h-72 lg:col-span-2" /><Skeleton className="h-72" /></div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function Notice({ tone = "indigo", title, children }) {
  const styles = { indigo: "border-indigo-200 bg-indigo-50 text-indigo-900", amber: "border-amber-200 bg-amber-50 text-amber-900", rose: "border-rose-200 bg-rose-50 text-rose-900", emerald: "border-emerald-200 bg-emerald-50 text-emerald-900" };
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", styles[tone])}>
      {title && <p className="font-semibold">{title}</p>}
      <div className={title ? "mt-0.5" : ""}>{children}</div>
    </div>
  );
}
