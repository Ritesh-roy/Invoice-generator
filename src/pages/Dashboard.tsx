import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, IndianRupee, Plus, Clock, CheckCircle2 } from "lucide-react";
import { computeTotals, fmt, useStore } from "@/lib/store";
import StatusBadge from "@/components/StatusBadge";

const Stat = ({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent: string }) => (
  <div className="rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-card">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const invoices = useStore((s) => s.invoices);
  const totals = invoices.map((i) => computeTotals(i).total);
  const revenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + computeTotals(i).total, 0);
  const pending = invoices.filter((i) => i.status === "pending").length;
  const paid = invoices.filter((i) => i.status === "paid").length;
  const recent = [...invoices].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of your billing activity.</p>
        </div>
        <Link to="/invoices/new" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 active:scale-[0.98]">
          <Plus className="h-4 w-4" /> Create Invoice
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Revenue" value={fmt(revenue)} icon={IndianRupee} accent="bg-primary/10 text-primary" />
        <Stat label="Total Invoices" value={String(invoices.length)} icon={FileText} accent="bg-foreground/10 text-foreground" />
        <Stat label="Paid Invoices" value={String(paid)} icon={CheckCircle2} accent="bg-success/10 text-success" />
        <Stat label="Pending Invoices" value={String(pending)} icon={Clock} accent="bg-warning/10 text-warning" />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">Recent Invoices</h2>
          <Link to="/invoices" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Invoice</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.map((inv) => (
                <tr key={inv.id} className="transition hover:bg-secondary/40">
                  <td className="px-6 py-3.5">
                    <Link to={`/invoices/${inv.id}`} className="font-semibold hover:text-primary">{inv.number}</Link>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">{inv.clientName}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{inv.date}</td>
                  <td className="px-6 py-3.5 text-right font-semibold">{fmt(computeTotals(inv).total)}</td>
                  <td className="px-6 py-3.5"><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">No invoices yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
