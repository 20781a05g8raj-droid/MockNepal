import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Layers, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import SetTargetExamButton from "./SetTargetExamButton";

export default async function StudentExamsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await db.studentProfile.findUnique({
    where: { userId: user.id },
  });

  const categories = await db.examCategory.findMany({
    include: {
      exams: {
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
          _count: { select: { questionExams: true, mockTests: true } },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Top Banner: Ocean Cyan / Teal */}
      <div
        className="card"
        style={{
          backgroundColor: "#F0FDFA",
          border: "2px solid #99F6E4",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 4px 14px rgba(13, 148, 136, 0.08)",
        }}
      >
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                style={{
                  backgroundColor: "#0D9488",
                  color: "#FFFFFF",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.25rem 0.65rem",
                  borderRadius: "var(--radius-full)",
                }}
              >
                🗺️ Curriculum Tracks • पाठ्यक्रम
              </span>
              <span style={{ fontSize: "0.75rem", color: "#0F766E", fontWeight: 600 }}>
                Official Commission & Council Syllabi
              </span>
            </div>
            <h1 style={{ fontSize: "1.55rem", color: "#134E4A", fontWeight: 800 }}>
              Syllabus Explorer & Enrolled Course Tracks
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#0F766E", marginTop: "0.3rem", maxWidth: "680px" }}>
              आधिकारिक पाठ्यक्रमका विषय तथा टपिकहरू हेर्नुहोस्, आफ्नो मुख्य लक्ष्य परीक्षा (Target Course) परिवर्तन गर्नुहोस्, र सम्पूर्ण स्रोतहरू एकै ठाउँबाट अध्ययन गर्नुहोस्।
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {categories.map((cat, idx) => {
          const catColors = [
            { border: "#BFDBFE", bg: "#EFF6FF", text: "#1E40AF", badge: "#2563EB" },
            { border: "#FECDD3", bg: "#FFF1F2", text: "#9F1239", badge: "#E11D48" },
            { border: "#BBF7D0", bg: "#F0FDF4", text: "#166534", badge: "#16A34A" },
          ];
          const colorTheme = catColors[idx % catColors.length];

          return (
            <div key={cat.id}>
              <div
                className="flex items-center gap-2 mb-3 pb-2"
                style={{
                  borderBottom: `2px solid ${colorTheme.border}`,
                }}
              >
                <span
                  style={{
                    backgroundColor: colorTheme.bg,
                    color: colorTheme.text,
                    padding: "0.25rem 0.6rem",
                    borderRadius: "6px",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                  }}
                >
                  {cat.code}
                </span>
                <h2 style={{ fontSize: "1.3rem", color: colorTheme.text, fontWeight: 700 }}>
                  {cat.name}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {cat.exams.map((exam) => {
                  const isSelected = profile?.targetExamId === exam.id;
                  const syllabus = exam.syllabi[0];
                  const subjects = syllabus?.subjects || [];
                  const topicsCount = subjects.reduce((a, s) => a + s.topics.length, 0);

                  return (
                    <div
                      key={exam.id}
                      className="card flex flex-col justify-between"
                      style={{
                        border: isSelected ? "2px solid #0D9488" : "1.5px solid #E2E8F0",
                        borderTop: isSelected ? "5px solid #0D9488" : `4px solid ${colorTheme.badge}`,
                        backgroundColor: isSelected ? "#F0FDFA" : "#FFFFFF",
                        boxShadow: isSelected ? "0 4px 12px rgba(13, 148, 136, 0.12)" : "0 2px 6px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span
                            style={{
                              backgroundColor: colorTheme.bg,
                              color: colorTheme.text,
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              padding: "0.15rem 0.5rem",
                              borderRadius: "4px",
                            }}
                          >
                            {cat.code}
                          </span>
                          {isSelected && (
                            <span
                              style={{
                                backgroundColor: "#0D9488",
                                color: "#FFFFFF",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                padding: "0.2rem 0.6rem",
                                borderRadius: "var(--radius-full)",
                              }}
                            >
                              🎯 Current Target Course
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: isSelected ? "#115E59" : "var(--color-text)", marginBottom: "0.4rem" }}>
                          {exam.title}
                        </h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                          {exam.description}
                        </p>

                        <div
                          className="text-xs mb-4 flex justify-between"
                          style={{
                            borderTop: "1px dashed var(--color-border)",
                            paddingTop: "0.6rem",
                            color: isSelected ? "#0F766E" : "var(--color-text-muted)",
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        >
                          <span>{subjects.length} Subjects • {topicsCount} Topics</span>
                          <span>{exam._count.questionExams} MCQs • {exam._count.mockTests} Mock Tests</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/student/exams/${exam.id}`}
                          className="btn btn-sm btn-full"
                          style={{
                            backgroundColor: isSelected ? "#0D9488" : "#F8FAFC",
                            color: isSelected ? "#FFFFFF" : "var(--color-text)",
                            border: isSelected ? "none" : "1px solid var(--color-border)",
                            fontWeight: 700,
                          }}
                        >
                          <span>View Syllabus Topics</span>
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>

                        {!isSelected && (
                          <SetTargetExamButton examId={exam.id} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
