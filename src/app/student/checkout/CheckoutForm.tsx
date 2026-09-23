"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck, ArrowRight, CreditCard, AlertCircle } from "lucide-react";

interface PlanDetails {
  id: string;
  title: string;
  durationDays: number;
  priceNpr: number;
  coverageType: string;
  features: string[];
}

export default function CheckoutForm({ plan }: { plan: PlanDetails }) {
  const router = useRouter();

  const [provider, setProvider] = useState<"ESEWA" | "KHALTI">("ESEWA");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"INIT" | "PAYING" | "COMPLETED" | "FAILED">("INIT");
  const [orderData, setOrderData] = useState<any | null>(null);
  const [error, setError] = useState("");

  const handleInitiateOrder = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/student/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          paymentProvider: provider,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to initiate transaction");
        setLoading(false);
        return;
      }

      setOrderData(data);
      setStep("PAYING");
      setLoading(false);
    } catch {
      setError("Network communication failure");
      setLoading(false);
    }
  };

  const handleCompleteSimulation = async (simulatedOutcome: "SUCCESS" | "FAILED") => {
    if (!orderData) return;
    setLoading(true);

    try {
      const res = await fetch("/api/student/checkout/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.orderId,
          transactionRef: orderData.transactionRef,
          simulateResult: simulatedOutcome,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStep("COMPLETED");
      } else {
        setStep("FAILED");
        setError(data.error || "Payment verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ border: "1.5px solid var(--color-border)" }}>
      {step === "INIT" && (
        <div>
          <div className="card-header pb-3 mb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div>
              <span className="badge badge-primary mb-1">Order Checkout</span>
              <h2 style={{ fontSize: "1.25rem" }}>Confirm Your Preparation Pass</h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-primary)" }}>
                NPR {plan.priceNpr.toLocaleString()}
              </div>
              <span className="text-xs text-muted">Fixed {plan.durationDays} Days Pass</span>
            </div>
          </div>

          {error && <div className="alert alert-error mb-4">{error}</div>}

          {/* Included Features List */}
          <div style={{ backgroundColor: "#F8FAFC", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", marginBottom: "1.5rem" }}>
            <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>Included with this pass:</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Provider Selection (eSewa / Khalti) */}
          <div className="form-group mb-6">
            <label className="form-label">Select Nepal Payment Wallet</label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <label
                className="flex items-center gap-3"
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: `2px solid ${provider === "ESEWA" ? "#16A34A" : "var(--color-border)"}`,
                  backgroundColor: provider === "ESEWA" ? "#F0FDF4" : "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="provider"
                  checked={provider === "ESEWA"}
                  onChange={() => setProvider("ESEWA")}
                />
                <div>
                  <strong style={{ color: "#15803D" }}>eSewa Mobile Wallet</strong>
                  <div className="text-xs text-muted">Nepal&apos;s digital payment gateway</div>
                </div>
              </label>

              <label
                className="flex items-center gap-3"
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: `2px solid ${provider === "KHALTI" ? "#7C3AED" : "var(--color-border)"}`,
                  backgroundColor: provider === "KHALTI" ? "#F5F3FF" : "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="provider"
                  checked={provider === "KHALTI"}
                  onChange={() => setProvider("KHALTI")}
                />
                <div>
                  <strong style={{ color: "#6D28D9" }}>Khalti Digital Wallet</strong>
                  <div className="text-xs text-muted">Instant online checkout</div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInitiateOrder}
            disabled={loading}
            className="btn btn-primary btn-full btn-lg"
          >
            <span>{loading ? "Creating Order..." : `Proceed to Pay NPR ${plan.priceNpr.toLocaleString()} via ${provider}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === "PAYING" && orderData && (
        <div className="text-center py-4">
          <span className="badge badge-accent mb-2">Simulated Payment Gateway</span>
          <h2>Processing Payment with {provider}</h2>
          <p className="text-muted text-sm mt-1 mb-6">
            Transaction Reference: <code>{orderData.transactionRef}</code> • Amount: <strong>NPR {orderData.amountNpr}</strong>
          </p>

          <div style={{ maxWidth: "420px", margin: "0 auto 2rem", padding: "1.25rem", backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", textAlign: "left", fontSize: "0.85rem" }}>
            <div className="flex justify-between py-1" style={{ borderBottom: "1px dashed var(--color-border)" }}>
              <span>Merchant:</span>
              <strong>Nepal Exam Prep Portal</strong>
            </div>
            <div className="flex justify-between py-1" style={{ borderBottom: "1px dashed var(--color-border)" }}>
              <span>Item:</span>
              <strong>{plan.title} ({plan.durationDays} Days)</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Total Payable:</span>
              <strong style={{ color: "var(--color-primary)" }}>NPR {orderData.amountNpr}</strong>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => handleCompleteSimulation("SUCCESS")}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Verifying with Server..." : "Simulate Successful Payment"}
            </button>
            <button
              type="button"
              onClick={() => handleCompleteSimulation("FAILED")}
              disabled={loading}
              className="btn btn-secondary"
            >
              Simulate Failure / Cancellation
            </button>
          </div>
        </div>
      )}

      {step === "COMPLETED" && (
        <div className="text-center py-6">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
          <h2 style={{ fontSize: "1.6rem", color: "var(--color-primary)" }}>Payment Verified & Access Activated!</h2>
          <p className="text-muted text-sm mt-2 mb-6" style={{ maxWidth: "500px", margin: "0.5rem auto 1.5rem" }}>
            Your {plan.title} is now active for {plan.durationDays} days. All mock test series, complete study notes, and unlimited practice sessions are unlocked.
          </p>

          <div className="flex justify-center gap-3">
            <Link href="/student/dashboard" className="btn btn-primary">
              Go to Dashboard & Start Studying
            </Link>
            <Link href="/student/profile" className="btn btn-secondary">
              View Entitlement Details
            </Link>
          </div>
        </div>
      )}

      {step === "FAILED" && (
        <div className="text-center py-6">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-3" />
          <h2 style={{ fontSize: "1.4rem" }}>Payment Verification Incomplete</h2>
          <p className="text-muted text-sm mt-2 mb-6">
            The transaction could not be verified by the provider. No charges have been made.
          </p>

          <button
            type="button"
            onClick={() => setStep("INIT")}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
