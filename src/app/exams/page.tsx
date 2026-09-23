import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { BookOpen, Layers, CheckCircle2, ChevronRight, FileText } from "lucide-react";

export default async function ExamsCatalogPage() {
  const user = await getSessionUser();

  const categories = await db.examCategory.findMany({
    include: {
      exams: {
        include: {
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
          _count: {
            select: { questionExams: true, mockTests: true },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  return (
    <div className="public-layout">
      <PublicNav user={user} />

      <main style={{ padding: "3rem 1.5rem", backgroundColor: "var(--color-bg)", flexGrow: 1 }}>
        <div className="container">
          <div className="mb-8">
            <span className="badge badge-primary mb-2">Exams & Curriculum</span>
            <h1>Government & Public Sector Exam Catalog</h1>
            <p style={{ maxWidth: "700px", marginTop: "0.5rem" }}>
              Explore official syllabi, subject breakdowns, verified question banks, and notes for Lok Sewa Aayog, Banking, and Teacher Service recruitment.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {categories.map((cat) => (
              <section key={cat.id}>
                <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: "2px solid var(--color-border)" }}>
                  <Layers className="w-5 h-5 text-primary" />
                  <h2 style={{ fontSize: "1.35rem" }}>{cat.name}</h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {cat.exams.map((exam) => {
                    const syllabus = exam.syllabi[0];
                    const subjects = syllabus?.subjects || [];
                    const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);

                    return (
                      <div key={exam.id} className="card card-hover flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="badge badge-primary">{cat.code}</span>
                            <span className="badge badge-muted">
                              {syllabus?.versionCode || "Official Syllabus"}
                            </span>
                          </div>

                          <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                            {exam.title}
                          </h3>
                          <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
                            {exam.description}
                          </p>

                          <div style={{ backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)", padding: "1rem", border: "1px solid var(--color-border)", marginBottom: "1.25rem" }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "0.5rem" }}>
                              Curriculum Overview ({subjects.length} Subjects, {totalTopics} Topics):
                            </div>
                            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.85rem", color: "var(--color-text-subheading)" }}>
                              {subjects.map((s) => (
                                <li key={s.id} className="flex justify-between">
                                  <span>• {s.name}</span>
                                  <span className="text-muted">{s.topics.length} topics</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex justify-between text-sm text-muted mb-4">
                            <span>Question Bank: <strong>{exam._count.questionExams} MCQs</strong></span>
                            <span>Mock Tests: <strong>{exam._count.mockTests} Tests</strong></span>
                          </div>
                        </div>

                        <div className="flex gap-3 mt-2">
                          <Link href={`/exams/${exam.code}`} className="btn btn-secondary btn-full btn-sm">
                            View Syllabus & Topics
                          </Link>
                          <Link href={`/register?examId=${exam.id}`} className="btn btn-primary btn-full btn-sm">
                            Start Practicing
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
