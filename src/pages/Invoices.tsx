import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { actions, computeTotals, fmt, useStore } from "@/lib/store";
import StatusBadge from "@/components/StatusBadge";

type Filter = "all" | "paid" | "pending";

const Invoices = () => {
  const invoices = useStore((s) => s.invoices);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return invoices
      .filter((i) => filter === "all" ? true : i.status === filter)
      .filter((i) => {
        if (!q) return true;
        const t = q.toLowerCase();
        return i.number.toLowerCase().includes(t) || i.clientName.toLowerCase().includes(t);
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [invoices, filter, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Invoices</h1>
          <p className="mt-1 text-sm text-muted-foreground">{invoices.length} total · {invoices.filter((i)=>i.status==="paid").length} paid</p>
        </div>
        <Link to="/invoices/new" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90">
          <Plus className="h-4 w-4" /> New Invoice
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by number or client…"
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </div>
          <div className="flex rounded-xl border border-border bg-background p-1">
            {(["all", "paid", "pending"] as Filter[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Invoice No</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((inv) => (
                <tr key={inv.id} className="transition hover:bg-secondary/40">
                  <td className="px-6 py-3.5 font-semibold">{inv.number}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{inv.clientName}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{inv.date}</td>
                  <td className="px-6 py-3.5 text-right font-semibold">{fmt(computeTotals(inv).total)}</td>
                  <td className="px-6 py-3.5"><StatusBadge status={inv.status} /></td>
                  <td className="px-6 py-3.5">
                    <div className="flex justify-end gap-1">
                      <Link to={`/invoices/${inv.id}`} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" title="View"><Eye className="h-4 w-4" /></Link>
                      <Link to={`/invoices/${inv.id}/edit`} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" title="Edit"><Pencil className="h-4 w-4" /></Link>
                      <button onClick={() => { if (confirm(`Delete ${inv.number}?`)) actions.deleteInvoice(inv.id); }} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No invoices match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
