"use client";

import { useEffect, useState } from "react";

// A live optical diagram: parallel rays pass through a convex lens.
// Scattered rays = a misconception. Rays meeting at one point = mastery.
// The loop replays Lens Formula going from 31% to 68%.

const LENS_X = 300;
const AXIS_Y = 260;
const START_X = 16;
const FOCUS_X = 540;
const END_X = 632;
const START_M = 0.31;
const END_M = 0.68;
const PERIOD_MS = 10000;

const RAYS = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k, i) => ({
  y: AXIS_Y + k * 26,
  h: k * 26,
  // fixed per-ray scatter so the picture is the same on every load
  jitter: [0.8, -0.5, 0.95, -0.9, 0.3, 0.7, -0.75, 0.55, -0.85][i],
}));

const STOPS = ["#fb7185", "#fbbf24", "#34d399"];

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const c = (x, y) => Math.round(x + (y - x) * t);
  return `rgb(${c(r1, r2)} ${c(g1, g2)} ${c(b1, b2)})`;
}

function focusColor(t) {
  return t < 0.55 ? mix(STOPS[0], STOPS[1], t / 0.55) : mix(STOPS[1], STOPS[2], (t - 0.55) / 0.45);
}

const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

function masteryAt(phase) {
  if (phase < 0.12) return START_M;
  if (phase < 0.72) return START_M + (END_M - START_M) * ease((phase - 0.12) / 0.6);
  if (phase < 0.92) return END_M;
  return END_M + (START_M - END_M) * ease((phase - 0.92) / 0.08);
}

function stageFor(m) {
  if (m < 0.4) return { index: 0, name: "Diagnostic", label: "Needs work", tone: "text-rose-300 bg-rose-400/10 ring-rose-300/20" };
  if (m < 0.58) return { index: 1, name: "Targeted practice", label: "Improving", tone: "text-amber-200 bg-amber-300/10 ring-amber-200/20" };
  return { index: 2, name: "Consolidation", label: "On track", tone: "text-emerald-300 bg-emerald-400/10 ring-emerald-300/20" };
}

