import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { User, ShieldCheck, CreditCard, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default async function StudentProfilePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await db.studentProfile.findUnique({
    where: { userId: user.id },
    include: { targetExam: true },
  });

  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  const entitlements = await db.entitlement.findMany({
    where: { userId: user.id },
    include: { plan: true, exam: true },
    orderBy: { validUntil: "desc" },
  });

  const activeEntitlement = entitlements.find((e) => e.isActive && new Date(e.validUntil) > new Date());

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* User info card */}
      <div className="card" style={{ borderTop: "4px solid var(--color-primary)" }}>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1.25rem",
              }}
            >
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: "1.4rem", marginBottom: "0.2rem" }}>{user.name}</h1>
              <div className="text-sm text-muted">{user.email}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-primary">Role: {user.role}</span>
                {activeEntitlement ? (
                  <span className="badge badge-accent">Active Premium Pass</span>
                ) : (
                  <span className="badge badge-muted">Free Student Tier</span>
                )}
              </div>
            </div>
          </div>

          <Link href="/pricing" className="btn btn-secondary btn-sm">
            <span>View All Preparation Passes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Academic Preferences */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Study Preferences & Goals</h3>
          <Link href="/student/exams" className="btn btn-ghost btn-sm">
            Switch Target Exam
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
          <div style={{ padding: "0.75rem", backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <span className="text-xs text-muted">Primary Target Exam</span>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-primary)", marginTop: 2 }}>
              {profile?.targetExam?.title || "Not selected"}
            </div>
          </div>

          <div style={{ padding: "0.75rem", backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <span className="text-xs text-muted">Language Mode</span>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text)", marginTop: 2 }}>
              {profile?.languagePreference || "Bilingual (Nepali & English)"}
            </div>
          </div>

          <div style={{ padding: "0.75rem", backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <span className="text-xs text-muted">Daily Target Minutes</span>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text)", marginTop: 2 }}>
              {profile?.dailyStudyTargetMinutes || 45} minutes / day
            </div>
          </div>

          <div style={{ padding: "0.75rem", backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <span className="text-xs text-muted">Consecutive Study Streak</span>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#B45309", marginTop: 2 }}>
              {profile?.streakCount || 0} Days (Asia/Kathmandu)
            </div>
          </div>
        </div>
      </div>

      {/* Active Entitlements & Access Passes (PRD Section 18) */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Access Passes & Expiry</h3>
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        </div>

        {entitlements.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted">
            <p>You currently do not have any active paid access passes.</p>
            <p style={{ fontSize: "0.8rem", marginTop: 4 }}>
              Free student limits apply to mock tests and advanced notes.
            </p>
            <Link href="/pricing" className="btn btn-primary btn-sm mt-3">
              Explore Preparation Passes
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {entitlements.map((e) => {
              const isCurrent = new Date(e.validUntil) > new Date() && e.isActive;
              return (
                <div
                  key={e.id}
                  style={{
                    padding: "0.875rem",
                    border: `1px solid ${isCurrent ? "var(--color-accent)" : "var(--color-border)"}`,
                    borderRadius: "var(--radius-md)",
                    backgroundColor: isCurrent ? "var(--color-accent-subtle)" : "#F8FAFC",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      {e.plan?.title || "Exam Access Pass"}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      Valid from {new Date(e.validFrom).toLocaleDateString()} until {new Date(e.validUntil).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`badge ${isCurrent ? "badge-success" : "badge-muted"}`}>
                    {isCurrent ? "Active" : "Expired"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Purchase & Order History (PRD Section 19) */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Payment & Order History</h3>
          <CreditCard className="w-4 h-4 text-muted" />
        </div>

        {orders.length === 0 ? (
          <div className="text-muted text-sm py-4 text-center">
            No purchase records found.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Pass Title</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><code>{o.transactionRef.substring(0, 14)}...</code></td>
                    <td>{o.plan.title}</td>
                    <td><strong>NPR {o.amountNpr.toLocaleString()}</strong></td>
                    <td>{o.paymentProvider}</td>
                    <td>
                      <span className={`badge ${o.status === "SUCCESS" ? "badge-success" : o.status === "PENDING" ? "badge-intermediate" : "badge-hard"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
