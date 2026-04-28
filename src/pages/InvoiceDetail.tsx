import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Printer, Trash2 } from "lucide-react";
import { actions, useStore } from "@/lib/store";
import InvoicePreview from "@/components/InvoicePreview";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoice = useStore((s) => s.invoices.find((i) => i.id === id));

  if (!invoice) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
        <p className="text-muted-foreground">Invoice not found.</p>
        <Link to="/invoices" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Back to invoices</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1 shadow-soft">
            <span className="px-2 text-xs font-semibold text-muted-foreground">Status</span>
            <button
              onClick={() => actions.setInvoiceStatus(invoice.id, invoice.status === "paid" ? "pending" : "paid")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                invoice.status === "paid" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"
              }`}
            >
              {invoice.status === "paid" ? "Paid" : "Pending"} · toggle
            </button>
          </div>
          <Link to={`/invoices/${invoice.id}/edit`} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold shadow-soft hover:bg-secondary">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90">
            <Printer className="h-4 w-4" /> Download PDF
          </button>
          <button
            onClick={() => { if (confirm("Delete this invoice?")) { actions.deleteInvoice(invoice.id); navigate("/invoices"); } }}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold text-destructive shadow-soft hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  );
};

export default InvoiceDetail;
