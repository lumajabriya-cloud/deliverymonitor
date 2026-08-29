import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Panel, StatusBadge } from "@/components/AppShell";
import { CustomerDialog, type CustomerDraft } from "@/components/CustomerDialog";
import { IncidentDialog, type IncidentDraft } from "@/components/IncidentDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteCustomer, incidentCount, setStatus, useDB } from "@/lib/monitor-store";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customer Database — Delivery Monitor" },
      {
        name: "description",
        content:
          "Search, add and manage delivery customer records with block, review and good-standing statuses.",
      },
      { property: "og:title", content: "Customer Database — Delivery Monitor" },
      {
        property: "og:description",
        content: "Manage blocked and flagged delivery customer records.",
      },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const db = useDB();
  const [search, setSearch] = useState("");
  const [status, setStatusFilter] = useState("ALL");
  const [draft, setDraft] = useState<CustomerDraft>(null);
  const [incidentDraft, setIncidentDraft] = useState<IncidentDraft>(null);

  const q = search.toLowerCase();
  const rows = db.customers.filter(
    (c) =>
      (status === "ALL" || c.status === status) &&
      `${c.name} ${c.mobile} ${c.reason}`.toLowerCase().includes(q),
  );

  return (
    <AppShell title="Customer Database">
      <Panel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or mobile…"
              className="w-full sm:w-64"
            />
            <Select value={status} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="GOOD">GOOD</SelectItem>
                <SelectItem value="BLOCKED">BLOCKED</SelectItem>
                <SelectItem value="REVIEW">REVIEW</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setDraft({})}>+ Add Customer</Button>
        </div>

        <div className="overflow-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Incidents</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Reason / Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-bold">{c.name || "Unnamed"}</TableCell>
                    <TableCell>{c.mobile}</TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell>{incidentCount(db, c.mobile)}</TableCell>
                    <TableCell>{c.lastOrder || "—"}</TableCell>
                    <TableCell className="max-w-[220px] truncate">{c.reason || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setDraft({ customer: c })}>
                          Edit
                        </Button>
                        {c.status === "BLOCKED" ? (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => {
                              setStatus(c.id, "GOOD");
                              toast.success("Customer set to good standing");
                            }}
                          >
                            Unblock
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              setStatus(c.id, "BLOCKED");
                              toast.success("Customer blocked");
                            }}
                          >
                            Block
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setIncidentDraft({ mobile: c.mobile })}
                        >
                          + Incident
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            deleteCustomer(c.id);
                            toast.success("Customer deleted");
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <CustomerDialog draft={draft} onOpenChange={(o) => !o && setDraft(null)} />
      <IncidentDialog draft={incidentDraft} onOpenChange={(o) => !o && setIncidentDraft(null)} />
    </AppShell>
  );
}
