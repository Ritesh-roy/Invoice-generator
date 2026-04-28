import { Invoice, computeTotals, fmt, useStore } from "@/lib/store";

const InvoicePreview = ({ invoice }: { invoice: Invoice }) => {
  const settings = useStore((s) => s.settings);
  const { subtotal, gstAmount, total } = computeTotals(invoice);

  return (
    <div id="print-area" className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="flex items-start justify-between gap-4 border-b border-border bg-secondary/40 p-7">
        <div>
          <div className="flex items-center gap-2.5">
            {settings.logo ? (
              <img src={settings.logo} alt="logo" className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-foreground text-sm font-bold text-primary-foreground">
                {settings.companyName.slice(0, 1)}
              </div>
            )}
            <span className="text-lg font-bold tracking-tight">{settings.companyName}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {settings.email}<br />{settings.phone}<br />{settings.address}
            {settings.gstNumber && <><br />GSTIN: {settings.gstNumber}</>}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Invoice</div>
          <div className="mt-1 text-2xl font-bold tracking-tight">{invoice.number}</div>
          <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
            <div>Issued: <span className="font-medium text-foreground">{invoice.date}</span></div>
            <div>Due: <span className="font-medium text-foreground">{invoice.dueDate}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 border-b border-border p-7">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Bill To</div>
          <div className="mt-2 text-sm font-semibold">{invoice.clientName || "—"}</div>
          <div className="mt-1 text-xs text-muted-foreground">{invoice.clientEmail}</div>
          <div className="text-xs text-muted-foreground">{invoice.clientPhone}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Amount Due</div>
          <div className="mt-2 text-2xl font-bold">{fmt(total)}</div>
          <div className="mt-1 text-[11px]">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold ${
              invoice.status === "paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
            }`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {invoice.status === "paid" ? "Paid" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-7 pb-3">
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5 text-right">Qty</th>
                <th className="px-4 py-2.5 text-right">Price</th>
                <th className="px-4 py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoice.items.map((it) => (
                <tr key={it.id}>
                  <td className="px-4 py-3">{it.name || "—"}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{it.qty}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{fmt(it.price)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{fmt(it.qty * it.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end px-7 pb-7">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>GST ({invoice.gst}%)</span><span>{fmt(gstAmount)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Discount</span><span>− {fmt(invoice.discount)}</span></div>
          <div className="my-2 border-t border-dashed border-border" />
          <div className="flex items-center justify-between rounded-xl bg-foreground px-4 py-3 text-background">
            <span className="text-xs font-semibold uppercase tracking-wider">Grand Total</span>
            <span className="text-lg font-bold">{fmt(total)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="border-t border-border bg-secondary/30 p-7">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Notes</div>
          <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
};

export default InvoicePreview;
