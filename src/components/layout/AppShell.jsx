import { Logo } from "@/components/layout/Logo";
import { NavLinks } from "@/components/layout/NavLinks";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { Badge } from "@/components/ui/primitives";

export function AppShell({ session, nav, notifications, roleLabel, home, children }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2.5 sm:px-6">
          <Logo href={home} />
          {roleLabel && <Badge tone="indigo" className="hidden sm:inline-flex">{roleLabel}</Badge>}
          <div className="order-last w-full sm:order-none sm:w-auto sm:flex-1"><NavLinks items={nav} /></div>
          <div className="ml-auto flex items-center gap-2">
            {notifications && <NotificationBell items={notifications} />}
            <span className="hidden text-sm font-medium text-slate-700 md:inline">{session.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
