import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { examId, subjectId, topicId, difficultyFilter, questionCount } = await req.json();

    if (!examId || !subjectId) {
      return NextResponse.json({ error: "examId and subjectId are required" }, { status: 400 });
    }

    const count = parseInt(questionCount || "10", 10);

    // Check entitlement
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
      subjectId,
      subject: { syllabusVersion: { examId } },
      questionExams: { some: { examId } },
      ...(!isPremium ? { accessLevel: "FREE" } : {}),
    };

    if (topicId && topicId !== "ALL") {
      whereClause.topicId = topicId;
    }

    if (difficultyFilter && difficultyFilter !== "ALL") {
      whereClause.difficulty = difficultyFilter.toUpperCase();
    }

    // Get all eligible question IDs
    const eligibleQuestions = await db.question.findMany({
      where: whereClause,
      select: { id: true },
    });

    if (eligibleQuestions.length === 0) {
      return NextResponse.json(
        { error: "No published questions available for the selected criteria." },
        { status: 400 }
      );
    }

    // Find previously attempted questions to prefer unseen questions
    const previouslyAttempted = await db.attemptAnswer.findMany({
      where: { session: { userId: user.id } },
      select: { questionVersion: { select: { questionId: true } } },
    });
    const seenIds = new Set(previouslyAttempted.map((a) => a.questionVersion.questionId));

    const unseen = eligibleQuestions.filter((q) => !seenIds.has(q.id));
    const seen = eligibleQuestions.filter((q) => seenIds.has(q.id));

    // Combine preferring unseen first, no duplicates
    const selectedPool = [...unseen, ...seen].slice(0, count);

    // Create session
    const session = await db.practiceSession.create({
      data: {
        userId: user.id,
        examId,
        subjectId,
        topicId: topicId && topicId !== "ALL" ? topicId : null,
        difficultyFilter: difficultyFilter || "ALL",
        totalQuestions: selectedPool.length,
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (error: any) {
    console.error("Practice start error:", error);
    return NextResponse.json({ error: "Failed to create practice session" }, { status: 500 });
  }
}
