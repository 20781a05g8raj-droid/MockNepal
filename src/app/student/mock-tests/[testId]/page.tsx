import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft, Clock, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";
import StartTestButton from "./StartTestButton";

interface MockTestInstructionsProps {
  params: Promise<{ testId: string }>;
}

export default async function MockTestInstructionsPage({ params }: MockTestInstructionsProps) {
  const { testId } = await params;
  const user = await getSessionUser();
  if (!user) return null;

  const mockTest = await db.mockTest.findUnique({
    where: { id: testId },
    include: {
      exam: true,
      attempts: {
        where: { userId: user.id },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  if (!mockTest) notFound();

  const attempts = mockTest.attempts;
  const remaining = Math.max(0, mockTest.attemptLimit - attempts.length);

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Link href="/student/mock-tests" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }}>
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Mock Test List</span>
      </Link>

      <div className="card" style={{ borderTop: "4px solid var(--color-primary)" }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-primary">{mockTest.exam.title}</span>
          <span className="badge badge-intermediate">Exam Simulation</span>
        </div>

        <h1 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>{mockTest.title}</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: "1.6" }}>
          {mockTest.description}
        </p>

        {/* Specifications grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", backgroundColor: "#F8FAFC", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", margin: "1.5rem 0" }}>
          <div>
            <span className="text-xs text-muted">Examination Duration</span>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-primary)" }}>
              {mockTest.durationMinutes} Minutes
            </div>
          </div>
          <div>
            <span className="text-xs text-muted">Total Questions</span>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-primary)" }}>
              {mockTest.totalQuestions} Questions
            </div>
          </div>
          <div>
            <span className="text-xs text-muted">Marks per Correct Answer</span>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-success)" }}>
              +{mockTest.marksPerCorrect} Marks
            </div>
          </div>
          <div>
            <span className="text-xs text-muted">Negative Deduction per Wrong</span>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-error)" }}>
              -{(mockTest.marksPerCorrect * mockTest.negativePenaltyPercent) / 100} Marks ({mockTest.negativePenaltyPercent}%)
            </div>
          </div>
        </div>

        {/* Instructions list */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>
            Examination Instructions & Integrity Rules:
          </h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.875rem", color: "var(--color-text-subheading)" }}>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" style={{ marginTop: 2 }} />
              <span><strong>Server-Authoritative Timer:</strong> The countdown timer runs on the backend. Refreshing or closing your browser will not reset or pause the timer.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" style={{ marginTop: 2 }} />
              <span><strong>Automatic Autosave:</strong> Every option you select is immediately saved to the server. You can change your selection or clear an answer at any time prior to submission.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" style={{ marginTop: 2 }} />
              <span><strong>Negative Marking:</strong> In accordance with official Lok Sewa rules, incorrect answers deduct 20% of the question value (-0.4 marks). Unanswered questions receive 0.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" style={{ marginTop: 2 }} />
              <span><strong>Auto-Submission:</strong> When the time limit expires, the test automatically submits your current saved answers.</span>
            </li>
          </ul>
        </div>

        {remaining > 0 ? (
          <StartTestButton testId={mockTest.id} />
        ) : (
          <div className="alert alert-warning">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>You have utilized all {mockTest.attemptLimit} attempts allowed for this examination.</span>
          </div>
        )}
      </div>
    </div>
  );
}