export function HeroVisual() {
  const [m, setM] = useState(START_M);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setM(END_M);
      return undefined;
    }
    let frame;
    const begin = performance.now();
    const tick = (now) => {
      const phase = ((now - begin) % PERIOD_MS) / PERIOD_MS;
      setM(Math.round(masteryAt(phase) * 400) / 400);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const t = (m - START_M) / (END_M - START_M); // 0 = confused, 1 = focused
  const spread = 1 - t;
  const color = focusColor(t);
  const stage = stageFor(m);
  const confused = t < 0.5;
  const percent = Math.round(m * 100);

  const paths = RAYS.map((r) => {
    const yF = AXIS_Y + spread * (r.h * 0.55 + r.jitter * 34);
    const slope = (yF - r.y) / (FOCUS_X - LENS_X);
    const yE = yF + slope * (END_X - FOCUS_X);
    return { in: `M${START_X} ${r.y}H${LENS_X}`, out: `M${LENS_X} ${r.y}L${FOCUS_X} ${yF.toFixed(1)}L${END_X} ${yE.toFixed(1)}` };
  });

  return (
    <div className="relative mx-auto w-full max-w-[640px]" role="img" aria-label="Light rays passing through a lens. As Lens Formula mastery rises from 31% to 68%, scattered rays converge to a single sharp focus.">
      <svg viewBox="0 0 640 520" className="block h-auto w-full" aria-hidden>
        <defs>
          <linearGradient id="hv-in" gradientUnits="userSpaceOnUse" x1={START_X} y1="0" x2={LENS_X} y2="0">
            <stop offset="0" stopColor="#bae6fd" stopOpacity="0" />
            <stop offset="1" stopColor="#e0f2fe" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="hv-lens" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a5b4fc" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="#6366f1" stopOpacity="0.22" />
            <stop offset="1" stopColor="#22d3ee" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="hv-halo">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id="hv-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="hv-glow-lg" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* optical axis and focal markers */}
        <line x1="0" y1={AXIS_Y} x2="640" y2={AXIS_Y} stroke="#fff" strokeOpacity="0.14" strokeDasharray="3 7" />
        {[LENS_X - (FOCUS_X - LENS_X), FOCUS_X].map((x) => (
          <g key={x}>
            <line x1={x} y1={AXIS_Y - 6} x2={x} y2={AXIS_Y + 6} stroke="#fff" strokeOpacity="0.4" />
            <text x={x} y={AXIS_Y + 24} textAnchor="middle" fontSize="12" fill="#fff" fillOpacity="0.45">F</text>
          </g>
        ))}

        {/* incoming light */}
        <g fill="none" strokeWidth="1.6" strokeLinecap="round">
          {paths.map((p, i) => <path key={i} d={p.in} stroke="url(#hv-in)" />)}
        </g>

        {/* glow behind refracted rays */}
        <g fill="none" stroke={color} strokeWidth="5" strokeOpacity="0.35" strokeLinecap="round" strokeLinejoin="round" filter="url(#hv-glow)">
          {paths.map((p, i) => <path key={i} d={p.out} />)}
        </g>

        {/* lens */}
        <path d="M300 104C348 190 348 330 300 416C252 330 252 190 300 104Z" fill="url(#hv-lens)" stroke="#c7d2fe" strokeOpacity="0.55" strokeWidth="1.2" />
        <path d="M300 126C330 195 330 325 300 394" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1" />

        {/* refracted rays */}
        <g fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {paths.map((p, i) => <path key={i} d={p.out} />)}
        </g>

        {/* focus */}
        <circle cx={FOCUS_X} cy={AXIS_Y} r={14 + t * 30} fill={color} fillOpacity={0.12 + t * 0.4} filter="url(#hv-glow-lg)" />
        <circle cx={FOCUS_X} cy={AXIS_Y} r={4 + t * 3} fill={color} />
        <circle cx={FOCUS_X} cy={AXIS_Y} r={20 + t * 10} fill="url(#hv-halo)" opacity={t * 0.55} />
      </svg>

      {/* concept readout */}
      <div className="mt-3 rounded-2xl sm:absolute sm:bottom-[1%] sm:left-0 sm:mt-0 sm:w-[58%] sm:min-w-[190px] sm:max-w-[270px] bg-white/[0.06] p-4 shadow-2xl shadow-black/40 ring-1 ring-white/12 backdrop-blur-md" aria-hidden>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-300">Lens Formula</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 transition-colors duration-500 ${stage.tone}`}>{stage.label}</span>
        </div>
        <div className="font-display mt-1 text-5xl font-semibold tabular-nums tracking-tight text-white">
          {percent}<span className="text-2xl text-slate-400">%</span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1 flex-1 rounded-full transition-colors duration-500" style={{ background: i <= stage.index ? color : "rgb(255 255 255 / 0.12)" }} />
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">{stage.name}</p>
      </div>

      {/* misconception status */}
      <div
        className={`mt-3 rounded-2xl p-4 sm:absolute sm:right-0 sm:top-[1%] sm:mt-0 sm:w-[56%] sm:min-w-[190px] sm:max-w-[260px] ring-1 backdrop-blur-md transition-colors duration-700 ${confused ? "bg-rose-500/10 ring-rose-300/25" : "bg-emerald-500/10 ring-emerald-300/25"}`}
        aria-hidden
      >
        <p className={`text-xs font-semibold transition-colors duration-700 ${confused ? "text-rose-300" : "text-emerald-300"}`}>
          {confused ? "Misconception detected · 89% confidence" : "Misconception resolved"}
        </p>
        <p className="mt-1 text-sm text-white">
          {confused ? "Confusing focal length with lens power." : "Focal length and lens power are now kept apart."}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {confused ? "Next: easy conceptual check, medium numerical, hard application" : "Next review: tomorrow"}
        </p>
      </div>
    </div>
  );
}
