import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Panel } from "@/components/AppShell";
import { IncidentDialog, type IncidentDraft } from "@/components/IncidentDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteIncident, findCustomer, useDB } from "@/lib/monitor-store";

export const Route = createFileRoute("/incidents")({
  head: () => ({
    meta: [
      { title: "Incident Log — Delivery Monitor" },
      {
        name: "description",
        content:
          "Log and review delivery incidents such as COD refusals, cancellations and suspicious activity per customer.",
      },
      { property: "og:title", content: "Incident Log — Delivery Monitor" },
      {
        property: "og:description",
        content: "Record COD refusals, cancellations and other delivery incidents.",
      },
    ],
  }),
  component: IncidentsPage,
});

function IncidentsPage() {
  const db = useDB();
  const [draft, setDraft] = useState<IncidentDraft>(null);
  const rows = [...db.incidents].reverse();

  return (
    <AppShell title="Incident Log">
      <Panel title="All Incidents" actions={<Button onClick={() => setDraft({})}>+ Add Incident</Button>}>
        <div className="overflow-auto">
          <Table className="min-w-[850px]">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.date}</TableCell>
                    <TableCell>{i.mobile}</TableCell>
                    <TableCell>{findCustomer(db, i.mobile)?.name || "Unknown"}</TableCell>
                    <TableCell>{i.type}</TableCell>
                    <TableCell className="max-w-[300px]">{i.details || "—"}</TableCell>
                    <TableCell>{i.staff || "—"}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          deleteIncident(i.id);
                          toast.success("Incident deleted");
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No incidents recorded.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <IncidentDialog draft={draft} onOpenChange={(o) => !o && setDraft(null)} />
    </AppShell>
  );
}
