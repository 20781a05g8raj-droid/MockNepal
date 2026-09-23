import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import PracticeRunner from "./PracticeRunner";

export const dynamic = "force-dynamic";

interface PracticeSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function PracticeSessionPage({ params }: PracticeSessionPageProps) {
  const { sessionId } = await params;
  const user = await getSessionUser();
  if (!user) return redirect("/login");

  let session: any = null;

  try {
    session = await db.practiceSession.findUnique({
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
  } catch (e) {
    console.warn("DB lookup error for session:", e);
  }

  // If session not found in current database (e.g. cross-lambda serverless environment)
  if (!session && sessionId.startsWith("sess_")) {
    try {
      const decodedJson = Buffer.from(sessionId.slice(5), "base64url").toString("utf-8");
      const decoded = JSON.parse(decodedJson);

      if (decoded.u === user.id) {
        const exam = await db.exam.findUnique({ where: { id: decoded.e } });
        const subject = await db.subject.findUnique({ where: { id: decoded.s } });
        const topic = decoded.t && decoded.t !== "ALL" ? await db.topic.findUnique({ where: { id: decoded.t } }) : null;

        if (exam && subject) {
          // Attempt to persist into this container's DB
          try {
            session = await db.practiceSession.upsert({
              where: { id: decoded.id },
              update: {},
              create: {
                id: decoded.id,
                userId: user.id,
                examId: decoded.e,
                subjectId: decoded.s,
                topicId: decoded.t && decoded.t !== "ALL" ? decoded.t : null,
                difficultyFilter: decoded.d || "ALL",
                totalQuestions: decoded.c || 10,
                status: "IN_PROGRESS",
              },
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
          } catch {
            session = {
              id: decoded.id || sessionId,
              userId: user.id,
              examId: decoded.e,
              subjectId: decoded.s,
              topicId: decoded.t && decoded.t !== "ALL" ? decoded.t : null,
              difficultyFilter: decoded.d || "ALL",
              totalQuestions: decoded.c || 10,
              status: "IN_PROGRESS",
              startedAt: new Date(decoded.ts || Date.now()),
              completedAt: null,
              exam,
              subject,
              topic,
              answers: [],
            };
          }
        }
      }
    } catch (e) {
      console.error("Failed to decode session token:", e);
    }
  }

  if (!session || session.userId !== user.id) {
    notFound();
  }

  // If already completed and user navigates here, take them to results
  if (session.status === "COMPLETED") {
    redirect(`/student/practice/${session.id}/results`);
  }

  // Get user bookmarks
  let bookmarkedSet = new Set<string>();
  try {
    const userBookmarks = await db.bookmark.findMany({
      where: { userId: user.id, itemType: "QUESTION" },
      select: { itemId: true },
    });
    bookmarkedSet = new Set(userBookmarks.map((b) => b.itemId));
  } catch (e) {
    console.warn("Could not load bookmarks:", e);
  }

  // 1. Gather previously answered questions in this session
  const answeredQuestionIds = new Set((session.answers || []).map((a: any) => a.questionVersion.questionId));

  const questionsPayload = [];

  for (const ans of (session.answers || [])) {
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
    let isPremium = false;
    try {
      const activeEntitlement = await db.entitlement.findFirst({
        where: {
          userId: user.id,
          isActive: true,
          validUntil: { gt: new Date() },
        },
      });
      isPremium = !!activeEntitlement;
    } catch (e) {
      console.warn("Could not check entitlement:", e);
    }

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

    let unattemptedQuestions: any[] = [];
    try {
      unattemptedQuestions = await db.question.findMany({
        where: whereClause,
        include: {
          versions: { orderBy: { versionNumber: "desc" }, take: 1 },
          topic: true,
          subject: true,
        },
        take: remainingCount,
      });
    } catch (e) {
      console.error("Failed to query unattempted questions:", e);
    }

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
        topicName: q.topic?.name || "General",
        questionType: q.questionType,
        examYear: q.examYear,
        source: q.source,
        isBookmarked: bookmarkedSet.has(q.id),
        previousAnswer: null,
      });
    }
  }

  // Initial index should be the first unattempted question
  const initialIndex = (session.answers || []).length < questionsPayload.length ? (session.answers || []).length : 0;

  return (
    <PracticeRunner
      sessionId={sessionId}
      sessionInfo={{
        examTitle: session.exam.title,
        subjectName: session.subject.name,
        topicName: session.topic?.name,
        totalQuestions: session.totalQuestions,
        completedAnswersCount: (session.answers || []).length,
      }}
      questions={questionsPayload}
      initialIndex={initialIndex}
    />
  );
}
