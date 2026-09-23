import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleAnswerRevisionState } from "@/lib/revision";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { attemptId } = await req.json();

    if (!attemptId) {
      return NextResponse.json({ error: "attemptId is required" }, { status: 400 });
    }

    const attempt = await db.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        mockTest: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    versions: { orderBy: { versionNumber: "desc" }, take: 1 },
                  },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt || attempt.userId !== user.id) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Idempotent check: if already submitted, return existing result
    if (attempt.status === "SUBMITTED" || attempt.status === "TIMED_OUT") {
      return NextResponse.json({
        success: true,
        alreadySubmitted: true,
        score: attempt.score,
        accuracyPercent: attempt.accuracyPercent,
        correctCount: attempt.correctCount,
        incorrectCount: attempt.incorrectCount,
        unansweredCount: attempt.unansweredCount,
      });
    }

    const mockTest = attempt.mockTest;
    const testQuestions = mockTest.questions;
    const answersMap = new Map(attempt.answers.map((a) => [a.questionId, a.selectedOption]));

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    for (const tq of testQuestions) {
      const q = tq.question;
      const latestVersion = q.versions[0];
      const selected = answersMap.get(q.id);

      if (!selected) {
        unansweredCount++;
      } else if (latestVersion && selected.toUpperCase() === latestVersion.correctOption.toUpperCase()) {
        correctCount++;
        // update revision state
        await handleAnswerRevisionState(user.id, q.id, true);
      } else {
        incorrectCount++;
        // Add to mistake notebook for spaced revision
        await handleAnswerRevisionState(user.id, q.id, false);
      }
    }

    // Official scoring formula (PRD Section 11):
    // Marks = (Correct * marksPerCorrect) - (Incorrect * marksPerCorrect * negativePenaltyPercent / 100)
    const marksPerCorrect = mockTest.marksPerCorrect;
    const penaltyPerIncorrect = (marksPerCorrect * mockTest.negativePenaltyPercent) / 100.0;
    const rawScore = (correctCount * marksPerCorrect) - (incorrectCount * penaltyPerIncorrect);
    const score = Math.max(0, Math.round(rawScore * 100) / 100);

    const totalAttempted = correctCount + incorrectCount;
    const accuracyPercent = totalAttempted > 0
      ? Math.round((correctCount / totalAttempted) * 100 * 10) / 10
      : 0;

    const isTimedOut = new Date() > attempt.deadline;

    const updated = await db.testAttempt.update({
      where: { id: attemptId },
      data: {
        status: isTimedOut ? "TIMED_OUT" : "SUBMITTED",
        submittedAt: new Date(),
        score,
        accuracyPercent,
        correctCount,
        incorrectCount,
        unansweredCount,
      },
    });

    return NextResponse.json({
      success: true,
      score: updated.score,
      accuracyPercent: updated.accuracyPercent,
      correctCount: updated.correctCount,
      incorrectCount: updated.incorrectCount,
      unansweredCount: updated.unansweredCount,
    });
  } catch (error: any) {
    console.error("Submit test error:", error);
    return NextResponse.json({ error: "Failed to submit test" }, { status: 500 });
  }
}
