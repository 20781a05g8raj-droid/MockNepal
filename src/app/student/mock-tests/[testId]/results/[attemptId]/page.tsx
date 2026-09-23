import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Award,
} from "lucide-react";

interface MockTestResultsPageProps {
  params: Promise<{ testId: string; attemptId: string }>;
}

export default async function MockTestResultsPage({ params }: MockTestResultsPageProps) {
  const { testId, attemptId } = await params;
  const user = await getSessionUser();
  if (!user) return null;

  const attempt = await db.testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      mockTest: {
        include: {
          exam: true,
          questions: {
            include: {
              question: {
                include: {
                  topic: true,
                  versions: { orderBy: { versionNumber: "desc" }, take: 1 },
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
      answers: true,
    },
  });

  if (!attempt || attempt.userId !== user.id) {
    notFound();
  }

  const mockTest = attempt.mockTest;
  const questions = mockTest.questions;
  const answersMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  const marksPerCorrect = mockTest.marksPerCorrect;
  const penaltyPerWrong = (marksPerCorrect * mockTest.negativePenaltyPercent) / 100.0;
  const maxPossibleMarks = mockTest.totalQuestions * marksPerCorrect;

  const durationTakenSeconds = attempt.submittedAt
    ? Math.round((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000)
    : mockTest.durationMinutes * 60;
  const durationMinutesTaken = Math.round(durationTakenSeconds / 60);

  return (
    <div style={{ maxWidth: "840px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Overview Score Card */}
      <div className="card text-center" style={{ borderTop: "4px solid var(--color-primary)", padding: "2.5rem 1.5rem" }}>
        <div className="flex justify-center items-center gap-2 mb-2">
          <span className="badge badge-primary">{mockTest.exam.title}</span>
          <span className="badge badge-accent">Official Scoring Result</span>
        </div>

        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>{mockTest.title}</h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          Examination completed on {attempt.submittedAt?.toLocaleDateString() || new Date().toLocaleDateString()}
        </p>

        {/* Final Score Hero */}
        <div style={{ margin: "2rem 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Final Net Score (with Negative Deductions)
          </div>
          <div style={{ fontSize: "3.25rem", fontWeight: 800, color: "var(--color-primary)", lineHeight: 1.1, margin: "0.5rem 0" }}>
            {attempt.score ?? 0}
            <span style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--color-text-muted)" }}> / {maxPossibleMarks}</span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--color-text-subheading)" }}>
            Accuracy: <strong>{attempt.accuracyPercent ?? 0}%</strong> of attempted questions
          </div>
        </div>

        {/* Breakdown Metric Strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1rem", backgroundColor: "#F8FAFC", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
          <div>
            <span className="text-xs text-muted">Correct (+{marksPerCorrect})</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-success)" }}>
              {attempt.correctCount}
            </div>
            <div className="text-xs text-muted">+{attempt.correctCount * marksPerCorrect} marks</div>
          </div>

          <div>
            <span className="text-xs text-muted">Incorrect (-{penaltyPerWrong})</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-error)" }}>
              {attempt.incorrectCount}
            </div>
            <div className="text-xs text-muted">-{(attempt.incorrectCount * penaltyPerWrong).toFixed(1)} penalty</div>
          </div>

          <div>
            <span className="text-xs text-muted">Unanswered (0)</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-muted)" }}>
              {attempt.unansweredCount}
            </div>
            <div className="text-xs text-muted">0 marks</div>
          </div>

          <div>
            <span className="text-xs text-muted">Time Taken</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-primary)" }}>
              {durationMinutesTaken}m
            </div>
            <div className="text-xs text-muted">of {mockTest.durationMinutes} mins</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          <Link href="/student/mock-tests" className="btn btn-secondary">
            Mock Tests Catalog
          </Link>
          {attempt.incorrectCount > 0 && (
            <Link href="/student/mistakes" className="btn btn-accent">
              <RotateCcw className="w-4 h-4" />
              <span>Review {attempt.incorrectCount} Mistakes in Notebook</span>
            </Link>
          )}
          <Link href="/student/dashboard" className="btn btn-primary">
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Question-by-Question Detailed Review (PRD Section 6 G) */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Detailed Question Review & Explanations</h3>
          <span className="badge badge-muted">{questions.length} Total Questions</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
          {questions.map((tq, idx) => {
            const q = tq.question;
            const v = q.versions[0];
            const savedAnswer = answersMap.get(q.id);
            const userSelected = savedAnswer?.selectedOption;
            const isCorrect = userSelected && v && userSelected.toUpperCase() === v.correctOption.toUpperCase();
            const isUnanswered = !userSelected;

            return (
              <div
                key={q.id}
                style={{
                  border: `1.5px solid ${isCorrect ? "var(--color-success-border)" : isUnanswered ? "var(--color-border)" : "var(--color-error-border)"}`,
                  backgroundColor: isCorrect ? "var(--color-success-bg)" : isUnanswered ? "#F8FAFC" : "var(--color-error-bg)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                }}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary">Q{idx + 1}</span>
                    <span className="text-xs text-muted">{q.topic.name}</span>
                  </div>

                  <div>
                    {isCorrect ? (
                      <span className="badge badge-success">+{marksPerCorrect} Correct</span>
                    ) : isUnanswered ? (
                      <span className="badge badge-muted">Unanswered (0)</span>
                    ) : (
                      <span className="badge badge-hard">-{penaltyPerWrong} Incorrect</span>
                    )}
                  </div>
                </div>

                <p style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: "1rem", color: "var(--color-text)" }}>
                  {v?.questionText}
                </p>

                {/* 4 Option Review */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem", marginBottom: "1rem" }}>
                  {[
                    { letter: "A", text: v?.optionA },
                    { letter: "B", text: v?.optionB },
                    { letter: "C", text: v?.optionC },
                    { letter: "D", text: v?.optionD },
                  ].map((opt) => {
                    const isUserChoice = userSelected === opt.letter;
                    const isRightChoice = v?.correctOption === opt.letter;

                    let bg = "#FFFFFF";
                    let border = "1px solid var(--color-border)";
                    if (isRightChoice) {
                      bg = "var(--color-success-bg)";
                      border = "1.5px solid var(--color-success)";
                    } else if (isUserChoice) {
                      bg = "var(--color-error-bg)";
                      border = "1.5px solid var(--color-error)";
                    }

                    return (
                      <div
                        key={opt.letter}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.6rem 0.85rem",
                          backgroundColor: bg,
                          border,
                          borderRadius: "var(--radius-md)",
                          fontSize: "0.9rem",
                        }}
                      >
                        <span style={{ fontWeight: 700, minWidth: "20px" }}>{opt.letter}.</span>
                        <span style={{ flexGrow: 1 }}>{opt.text}</span>
                        {isRightChoice && <span className="text-xs" style={{ color: "var(--color-success)", fontWeight: 700 }}>✓ Correct Key</span>}
                        {isUserChoice && !isRightChoice && <span className="text-xs" style={{ color: "var(--color-error)", fontWeight: 700 }}>✗ Your Answer</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div style={{ backgroundColor: "#FFFFFF", padding: "0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", fontSize: "0.875rem", lineHeight: "1.6" }}>
                  <strong style={{ color: "var(--color-primary)" }}>Verified Explanation: </strong>
                  {v?.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
