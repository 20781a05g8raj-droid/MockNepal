import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import PracticeRunner from "./PracticeRunner";

interface PracticeSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function PracticeSessionPage({ params }: PracticeSessionPageProps) {
  const { sessionId } = await params;
  const user = await getSessionUser();
  if (!user) return null;

  const session = await db.practiceSession.findUnique({
    where: { id: sessionId },
    include: {
      exam: true,
      subject: true,
      topic: true,
      answers: {
        include: {
          questionVersion: {
            include: { question: true },
          },
        },
        orderBy: { submittedAt: "asc" },
      },
    },
  });

  if (!session || session.userId !== user.id) {
    notFound();
  }

  // If already completed and user navigates here, take them to results
  if (session.status === "COMPLETED") {
    redirect(`/student/practice/${session.id}/results`);
  }

  // Get user bookmarks
  const userBookmarks = await db.bookmark.findMany({
    where: { userId: user.id, itemType: "QUESTION" },
    select: { itemId: true },
  });
  const bookmarkedSet = new Set(userBookmarks.map((b) => b.itemId));

  // 1. Gather previously answered questions in this session
  const answeredQuestionIds = new Set(session.answers.map((a) => a.questionVersion.questionId));

  const questionsPayload = [];

  for (const ans of session.answers) {
    const q = ans.questionVersion.question;
    const v = ans.questionVersion;
    questionsPayload.push({
      id: q.id,
      questionText: v.questionText,
      optionA: v.optionA,
      optionB: v.optionB,
      optionC: v.optionC,
      optionD: v.optionD,
      difficulty: q.difficulty,
      subjectName: session.subject.name,
      topicName: session.topic?.name || "General",
      questionType: q.questionType,
      examYear: q.examYear,
      source: q.source,
      isBookmarked: bookmarkedSet.has(q.id),
      previousAnswer: {
        selectedOption: ans.selectedOption,
        isCorrect: ans.isCorrect,
        correctOption: v.correctOption,
        explanation: v.explanation,
      },
    });
  }

  // 2. Query remaining questions up to session.totalQuestions
  const remainingCount = session.totalQuestions - questionsPayload.length;

  if (remainingCount > 0) {
    // Check entitlement for premium
    const activeEntitlement = await db.entitlement.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        validUntil: { gt: new Date() },
      },
    });
    const isPremium = !!activeEntitlement;

    const whereClause: any = {
      status: "PUBLISHED",
      subjectId: session.subjectId,
      questionExams: { some: { examId: session.examId } },
      id: { notIn: Array.from(answeredQuestionIds) },
      ...(!isPremium ? { accessLevel: "FREE" } : {}),
    };

    if (session.topicId) {
      whereClause.topicId = session.topicId;
    }

    if (session.difficultyFilter && session.difficultyFilter !== "ALL") {
      whereClause.difficulty = session.difficultyFilter;
    }

    const unattemptedQuestions = await db.question.findMany({
      where: whereClause,
      include: {
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
        topic: true,
        subject: true,
      },
      take: remainingCount,
    });

    for (const q of unattemptedQuestions) {
      const v = q.versions[0];
      if (!v) continue;

      // Notice: DO NOT expose correctOption or explanation to student before submission!
      questionsPayload.push({
        id: q.id,
        questionText: v.questionText,
        optionA: v.optionA,
        optionB: v.optionB,
        optionC: v.optionC,
        optionD: v.optionD,
        difficulty: q.difficulty,
        subjectName: q.subject.name,
        topicName: q.topic.name,
        questionType: q.questionType,
        examYear: q.examYear,
        source: q.source,
        isBookmarked: bookmarkedSet.has(q.id),
        previousAnswer: null,
      });
    }
  }

  // Initial index should be the first unattempted question
  const initialIndex = session.answers.length < questionsPayload.length ? session.answers.length : 0;

  return (
    <PracticeRunner
      sessionId={session.id}
      sessionInfo={{
        examTitle: session.exam.title,
        subjectName: session.subject.name,
        topicName: session.topic?.name,
        totalQuestions: session.totalQuestions,
        completedAnswersCount: session.answers.length,
      }}
      questions={questionsPayload}
      initialIndex={initialIndex}
    />
  );
}
