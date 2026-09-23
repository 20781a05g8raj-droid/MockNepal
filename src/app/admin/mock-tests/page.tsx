import { db } from "@/lib/db";
import AdminMockTestsClient from "./AdminMockTestsClient";

export default async function AdminMockTestsPage() {
  const mockTests = await db.mockTest.findMany({
    include: {
      exam: true,
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const exams = await db.exam.findMany({
    where: { isActive: true },
    select: { id: true, title: true },
    orderBy: { order: "asc" },
  });

  const formattedTests = mockTests.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    durationMinutes: t.durationMinutes,
    totalQuestions: t.totalQuestions,
    marksPerCorrect: t.marksPerCorrect,
    negativePenaltyPercent: t.negativePenaltyPercent,
    accessLevel: t.accessLevel,
    status: t.status,
    attemptLimit: t.attemptLimit,
    examId: t.exam.id,
    examTitle: t.exam.title,
    questionCount: t._count.questions,
    attemptCount: t._count.attempts,
  }));

  return <AdminMockTestsClient initialTests={formattedTests} exams={exams} />;
}
