import { cn, shortDate } from "@/lib/format";

/** Dependency-free SVG line chart. series: [{ name, color, points: [{ label, value }] }], values 0..max. */
export function LineChart({ series, height = 200, max = 1, percent = true, ariaLabel }) {
  const W = 640;
  const pad = { l: 36, r: 12, t: 10, b: 26 };
  const lead = series.find((s) => s.points.length) ?? series[0];
  if (!lead || lead.points.length === 0) return null;
  const x = (i, n) => pad.l + (n <= 1 ? (W - pad.l - pad.r) / 2 : (i / (n - 1)) * (W - pad.l - pad.r));
  const y = (v) => pad.t + (1 - Math.min(v, max) / max) * (height - pad.t - pad.b);
  const ticks = percent ? [0, 0.25, 0.5, 0.75, 1] : [0, max / 2, max];
  const labels = [0, Math.floor((lead.points.length - 1) / 2), lead.points.length - 1].filter((v, i, a) => a.indexOf(v) === i);
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="h-auto w-full" role="img" aria-label={ariaLabel ?? "Chart"}>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={pad.l} x2={W - pad.r} y1={y(tick * (percent ? max : 1))} y2={y(tick * (percent ? max : 1))} stroke="#e2e8f0" strokeDasharray="3 4" />
          <text x={pad.l - 6} y={y(tick * (percent ? max : 1)) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{percent ? `${Math.round(tick * 100)}` : tick.toFixed(1)}</text>
        </g>
      ))}
      {series.map((s) => {
        const d = s.points.map((p, i) => `${i ? "L" : "M"}${x(i, s.points.length).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
        return (
          <g key={s.name}>
            <path d={d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {s.points.length <= 40 && s.points.map((p, i) => <circle key={i} cx={x(i, s.points.length)} cy={y(p.value)} r="3" fill="#fff" stroke={s.color} strokeWidth="2" />)}
          </g>
        );
      })}
      {labels.map((i) => (
        <text key={i} x={x(i, lead.points.length)} y={height - 6} textAnchor={i === 0 ? "start" : i === lead.points.length - 1 ? "end" : "middle"} fontSize="10" fill="#94a3b8">
          {/^\d{4}-/.test(lead.points[i].label) ? shortDate(lead.points[i].label) : lead.points[i].label}
        </text>
      ))}
    </svg>
  );
}

export function ChartLegend({ items }) {
  return (
    <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
      {items.map((i) => <span key={i.name} className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: i.color }} />{i.name}</span>)}
    </div>
  );
}

const heat = (v) => (v === null ? "bg-slate-100 text-slate-400" : v < 0.5 ? "bg-rose-500 text-white" : v < 0.65 ? "bg-amber-400 text-amber-950" : v < 0.8 ? "bg-sky-400 text-sky-950" : "bg-emerald-500 text-white");

/** Row-per-concept heatmap: colour encodes class mastery. rows: [{ label, sub, value }] */
export function Heatmap({ rows }) {
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-center gap-3 sm:grid-cols-[minmax(0,14rem)_1fr]">
          <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{r.label}</p>{r.sub && <p className="truncate text-xs text-slate-500">{r.sub}</p>}</div>
          <div className="flex items-center gap-2">
            <div className="h-7 flex-1 overflow-hidden rounded-lg bg-slate-100">
              <div className={cn("flex h-full items-center justify-end rounded-lg px-2 text-xs font-bold tabular-nums transition-[width] duration-700", heat(r.value))} style={{ width: `${r.value === null ? 100 : Math.max(10, Math.round(r.value * 100))}%` }}>
                {r.value === null ? "no data" : `${Math.round(r.value * 100)}%`}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MiniBars({ data, valueKey, labelKey = "date", color = "bg-indigo-500", unit = "" }) {
  const top = Math.max(1, ...data.map((d) => d[valueKey]));
  return (
    <div className="flex h-28 items-end gap-1.5" role="img" aria-label="Daily activity">
      {data.map((d) => (
        <div key={d[labelKey]} className="group flex flex-1 flex-col items-center justify-end gap-1" title={`${shortDate(d[labelKey])}: ${d[valueKey]}${unit}`}>
          <div className={cn("w-full rounded-t-md", color)} style={{ height: `${Math.max(6, (d[valueKey] / top) * 100)}%` }} />
        </div>
      ))}
    </div>
  );
}
