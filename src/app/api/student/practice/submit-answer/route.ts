import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleAnswerRevisionState } from "@/lib/revision";
import { incrementMissionProgress } from "@/lib/missions";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { sessionId, questionId, selectedOption, timeSpentSeconds } = await req.json();

    if (!sessionId || !questionId || !selectedOption) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let session: any = null;
    try {
      session = await db.practiceSession.findUnique({
        where: { id: sessionId },
      });
    } catch (e) {
      console.warn("Error finding session:", e);
    }

    // If session is encoded token (serverless cross-container)
    if (!session && sessionId.startsWith("sess_")) {
      try {
        const decodedJson = Buffer.from(sessionId.slice(5), "base64url").toString("utf-8");
        const decoded = JSON.parse(decodedJson);
        if (decoded.u === user.id) {
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
            });
          } catch {
            session = {
              id: decoded.id || sessionId,
              userId: user.id,
              totalQuestions: decoded.c || 10,
            };
          }
        }
      } catch (e) {
        console.error("Failed to decode session on submit:", e);
      }
    }

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: "Invalid session" }, { status: 403 });
    }

    // Fetch the latest question version
    const question = await db.question.findUnique({
      where: { id: questionId },
      include: {
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      },
    });

    if (!question || question.versions.length === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const latestVersion = question.versions[0];
    const isCorrect = latestVersion.correctOption.toUpperCase() === selectedOption.toUpperCase();

    // Record attempt answer if database is writable
    let currentAnswerCount = 1;
    try {
      await db.attemptAnswer.create({
        data: {
          sessionId: session.id,
          questionVersionId: latestVersion.id,
          selectedOption: selectedOption.toUpperCase(),
          isCorrect,
          timeSpentSeconds: timeSpentSeconds || 0,
        },
      });

      // Update topic progress
      await db.topicProgress.upsert({
        where: {
          userId_topicId: { userId: user.id, topicId: question.topicId },
        },
        update: {
          questionsAttempted: { increment: 1 },
          ...(isCorrect ? { questionsCorrect: { increment: 1 } } : {}),
          lastPracticedAt: new Date(),
        },
        create: {
          userId: user.id,
          topicId: question.topicId,
          questionsAttempted: 1,
          questionsCorrect: isCorrect ? 1 : 0,
          lastPracticedAt: new Date(),
        },
      });

      // Update spaced repetition mistake notebook
      await handleAnswerRevisionState(user.id, question.id, isCorrect);

      // Increment daily mission practice progress
      await incrementMissionProgress(user.id, "PRACTICE_COUNT", 1);

      // Check if session is now completed
      currentAnswerCount = await db.attemptAnswer.count({
        where: { sessionId: session.id },
      });

      if (currentAnswerCount >= (session.totalQuestions || 10)) {
        await db.practiceSession.update({
          where: { id: session.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
      }
    } catch (e) {
      console.warn("Could not save attempt answer to DB:", e);
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      correctOption: latestVersion.correctOption,
      explanation: latestVersion.explanation,
      source: question.source,
      examYear: question.examYear,
      isSessionComplete: currentAnswerCount >= (session.totalQuestions || 10),
    });
  } catch (error: any) {
    console.error("Submit answer error:", error);
    return NextResponse.json({ error: "Failed to process answer" }, { status: 500 });
  }
}
