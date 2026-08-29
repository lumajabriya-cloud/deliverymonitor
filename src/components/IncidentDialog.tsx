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
import { saveIncident } from "@/lib/monitor-store";

export const INCIDENT_TYPES = [
  "COD Refusal",
  "Repeated Cancellation",
  "Abusive Behaviour",
  "Fraud / Suspicious Activity",
  "Incorrect Address",
  "Other",
];

export type IncidentDraft = { mobile?: string } | null;

export function IncidentDialog({
  draft,
  onOpenChange,
}: {
  draft: IncidentDraft;
  onOpenChange: (open: boolean) => void;
}) {
  const [mobile, setMobile] = useState("");
  const [type, setType] = useState(INCIDENT_TYPES[0]);
  const [details, setDetails] = useState("");
  const [staff, setStaff] = useState("");

  useEffect(() => {
    if (draft) {
      setMobile(draft.mobile ?? "");
      setType(INCIDENT_TYPES[0]);
      setDetails("");
      setStaff("");
    }
  }, [draft]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim()) return;
    saveIncident({ mobile: mobile.trim(), type, details: details.trim(), staff: staff.trim() });
    toast.success("Incident recorded");
    onOpenChange(false);
  };

  return (
    <Dialog open={!!draft} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Incident</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="iMobile">Customer Mobile *</Label>
            <Input
              id="iMobile"
              required
              placeholder="+965 5XXXXXXX"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Incident Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="iStaff">Staff</Label>
              <Input id="iStaff" value={staff} onChange={(e) => setStaff(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="iDetails">Details</Label>
            <Textarea
              id="iDetails"
              placeholder="Describe what happened"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Incident</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
