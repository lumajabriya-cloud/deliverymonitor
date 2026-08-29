import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  findCustomer,
  incidentCount,
  setStatus,
  useDB,
  type Customer,
} from "@/lib/monitor-store";
import type { CustomerDraft } from "@/components/CustomerDialog";

export function CustomerLookup({
  size = "default",
  onEdit,
  onAdd,
}: {
  size?: "default" | "large";
  onEdit: (draft: CustomerDraft) => void;
  onAdd: (mobile: string) => void;
}) {
  const db = useDB();
  const [phone, setPhone] = useState("");
  const [query, setQuery] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(phone.trim());
  };

  const customer: Customer | undefined = query ? findCustomer(db, query) : undefined;

  return (
    <div>
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter mobile number"
          className={size === "large" ? "h-11 text-base" : ""}
          aria-label="Customer mobile number"
        />
        <Button type="submit" className={size === "large" ? "h-11 px-6" : ""}>
          Check Customer
        </Button>
      </form>

      {query !== null && (
        <div className="mt-4">
          {query === "" ? (
            <ResultCard tone="review">
              <p className="text-base font-extrabold">ENTER A MOBILE NUMBER</p>
            </ResultCard>
          ) : !customer ? (
            <ResultCard tone="review">
              <h3 className="text-xl font-bold">⚠️ NOT REGISTERED</h3>
              <p className="mt-1 text-sm font-bold">No customer record found.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Do not treat an unknown number as blocked. Verify the order details or add the
                customer record.
              </p>
              <Button className="mt-4" onClick={() => onAdd(query)}>
                + Add Customer
              </Button>
            </ResultCard>
          ) : (
            <ResultCard
              tone={
                customer.status === "BLOCKED"
                  ? "blocked"
                  : customer.status === "REVIEW"
                    ? "review"
                    : "good"
              }
            >
              <h3 className="text-xl font-bold">
                {customer.status === "BLOCKED"
                  ? "🚫 DO NOT ACCEPT ORDER"
                  : customer.status === "REVIEW"
                    ? "⚠️ REVIEW CUSTOMER"
                    : "✅ GOOD STANDING"}
              </h3>
              <p className="mt-1 text-sm font-extrabold">
                {customer.name || "Customer"} · {customer.mobile}
              </p>
              <p className="mt-1 text-sm">
                {customer.status === "BLOCKED"
                  ? "DECLINE ORDER according to restaurant policy."
                  : customer.status === "REVIEW"
                    ? "Manager review recommended before accepting."
                    : "Customer is cleared to order."}
              </p>
              {customer.reason && (
                <p className="mt-1 text-sm">
                  <b>Reason:</b> {customer.reason}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Incidents: {incidentCount(db, customer.mobile)} · Last order:{" "}
                {customer.lastOrder || "—"}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={() => onEdit({ customer })}>
                  Edit Record
                </Button>
                {customer.status === "BLOCKED" ? (
                  <Button
                    variant="success"
                    onClick={() => {
                      setStatus(customer.id, "GOOD");
                      toast.success("Customer set to good standing");
                    }}
                  >
                    Unblock / Good Standing
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    onClick={() => {
                      setStatus(customer.id, "BLOCKED");
                      toast.success("Customer blocked");
                    }}
                  >
                    Block Customer
                  </Button>
                )}
              </div>
            </ResultCard>
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({
  tone,
  children,
}: {
  tone: "good" | "blocked" | "review";
  children: React.ReactNode;
}) {
  const map = {
    good: "bg-success-soft border-success-border",
    blocked: "bg-danger-soft border-danger-border",
    review: "bg-warning-soft border-warning-border",
  } as const;
  return (
    <div className={`rounded-xl border-2 p-6 text-center ${map[tone]}`}>{children}</div>
  );
}
