import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Save, Printer, RefreshCw } from "lucide-react";
import { Invoice, actions, fmt, newInvoiceNumber, useStore } from "@/lib/store";
import InvoicePreview from "@/components/InvoicePreview";

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

const blank = (): Invoice => ({
  id: crypto.randomUUID(),
  number: newInvoiceNumber(),
  clientId: "", clientName: "", clientEmail: "", clientPhone: "", clientCompany: "", clientAddress: "", clientCity: "", clientPostalCode: "", clientState: "", clientCountry: "India", clientGstNumber: "", clientPan: "",
  date: today(), dueDate: addDays(14),
  items: [{ id: crypto.randomUUID(), name: "", qty: 1, price: 0 }],
  gst: 18, discount: 0, notes: "Thank you for your business.",
  customFields: [],
  status: "pending", createdAt: Date.now(),
});

const inputBase = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";
const labelBase = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

const InvoiceEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = useStore((s) => id ? s.invoices.find((i) => i.id === id) : undefined);
  const clients = useStore((s) => s.clients);
  const [inv, setInv] = useState<Invoice>(existing ? { ...blank(), ...existing, customFields: existing.customFields ?? [] } : blank());

  const update = (patch: Partial<Invoice>) => setInv((prev) => ({ ...prev, ...patch }));
  const addItem = () => update({ items: [...inv.items, { id: crypto.randomUUID(), name: "", qty: 1, price: 0 }] });
  const updateItem = (iid: string, patch: Partial<Invoice["items"][number]>) =>
    update({ items: inv.items.map((it) => it.id === iid ? { ...it, ...patch } : it) });
  const removeItem = (iid: string) => update({ items: inv.items.filter((it) => it.id !== iid) });
  const addCustomField = () => update({ customFields: [...inv.customFields, { id: crypto.randomUUID(), label: "Field label", value: "" }] });
  const updateCustomField = (fid: string, patch: Partial<Invoice["customFields"][number]>) =>
    update({ customFields: inv.customFields.map((field) => field.id === fid ? { ...field, ...patch } : field) });
  const removeCustomField = (fid: string) => update({ customFields: inv.customFields.filter((field) => field.id !== fid) });

  const subtotal = useMemo(() => inv.items.reduce((s, i) => s + i.qty * i.price, 0), [inv.items]);
  const gstAmount = (subtotal * inv.gst) / 100;
  const total = Math.max(0, subtotal + gstAmount - inv.discount);

  const save = () => {
    actions.upsertInvoice(inv);
    navigate(`/invoices/${inv.id}`);
  };

  const pickClient = (cid: string) => {
    const c = clients.find((x) => x.id === cid);
    if (!c) return;
    update({
      clientId: c.id,
      clientName: c.name,
      clientEmail: c.email,
      clientPhone: c.phone,
      clientCompany: c.company || "",
      clientAddress: c.address || "",
      clientCity: c.city || "",
      clientPostalCode: c.postalCode || "",
      clientState: c.state || "",
      clientCountry: c.country || "",
      clientGstNumber: c.gstNumber || "",
      clientPan: c.pan || "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{existing ? "Edit Invoice" : "Create Invoice"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live preview updates as you type.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold shadow-soft hover:bg-secondary">
            <Printer className="h-4 w-4" /> Download PDF
          </button>
          <button onClick={save} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90">
            <Save className="h-4 w-4" /> Save Invoice
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="print:hidden">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelBase}>Invoice #</label>
                <div className="flex gap-2">
                  <input className={inputBase} value={inv.number} onChange={(e) => update({ number: e.target.value })} />
                  <button onClick={() => update({ number: newInvoiceNumber() })} className="shrink-0 rounded-xl border border-border bg-secondary px-3 hover:bg-secondary/70" title="Regenerate">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className={labelBase}>Date</label>
                <input type="date" className={inputBase} value={inv.date} onChange={(e) => update({ date: e.target.value })} />
              </div>
              <div>
                <label className={labelBase}>Due Date</label>
                <input type="date" className={inputBase} value={inv.dueDate} onChange={(e) => update({ dueDate: e.target.value })} />
              </div>
            </div>

            <div className="mt-7">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">Client</h3>
              {clients.length > 0 && (
                <div className="mb-3">
                  <label className={labelBase}>Pick from saved</label>
                  <select className={inputBase} value={inv.clientId} onChange={(e) => pickClient(e.target.value)}>
                    <option value="">— select —</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelBase}>Client Business Name</label>
                  <input className={inputBase} value={inv.clientCompany} onChange={(e) => update({ clientCompany: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelBase}>Client Name</label>
                  <input className={inputBase} value={inv.clientName} onChange={(e) => update({ clientName: e.target.value })} />
                </div>
                <div>
                  <label className={labelBase}>Email</label>
                  <input className={inputBase} value={inv.clientEmail} onChange={(e) => update({ clientEmail: e.target.value })} />
                </div>
                <div>
                  <label className={labelBase}>Phone</label>
                  <input className={inputBase} value={inv.clientPhone} onChange={(e) => update({ clientPhone: e.target.value })} />
                </div>
                <div>
                  <label className={labelBase}>Country</label>
                  <select className={inputBase} value={inv.clientCountry} onChange={(e) => update({ clientCountry: e.target.value })}>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
                <div>
                  <label className={labelBase}>GSTIN</label>
                  <input className={inputBase} value={inv.clientGstNumber} onChange={(e) => update({ clientGstNumber: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelBase}>Address</label>
                  <input className={inputBase} value={inv.clientAddress} onChange={(e) => update({ clientAddress: e.target.value })} />
                </div>
                <div>
                  <label className={labelBase}>City</label>
                  <input className={inputBase} value={inv.clientCity} onChange={(e) => update({ clientCity: e.target.value })} />
                </div>
                <div>
                  <label className={labelBase}>Postal Code</label>
                  <input className={inputBase} value={inv.clientPostalCode} onChange={(e) => update({ clientPostalCode: e.target.value })} />
                </div>
                <div>
                  <label className={labelBase}>State</label>
                  <input className={inputBase} value={inv.clientState} onChange={(e) => update({ clientState: e.target.value })} />
                </div>
                <div>
                  <label className={labelBase}>PAN</label>
                  <input className={inputBase} value={inv.clientPan} onChange={(e) => update({ clientPan: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider">Items</h3>
                <button onClick={addItem} className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="hidden grid-cols-12 gap-2 bg-secondary/50 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1" />
                </div>
                <div className="divide-y divide-border">
                  {inv.items.map((it) => (
                    <div key={it.id} className="grid grid-cols-12 gap-2 px-3 py-2.5">
                      <input className={`${inputBase} col-span-12 sm:col-span-5`} placeholder="Description" value={it.name} onChange={(e) => updateItem(it.id, { name: e.target.value })} />
                      <input type="number" min={0} className={`${inputBase} col-span-4 text-right sm:col-span-2`} value={it.qty} onChange={(e) => updateItem(it.id, { qty: parseFloat(e.target.value) || 0 })} />
                      <input type="number" min={0} step="0.01" className={`${inputBase} col-span-4 text-right sm:col-span-2`} value={it.price} onChange={(e) => updateItem(it.id, { price: parseFloat(e.target.value) || 0 })} />
                      <div className="col-span-3 flex items-center justify-end px-2 text-sm font-semibold sm:col-span-2">{fmt(it.qty * it.price)}</div>
                      <button onClick={() => removeItem(it.id)} className="col-span-1 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelBase}>GST (%)</label>
                <input type="number" min={0} max={100} className={inputBase} value={inv.gst} onChange={(e) => update({ gst: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className={labelBase}>Discount (₹)</label>
                <input type="number" min={0} className={inputBase} value={inv.discount} onChange={(e) => update({ discount: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">Custom fields</h3>
                  <p className="text-xs text-muted-foreground">Add extra invoice labels like PAN, order ID, or reference.</p>
                </div>
                <button onClick={addCustomField} className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {inv.customFields.map((field) => (
                  <div key={field.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_40px]">
                    <input className={inputBase} value={field.label} onChange={(e) => updateCustomField(field.id, { label: e.target.value })} placeholder="Field label" />
                    <input className={inputBase} value={field.value} onChange={(e) => updateCustomField(field.id, { value: e.target.value })} placeholder="Value" />
                    <button type="button" onClick={() => removeCustomField(field.id)} className="rounded-xl border border-border bg-card px-3 text-sm text-destructive hover:bg-destructive/10">Remove</button>
                  </div>
                ))}
                {inv.customFields.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">No custom fields added.</div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className={labelBase}>Notes</label>
              <textarea rows={3} className={`${inputBase} resize-none`} value={inv.notes} onChange={(e) => update({ notes: e.target.value })} />
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3 text-sm">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground">Grand Total</span>
              <span className="text-lg font-bold">{fmt(total)}</span>
            </div>
          </div>
        </section>

        <section>
          <InvoicePreview invoice={inv} />
        </section>
      </div>
    </div>
  );
};

export default InvoiceEditor;
