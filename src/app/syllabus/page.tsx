import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import {
  FileText,
  Download,
  BookOpen,
  Upload,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Award
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SyllabusPage() {
  const user = await getSessionUser();

  // Fetch all exams with active syllabi and subjects
  let exams: any[] = [];
  try {
    exams = await db.exam.findMany({
      where: { isActive: true },
      include: {
        category: true,
        syllabi: {
          include: {
            subjects: {
              include: {
                topics: true,
                _count: { select: { questions: true } },
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });
  } catch (err) {
    console.error("Error fetching exams for syllabus:", err);
  }

  return (
    <div style={{ backgroundColor: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PublicNav user={user} />

      <main style={{ flexGrow: 1, padding: "2.5rem 1rem 4rem" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
          {/* Header Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0369A1 100%)",
              borderRadius: "16px",
              padding: "2.5rem 2rem",
              color: "#FFFFFF",
              marginBottom: "2.5rem",
              boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.2)",
            }}
          >
            <div style={{ maxWidth: "800px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(8px)",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "999px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                <Layers className="w-4 h-4 text-sky-300" />
                <span>आधिकारिक पाठ्यक्रम तथा ढाँचा (Official Syllabi)</span>
              </div>

              <h1 style={{ fontSize: "2.2rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "0.75rem" }}>
                नेपाल सरकारी तथा प्राविधिक परीक्षा पाठ्यक्रम (Syllabus)
              </h1>
              <p style={{ fontSize: "1rem", color: "#BAE6FD", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                लोक सेवा आयोग, शिक्षक सेवा आयोग, नेपाल इन्जिनियरिङ काउन्सिल तथा बैंकिङ परीक्षाका नवीनतम र आधिकारिक पाठ्यक्रमहरू हेर्नुहोस् र डाउनलोड गर्नुहोस्।
              </p>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link
                  href="/notes"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "#0284C7",
                    color: "#FFFFFF",
                    padding: "0.65rem 1.25rem",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                  }}
                >
                  <FileText className="w-4 h-4" />
                  <span>अध्ययन नोट तथा PDF हरू (Study Notes)</span>
                </Link>

                <Link
                  href="/admin/notes"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    padding: "0.65rem 1.25rem",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    textDecoration: "none",
                  }}
                >
                  <Upload className="w-4 h-4 text-sky-200" />
                  <span>नयाँ नोट वा पाठ्यक्रम PDF अपलोड गर्नुहोस्</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Syllabi List by Exam */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {exams.map((exam) => {
              const activeSyllabus = exam.syllabi?.[0];
              const subjects = activeSyllabus?.subjects || [];
              const totalQ = subjects.reduce((acc: number, s: any) => acc + (s._count?.questions || 0), 0);

              return (
                <div
                  key={exam.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "14px",
                    border: "1px solid #E2E8F0",
                    padding: "1.75rem",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  {/* Exam Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "1rem",
                      borderBottom: "1px solid #F1F5F9",
                      paddingBottom: "1rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#0284C7",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {exam.category?.name || "Competitive Exam"}
                      </div>
                      <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                        {exam.title}
                      </h2>
                      {exam.description && (
                        <p style={{ fontSize: "0.88rem", color: "#64748B", marginTop: "0.35rem" }}>
                          {exam.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          backgroundColor: "#F1F5F9",
                          color: "#334155",
                          padding: "0.35rem 0.75rem",
                          borderRadius: "6px",
                        }}
                      >
                        {subjects.length} विषयहरू • {totalQ} प्रश्नहरू
                      </span>

                      <Link
                        href={`/mcqs?cat=${exam.category?.code}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          backgroundColor: "#0284C7",
                          color: "#FFFFFF",
                          padding: "0.4rem 0.85rem",
                          borderRadius: "6px",
                          textDecoration: "none",
                        }}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>यस परीक्षाका प्रश्नहरू</span>
                      </Link>
                    </div>
                  </div>

                  {/* Subjects Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {subjects.map((sub: any) => (
                      <div
                        key={sub.id}
                        style={{
                          backgroundColor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          borderRadius: "10px",
                          padding: "1rem",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                color: "#0369A1",
                                backgroundColor: "#E0F2FE",
                                padding: "0.15rem 0.5rem",
                                borderRadius: "4px",
                              }}
                            >
                              विषय कोड: {sub.code}
                            </span>
                            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B" }}>
                              {sub._count?.questions || 0} MCQs
                            </span>
                          </div>

                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1E293B", marginBottom: "0.4rem" }}>
                            {sub.name}
                          </h3>

                          {/* Sub Topics list */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.85rem" }}>
                            {sub.topics?.slice(0, 3).map((t: any) => (
                              <span
                                key={t.id}
                                style={{
                                  fontSize: "0.72rem",
                                  backgroundColor: "#FFFFFF",
                                  border: "1px solid #CBD5E1",
                                  color: "#475569",
                                  padding: "0.15rem 0.45rem",
                                  borderRadius: "4px",
                                }}
                              >
                                {t.name}
                              </span>
                            ))}
                            {(sub.topics?.length || 0) > 3 && (
                              <span style={{ fontSize: "0.72rem", color: "#64748B", alignSelf: "center" }}>
                                +{(sub.topics?.length || 0) - 3} थप अध्याय
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                          <Link
                            href={`/mcqs?subjectId=${sub.id}`}
                            style={{
                              flex: 1,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.35rem",
                              backgroundColor: "#0284C7",
                              color: "#FFFFFF",
                              padding: "0.45rem 0.75rem",
                              borderRadius: "6px",
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              textDecoration: "none",
                              textAlign: "center",
                            }}
                          >
                            <span>यस विषयको MCQ खोल्नुहोस्</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/notes?subjectId=${sub.id}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #CBD5E1",
                              color: "#334155",
                              padding: "0.45rem 0.65rem",
                              borderRadius: "6px",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                            title="यस विषयका नोटहरू हेर्नुहोस्"
                          >
                            <FileText className="w-3.5 h-3.5 text-sky-600" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
