import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft, BookOpen, Layers, CheckCircle2, Play, ExternalLink } from "lucide-react";
import TopicCheckbox from "./TopicCheckbox";
import SetTargetExamButton from "../SetTargetExamButton";

interface StudentExamDetailPageProps {
  params: Promise<{ examId: string }>;
}

export default async function StudentExamDetailPage({ params }: StudentExamDetailPageProps) {
  const { examId } = await params;
  const user = await getSessionUser();
  if (!user) return null;

  const exam = await db.exam.findUnique({
    where: { id: examId },
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
    },
  });

  if (!exam) notFound();

  const syllabus = exam.syllabi[0];
  const subjects = syllabus?.subjects || [];

  // Fetch topic progress records for this user
  const topicProgressRecords = await db.topicProgress.findMany({
    where: { userId: user.id },
  });
  const progressMap = new Map(topicProgressRecords.map((p) => [p.topicId, p]));

  const allTopics = subjects.flatMap((s) => s.topics);
  const completedCount = allTopics.filter((t) => progressMap.get(t.id)?.isMarkedCompleted).length;
  const progressPct = allTopics.length > 0 ? Math.round((completedCount / allTopics.length) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Link href="/student/exams" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }}>
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Exams</span>
      </Link>

      {/* Header Summary Card */}
      <div className="card" style={{ borderLeft: "4px solid var(--color-primary)" }}>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-primary">{exam.category.name}</span>
              <span className="badge badge-muted">Syllabus: {syllabus?.versionCode || "Official"}</span>
            </div>
            <h1 style={{ fontSize: "1.5rem" }}>{exam.title}</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.25rem", maxWidth: "750px" }}>
              {exam.description}
            </p>
            {syllabus?.officialSourceUrl && (
              <div className="text-xs text-muted mt-2">
                Official Reference: <a href={syllabus.officialSourceUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>{syllabus.officialSourceUrl}</a>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 items-end">
            <div style={{ minWidth: "220px", backgroundColor: "#F8FAFC", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Syllabus Completed:</span>
                <strong>{progressPct}%</strong>
              </div>
              <div className="progress-bar mb-2">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="text-xs text-muted text-center">
                {completedCount} of {allTopics.length} topics checked
              </div>
            </div>

            <SetTargetExamButton examId={exam.id} />
          </div>
        </div>
      </div>

      {/* Subject & Topics breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {subjects.map((subj, idx) => (
          <div key={subj.id} className="card">
            <div className="card-header flex justify-between items-center flex-wrap gap-2" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "0.75rem" }}>
              <div>
                <span className="badge badge-primary" style={{ marginRight: "0.5rem" }}>Subject {idx + 1}</span>
                <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{subj.name}</span>
                <span className="text-muted text-xs" style={{ marginLeft: "0.5rem" }}>({subj.code})</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/student/notes?subjectId=${subj.id}`}
                  className="btn btn-secondary btn-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Subject Notes & PDFs</span>
                </Link>
                <Link
                  href={`/student/practice?examId=${exam.id}&subjectId=${subj.id}`}
                  className="btn btn-primary btn-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Practice Subject MCQs</span>
                </Link>
              </div>
            </div>

            <div className="table-container mt-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "35%" }}>Topic</th>
                    <th>Measured Accuracy</th>
                    <th>MCQ Pool</th>
                    <th>Study Notes</th>
                    <th>Manual Status</th>
                    <th style={{ textAlign: "right" }}>Practice</th>
                  </tr>
                </thead>
                <tbody>
                  {subj.topics.map((t) => {
                    const prog = progressMap.get(t.id);
                    const attempted = prog?.questionsAttempted || 0;
                    const correct = prog?.questionsCorrect || 0;
                    const acc = attempted > 0 ? Math.round((correct / attempted) * 100) : null;

                    return (
                      <tr key={t.id}>
                        <td>
                          <strong>{t.name}</strong>
                          <div className="text-xs text-muted">Est. {t.estimatedMinutes} mins • Code: {t.code}</div>
                        </td>
                        <td>
                          {acc !== null ? (
                            <span className={`badge ${acc >= 75 ? "badge-success" : acc >= 50 ? "badge-intermediate" : "badge-hard"}`}>
                              {acc}% ({correct}/{attempted})
                            </span>
                          ) : (
                            <span className="text-xs text-muted">Not practiced yet</span>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-basic">{t._count.questions} questions</span>
                        </td>
                        <td>
                          {t._count.notes > 0 ? (
                            <Link href={`/student/notes?topicId=${t.id}`} className="badge badge-accent" style={{ textDecoration: "none" }}>
                              {t._count.notes} note &rarr;
                            </Link>
                          ) : (
                            <span className="text-xs text-muted">Notes pending</span>
                          )}
                        </td>
                        <td>
                          <TopicCheckbox
                            topicId={t.id}
                            initialCompleted={!!prog?.isMarkedCompleted}
                          />
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Link
                            href={`/student/practice?examId=${exam.id}&subjectId=${subj.id}&topicId=${t.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            Practice
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
