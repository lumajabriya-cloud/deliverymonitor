import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveCustomer, today, type Customer, type Status } from "@/lib/monitor-store";

export type CustomerDraft = { customer?: Customer; mobile?: string } | null;

const blank = (mobile = ""): Omit<Customer, "id"> => ({
  mobile,
  name: "",
  status: "GOOD",
  staff: "",
  blockDate: today(),
  lastOrder: "",
  reason: "",
  notes: "",
});

export function CustomerDialog({
  draft,
  onOpenChange,
}: {
  draft: CustomerDraft;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState<Omit<Customer, "id">>(blank());

  useEffect(() => {
    if (draft) setForm(draft.customer ? { ...draft.customer } : blank(draft.mobile ?? ""));
  }, [draft]);

  const set = (k: keyof Omit<Customer, "id">, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mobile.trim()) return;
    const id = draft?.customer?.id;
    saveCustomer(id ? { ...form, mobile: form.mobile.trim(), id } : { ...form, mobile: form.mobile.trim() });
    toast.success("Customer saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={!!draft} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>{draft?.customer ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fMobile">Mobile Number *</Label>
              <Input
                id="fMobile"
                required
                placeholder="+965 5XXXXXXX"
                value={form.mobile}
                onChange={(e) => set("mobile", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fName">Customer Name</Label>
              <Input
                id="fName"
                placeholder="Optional"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as Status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOOD">GOOD STANDING</SelectItem>
                  <SelectItem value="REVIEW">REVIEW</SelectItem>
                  <SelectItem value="BLOCKED">BLOCKED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fStaff">Staff / Manager</Label>
              <Input
                id="fStaff"
                placeholder="Staff name"
                value={form.staff}
                onChange={(e) => set("staff", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fBlockDate">Block / Review Date</Label>
              <Input
                id="fBlockDate"
                type="date"
                value={form.blockDate}
                onChange={(e) => set("blockDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fLastOrder">Last Order Date</Label>
              <Input
                id="fLastOrder"
                type="date"
                value={form.lastOrder}
                onChange={(e) => set("lastOrder", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fReason">Reason</Label>
            <Input
              id="fReason"
              placeholder="e.g. repeated refused COD orders"
              value={form.reason}
              onChange={(e) => set("reason", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fNotes">Notes</Label>
            <Textarea
              id="fNotes"
              placeholder="Additional information"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Customer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
