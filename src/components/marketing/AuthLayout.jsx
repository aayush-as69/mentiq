import { Logo } from "@/components/layout/Logo";
import { DemoButtons } from "@/components/marketing/DemoButtons";

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <Logo light />
        <div className="relative">
          <p className="font-display text-4xl font-semibold leading-tight">AI that learns how you learn.</p>
          <p className="mt-4 max-w-md text-slate-300">Mentiq builds a living model of what you know, what you misunderstand and what to practise next — and updates it after every answer.</p>
        </div>
        <p className="relative text-sm text-slate-400">Class 10 Physics · Adaptive exam preparation</p>
      </div>
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden"><Logo /></div>
          <div>
            <h1 className="font-display text-3xl font-semibold text-slate-900">{title}</h1>
            <p className="mt-1 text-slate-600">{subtitle}</p>
          </div>
          {children}
          <div className="border-t border-slate-200 pt-6"><DemoButtons /></div>
        </div>
      </div>
    </div>
  );
}
