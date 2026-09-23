import { db } from "@/lib/db";
import { CreditCard, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const entitlements = await db.entitlement.findMany({
    include: {
      user: { select: { name: true, email: true } },
      plan: true,
    },
    orderBy: { validUntil: "desc" },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem" }}>Orders & Access Entitlements</h1>
        <p className="text-sm text-muted">
          Auditable transaction logs, payment verification records, and active access grants.
        </p>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Digital Wallet Transactions (eSewa / Khalti)</h3>
          <span className="badge badge-muted">{orders.length} Orders</span>
        </div>

        <div className="table-container mt-2">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction Ref</th>
                <th>Student</th>
                <th>Purchased Pass</th>
                <th>Amount</th>
                <th>Gateway</th>
                <th>Status</th>
                <th>Date (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-4 text-muted">No orders found.</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td><code>{o.transactionRef}</code></td>
                    <td>
                      <strong>{o.user.name}</strong>
                      <div className="text-xs text-muted">{o.user.email}</div>
                    </td>
                    <td>{o.plan.title}</td>
                    <td><strong>NPR {o.amountNpr.toLocaleString()}</strong></td>
                    <td>{o.paymentProvider}</td>
                    <td>
                      <span className={`badge ${o.status === "SUCCESS" ? "badge-success" : o.status === "PENDING" ? "badge-intermediate" : "badge-hard"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="text-xs text-muted">{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Entitlements Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Active Student Entitlements</h3>
          <span className="badge badge-primary">{entitlements.length} Granted</span>
        </div>

        <div className="table-container mt-2">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Pass Coverage</th>
                <th>Valid From</th>
                <th>Valid Until</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entitlements.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4 text-muted">No active entitlements.</td></tr>
              ) : (
                entitlements.map((e) => {
                  const isCurrent = new Date(e.validUntil) > new Date() && e.isActive;
                  return (
                    <tr key={e.id}>
                      <td>
                        <strong>{e.user.name}</strong>
                        <div className="text-xs text-muted">{e.user.email}</div>
                      </td>
                      <td>{e.plan?.title || "Exam Pass"}</td>
                      <td className="text-xs text-muted">{new Date(e.validFrom).toLocaleDateString()}</td>
                      <td className="text-xs text-muted">{new Date(e.validUntil).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${isCurrent ? "badge-success" : "badge-muted"}`}>
                          {isCurrent ? "Active" : "Expired"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
