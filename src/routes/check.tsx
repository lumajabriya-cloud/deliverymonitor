import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Panel } from "@/components/AppShell";
import { CustomerLookup } from "@/components/CustomerLookup";
import { CustomerDialog, type CustomerDraft } from "@/components/CustomerDialog";

export const Route = createFileRoute("/check")({
  head: () => ({
    meta: [
      { title: "Order Acceptance Check — Delivery Monitor" },
      {
        name: "description",
        content:
          "Check a customer's mobile number before accepting a delivery order and instantly see blocked or flagged records.",
      },
      { property: "og:title", content: "Order Acceptance Check — Delivery Monitor" },
      {
        property: "og:description",
        content: "Instant blocked-number lookup before accepting a delivery order.",
      },
    ],
  }),
  component: CheckPage,
});

function CheckPage() {
  const [draft, setDraft] = useState<CustomerDraft>(null);

  return (
    <AppShell title="Order Check" subtitle="Verify a number before accepting the order">
      <div className="mx-auto max-w-3xl">
        <Panel title="Order Acceptance Check">
          <div className="mb-4 rounded-lg bg-accent p-3 text-sm text-accent-foreground">
            Enter the customer's mobile number <b>before accepting a delivery order</b>. A blocked
            number is clearly flagged.
          </div>
          <CustomerLookup size="large" onEdit={setDraft} onAdd={(mobile) => setDraft({ mobile })} />
        </Panel>
      </div>
      <CustomerDialog draft={draft} onOpenChange={(o) => !o && setDraft(null)} />
    </AppShell>
  );
}
