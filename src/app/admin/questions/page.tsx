import { Suspense } from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import QuestionTableClient from "./QuestionTableClient";

export default async function AdminQuestionsPage() {
  const rawQuestions = await db.question.findMany({
    include: {
      subject: true,
      topic: true,
      questionExams: { include: { exam: true } },
      versions: { orderBy: { versionNumber: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const subjects = await db.subject.findMany({ orderBy: { order: "asc" } });
  const topics = await db.topic.findMany({ orderBy: { order: "asc" } });

  const formattedQuestions = rawQuestions.map((q) => {
    const latestVersion = q.versions[0];
    return {
      id: q.id,
      externalId: q.externalId,
      questionText: latestVersion?.questionText || "Draft Question",
      difficulty: q.difficulty,
      language: q.language || "NEPALI",
      questionType: q.questionType,
      status: q.status,
      subjectName: q.subject.name,
      topicName: q.topic.name,
      examTitles: q.questionExams.map((qe) => qe.exam.title),
      versionCount: q.versions.length,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: "1.5rem" }}>MCQ Question Bank</h1>
          <p className="text-sm text-muted">
            Manage official questions, drafts, versioning, and exam allocations.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin/questions/new" className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            <span>Add Single Question</span>
          </Link>
          <Link href="/admin/questions/import" className="btn btn-secondary btn-sm">
            <Upload className="w-4 h-4" />
            <span>Import Excel</span>
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-6 text-sm text-muted">Loading question bank...</div>}>
        <QuestionTableClient
          questions={formattedQuestions}
          subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
          topics={topics.map((t) => ({ id: t.id, name: t.name, subjectId: t.subjectId }))}
        />
      </Suspense>
    </div>
  );
}
