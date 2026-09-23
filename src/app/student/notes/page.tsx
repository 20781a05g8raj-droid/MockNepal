import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  BookOpen,
  FileText,
  CheckCircle2,
  Play,
  ExternalLink,
  Download,
  FileCheck,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface NotesPageProps {
  searchParams: Promise<{
    topicId?: string;
    noteId?: string;
    subjectId?: string;
    format?: string;
  }>;
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const { topicId, noteId, subjectId, format } = await searchParams;

  // Fetch Student Profile & Target Exam to ensure course isolation
  const profile = await db.studentProfile.findUnique({
    where: { userId: user.id },
    include: {
      targetExam: {
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
      },
    },
  });

  const targetExam = profile?.targetExam;
  const courseSubjects = targetExam?.syllabi[0]?.subjects || [];

  // Construct strict where clause isolated to target exam
  const whereClause: any = {
    status: "PUBLISHED",
  };

  if (targetExam) {
    whereClause.topic = {
      subject: {
        syllabusVersion: {
          examId: targetExam.id,
        },
      },
    };
  }

  if (subjectId) {
    whereClause.topic = {
      ...whereClause.topic,
      subjectId: subjectId,
    };
  }

  if (topicId) {
    whereClause.topicId = topicId;
  }

  if (format && (format === "PDF" || format === "ARTICLE")) {
    whereClause.noteType = format;
  }

  const notes = await db.note.findMany({
    where: whereClause,
    include: {
      topic: {
        include: {
          subject: true,
          _count: { select: { questions: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const activeNote = noteId
    ? notes.find((n) => n.id === noteId) || notes[0]
    : notes[0];

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Banner with Active Course Context: Royal Violet / Indigo */}
      <div
        className="card"
        style={{
          backgroundColor: "#EEF2FF",
          border: "2px solid #C7D2FE",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 4px 14px rgba(79, 70, 229, 0.08)",
        }}
      >
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                style={{
                  backgroundColor: "#4F46E5",
                  color: "#FFFFFF",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.25rem 0.65rem",
                  borderRadius: "var(--radius-full)",
                }}
              >
                📚 Study Materials • अध्ययन सामग्री
              </span>
              {targetExam && (
                <span
                  style={{
                    backgroundColor: "#E0E7FF",
                    color: "#3730A3",
                    border: "1px solid #C7D2FE",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  🎯 {targetExam.title}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: "1.55rem", color: "#312E81", fontWeight: 800 }}>
              Curated Study Notes & PDF Handbooks
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#4338CA", marginTop: "0.3rem", maxWidth: "680px" }}>
              आधिकारिक पाठ्यक्रम अनुसारका विस्तृत नोट्स, ऐन-कानुन, र PDF पुस्तिका अध्ययन गर्नुहोस्। प्रत्येक टपिकसँग प्रत्यक्ष जोडिएका MCQs अभ्यास गर्नुहोस्।
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/student/exams"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#FFFFFF",
                color: "#4338CA",
                border: "1px solid #C7D2FE",
                padding: "0.5rem 0.9rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.825rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <Layers className="w-4 h-4" />
              <span>View Full Syllabus</span>
            </Link>
          </div>
        </div>

        {/* Subject Filter Pills */}
        {courseSubjects.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              overflowX: "auto",
              paddingTop: "1rem",
              marginTop: "1.25rem",
              borderTop: "1px solid #C7D2FE",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#3730A3", textTransform: "uppercase" }}>
              विषय अनुसार:
            </span>
            <Link
              href={`/student/notes${format ? `?format=${format}` : ""}`}
              style={{
                padding: "0.35rem 0.8rem",
                textDecoration: "none",
                fontSize: "0.8rem",
                fontWeight: !subjectId ? 700 : 500,
                borderRadius: "var(--radius-full)",
                backgroundColor: !subjectId ? "#4F46E5" : "#FFFFFF",
                color: !subjectId ? "#FFFFFF" : "#3730A3",
                border: !subjectId ? "1px solid #4F46E5" : "1px solid #C7D2FE",
              }}
            >
              All Subjects ({courseSubjects.length})
            </Link>
            {courseSubjects.map((s) => {
              const isSubSelected = subjectId === s.id;
              return (
                <Link
                  key={s.id}
                  href={`/student/notes?subjectId=${s.id}${format ? `&format=${format}` : ""}`}
                  style={{
                    padding: "0.35rem 0.8rem",
                    textDecoration: "none",
                    fontSize: "0.8rem",
                    fontWeight: isSubSelected ? 700 : 500,
                    borderRadius: "var(--radius-full)",
                    backgroundColor: isSubSelected ? "#4F46E5" : "#FFFFFF",
                    color: isSubSelected ? "#FFFFFF" : "#3730A3",
                    border: isSubSelected ? "1px solid #4F46E5" : "1px solid #C7D2FE",
                  }}
                >
                  {s.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="notes-grid">
        {/* Left Side: Notes List */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div className="flex justify-between items-center mb-3">
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              Notes ({notes.length})
            </h3>

            {/* Format toggle: All, PDF, Article */}
            <div className="flex gap-1">
              <Link
                href={`/student/notes?${subjectId ? `subjectId=${subjectId}&` : ""}format=PDF`}
                className={`badge ${format === "PDF" ? "badge-accent" : "badge-muted"}`}
                style={{ fontSize: "0.7rem", textDecoration: "none" }}
                title="Filter PDF Notes only"
              >
                PDF
              </Link>
              <Link
                href={`/student/notes?${subjectId ? `subjectId=${subjectId}&` : ""}format=ARTICLE`}
                className={`badge ${format === "ARTICLE" ? "badge-primary" : "badge-muted"}`}
                style={{ fontSize: "0.7rem", textDecoration: "none" }}
                title="Filter Articles only"
              >
                Article
              </Link>
              {format && (
                <Link
                  href={`/student/notes${subjectId ? `?subjectId=${subjectId}` : ""}`}
                  className="badge badge-muted"
                  style={{ fontSize: "0.7rem", textDecoration: "none" }}
                  title="Clear format filter"
                >
                  Clear
                </Link>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {notes.length === 0 ? (
              <div className="text-center py-6 text-muted text-xs">
                No study notes available for the selected subject.
              </div>
            ) : (
              notes.map((n) => {
                const isSelected = activeNote?.id === n.id;
                return (
                  <Link
                    key={n.id}
                    href={`/student/notes?noteId=${n.id}${subjectId ? `&subjectId=${subjectId}` : ""}${topicId ? `&topicId=${topicId}` : ""}${format ? `&format=${format}` : ""}`}
                    style={{
                      display: "block",
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: isSelected ? "#EEF2FF" : "#FFFFFF",
                      border: isSelected ? "2px solid #6366F1" : "1px solid #E2E8F0",
                      borderLeft: isSelected ? "4px solid #4F46E5" : undefined,
                      textDecoration: "none",
                      transition: "all var(--transition-fast)",
                      boxShadow: isSelected ? "0 2px 8px rgba(79, 70, 229, 0.12)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {n.noteType === "PDF" ? (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: "#FEE2E2",
                            color: "#DC2626",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "0.15rem 0.45rem",
                            border: "1px solid #FECDD3",
                          }}
                        >
                          📄 PDF {n.fileSizeBytes ? `(${formatFileSize(n.fileSizeBytes)})` : ""}
                        </span>
                      ) : (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: "#EEF2FF",
                            color: "#4338CA",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "0.15rem 0.45rem",
                            border: "1px solid #C7D2FE",
                          }}
                        >
                          📝 Article
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        color: isSelected ? "#312E81" : "var(--color-text)",
                        lineHeight: "1.3",
                      }}
                    >
                      {n.title}
                    </div>
                    <div className="text-xs text-muted mt-1.5 flex justify-between">
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
                        {n.topic.name}
                      </span>
                      <span style={{ color: "#4F46E5", fontWeight: 600 }}>{n.topic._count.questions} Qs</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Reading Area (PDF Reader or Rich Article) */}
        {activeNote ? (
          <article
            className="card"
            style={{
              padding: "2rem",
              width: "100%",
              border: "1.5px solid #C7D2FE",
              boxShadow: "0 4px 16px rgba(79, 70, 229, 0.06)",
            }}
          >
            {/* Header / Meta */}
            <div className="flex justify-between items-start flex-wrap gap-4 pb-4 mb-6" style={{ borderBottom: "1px solid #E0E7FF" }}>
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    style={{
                      backgroundColor: "#EEF2FF",
                      color: "#4338CA",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid #C7D2FE",
                    }}
                  >
                    {activeNote.topic.subject.name}
                  </span>
                  <span className="badge badge-muted">{activeNote.topic.name}</span>
                  {activeNote.noteType === "PDF" ? (
                    <span
                      style={{
                        backgroundColor: "#FEE2E2",
                        color: "#DC2626",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "var(--radius-full)",
                        border: "1px solid #FECDD3",
                      }}
                    >
                      📄 Official PDF Handbook
                    </span>
                  ) : (
                    <span
                      style={{
                        backgroundColor: "#EEF2FF",
                        color: "#4338CA",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "var(--radius-full)",
                        border: "1px solid #C7D2FE",
                      }}
                    >
                      📝 Comprehensive Syllabus Article
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: "1.55rem", lineHeight: "1.35", color: "#312E81", fontWeight: 800 }}>
                  {activeNote.title}
                </h2>

                <div className="flex items-center gap-4 text-xs text-muted mt-2">
                  {activeNote.source && <span>Source: <strong>{activeNote.source}</strong></span>}
                  {activeNote.verifiedAt && (
                    <span>Verified: {new Date(activeNote.verifiedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <Link
                  href={`/student/practice?topicId=${activeNote.topicId}&subjectId=${activeNote.topic.subjectId}`}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "#4F46E5",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    padding: "0.5rem 1rem",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Practice MCQs ({activeNote.topic._count.questions})</span>
                </Link>
              </div>
            </div>

            {/* Summary if provided */}
            {activeNote.summary && (
              <div
                style={{
                  backgroundColor: "#F5F3FF",
                  borderLeft: "4px solid #7C3AED",
                  padding: "1rem 1.25rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.9rem",
                  color: "#4C1D95",
                  marginBottom: "1.5rem",
                  border: "1px solid #DDD6FE",
                }}
              >
                <strong>Summary & Key Takeaways: </strong>
                {activeNote.summary}
              </div>
            )}

            {/* IF NOTE TYPE IS PDF: EMBEDDED PDF VIEWER */}
            {activeNote.noteType === "PDF" && activeNote.pdfUrl ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* PDF Toolbar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "#F1F5F9",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <strong style={{ fontSize: "0.9rem" }}>{activeNote.pdfFileName || "Official Document.pdf"}</strong>
                      {activeNote.fileSizeBytes && (
                        <span className="text-xs text-muted ml-2">({formatFileSize(activeNote.fileSizeBytes)})</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={activeNote.pdfUrl}
                      download
                      className="btn btn-secondary btn-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                    <a
                      href={activeNote.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Fullscreen</span>
                    </a>
                  </div>
                </div>

                {/* Embedded PDF View */}
                <div
                  style={{
                    width: "100%",
                    height: "720px",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    backgroundColor: "#334155",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <iframe
                    src={`${activeNote.pdfUrl}#toolbar=1`}
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                    title={activeNote.title}
                  />
                </div>
              </div>
            ) : (
              /* IF NOTE TYPE IS ARTICLE: RICH ARTICLE CONTENT */
              <div
                className="reading-content"
                style={{
                  fontSize: "1.05rem",
                  lineHeight: "1.8",
                  color: "var(--color-text-subheading)",
                }}
                dangerouslySetInnerHTML={{ __html: activeNote.contentHtml }}
              />
            )}

            {/* Bottom Action Footer */}
            <div
              style={{
                marginTop: "2.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div className="text-xs text-muted">
                Official syllabus reference material verified for {targetExam?.title || "Exam Preparation"}.
              </div>

              <Link
                href={`/student/practice?topicId=${activeNote.topicId}&subjectId=${activeNote.topic.subjectId}`}
                className="btn btn-accent"
              >
                <span>Practice MCQs on this Topic ({activeNote.topic._count.questions} Qs)</span>
                <Play className="w-4 h-4" />
              </Link>
            </div>
          </article>
        ) : (
          <div className="card text-center" style={{ padding: "3rem" }}>
            <FileText className="w-10 h-10 text-muted mx-auto mb-2" />
            <h3>No Notes Available in this Selection</h3>
            <p className="text-muted text-sm mt-1">
              Select a subject or check back as instructors publish more study notes and PDF documents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
