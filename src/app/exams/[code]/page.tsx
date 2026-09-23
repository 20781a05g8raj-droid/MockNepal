import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { ArrowLeft, BookOpen, Layers, CheckCircle, FileText, ArrowRight, ExternalLink } from "lucide-react";

interface ExamDetailPageProps {
  params: Promise<{ code: string }>;
}

export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
  const { code } = await params;
  const user = await getSessionUser();

  const exam = await db.exam.findUnique({
    where: { code },
    include: {
      category: true,
      syllabi: {
        include: {
          subjects: {
            include: {
              topics: {
                include: {
                  _count: { select: { questions: true, notes: true } },
                },
              },
            },
          },
        },
      },
      mockTests: {
        where: { status: "PUBLISHED" },
      },
    },
  });

  if (!exam) {
    notFound();
  }

  const syllabus = exam.syllabi[0];
  const subjects = syllabus?.subjects || [];

  return (
    <div className="public-layout">
      <PublicNav user={user} />

      <main style={{ padding: "2.5rem 1.5rem 4rem", backgroundColor: "var(--color-bg)", flexGrow: 1 }}>
        <div className="container">
          <Link href="/exams" className="btn btn-ghost btn-sm mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Exam Catalog</span>
          </Link>

          {/* Header Banner */}
          <div className="card mb-6" style={{ borderLeft: "4px solid var(--color-primary)" }}>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-primary">{exam.category.name}</span>
                  <span className="badge badge-muted">Syllabus Version: {syllabus?.versionCode || "2081 Official"}</span>
                </div>
                <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{exam.title}</h1>
                <p style={{ maxWidth: "800px", color: "var(--color-text-subheading)" }}>
                  {exam.description}
                </p>
                {syllabus?.officialSourceUrl && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
                    <span>Official Gazette / PSC Reference:</span>
                    <a href={syllabus.officialSourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
                      <span>{syllabus.officialSourceUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Link href={`/register?examId=${exam.id}`} className="btn btn-primary">
                  <span>Start Practicing This Exam</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {syllabus && (
                  <Link href={`/student/exams/${exam.id}`} className="btn btn-secondary btn-sm">
                    Open in Student Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Syllabus Subject and Topic Breakdown */}
          <div className="mb-6">
            <h2 style={{ fontSize: "1.35rem", marginBottom: "1rem" }}>
              Official Syllabus Breakdown & Available Materials
            </h2>

            {subjects.length === 0 ? (
              <div className="card text-center" style={{ padding: "3rem" }}>
                <p className="text-muted">Syllabus is currently being verified by editors for this examination.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {subjects.map((subj, idx) => (
                  <div key={subj.id} className="card">
                    <div className="card-header" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "0.75rem" }}>
                      <div>
                        <span className="badge badge-primary" style={{ marginRight: "0.5rem" }}>Subject {idx + 1}</span>
                        <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{subj.name}</span>
                        <span className="text-muted text-sm" style={{ marginLeft: "0.5rem" }}>({subj.code})</span>
                      </div>
                      <span className="badge badge-muted">{subj.topics.length} Topics</span>
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th style={{ width: "45%" }}>Topic Name</th>
                              <th>Est. Study Time</th>
                              <th>Verified MCQs</th>
                              <th>Study Notes</th>
                              <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subj.topics.map((t) => (
                              <tr key={t.id}>
                                <td>
                                  <strong>{t.name}</strong>
                                  <div className="text-xs text-muted">Code: {t.code}</div>
                                </td>
                                <td>{t.estimatedMinutes} mins</td>
                                <td>
                                  <span className="badge badge-basic">
                                    {t._count.questions} questions
                                  </span>
                                </td>
                                <td>
                                  {t._count.notes > 0 ? (
                                    <span className="badge badge-accent">
                                      {t._count.notes} note available
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted">Notes pending</span>
                                  )}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <Link
                                    href={`/student/practice?examId=${exam.id}&subjectId=${subj.id}&topicId=${t.id}`}
                                    className="btn btn-secondary btn-sm"
                                  >
                                    Practice Topic
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Mock Tests */}
          <div>
            <h2 style={{ fontSize: "1.35rem", marginBottom: "1rem" }}>
              Official Model Mock Tests for {exam.title}
            </h2>

            {exam.mockTests.length === 0 ? (
              <div className="card card-compact text-muted">
                No mock tests currently published for this exam. Check back soon.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {exam.mockTests.map((test) => (
                  <div key={test.id} className="card card-hover flex justify-between items-center">
                    <div>
                      <h4 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>{test.title}</h4>
                      <div className="text-sm text-muted">
                        {test.durationMinutes} mins • {test.totalQuestions} Questions • -{test.negativePenaltyPercent}% Negative Marking
                      </div>
                    </div>
                    <Link href={`/student/mock-tests/${test.id}`} className="btn btn-primary btn-sm">
                      Take Test
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
