import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Panel } from "@/components/AppShell";
import { CustomerLookup } from "@/components/CustomerLookup";
import { CustomerDialog, type CustomerDraft } from "@/components/CustomerDialog";
import { useDB } from "@/lib/monitor-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Delivery Customer Monitor" },
      {
        name: "description",
        content:
          "Track blocked, under-review and good-standing delivery customers, incidents and order checks in one dashboard.",
      },
      { property: "og:title", content: "Dashboard — Delivery Customer Monitor" },
      {
        property: "og:description",
        content: "Track blocked and flagged food delivery customers before accepting orders.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const db = useDB();
  const [draft, setDraft] = useState<CustomerDraft>(null);
  const count = (s: string) => db.customers.filter((c) => c.status === s).length;

  const cards = [
    { label: "Good Standing", value: count("GOOD"), tone: "text-success" },
    { label: "Blocked", value: count("BLOCKED"), tone: "text-danger" },
    { label: "Under Review", value: count("REVIEW"), tone: "text-warning" },
    { label: "Total Incidents", value: db.incidents.length, tone: "text-primary" },
  ];

  const recent = [...db.activity].slice(-8).reverse();

  return (
    <AppShell title="Dashboard">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5 shadow-panel">
            <div className="text-sm text-muted-foreground">{c.label}</div>
            <div className={`mt-2 text-3xl font-extrabold ${c.tone}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Quick Customer Check">
          <CustomerLookup
            onEdit={setDraft}
            onAdd={(mobile) => setDraft({ mobile })}
          />
        </Panel>
        <Panel title="Recent Activity">
          {recent.length ? (
            <ul>
              {recent.map((a, i) => (
                <li key={i} className="border-b border-border py-2 last:border-0">
                  <p className="text-sm font-bold">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.date}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No activity yet.</p>
          )}
        </Panel>
      </div>

      <CustomerDialog draft={draft} onOpenChange={(o) => !o && setDraft(null)} />
    </AppShell>
  );
}
