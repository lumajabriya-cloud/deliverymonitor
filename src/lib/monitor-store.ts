import { useSyncExternalStore } from "react";

export type Status = "GOOD" | "BLOCKED" | "REVIEW";

export type Customer = {
  id: string;
  mobile: string;
  name: string;
  status: Status;
  staff: string;
  blockDate: string;
  lastOrder: string;
  reason: string;
  notes: string;
};

export type Incident = {
  id: string;
  date: string;
  mobile: string;
  type: string;
  details: string;
  staff: string;
};

export type Activity = { date: string; text: string };

export type DB = {
  customers: Customer[];
  incidents: Incident[];
  activity: Activity[];
};

const KEY = "delivery_monitor_v1";
const EMPTY: DB = { customers: [], incidents: [], activity: [] };

let db: DB = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): DB {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<DB>;
    return {
      customers: parsed.customers ?? [],
      incidents: parsed.incidents ?? [],
      activity: parsed.activity ?? [],
    };
  } catch {
    return EMPTY;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(db));
  }
  emit();
}

function subscribe(cb: () => void) {
  if (!loaded) {
    loaded = true;
    db = load();
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): DB {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    db = load();
  }
  return db;
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export const normalize = (p: string) => (p || "").replace(/[^\d+]/g, "");
export const today = () => new Date().toISOString().slice(0, 10);
export const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export function findCustomer(data: DB, phone: string) {
  const n = normalize(phone);
  if (!n) return undefined;
  return data.customers.find((c) => normalize(c.mobile) === n);
}

export function incidentCount(data: DB, mobile: string) {
  const n = normalize(mobile);
  return data.incidents.filter((i) => normalize(i.mobile) === n).length;
}

function logActivity(text: string) {
  db.activity = [...db.activity, { date: new Date().toLocaleString(), text }].slice(-200);
}

export function saveCustomer(input: Omit<Customer, "id"> & { id?: string }) {
  const record: Customer = { ...input, id: input.id || uid() };
  if (input.id) {
    db.customers = db.customers.map((c) => (c.id === input.id ? record : c));
  } else {
    const existing = findCustomer(db, record.mobile);
    if (existing) {
      db.customers = db.customers.map((c) =>
        c.id === existing.id ? { ...record, id: existing.id } : c,
      );
    } else {
      db.customers = [...db.customers, record];
    }
  }
  logActivity(`Customer ${record.mobile} saved as ${record.status}`);
  persist();
  return record;
}

export function deleteCustomer(id: string) {
  const c = db.customers.find((x) => x.id === id);
  db.customers = db.customers.filter((x) => x.id !== id);
  if (c) logActivity(`Customer ${c.mobile} deleted`);
  persist();
}

export function setStatus(id: string, status: Status) {
  db.customers = db.customers.map((c) =>
    c.id === id
      ? {
          ...c,
          status,
          blockDate: status === "BLOCKED" ? today() : c.blockDate,
          reason: status === "GOOD" ? "" : c.reason,
        }
      : c,
  );
  const c = db.customers.find((x) => x.id === id);
  if (c) logActivity(`${c.mobile} changed to ${status}`);
  persist();
}

export function saveIncident(input: Omit<Incident, "id" | "date"> & { date?: string }) {
  const record: Incident = { ...input, id: uid(), date: input.date || today() };
  db.incidents = [...db.incidents, record];
  logActivity(`Incident recorded for ${record.mobile}`);
  persist();
  return record;
}

export function deleteIncident(id: string) {
  db.incidents = db.incidents.filter((i) => i.id !== id);
  persist();
}

export function replaceDB(next: DB) {
  db = {
    customers: next.customers ?? [],
    incidents: next.incidents ?? [],
    activity: next.activity ?? [],
  };
  persist();
}

export function clearAll() {
  db = { customers: [], incidents: [], activity: [] };
  persist();
}

export const CSV_HEADERS = [
  "mobile",
  "name",
  "status",
  "reason",
  "notes",
  "blockDate",
  "lastOrder",
  "staff",
] as const;

function csvCell(v: unknown) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(data: DB) {
  return [
    CSV_HEADERS.join(","),
    ...data.customers.map((c) =>
      CSV_HEADERS.map((h) => csvCell(c[h as keyof Customer])).join(","),
    ),
  ].join("\n");
}

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const nx = text[i + 1];
    if (ch === '"' && q && nx === '"') {
      cell += '"';
      i++;
    } else if (ch === '"') {
      q = !q;
    } else if (ch === "," && !q) {
      row.push(cell);
      cell = "";
    } else if ((ch === "\n" || ch === "\r") && !q) {
      if (ch === "\r" && nx === "\n") i++;
      row.push(cell);
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export function importCSVText(text: string) {
  const rows = parseCSV(text);
  const head = (rows.shift() || []).map((x) => x.trim());
  let count = 0;
  rows.forEach((row) => {
    const o: Record<string, string> = {};
    head.forEach((h, i) => (o[h] = (row[i] || "").trim()));
    const mobile = o["mobile"] || "";
    if (!mobile) return;
    const existing = findCustomer(db, mobile);
    const rawStatus = o["status"] as Status;
    const status = (["GOOD", "BLOCKED", "REVIEW"] as const).includes(rawStatus)
      ? rawStatus
      : "GOOD";
    if (existing) {
      db.customers = db.customers.map((c) =>
        c.id === existing.id ? { ...c, ...o, mobile, status } : c,
      );
    } else {
      db.customers = [
        ...db.customers,
        {
          id: uid(),
          mobile,
          name: o["name"] || "",
          status,
          reason: o["reason"] || "",
          notes: o["notes"] || "",
          blockDate: o["blockDate"] || "",
          lastOrder: o["lastOrder"] || "",
          staff: o["staff"] || "",
        },
      ];
    }
    count++;
  });
  logActivity(`${count} customer row(s) imported from CSV`);
  persist();
  return count;
}

export function download(data: string, name: string, type: string) {
  const blob = new Blob([data], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
