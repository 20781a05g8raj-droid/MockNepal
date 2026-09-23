import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Play,
  ArrowRight,
  Award,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface PracticeResultsPageProps {
  params: Promise<{ sessionId: string }>;
}

export const dynamic = "force-dynamic";

export default async function PracticeResultsPage({ params }: PracticeResultsPageProps) {
  const { sessionId } = await params;
  const user = await getSessionUser();
  if (!user) return null;

  const session = await db.practiceSession.findUnique({
    where: { id: sessionId },
    include: {
      exam: true,
      subject: true,
      topic: true,
      answers: {
        include: {
          questionVersion: {
            include: {
              question: {
                include: { topic: true },
              },
            },
          },
        },
        orderBy: { submittedAt: "asc" },
      },
    },
  });

  if (!session || session.userId !== user.id) {
    notFound();
  }

  const answers = session.answers;
  const totalSubmitted = answers.length;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const incorrectCount = totalSubmitted - correctCount;
  const unansweredCount = Math.max(0, session.totalQuestions - totalSubmitted);

  const accuracyPercent = totalSubmitted > 0
    ? Math.round((correctCount / totalSubmitted) * 100)
    : null;

  const totalTimeSeconds = answers.reduce((acc, a) => acc + a.timeSpentSeconds, 0);
  const avgTimePerQuestion = totalSubmitted > 0
    ? Math.round(totalTimeSeconds / totalSubmitted)
    : 0;

  // Topic breakdown
  const topicStatsMap = new Map<string, { name: string; total: number; correct: number }>();
  for (const a of answers) {
    const tName = a.questionVersion.question.topic.name;
    const curr = topicStatsMap.get(tName) || { name: tName, total: 0, correct: 0 };
    curr.total++;
    if (a.isCorrect) curr.correct++;
    topicStatsMap.set(tName, curr);
  }
  const topicBreakdown = Array.from(topicStatsMap.values());

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Overview Card */}
      <div className="card text-center" style={{ borderTop: "4px solid var(--color-primary)", padding: "2.5rem 1.5rem" }}>
        <span className="badge badge-primary mb-3">Session Complete</span>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>
          Practice Results & Performance
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
          {session.exam.title} • {session.subject.name} {session.topic ? `(${session.topic.name})` : ""}
        </p>

        {/* Score & Accuracy Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginTop: "2rem" }}>
          <div style={{ padding: "1.25rem 0.5rem", backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)" }}>
              {correctCount} / {session.totalQuestions}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>Correct Questions</div>
          </div>

          <div style={{ padding: "1.25rem 0.5rem", backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: accuracyPercent !== null && accuracyPercent >= 75 ? "var(--color-success)" : accuracyPercent !== null && accuracyPercent >= 50 ? "var(--color-warning)" : "var(--color-error)" }}>
              {accuracyPercent !== null ? `${accuracyPercent}%` : "No answers"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              {accuracyPercent !== null ? "Accuracy Rate" : "No answers submitted"}
            </div>
          </div>

          <div style={{ padding: "1.25rem 0.5rem", backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text)" }}>
              {avgTimePerQuestion}s
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>Avg Time / Question</div>
          </div>

          <div style={{ padding: "1.25rem 0.5rem", backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-error)" }}>
              {incorrectCount}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>Mistakes to Revise</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mt-8 flex-wrap">
          <Link href="/student/practice" className="btn btn-primary">
            <Play className="w-4 h-4" />
            <span>Practice Another Topic</span>
          </Link>
          {incorrectCount > 0 && (
            <Link href="/student/mistakes" className="btn btn-accent">
              <RotateCcw className="w-4 h-4" />
              <span>Review {incorrectCount} Mistakes in Notebook</span>
            </Link>
          )}
          <Link href="/student/dashboard" className="btn btn-secondary">
            Return to Dashboard
          </Link>
        </div>
      </div>

      {/* Topic Breakdown */}
      {topicBreakdown.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Performance by Topic</h3>
            <span className="badge badge-muted">{topicBreakdown.length} Topics Practiced</span>
          </div>

          <div className="table-container mt-2">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Questions</th>
                  <th>Correct</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {topicBreakdown.map((tb, idx) => {
                  const pct = Math.round((tb.correct / tb.total) * 100);
                  return (
                    <tr key={idx}>
                      <td><strong>{tb.name}</strong></td>
                      <td>{tb.total}</td>
                      <td>{tb.correct}</td>
                      <td>
                        <span className={`badge ${pct >= 75 ? "badge-success" : pct >= 50 ? "badge-intermediate" : "badge-hard"}`}>
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Question by Question Review */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Question Breakdown & Explanations</h3>
          <span className="badge badge-primary">{answers.length} Reviewed</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
          {answers.map((ans, idx) => {
            const qv = ans.questionVersion;
            return (
              <div
                key={ans.id}
                style={{
                  border: `1.5px solid ${ans.isCorrect ? "var(--color-success-border)" : "var(--color-error-border)"}`,
                  backgroundColor: ans.isCorrect ? "var(--color-success-bg)" : "var(--color-error-bg)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem 1.25rem",
                }}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                    Q{idx + 1}. {qv.questionText}
                  </span>
                  {ans.isCorrect ? (
                    <span className="badge badge-success" style={{ flexShrink: 0 }}>
                      Correct
                    </span>
                  ) : (
                    <span className="badge badge-hard" style={{ flexShrink: 0 }}>
                      Incorrect
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div style={{ padding: "0.4rem 0.6rem", background: "#FFFFFF", borderRadius: 4, border: "1px solid var(--color-border)" }}>
                    <strong>Your selection:</strong> Option {ans.selectedOption}
                  </div>
                  <div style={{ padding: "0.4rem 0.6rem", background: "#FFFFFF", borderRadius: 4, border: "1px solid var(--color-border)" }}>
                    <strong>Correct option:</strong> Option {qv.correctOption}
                  </div>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", padding: "0.75rem", borderRadius: 4, border: "1px solid var(--color-border)", fontSize: "0.85rem", lineHeight: "1.5" }}>
                  <strong>Explanation: </strong>
                  {qv.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
