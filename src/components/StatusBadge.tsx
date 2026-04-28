import { InvoiceStatus } from "@/lib/store";

const StatusBadge = ({ status }: { status: InvoiceStatus }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
    status === "paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
  }`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status === "paid" ? "Paid" : "Pending"}
  </span>
);

export default StatusBadge;
