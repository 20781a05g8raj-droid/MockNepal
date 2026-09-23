import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import PracticeSetupForm from "./PracticeSetupForm";

interface PracticeSetupPageProps {
  searchParams: Promise<{
    examId?: string;
    subjectId?: string;
    topicId?: string;
  }>;
}

export default async function PracticePage({ searchParams }: PracticeSetupPageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const { examId, subjectId, topicId } = await searchParams;

  const profile = await db.studentProfile.findUnique({
    where: { userId: user.id },
  });

  const activeEntitlement = await db.entitlement.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      validUntil: { gt: new Date() },
    },
  });

  const exams = await db.exam.findMany({
    where: { isActive: true },
    include: {
      syllabi: {
        include: {
          subjects: {
            include: {
              topics: true,
            },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  const formattedExams = exams.map((e) => ({
    id: e.id,
    title: e.title,
    subjects: e.syllabi[0]?.subjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      topics: s.topics.map((t) => ({ id: t.id, name: t.name, code: t.code })),
    })) || [],
  }));

  let resolvedExamId = examId;
  if (!resolvedExamId && subjectId) {
    const foundExam = formattedExams.find((e) => e.subjects.some((s) => s.id === subjectId));
    if (foundExam) resolvedExamId = foundExam.id;
  }
  const initialExamId = resolvedExamId || profile?.targetExamId || formattedExams[0]?.id;

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Signature Banner: Royal Blue */}
      <div
        className="card"
        style={{
          backgroundColor: "#F0F7FF",
          border: "2px solid #BFDBFE",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 4px 14px rgba(37, 99, 235, 0.08)",
        }}
      >
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                style={{
                  backgroundColor: "#2563EB",
                  color: "#FFFFFF",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.25rem 0.65rem",
                  borderRadius: "var(--radius-full)",
                }}
              >
                🎯 Practice Drills • दैनिक अभ्यास
              </span>
              <span style={{ fontSize: "0.75rem", color: "#1D4ED8", fontWeight: 600 }}>
                Server Verified & Immediate Feedback
              </span>
            </div>
            <h1 style={{ fontSize: "1.55rem", color: "#1E3A8A", fontWeight: 800 }}>
              Custom MCQ Practice Session
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#3B82F6", marginTop: "0.3rem", maxWidth: "620px" }}>
              आफ्नो पाठ्यक्रम, विषय र कठिनाइ स्तर छानेर तत्काल नतिजा र व्याख्या सहित अभ्यास गर्नुहोस्। प्रत्येक गल्ती स्वतः रिभिजन नोटबुकमा दर्ता हुन्छ।
            </p>
          </div>
        </div>
      </div>

      <PracticeSetupForm
        exams={formattedExams}
        defaultExamId={initialExamId}
        defaultSubjectId={subjectId}
        defaultTopicId={topicId}
        isPremium={!!activeEntitlement}
      />
    </div>
  );
}
