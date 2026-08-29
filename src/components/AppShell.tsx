import { Link } from "@tanstack/react-router";
import { BarChart3, Smartphone, Users, AlertTriangle, Database } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/check", label: "Order Check", icon: Smartphone },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/incidents", label: "Incidents", icon: AlertTriangle },
  { to: "/data", label: "Data / Import", icon: Database },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 w-[72px] shrink-0 border-r border-sidebar-border bg-sidebar px-2 py-5 text-sidebar-foreground md:w-[245px] md:px-3">
        <div className="px-2 pb-6 text-center text-lg font-extrabold tracking-tight md:text-left">
          <span className="hidden md:inline">DELIVERY </span>
          <span className="text-sidebar-primary">MONITOR</span>
        </div>
        <nav className="space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
              className="flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:justify-start"
              title={label}
            >
              <Icon className="size-4 shrink-0" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="ml-[72px] w-[calc(100%-72px)] max-w-[1600px] p-4 md:ml-[245px] md:w-[calc(100%-245px)] md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {subtitle ?? "Food delivery customer monitoring — data stays in this browser"}
          </p>
        </header>
        {children}
      </main>
    </div>
  );
}

export function Panel({
  title,
  actions,
  className,
  children,
}: {
  title?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border border-border bg-card p-5 shadow-panel ${className ?? ""}`}
    >
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-base font-bold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: "GOOD" | "BLOCKED" | "REVIEW" }) {
  const map = {
    GOOD: "bg-success-soft text-success",
    BLOCKED: "bg-danger-soft text-danger",
    REVIEW: "bg-warning-soft text-warning",
  } as const;
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-extrabold ${map[status]}`}>
      {status === "GOOD" ? "GOOD STANDING" : status}
    </span>
  );
}
