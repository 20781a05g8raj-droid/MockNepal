import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Layers } from "lucide-react";

interface StudentMockTestsPageProps {
  searchParams: Promise<{ view?: string; examId?: string }>;
}

export default async function StudentMockTestsPage({ searchParams }: StudentMockTestsPageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const { view, examId } = await searchParams;

  const profile = await db.studentProfile.findUnique({
    where: { userId: user.id },
    include: { targetExam: true },
  });

  const activeEntitlement = await db.entitlement.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      validUntil: { gt: new Date() },
    },
  });
  const isPremium = !!activeEntitlement;

  const targetExamId = profile?.targetExamId;
  const isViewAll = view === "all";

  // Where filter
  const filterExamId = isViewAll ? undefined : (examId || targetExamId);

  const mockTests = await db.mockTest.findMany({
    where: {
      status: "PUBLISHED",
      ...(filterExamId ? { examId: filterExamId } : {}),
    },
    include: {
      exam: true,
      attempts: {
        where: { userId: user.id },
        orderBy: { startedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Count total available across all
  const allTestsCount = await db.mockTest.count({ where: { status: "PUBLISHED" } });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Top Banner: Crimson / Rose */}
      <div
        className="card"
        style={{
          backgroundColor: "#FFF1F2",
          border: "2px solid #FECDD3",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 4px 14px rgba(225, 29, 72, 0.08)",
        }}
      >
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                style={{
                  backgroundColor: "#E11D48",
                  color: "#FFFFFF",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.25rem 0.65rem",
                  borderRadius: "var(--radius-full)",
                }}
              >
                ⏱️ Simulated Examinations • नमुना परीक्षा
              </span>
              {profile?.targetExam && !isViewAll && (
                <span
                  style={{
                    backgroundColor: "#FFE4E6",
                    color: "#9F1239",
                    border: "1px solid #FECDD3",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  🎯 {profile.targetExam.title}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: "1.55rem", color: "#881337", fontWeight: 800 }}>
              Official Model Mock Examinations
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#BE123C", marginTop: "0.3rem", maxWidth: "680px" }}>
              आधिकारिक पाठ्यक्रम बमोजिम समय सीमा, वास्तविक परीक्षा इन्टरफेस, र स्वतः २०% नेगेटिभ मार्किङ सहित पूर्ण नमुना परीक्षा दिनुहोस्।
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
              border: "1px solid #FECDD3",
              color: "#9F1239",
              fontWeight: 600,
            }}
          >
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>Exact 20% negative deduction model</span>
          </div>
        </div>

        {/* Course Filter Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            paddingTop: "1rem",
            marginTop: "1.25rem",
            borderTop: "1px solid #FECDD3",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9F1239", textTransform: "uppercase" }}>
            फिल्टर:
          </span>
          {profile?.targetExam && (
            <Link
              href="/student/mock-tests"
              style={{
                padding: "0.4rem 0.9rem",
                textDecoration: "none",
                fontSize: "0.825rem",
                fontWeight: 700,
                borderRadius: "var(--radius-full)",
                backgroundColor: !isViewAll ? "#E11D48" : "#FFFFFF",
                color: !isViewAll ? "#FFFFFF" : "#881337",
                border: !isViewAll ? "1px solid #E11D48" : "1px solid #FECDD3",
                boxShadow: !isViewAll ? "0 2px 6px rgba(225, 29, 72, 0.25)" : "none",
              }}
            >
              🎯 My Target Course ({!isViewAll ? mockTests.length : "Target"})
            </Link>
          )}
          <Link
            href="/student/mock-tests?view=all"
            style={{
              padding: "0.4rem 0.9rem",
              textDecoration: "none",
              fontSize: "0.825rem",
              fontWeight: 700,
              borderRadius: "var(--radius-full)",
              backgroundColor: isViewAll ? "#E11D48" : "#FFFFFF",
              color: isViewAll ? "#FFFFFF" : "#881337",
              border: isViewAll ? "1px solid #E11D48" : "1px solid #FECDD3",
              boxShadow: isViewAll ? "0 2px 6px rgba(225, 29, 72, 0.25)" : "none",
            }}
          >
            Browse All Courses ({allTestsCount})
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {mockTests.length === 0 ? (
          <div className="card text-center py-10">
            <Clock className="w-10 h-10 text-muted mx-auto mb-2 opacity-50" />
            <h3>No Mock Tests Available for this Filter</h3>
            <p className="text-xs text-muted mt-1">
              Switch to all courses to view other examinations or check back as instructors publish more sets.
            </p>
            <div className="mt-4">
              <Link href="/student/mock-tests?view=all" className="btn btn-secondary btn-sm">
                Browse All Course Mock Tests
              </Link>
            </div>
          </div>
        ) : (
          mockTests.map((test) => {
            const attempts = test.attempts;
            const bestScore = attempts.length > 0
              ? Math.max(...attempts.map((a) => a.score ?? 0))
              : null;
            const remainingAttempts = Math.max(0, test.attemptLimit - attempts.length);
            const hasInProgress = attempts.some((a) => a.status === "IN_PROGRESS");
            const isRestricted = test.accessLevel === "PREMIUM" && !isPremium;

            return (
              <div
                key={test.id}
                className="card card-hover flex flex-col justify-between"
                style={{
                  border: "1.5px solid #FECDD3",
                  borderLeft: "5px solid #E11D48",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 2px 8px rgba(225, 29, 72, 0.05)",
                }}
              >
                <div className="flex justify-between items-start flex-wrap gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        style={{
                          backgroundColor: "#FFE4E6",
                          color: "#9F1239",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "var(--radius-full)",
                        }}
                      >
                        {test.exam.title}
                      </span>
                      {test.accessLevel === "PREMIUM" ? (
                        <span
                          style={{
                            backgroundColor: "#FEF3C7",
                            color: "#92400E",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.6rem",
                            borderRadius: "var(--radius-full)",
                          }}
                        >
                          ⭐ Premium Series
                        </span>
                      ) : (
                        <span
                          style={{
                            backgroundColor: "#DCFCE7",
                            color: "#166534",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.6rem",
                            borderRadius: "var(--radius-full)",
                          }}
                        >
                          ✓ Open Model Test
                        </span>
                      )}
                      <span
                        style={{
                          backgroundColor: "#FFF1F2",
                          color: "#E11D48",
                          border: "1px solid #FECDD3",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "var(--radius-full)",
                        }}
                      >
                        -{test.negativePenaltyPercent}% Lok Sewa Penalty
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.25rem", color: "#881337", marginBottom: "0.35rem", fontWeight: 700 }}>
                      {test.title}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "#475569", maxWidth: "750px" }}>
                      {test.description}
                    </p>
                  </div>

                  <div className="text-right">
                    {bestScore !== null && (
                      <div style={{ marginBottom: "0.4rem" }}>
                        <div className="text-xs text-muted">Best Score (उत्कृष्ट अङ्क):</div>
                        <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#E11D48" }}>
                          {bestScore} marks
                        </div>
                      </div>
                    )}
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#9F1239",
                        backgroundColor: "#FFF1F2",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      Attempts: {attempts.length} / {test.attemptLimit}
                    </span>
                  </div>
                </div>

                {/* Exam specs strip */}
                <div
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    padding: "0.65rem 1rem",
                    backgroundColor: "#FFF1F2",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #FECDD3",
                    fontSize: "0.825rem",
                    color: "#881337",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span><strong>⏱️ Duration:</strong> {test.durationMinutes} mins</span>
                  <span><strong>❓ Total Questions:</strong> {test.totalQuestions} Qs</span>
                  <span><strong>➕ Marks:</strong> +{test.marksPerCorrect} each</span>
                  <span><strong>➖ Penalty:</strong> -{(test.marksPerCorrect * test.negativePenaltyPercent) / 100} per wrong</span>
                </div>

                {/* Action buttons & attempt links */}
                <div className="flex justify-between items-center flex-wrap gap-2 pt-2" style={{ borderTop: "1px solid #FFE4E6" }}>
                  <div>
                    {attempts.length > 0 ? (
                      <Link
                        href={`/student/mock-tests/${test.id}/results/${attempts[0].id}`}
                        className="text-xs hover:underline"
                        style={{ color: "#E11D48", fontWeight: 700 }}
                      >
                        View Most Recent Result ({new Date(attempts[0].startedAt).toLocaleDateString()}) &rarr;
                      </Link>
                    ) : (
                      <span className="text-xs text-muted">Not attempted yet (अहिलेसम्म नलिएको)</span>
                    )}
                  </div>

                  <div>
                    {isRestricted ? (
                      <Link href="/pricing" className="btn btn-secondary btn-sm">
                        Upgrade Pass to Unlock
                      </Link>
                    ) : remainingAttempts > 0 || hasInProgress ? (
                      <Link
                        href={`/student/mock-tests/${test.id}`}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: "#E11D48",
                          color: "#FFFFFF",
                          border: "none",
                          fontWeight: 700,
                          padding: "0.5rem 1.1rem",
                          boxShadow: "0 2px 8px rgba(225, 29, 72, 0.25)",
                        }}
                      >
                        <span>{hasInProgress ? "Resume Ongoing Test" : attempts.length > 0 ? "Retake Test" : "Start Mock Test"}</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    ) : (
                      <span className="badge badge-muted">Attempt Limit Reached</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
