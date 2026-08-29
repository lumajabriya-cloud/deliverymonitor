import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { toast } from "sonner";
import { AppShell, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  clearAll,
  download,
  importCSVText,
  replaceDB,
  toCSV,
  useDB,
  type DB,
} from "@/lib/monitor-store";

export const Route = createFileRoute("/data")({
  head: () => ({
    meta: [
      { title: "Data, Backup & Import — Delivery Monitor" },
      {
        name: "description",
        content:
          "Export and import customer data as CSV or JSON backups and manage locally stored delivery monitoring records.",
      },
      { property: "og:title", content: "Data, Backup & Import — Delivery Monitor" },
      {
        property: "og:description",
        content: "CSV and JSON backup, restore and import for your delivery customer records.",
      },
    ],
  }),
  component: DataPage,
});

function DataPage() {
  const db = useDB();
  const jsonRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  const onJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as DB;
      if (!parsed || !Array.isArray(parsed.customers)) throw new Error("bad file");
      replaceDB(parsed);
      toast.success("Backup restored");
    } catch {
      toast.error("Invalid backup file");
    }
    e.target.value = "";
  };

  const onCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const n = importCSVText(await file.text());
      toast.success(`${n} CSV row(s) imported`);
    } catch {
      toast.error("Could not read CSV file");
    }
    e.target.value = "";
  };

  return (
    <AppShell title="Data / Import">
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Backup & Restore">
          <p className="text-sm text-muted-foreground">
            Your data is stored in this browser's local storage. Export regularly for backup.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="success"
              onClick={() =>
                download(
                  JSON.stringify(db, null, 2),
                  "delivery-monitor-backup.json",
                  "application/json",
                )
              }
            >
              Export Full Backup
            </Button>
            <Button variant="secondary" onClick={() => jsonRef.current?.click()}>
              Import Full Backup
            </Button>
            <input ref={jsonRef} type="file" accept=".json" hidden onChange={onJSON} />
          </div>
        </Panel>

        <Panel title="CSV / Excel-Compatible Data">
          <p className="text-sm text-muted-foreground">
            CSV files open directly in Excel. Import a CSV to add or update customers.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="success"
              onClick={() => download(toCSV(db), "customers.csv", "text/csv")}
            >
              Export Customers CSV
            </Button>
            <Button variant="secondary" onClick={() => csvRef.current?.click()}>
              Import Customers CSV
            </Button>
            <input ref={csvRef} type="file" accept=".csv,text/csv" hidden onChange={onCSV} />
          </div>
          <div className="mt-4 rounded-lg bg-accent p-3 text-sm text-accent-foreground">
            <b>CSV columns:</b> mobile,name,status,reason,notes,blockDate,lastOrder,staff
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Data Management">
          <p className="text-sm text-muted-foreground">
            {db.customers.length} customer(s) and {db.incidents.length} incident(s) stored.
          </p>
          <Button
            className="mt-4"
            variant="danger"
            onClick={() => {
              if (confirm("Delete all local data? This cannot be undone.")) {
                clearAll();
                toast.success("All local data deleted");
              }
            }}
          >
            Delete All Local Data
          </Button>
        </Panel>
      </div>
    </AppShell>
  );
}
