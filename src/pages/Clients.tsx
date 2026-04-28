import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Pencil, Phone, Plus, Trash2, X } from "lucide-react";
import { Client, actions, computeTotals, fmt, useStore } from "@/lib/store";

const empty = (): Client => ({ id: crypto.randomUUID(), name: "", email: "", phone: "", company: "" });
const inputBase = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";

const Clients = () => {
  const clients = useStore((s) => s.clients);
  const invoices = useStore((s) => s.invoices);
  const [editing, setEditing] = useState<Client | null>(null);

  const totalsFor = (cid: string) => {
    const list = invoices.filter((i) => i.clientId === cid);
    const total = list.reduce((s, i) => s + computeTotals(i).total, 0);
    return { count: list.length, total };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">{clients.length} clients</p>
        </div>
        <button onClick={() => setEditing(empty())} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Client
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((c) => {
          const t = totalsFor(c.id);
          return (
            <div key={c.id} className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-foreground text-sm font-bold text-primary-foreground">
                    {c.name.slice(0, 1).toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{c.name}</div>
                    {c.company && <div className="truncate text-xs text-muted-foreground">{c.company}</div>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => setEditing(c)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => { if (confirm(`Delete ${c.name}?`)) actions.deleteClient(c.id); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {c.email || "—"}</div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {c.phone || "—"}</div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs">
                <span className="text-muted-foreground">{t.count} invoices</span>
                <span className="font-semibold">{fmt(t.total)}</span>
              </div>
              {t.count > 0 && (
                <Link to="/invoices" className="mt-3 block text-center text-xs font-semibold text-primary hover:underline">View invoices →</Link>
              )}
            </div>
          );
        })}
        {clients.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            No clients yet. Add your first one.
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{clients.find((c) => c.id === editing.id) ? "Edit Client" : "Add Client"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1.5 hover:bg-secondary"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-5 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</label>
                <input className={inputBase} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</label>
                <input className={inputBase} value={editing.company || ""} onChange={(e) => setEditing({ ...editing, company: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                <input className={inputBase} value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</label>
                <input className={inputBase} value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary">Cancel</button>
              <button onClick={() => { actions.upsertClient(editing); setEditing(null); }} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
