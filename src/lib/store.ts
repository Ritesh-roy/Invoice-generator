import { useEffect, useSyncExternalStore } from "react";

export type InvoiceItem = { id: string; name: string; qty: number; price: number };
export type InvoiceStatus = "paid" | "pending";
export type Invoice = {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  gst: number;
  discount: number;
  notes: string;
  status: InvoiceStatus;
  createdAt: number;
};
export type Client = {
  id: string; name: string; email: string; phone: string; company?: string; address?: string;
};
export type Settings = {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  logo: string; // data url
  theme: "light" | "dark";
};

type State = { invoices: Invoice[]; clients: Client[]; settings: Settings };

const KEY = "qrubis-invoice-store-v1";

const seed = (): State => {
  const c1 = { id: crypto.randomUUID(), name: "Acme Corporation", email: "billing@acme.com", phone: "+91 98765 43210", company: "Acme Corp" };
  const c2 = { id: crypto.randomUUID(), name: "Globex Ltd", email: "ap@globex.io", phone: "+91 90000 11122", company: "Globex" };
  const c3 = { id: crypto.randomUUID(), name: "Initech", email: "finance@initech.com", phone: "+91 99887 76655", company: "Initech" };
  const mk = (n: number, c: Client, status: InvoiceStatus, daysAgo: number, items: InvoiceItem[]): Invoice => {
    const d = new Date(); d.setDate(d.getDate() - daysAgo);
    const due = new Date(d); due.setDate(due.getDate() + 14);
    return {
      id: crypto.randomUUID(),
      number: `INV-${String(1000 + n)}`,
      clientId: c.id, clientName: c.name, clientEmail: c.email, clientPhone: c.phone,
      date: d.toISOString().slice(0, 10),
      dueDate: due.toISOString().slice(0, 10),
      items, gst: 18, discount: 0, notes: "Thank you for your business.",
      status, createdAt: d.getTime(),
    };
  };
  return {
    clients: [c1, c2, c3],
    invoices: [
      mk(1, c1, "paid", 22, [{ id: crypto.randomUUID(), name: "Website Design", qty: 1, price: 25000 }]),
      mk(2, c2, "paid", 14, [{ id: crypto.randomUUID(), name: "SEO Audit", qty: 1, price: 12000 }, { id: crypto.randomUUID(), name: "Content (10 pages)", qty: 10, price: 800 }]),
      mk(3, c3, "pending", 6, [{ id: crypto.randomUUID(), name: "Mobile App MVP", qty: 1, price: 85000 }]),
      mk(4, c1, "pending", 2, [{ id: crypto.randomUUID(), name: "Hosting (1 yr)", qty: 1, price: 4500 }]),
    ],
    settings: {
      companyName: "Qrubis E-commerce",
      email: "hello@qrubis.com",
      phone: "+91 80000 12345",
      address: "Bengaluru, India",
      gstNumber: "29ABCDE1234F1Z5",
      logo: "",
      theme: "light",
    },
  };
};

const load = (): State => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as State;
  } catch { return seed(); }
};

let state: State = load();
const listeners = new Set<() => void>();

const persist = () => {
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const getSnapshot = () => state;

export const useStore = <T,>(selector: (s: State) => T): T => {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return selector(snap);
};

export const actions = {
  upsertInvoice(inv: Invoice) {
    const idx = state.invoices.findIndex((i) => i.id === inv.id);
    state = { ...state, invoices: idx >= 0
      ? state.invoices.map((i) => i.id === inv.id ? inv : i)
      : [inv, ...state.invoices] };
    persist();
  },
  deleteInvoice(id: string) {
    state = { ...state, invoices: state.invoices.filter((i) => i.id !== id) };
    persist();
  },
  setInvoiceStatus(id: string, status: InvoiceStatus) {
    state = { ...state, invoices: state.invoices.map((i) => i.id === id ? { ...i, status } : i) };
    persist();
  },
  upsertClient(c: Client) {
    const idx = state.clients.findIndex((x) => x.id === c.id);
    state = { ...state, clients: idx >= 0
      ? state.clients.map((x) => x.id === c.id ? c : x)
      : [c, ...state.clients] };
    persist();
  },
  deleteClient(id: string) {
    state = { ...state, clients: state.clients.filter((c) => c.id !== id) };
    persist();
  },
  updateSettings(patch: Partial<Settings>) {
    state = { ...state, settings: { ...state.settings, ...patch } };
    persist();
  },
};

export const computeTotals = (inv: Pick<Invoice, "items" | "gst" | "discount">) => {
  const subtotal = inv.items.reduce((s, i) => s + (i.qty || 0) * (i.price || 0), 0);
  const gstAmount = (subtotal * (inv.gst || 0)) / 100;
  const total = Math.max(0, subtotal + gstAmount - (inv.discount || 0));
  return { subtotal, gstAmount, total };
};

export const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })
    .format(isFinite(n) ? n : 0);

export const useTheme = () => {
  const theme = useStore((s) => s.settings.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark"); else root.classList.remove("dark");
  }, [theme]);
  return theme;
};

export const newInvoiceNumber = () => {
  const max = state.invoices.reduce((m, i) => {
    const n = parseInt(i.number.replace(/\D/g, ""), 10);
    return isFinite(n) ? Math.max(m, n) : m;
  }, 1000);
  return `INV-${max + 1}`;
};
