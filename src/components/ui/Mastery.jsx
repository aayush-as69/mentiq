import { STATUS, TREND, cn, pctNum } from "@/lib/format";
import { statusFor } from "@/engine/mastery";

export function MasteryBar({ value, attempts = 1, label, showValue = true, className, height = "h-2.5" }) {
  const status = STATUS[statusFor(value, attempts)];
  const percent = attempts ? pctNum(value) : 0;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div role="progressbar" aria-label={label ?? "Mastery"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className={cn("w-full overflow-hidden rounded-full bg-slate-100", height)}>
        <div className={cn("h-full rounded-full transition-[width] duration-700", status.bar)} style={{ width: `${percent}%` }} />
      </div>
      {showValue && <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700">{attempts ? `${percent}%` : "—"}</span>}
    </div>
  );
}

export function MasteryRing({ value, size = 132, stroke = 12, label = "Overall mastery" }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = STATUS[statusFor(value, 1)].ring;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${pctNum(value)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value)} className="transition-[stroke-dashoffset] duration-1000" />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-3xl font-semibold tabular-nums text-slate-900">{pctNum(value)}%</div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">mastery</div>
      </div>
    </div>
  );
}

export function StatusPill({ status }) {
  const s = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", s.bg, s.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function TrendTag({ trend }) {
  const t = TREND[trend] ?? TREND.new;
  return <span className={cn("text-sm font-semibold", t.text)}><span aria-hidden>{t.icon}</span> {t.label}</span>;
}
