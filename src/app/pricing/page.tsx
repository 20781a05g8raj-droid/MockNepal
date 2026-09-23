import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { CheckCircle2, ShieldAlert, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export default async function PricingPage() {
  const user = await getSessionUser();

  const plans = await db.packagePlan.findMany({
    where: { isActive: true },
    include: { exam: true },
    orderBy: { priceNpr: "asc" },
  });

  return (
    <div className="public-layout">
      <PublicNav user={user} />

      <main style={{ padding: "3.5rem 1.5rem 5rem", backgroundColor: "var(--color-bg)", flexGrow: 1 }}>
        <div className="container" style={{ maxWidth: "1050px" }}>
          <div className="text-center mb-8">
            <span className="badge badge-primary mb-2">Transparent Pricing</span>
            <h1>Preparation Passes & Access Packages</h1>
            <p style={{ maxWidth: "650px", margin: "0.5rem auto 0", fontSize: "1.05rem" }}>
              Fixed-duration access passes in Nepalese Rupees (NPR). No automatic hidden renewals, no artificial countdowns. Complete study progress is permanently preserved after pass expiry.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {/* Free Tier */}
            <div className="card flex flex-col justify-between" style={{ border: "1.5px solid var(--color-border)" }}>
              <div>
                <span className="badge badge-muted mb-2">Free Student Tier</span>
                <h3 style={{ fontSize: "1.35rem", marginBottom: "0.25rem" }}>Foundational Access</h3>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)", marginBottom: "1rem" }}>
                  NPR 0
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
                  Full access to syllabi, sample MCQs with complete explanations, and basic mistake tracking.
                </p>

                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem" }}>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Daily MCQ practice allowance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Explanations on all accessible questions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Official syllabus browsing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sample model mock exams</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Daily study mission tracking</span>
                  </li>
                </ul>
              </div>

              <Link href="/register" className="btn btn-secondary btn-full mt-6">
                Create Free Account
              </Link>
            </div>

            {/* Dynamic Plans from DB */}
            {plans.map((plan) => {
              const features = JSON.parse(plan.featuresJson || "[]") as string[];
              const isPopular = plan.durationDays >= 90;

              return (
                <div
                  key={plan.id}
                  className="card flex flex-col justify-between"
                  style={{
                    border: isPopular ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                    position: "relative",
                  }}
                >
                  {isPopular && (
                    <div style={{ position: "absolute", top: -12, right: 20 }}>
                      <span className="badge badge-accent">Best Academic Value</span>
                    </div>
                  )}

                  <div>
                    <span className="badge badge-primary mb-2">
                      {plan.coverageType === "ALL_EXAMS" ? "All Exams Pass" : plan.exam?.title || "Exam Pass"}
                    </span>
                    <h3 style={{ fontSize: "1.35rem", marginBottom: "0.25rem" }}>{plan.title}</h3>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)", marginBottom: "1rem" }}>
                      NPR {plan.priceNpr.toLocaleString()}
                      <span style={{ fontSize: "0.85rem", fontWeight: 400, color: "var(--color-text-muted)" }}>
                        {" "}for {plan.durationDays} days
                      </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
                      Fixed access period without auto-billing. Covers all questions, mock tests, and notes.
                    </p>

                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem" }}>
                      {features.map((f, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={user ? `/student/checkout?planId=${plan.id}` : `/register?redirect=/student/checkout?planId=${plan.id}`}
                    className={`btn ${isPopular ? "btn-primary" : "btn-accent"} btn-full mt-6`}
                  >
                    <span>Get {plan.durationDays}-Day Pass</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Refund & Policy Box */}
          <div id="refund-policy" className="card" style={{ backgroundColor: "#F8FAFC", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 style={{ fontSize: "1.1rem" }}>Clear Academic & Financial Policies</h3>
            </div>
            <div className="grid grid-cols-2 gap-6 text-sm text-subheading mt-3">
              <div>
                <strong>Fixed-Duration Access:</strong> Passes do not automatically recur or auto-charge your digital wallet. When a pass reaches its expiry date, you are not charged again. You retain full access to all your past attempt scores, notes, and mistake notebook entries.
              </div>
              <div>
                <strong>7-Day Fair Refund Policy:</strong> If you experience verifiable technical issues accessing study materials, contact support within 7 days of purchase for a complete transaction reconciliation or full refund.
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
