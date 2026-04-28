import { useMemo, useState } from "react";

type Item = { id: string; name: string; qty: number; price: number };

const genInvoiceNo = () => "INV-" + Math.floor(100000 + Math.random() * 900000);
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(
    isFinite(n) ? n : 0,
  );

const Index = () => {
  const [invoiceNo, setInvoiceNo] = useState(genInvoiceNo());
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [dueDate, setDueDate] = useState(addDays(14));

  const [clientName, setClientName] = useState("Acme Corporation");
  const [clientEmail, setClientEmail] = useState("billing@acme.com");
  const [clientPhone, setClientPhone] = useState("+91 98765 43210");

  const [items, setItems] = useState<Item[]>([
    { id: crypto.randomUUID(), name: "Website Design", qty: 1, price: 25000 },
    { id: crypto.randomUUID(), name: "Hosting (1 yr)", qty: 1, price: 4500 },
  ]);

  const [gst, setGst] = useState<number>(18);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState("Thank you for your business. Payment due within 14 days.");

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items]);
  const gstAmount = useMemo(() => (subtotal * (gst || 0)) / 100, [subtotal, gst]);
  const grandTotal = useMemo(
    () => Math.max(0, subtotal + gstAmount - (discount || 0)),
    [subtotal, gstAmount, discount],
  );

  const updateItem = (id: string, patch: Partial<Item>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const addItem = () =>
    setItems((p) => [...p, { id: crypto.randomUUID(), name: "", qty: 1, price: 0 }]);
  const removeItem = (id: string) => setItems((p) => p.filter((i) => i.id !== id));

  const handleSave = () => {
    const payload = {
      invoiceNo, invoiceDate, dueDate,
      client: { name: clientName, email: clientEmail, phone: clientPhone },
      items, gst, discount, notes, subtotal, gstAmount, grandTotal,
    };
    localStorage.setItem(`invoice-${invoiceNo}`, JSON.stringify(payload));
    alert(`Invoice ${invoiceNo} saved locally.`);
  };

  const inputBase =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
  const labelBase = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-slate-900 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
              Q
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Qrubis E-commerce</h1>
              <p className="text-xs text-slate-500">Invoice Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            >
              Save Invoice
            </button>
            <button
              onClick={() => window.print()}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-blue-600 hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              Download PDF
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-10">
        {/* LEFT — FORM */}
        <section className="print:hidden">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Create Invoice</h2>
              <p className="mt-1 text-sm text-slate-500">Fill in the details — preview updates live.</p>
            </div>

            {/* Invoice meta */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelBase}>Invoice #</label>
                <div className="flex gap-2">
                  <input className={inputBase} value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
                  <button
                    type="button"
                    onClick={() => setInvoiceNo(genInvoiceNo())}
                    title="Regenerate"
                    className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 transition hover:bg-slate-100"
                  >
                    ↻
                  </button>
                </div>
              </div>
              <div>
                <label className={labelBase}>Invoice Date</label>
                <input type="date" className={inputBase} value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </div>
              <div>
                <label className={labelBase}>Due Date</label>
                <input type="date" className={inputBase} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>

            {/* Client */}
            <div className="mt-8">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-700">Client</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelBase}>Client Name</label>
                  <input className={inputBase} value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Company or person" />
                </div>
                <div>
                  <label className={labelBase}>Email</label>
                  <input type="email" className={inputBase} value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="name@company.com" />
                </div>
                <div>
                  <label className={labelBase}>Phone</label>
                  <input className={inputBase} value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+91 ..." />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Items</h3>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  <span className="text-base leading-none">+</span> Add Item
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="hidden grid-cols-12 gap-2 bg-slate-50 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:grid">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1" />
                </div>
                <div className="divide-y divide-slate-100">
                  {items.map((it) => (
                    <div key={it.id} className="grid grid-cols-12 gap-2 px-3 py-2.5">
                      <input
                        className={`${inputBase} col-span-12 sm:col-span-5`}
                        value={it.name}
                        placeholder="Description"
                        onChange={(e) => updateItem(it.id, { name: e.target.value })}
                      />
                      <input
                        type="number" min={0}
                        className={`${inputBase} col-span-4 text-right sm:col-span-2`}
                        value={it.qty}
                        onChange={(e) => updateItem(it.id, { qty: parseFloat(e.target.value) || 0 })}
                      />
                      <input
                        type="number" min={0} step="0.01"
                        className={`${inputBase} col-span-4 text-right sm:col-span-2`}
                        value={it.price}
                        onChange={(e) => updateItem(it.id, { price: parseFloat(e.target.value) || 0 })}
                      />
                      <div className="col-span-3 flex items-center justify-end px-2 text-sm font-semibold sm:col-span-2">
                        {fmt(it.qty * it.price)}
                      </div>
                      <button
                        onClick={() => removeItem(it.id)}
                        title="Remove"
                        className="col-span-1 flex items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="px-3 py-6 text-center text-sm text-slate-400">No items yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelBase}>GST (%)</label>
                <input
                  type="number" min={0} max={100}
                  className={inputBase}
                  value={gst}
                  onChange={(e) => setGst(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className={labelBase}>Discount (₹)</label>
                <input
                  type="number" min={0}
                  className={inputBase}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className={labelBase}>Notes</label>
              <textarea
                rows={3}
                className={`${inputBase} resize-none`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms, thank-you note, etc."
              />
            </div>
          </div>
        </section>

        {/* RIGHT — PREVIEW */}
        <section>
          <div
            id="invoice-preview"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5"
          >
            {/* Top bar */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white p-7">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-slate-900 text-sm font-bold text-white">
                    Q
                  </div>
                  <span className="text-lg font-bold tracking-tight">Qrubis E-commerce</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  hello@qrubis.com<br />www.qrubis.com
                </p>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Invoice</div>
                <div className="mt-1 text-2xl font-bold tracking-tight">{invoiceNo}</div>
                <div className="mt-2 space-y-0.5 text-xs text-slate-500">
                  <div>Issued: <span className="font-medium text-slate-700">{invoiceDate}</span></div>
                  <div>Due: <span className="font-medium text-slate-700">{dueDate}</span></div>
                </div>
              </div>
            </div>

            {/* Bill to */}
            <div className="grid grid-cols-2 gap-6 border-b border-slate-100 p-7">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Bill To</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{clientName || "—"}</div>
                <div className="mt-1 text-xs text-slate-500">{clientEmail}</div>
                <div className="text-xs text-slate-500">{clientPhone}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Amount Due</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{fmt(grandTotal)}</div>
              </div>
            </div>

            {/* Items */}
            <div className="p-7 pb-3">
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-2.5">Description</th>
                      <th className="px-4 py-2.5 text-right">Qty</th>
                      <th className="px-4 py-2.5 text-right">Price</th>
                      <th className="px-4 py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it) => (
                      <tr key={it.id}>
                        <td className="px-4 py-3 text-slate-800">{it.name || "—"}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{it.qty}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmt(it.price)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmt(it.qty * it.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end px-7 pb-7">
              <div className="w-full max-w-xs space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span><span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST ({gst}%)</span><span>{fmt(gstAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span><span>− {fmt(discount)}</span>
                </div>
                <div className="my-2 border-t border-dashed border-slate-200" />
                <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
                  <span className="text-xs font-semibold uppercase tracking-wider">Grand Total</span>
                  <span className="text-lg font-bold">{fmt(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="border-t border-slate-100 bg-slate-50/60 p-7">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Notes</div>
                <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-600">{notes}</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
