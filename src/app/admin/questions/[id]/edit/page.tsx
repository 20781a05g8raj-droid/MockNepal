import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QuestionEditorForm from "../../QuestionEditorForm";

interface EditQuestionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const { id } = await params;

  const question = await db.question.findUnique({
    where: { id },
    include: {
      questionExams: true,
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
  });

  if (!question) notFound();

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

  const latestVersion = question.versions[0];

  const initialData = {
    id: question.id,
    questionId: question.id,
    examIds: question.questionExams.map((qe) => qe.examId),
    subjectId: question.subjectId,
    topicId: question.topicId,
    difficulty: question.difficulty,
    language: question.language,
    questionType: question.questionType,
    examYear: question.examYear?.toString() || "",
    source: question.source || "",
    accessLevel: question.accessLevel,
    questionText: latestVersion?.questionText || "",
    optionA: latestVersion?.optionA || "",
    optionB: latestVersion?.optionB || "",
    optionC: latestVersion?.optionC || "",
    optionD: latestVersion?.optionD || "",
    correctOption: latestVersion?.correctOption || "A",
    explanation: latestVersion?.explanation || "",
  };

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
        initialData={initialData}
      />
    </div>
  );
}
