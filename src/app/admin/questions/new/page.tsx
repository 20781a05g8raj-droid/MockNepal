import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QuestionEditorForm from "../QuestionEditorForm";

interface NewQuestionPageProps {
  searchParams: Promise<{
    examId?: string;
    subjectId?: string;
    topicId?: string;
  }>;
}

export default async function NewQuestionPage({ searchParams }: NewQuestionPageProps) {
  const params = await searchParams;

  const exams = await db.exam.findMany({
    where: { isActive: true },
    select: { id: true, title: true },
    orderBy: { order: "asc" },
  });

  const subjects = await db.subject.findMany({
    select: { id: true, name: true },
    orderBy: { order: "asc" },
  });

  const topics = await db.topic.findMany({
    select: { id: true, name: true, subjectId: true },
    orderBy: { order: "asc" },
  });

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Link href="/admin/questions" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }}>
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Question Bank</span>
      </Link>

      <QuestionEditorForm
        exams={exams.map((e) => ({ id: e.id, name: e.title }))}
        subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
        topics={topics}
        initialData={{
          examIds: params.examId ? [params.examId] : undefined,
          subjectId: params.subjectId,
          topicId: params.topicId,
        }}
      />
    </div>
  );
}
