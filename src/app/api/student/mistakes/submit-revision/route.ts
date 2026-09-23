import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleAnswerRevisionState } from "@/lib/revision";
import { incrementMissionProgress } from "@/lib/missions";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { questionId, selectedOption } = await req.json();

    if (!questionId || !selectedOption) {
      return NextResponse.json({ error: "questionId and selectedOption are required" }, { status: 400 });
    }

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

    // Progress or reset the spaced repetition schedule (PRD Section 15)
    await handleAnswerRevisionState(user.id, questionId, isCorrect);

    // Increment daily mission progress
    await incrementMissionProgress(user.id, "MISTAKE_REVISION", 1);

    // Fetch updated revision item
    const updatedItem = await db.revisionItem.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      isCorrect,
      correctOption: latestVersion.correctOption,
      explanation: latestVersion.explanation,
      newStage: updatedItem?.stage,
      nextRevisionDueNepalDate: updatedItem?.nextRevisionDueNepalDate,
      isMastered: updatedItem?.isMastered,
    });
  } catch (error: any) {
    console.error("Revision submit error:", error);
    return NextResponse.json({ error: "Failed to submit revision" }, { status: 500 });
  }
}
