import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTodayNepalDateString } from "@/lib/nepal-date";
import { RotateCcw, CheckCircle2, Clock, Play, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

interface MistakePageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function MistakeNotebookPage({ searchParams }: MistakePageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const { filter } = await searchParams;
  const todayNepal = getTodayNepalDateString();

  const allRevisionItems = await db.revisionItem.findMany({
    where: { userId: user.id },
    include: {
      question: {
        include: {
          subject: true,
          topic: true,
          versions: { orderBy: { versionNumber: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { lastAttemptedAt: "desc" },
  });

  const dueItems = allRevisionItems.filter(
    (i) => !i.isMastered && i.nextRevisionDueNepalDate <= todayNepal
  );
  const scheduledItems = allRevisionItems.filter(
    (i) => !i.isMastered && i.nextRevisionDueNepalDate > todayNepal
  );
  const masteredItems = allRevisionItems.filter((i) => i.isMastered);

  let displayedItems = allRevisionItems;
  if (filter === "DUE") {
    displayedItems = dueItems;
  } else if (filter === "SCHEDULED") {
    displayedItems = scheduledItems;
  } else if (filter === "MASTERED") {
    displayedItems = masteredItems;
  }

  const STAGE_LABELS: Record<number, string> = {
    1: "Stage 1 (1 Day)",
    2: "Stage 2 (3 Days)",
    3: "Stage 3 (7 Days)",
    4: "Stage 4 (14 Days)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Top Banner: Warm Amber */}
      <div
        className="card"
        style={{
          backgroundColor: "#FFFBEB",
          border: "2px solid #FDE68A",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 4px 14px rgba(217, 119, 6, 0.08)",
        }}
      >
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                style={{
                  backgroundColor: "#D97706",
                  color: "#FFFFFF",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.25rem 0.65rem",
                  borderRadius: "var(--radius-full)",
                }}
              >
                🔄 Spaced Repetition • गल्ती पुस्तिका
              </span>
              <span style={{ fontSize: "0.75rem", color: "#B45309", fontWeight: 600 }}>
                4-Stage Interval Algorithm
              </span>
            </div>
            <h1 style={{ fontSize: "1.55rem", color: "#78350F", fontWeight: 800 }}>
              Smart Mistake Revision Notebook
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#92400E", marginTop: "0.3rem", maxWidth: "680px" }}>
              अभ्यास वा नमुना परीक्षामा बिग्रिएका सबै प्रश्नहरू वैज्ञानिक ४-चरण अन्तराल (१ दिन &rarr; ३ दिन &rarr; ७ दिन &rarr; १४ दिन) मा रिभिजनका लागि स्वतः तालिकाबद्ध हुन्छन्।
            </p>
          </div>

          <div className="flex gap-3">
            {dueItems.length > 0 ? (
              <Link
                href="/student/mistakes/revision"
                className="btn btn-sm"
                style={{
                  backgroundColor: "#D97706",
                  color: "#FFFFFF",
                  border: "none",
                  fontWeight: 700,
                  padding: "0.6rem 1.25rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 8px rgba(217, 119, 6, 0.3)",
                }}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start Due Revision ({dueItems.length} Due Today)</span>
              </Link>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.85rem",
                  color: "#15803D",
                  backgroundColor: "#DCFCE7",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid #86EFAC",
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No items due today (सबै रिभिजन पूरा भयो)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spaced Repetition 4-Stage Visual Milestones (PRD Section 15) */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1.5px solid #FDE68A",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <strong style={{ fontSize: "0.95rem", color: "#78350F" }}>
            ४-चरण वैज्ञानिक रिभिजन चक्र (4-Stage Revision Lifecycle):
          </strong>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {/* Stage 1 */}
          <div style={{ padding: "0.75rem", background: "#FFF7ED", borderRadius: "var(--radius-md)", border: "1.5px solid #FDBA74" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#C2410C", textTransform: "uppercase" }}>Stage 1 • चरण १</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#9A3412", marginTop: "2px" }}>१ दिन पछि (1 Day)</div>
            <div style={{ fontSize: "0.75rem", color: "#7C2D12", marginTop: "4px" }}>पहिलो पटक बिग्रिएपछि तत्काल तालिकाबद्ध</div>
          </div>

          {/* Stage 2 */}
          <div style={{ padding: "0.75rem", background: "#FFFBEB", borderRadius: "var(--radius-md)", border: "1.5px solid #FCD34D" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#B45309", textTransform: "uppercase" }}>Stage 2 • चरण २</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#92400E", marginTop: "2px" }}>३ दिन पछि (3 Days)</div>
            <div style={{ fontSize: "0.75rem", color: "#78350F", marginTop: "4px" }}>पहिलो सफल रिभिजन पछि स्थानान्तरण</div>
          </div>

          {/* Stage 3 */}
          <div style={{ padding: "0.75rem", background: "#F0F9FF", borderRadius: "var(--radius-md)", border: "1.5px solid #7DD3FC" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0369A1", textTransform: "uppercase" }}>Stage 3 • चरण ३</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#075985", marginTop: "2px" }}>७ दिन पछि (7 Days)</div>
            <div style={{ fontSize: "0.75rem", color: "#0C4A6E", marginTop: "4px" }}>दीर्घकालीन स्मरण सुदृढीकरण चरण</div>
          </div>

          {/* Stage 4 */}
          <div style={{ padding: "0.75rem", background: "#F0FDF4", borderRadius: "var(--radius-md)", border: "1.5px solid #86EFAC" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#15803D", textTransform: "uppercase" }}>Stage 4 • पूर्ण दक्षता</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#166534", marginTop: "2px" }}>१४ दिन पछि (14 Days)</div>
            <div style={{ fontSize: "0.75rem", color: "#14532D", marginTop: "4px" }}>सफल भएपछि सधैंका लागि Mastered घोषित</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap" style={{ borderBottom: "2px solid #FDE68A", paddingBottom: "0.75rem" }}>
        <Link
          href="/student/mistakes"
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.825rem",
            fontWeight: 700,
            textDecoration: "none",
            backgroundColor: !filter ? "#D97706" : "#FFFFFF",
            color: !filter ? "#FFFFFF" : "#78350F",
            border: !filter ? "1px solid #D97706" : "1px solid #FDE68A",
          }}
        >
          All Items ({allRevisionItems.length})
        </Link>
        <Link
          href="/student/mistakes?filter=DUE"
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.825rem",
            fontWeight: 700,
            textDecoration: "none",
            backgroundColor: filter === "DUE" ? "#D97706" : "#FFFFFF",
            color: filter === "DUE" ? "#FFFFFF" : "#78350F",
            border: filter === "DUE" ? "1px solid #D97706" : "1px solid #FDE68A",
          }}
        >
          Due Today ({dueItems.length})
        </Link>
        <Link
          href="/student/mistakes?filter=SCHEDULED"
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.825rem",
            fontWeight: 700,
            textDecoration: "none",
            backgroundColor: filter === "SCHEDULED" ? "#D97706" : "#FFFFFF",
            color: filter === "SCHEDULED" ? "#FFFFFF" : "#78350F",
            border: filter === "SCHEDULED" ? "1px solid #D97706" : "1px solid #FDE68A",
          }}
        >
          Future Scheduled ({scheduledItems.length})
        </Link>
        <Link
          href="/student/mistakes?filter=MASTERED"
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.825rem",
            fontWeight: 700,
            textDecoration: "none",
            backgroundColor: filter === "MASTERED" ? "#D97706" : "#FFFFFF",
            color: filter === "MASTERED" ? "#FFFFFF" : "#78350F",
            border: filter === "MASTERED" ? "1px solid #D97706" : "1px solid #FDE68A",
          }}
        >
          Mastered ({masteredItems.length})
        </Link>
      </div>

      {/* Mistakes List */}
      {displayedItems.length === 0 ? (
        <div className="card text-center" style={{ padding: "3rem" }}>
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h3>No Mistake Items in this Category</h3>
          <p className="text-muted text-sm mt-1">
            Questions you get incorrect during practice or mock tests will automatically appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {displayedItems.map((item) => {
            const q = item.question;
            const v = q.versions[0];
            const isDueNow = !item.isMastered && item.nextRevisionDueNepalDate <= todayNepal;

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  borderLeft: isDueNow
                    ? "4px solid var(--color-warning)"
                    : item.isMastered
                    ? "4px solid var(--color-success)"
                    : "4px solid var(--color-border)",
                }}
              >
                <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary">{q.subject.name}</span>
                    <span className="text-xs text-muted">{q.topic.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.isMastered ? (
                      <span className="badge badge-success">Mastered (Completed Stage 4)</span>
                    ) : isDueNow ? (
                      <span className="badge badge-intermediate">Due for Review Today</span>
                    ) : (
                      <span className="badge badge-muted">
                        Due: {item.nextRevisionDueNepalDate}
                      </span>
                    )}

                    <span className="badge badge-muted">
                      {STAGE_LABELS[item.stage] || `Stage ${item.stage}`}
                    </span>
                  </div>
                </div>

                <p style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--color-text)", marginBottom: "0.75rem" }}>
                  {v?.questionText}
                </p>

                <div style={{ backgroundColor: "#F8FAFC", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span>Correct Option: <strong>Option {v?.correctOption}</strong></span>
                    <span>Incorrect Attempts: <strong>{item.incorrectCount}</strong></span>
                  </div>
                  <div style={{ color: "var(--color-text-subheading)", lineHeight: "1.5" }}>
                    <strong>Explanation:</strong> {v?.explanation}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-muted">
                  <span>Last Attempted: {new Date(item.lastAttemptedAt).toLocaleDateString()}</span>
                  {isDueNow && (
                    <Link
                      href="/student/mistakes/revision"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "0.2rem 0.6rem" }}
                    >
                      Revise Now &rarr;
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
