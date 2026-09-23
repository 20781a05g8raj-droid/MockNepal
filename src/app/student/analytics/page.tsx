import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateTopicPerformance } from "@/lib/weaktopics";
import { getTodayNepalDateString } from "@/lib/nepal-date";
import StudyPlanGenerator from "./StudyPlanGenerator";
import { BarChart3, TrendingUp, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export default async function AnalyticsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const todayNepal = getTodayNepalDateString();

  // 1. Weak topics diagnostic
  const topicPerformance = await calculateTopicPerformance(user.id);

  // 2. Practice totals
  const allAttempts = await db.attemptAnswer.findMany({
    where: { session: { userId: user.id } },
  });
  const totalAttempted = allAttempts.length;
  const totalCorrect = allAttempts.filter((a) => a.isCorrect).length;
  const overallAccuracy = totalAttempted > 0
    ? Math.round((totalCorrect / totalAttempted) * 100)
    : null;

  // 3. Mock test history
  const mockAttempts = await db.testAttempt.findMany({
    where: { userId: user.id, status: { in: ["SUBMITTED", "TIMED_OUT"] } },
    include: { mockTest: true },
    orderBy: { submittedAt: "desc" },
  });

  // 4. Counts for study plan
  const dueRevisionsCount = await db.revisionItem.count({
    where: { userId: user.id, isMastered: false, nextRevisionDueNepalDate: { lte: todayNepal } },
  });

  const weakTopicsData = topicPerformance.map((t) => ({
    topicName: t.topicName,
    subjectName: t.subjectName,
    status: t.status,
    accuracy: t.accuracyPercent,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Top Banner: Amethyst Purple */}
      <div
        className="card"
        style={{
          backgroundColor: "#FAF5FF",
          border: "2px solid #E9D5FF",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 4px 14px rgba(124, 58, 237, 0.08)",
        }}
      >
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                style={{
                  backgroundColor: "#7C3AED",
                  color: "#FFFFFF",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.25rem 0.65rem",
                  borderRadius: "var(--radius-full)",
                }}
              >
                📊 Performance Diagnostics • नतिजा विश्लेषण
              </span>
              <span style={{ fontSize: "0.75rem", color: "#6B21A8", fontWeight: 600 }}>
                Transparent Thresholds (PRD 16.2)
              </span>
            </div>
            <h1 style={{ fontSize: "1.55rem", color: "#4C1D95", fontWeight: 800 }}>
              Academic Performance & Weak-Topic Analysis
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#6B21A8", marginTop: "0.3rem", maxWidth: "680px" }}>
              आधिकारिक वस्तुगत मूल्याङ्कन, कमजोर टपिक पहिचान, र नमुना परीक्षाको प्रगति ट्र्याक गर्नुहोस्। कुनै काल्पनिक डेटा विना वास्तविक तथ्याङ्क।
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8rem",
              backgroundColor: "#FFFFFF",
              padding: "0.5rem 0.85rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid #E9D5FF",
              color: "#6B21A8",
              fontWeight: 600,
            }}
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Deterministic Analysis • Zero AI Hallucination</span>
          </div>
        </div>
      </div>

      {/* Top Metric Strip: 4 Distinct Color Themes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {/* Metric 1: Royal Blue (Practice) */}
        <div
          style={{
            backgroundColor: "#EFF6FF",
            border: "1.5px solid #BFDBFE",
            borderRadius: "var(--radius-lg)",
            padding: "1.1rem 1.25rem",
            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.06)",
          }}
        >
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase" }}>
            Total Practice Questions
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#1E3A8A", marginTop: "0.25rem", lineHeight: 1.1 }}>
            {totalAttempted}
          </div>
          <span style={{ fontSize: "0.78rem", color: "#2563EB", fontWeight: 600 }}>{totalCorrect} correct answers</span>
        </div>

        {/* Metric 2: Accuracy (Dynamic Green/Amber/Red) */}
        <div
          style={{
            backgroundColor: overallAccuracy !== null && overallAccuracy >= 75 ? "#F0FDF4" : overallAccuracy !== null && overallAccuracy >= 50 ? "#FFFBEB" : "#FEF2F2",
            border: `1.5px solid ${overallAccuracy !== null && overallAccuracy >= 75 ? "#BBF7D0" : overallAccuracy !== null && overallAccuracy >= 50 ? "#FDE68A" : "#FECDD3"}`,
            borderRadius: "var(--radius-lg)",
            padding: "1.1rem 1.25rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: overallAccuracy !== null && overallAccuracy >= 75 ? "#15803D" : overallAccuracy !== null && overallAccuracy >= 50 ? "#B45309" : "#B91C1C",
              textTransform: "uppercase",
            }}
          >
            Practice Accuracy
          </span>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: overallAccuracy !== null && overallAccuracy >= 75 ? "#166534" : overallAccuracy !== null && overallAccuracy >= 50 ? "#92400E" : "#991B1B",
              marginTop: "0.25rem",
              lineHeight: 1.1,
            }}
          >
            {overallAccuracy !== null ? `${overallAccuracy}%` : "N/A"}
          </div>
          <span
            style={{
              fontSize: "0.78rem",
              color: overallAccuracy !== null && overallAccuracy >= 75 ? "#16A34A" : overallAccuracy !== null && overallAccuracy >= 50 ? "#D97706" : "#DC2626",
              fontWeight: 600,
            }}
          >
            Across all practice sets
          </span>
        </div>

        {/* Metric 3: Rose/Crimson (Mock Exams) */}
        <div
          style={{
            backgroundColor: "#FFF1F2",
            border: "1.5px solid #FECDD3",
            borderRadius: "var(--radius-lg)",
            padding: "1.1rem 1.25rem",
            boxShadow: "0 2px 8px rgba(225, 29, 72, 0.06)",
          }}
        >
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#BE123C", textTransform: "uppercase" }}>
            Mock Exams Completed
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#881337", marginTop: "0.25rem", lineHeight: 1.1 }}>
            {mockAttempts.length}
          </div>
          <span style={{ fontSize: "0.78rem", color: "#E11D48", fontWeight: 600 }}>Under Lok Sewa timing rules</span>
        </div>

        {/* Metric 4: Warm Amber (Due Mistakes) */}
        <div
          style={{
            backgroundColor: "#FFFBEB",
            border: "1.5px solid #FDE68A",
            borderRadius: "var(--radius-lg)",
            padding: "1.1rem 1.25rem",
            boxShadow: "0 2px 8px rgba(217, 119, 6, 0.06)",
          }}
        >
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#B45309", textTransform: "uppercase" }}>
            Mistakes Due for Review
          </span>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: dueRevisionsCount > 0 ? "#B45309" : "#15803D",
              marginTop: "0.25rem",
              lineHeight: 1.1,
            }}
          >
            {dueRevisionsCount}
          </div>
          <span style={{ fontSize: "0.78rem", color: dueRevisionsCount > 0 ? "#D97706" : "#16A34A", fontWeight: 600 }}>
            {dueRevisionsCount > 0 ? "Requires revision today" : "All mistakes caught up"}
          </span>
        </div>
      </div>

      {/* Weak Topic Threshold Diagnostics (PRD Section 16.2) */}
      <div
        className="card"
        style={{
          border: "1.5px solid #E9D5FF",
          boxShadow: "0 4px 14px rgba(124, 58, 237, 0.05)",
        }}
      >
        <div className="card-header" style={{ borderBottom: "1px solid #F3E8FF", paddingBottom: "1rem" }}>
          <div>
            <h3 className="card-title" style={{ color: "#4C1D95", fontSize: "1.2rem" }}>
              Syllabus Topic Diagnostic Heatmap (कमजोर टपिक पहिचान)
            </h3>
            <p className="card-subtitle">
              Strict rules: &lt;10 questions = Insufficient Data, &lt;50% = Needs Improvement (सुधार आवश्यक), 50-74% = Developing (मध्यम), &ge;75% = Strong (मजबुत)।
            </p>
          </div>
          <span
            style={{
              backgroundColor: "#F3E8FF",
              color: "#6B21A8",
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.25rem 0.65rem",
              borderRadius: "var(--radius-full)",
              border: "1px solid #E9D5FF",
            }}
          >
            {topicPerformance.length} Topics Evaluated
          </span>
        </div>

        {topicPerformance.length === 0 ? (
          <div className="text-center py-6 text-muted text-sm">
            No topic practice data recorded yet. Complete at least 10 questions in a topic to establish performance benchmarks.
          </div>
        ) : (
          <div className="table-container mt-2">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Topic Name</th>
                  <th>Subject</th>
                  <th>Questions Attempted</th>
                  <th>Accuracy</th>
                  <th>Classification (PRD 16.2)</th>
                </tr>
              </thead>
              <tbody>
                {topicPerformance.map((tp) => (
                  <tr key={tp.topicId}>
                    <td><strong>{tp.topicName}</strong></td>
                    <td className="text-muted text-sm">{tp.subjectName}</td>
                    <td>{tp.totalAttempts} ({tp.correctAnswers} correct)</td>
                    <td>
                      {tp.accuracyPercent !== null ? (
                        <strong>{tp.accuracyPercent}%</strong>
                      ) : (
                        <span className="text-muted text-xs">&mdash;</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          tp.status === "STRONG"
                            ? "badge-success"
                            : tp.status === "DEVELOPING"
                            ? "badge-intermediate"
                            : tp.status === "NEEDS_IMPROVEMENT"
                            ? "badge-hard"
                            : "badge-muted"
                        }`}
                      >
                        {tp.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rule-Based Study Plan Generator */}
      <StudyPlanGenerator
        weakTopics={weakTopicsData}
        unfinishedTopicsCount={Math.max(1, 10 - topicPerformance.length)}
        revisionDueCount={dueRevisionsCount}
      />
    </div>
  );
}
