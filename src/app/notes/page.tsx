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
  Sparkles,
  Lock,
  Layers,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export const dynamic = "force-dynamic";

interface NotesPageProps {
  searchParams: Promise<{
    subjectId?: string;
  }>;
}

export default async function PublicNotesPage({ searchParams }: NotesPageProps) {
  const user = await getSessionUser();
  const { subjectId } = await searchParams;

  // Check if current user has active Pro pass
  let isPro = false;
  if (user) {
    try {
      const activeEntitlement = await db.entitlement.findFirst({
        where: {
          userId: user.id,
          isActive: true,
          validUntil: { gt: new Date() },
        },
      });
      isPro = !!activeEntitlement;
    } catch (e) {
      console.warn("Entitlement error:", e);
    }
  }

  // Fetch all subjects for the filter pills
  let subjects: any[] = [];
  let notes: any[] = [];

  try {
    subjects = await db.subject.findMany({
      include: {
        syllabusVersion: {
          include: { exam: true },
        },
        _count: { select: { questions: true } },
      },
      orderBy: { order: "asc" },
    });

    const whereClause: any = {
      status: "PUBLISHED",
    };

    if (subjectId) {
      whereClause.topic = { subjectId };
    }

    notes = await db.note.findMany({
      where: whereClause,
      include: {
        topic: {
          include: {
            subject: {
              include: {
                syllabusVersion: {
                  include: { exam: true },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("Notes query error:", error);
  }

  const activeSubject = subjects.find((s) => s.id === subjectId);

  return (
    <div style={{ backgroundColor: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PublicNav user={user} />

      <main style={{ flexGrow: 1, padding: "2.5rem 1rem 4rem" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
          {/* Header Banner */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              padding: "1.75rem 2rem",
              marginBottom: "2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1.25rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  color: "#0284C7",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.4rem",
                }}
              >
                <BookOpen className="w-4 h-4" />
                <span>आधिकारिक अध्ययन सामग्री तथा पाठ्यक्रम</span>
              </div>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0F172A", margin: "0 0 0.4rem 0" }}>
                Study Notes & Syllabus PDFs (अध्ययन सामग्री)
              </h1>
              <p style={{ color: "#64748B", fontSize: "0.92rem", margin: 0, maxWidth: "680px" }}>
                लोक सेवा, बैंकिङ, शिक्षक सेवा र इन्जिनियरिङ लाइसेन्सका आधिकारिक पाठ्यक्रम, सर्ट नोट्स तथा महत्वपूर्ण PDF हरू अध्ययन र डाउनलोड गर्नुहोस्।
              </p>
            </div>


          </div>

          {/* Subject Filter Pills */}
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.6rem" }}>
              विषय अनुसार फिल्टर गर्नुहोस् (Filter by Subject):
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Link
                href="/notes"
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "999px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  backgroundColor: !subjectId ? "#0B5ED7" : "#FFFFFF",
                  color: !subjectId ? "#FFFFFF" : "#334155",
                  border: "1px solid",
                  borderColor: !subjectId ? "#0B5ED7" : "#CBD5E1",
                }}
              >
                All Subjects ({notes.length})
              </Link>

              {subjects.filter((s) => s._count.notes > 0).map((s) => {
                const isSelected = subjectId === s.id;
                return (
                  <Link
                    key={s.id}
                    href={`/notes?subjectId=${s.id}`}
                    style={{
                      padding: "0.35rem 0.85rem",
                      borderRadius: "999px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      backgroundColor: isSelected ? "#0B5ED7" : "#FFFFFF",
                      color: isSelected ? "#FFFFFF" : "#334155",
                      border: "1px solid",
                      borderColor: isSelected ? "#0B5ED7" : "#CBD5E1",
                    }}
                  >
                    {s.name} ({s._count.notes})
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Notes Grid */}
          {notes.length === 0 ? (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                padding: "3rem",
                textAlign: "center",
              }}
            >
              <FileText className="w-12 h-12 text-slate-300" style={{ margin: "0 auto 1rem" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1E293B" }}>
                No Notes Found for this Subject
              </h3>
              <p style={{ color: "#64748B", fontSize: "0.88rem", marginTop: "0.35rem" }}>
                अहिले यस विषयको कुनै PDF उपलब्ध छैन। नयाँ सामग्री अपलोड गर्न माथिको बटन प्रयोग गर्नुहोस्।
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
              {notes.map((note) => {
                const isLocked = note.accessLevel === "PREMIUM" && !isPro;
                return (
                  <div
                    key={note.id}
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "10px",
                      padding: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                      transition: "all 150ms ease",
                    }}
                  >
                    <div>
                      {/* Badge Row */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "0.15rem 0.5rem",
                            borderRadius: "4px",
                            backgroundColor: note.accessLevel === "PREMIUM" ? "#FEF3C7" : "#DCFCE7",
                            color: note.accessLevel === "PREMIUM" ? "#B45309" : "#15803D",
                          }}
                        >
                          {note.accessLevel === "PREMIUM" ? "PRO NOTE ⭐" : "FREE PDF"}
                        </span>

                        <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
                          {note.fileSizeBytes ? `${Math.round(note.fileSizeBytes / 1024)} KB` : "PDF Document"}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.35, marginBottom: "0.4rem" }}>
                        {note.title}
                      </h3>

                      <p style={{ fontSize: "0.82rem", color: "#64748B", margin: "0 0 1rem 0" }}>
                        {note.summary || "आधिकारिक पाठ्यक्रम तथा परीक्षा तयारीका लागि महत्वपूर्ण संक्षिप्त अध्ययन सामग्री।"}
                      </p>

                      <div style={{ fontSize: "0.75rem", color: "#475569", marginBottom: "1rem" }}>
                        <strong>विषय:</strong> {note.topic?.subject?.name || "General"} • {note.topic?.name}
                      </div>
                    </div>

                    <div>
                      {isLocked ? (
                        <Link
                          href="/pricing"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                            width: "100%",
                            padding: "0.55rem",
                            borderRadius: "6px",
                            backgroundColor: "#FEF3C7",
                            color: "#B45309",
                            border: "1px solid #FDE68A",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Unlock with Pro Pass</span>
                        </Link>
                      ) : note.pdfUrl ? (
                        <a
                          href={note.pdfUrl}
                          download={note.pdfFileName || "study_notes.pdf"}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                            width: "100%",
                            padding: "0.55rem",
                            borderRadius: "6px",
                            backgroundColor: "#0B5ED7",
                            color: "#FFFFFF",
                            border: "none",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          <Download className="w-4 h-4" />
                          <span>Download PDF (डाउनलोड)</span>
                        </a>
                      ) : (
                        <div style={{ fontSize: "0.8rem", color: "#94A3B8", textAlign: "center" }}>
                          Full article content available
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
