import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { attemptId, questionId, selectedOption, isMarkedForReview } = await req.json();

    if (!attemptId || !questionId) {
      return NextResponse.json({ error: "attemptId and questionId are required" }, { status: 400 });
    }

    const attempt = await db.testAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.userId !== user.id) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Test is already completed or submitted." }, { status: 400 });
    }

    // Check server deadline
    if (new Date() > attempt.deadline) {
      return NextResponse.json({ isExpired: true, message: "Test time has expired." }, { status: 400 });
    }

    // Upsert answer
    const saved = await db.testAttemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: {
        selectedOption: selectedOption ? selectedOption.toUpperCase() : null,
        isMarkedForReview: !!isMarkedForReview,
        savedAt: new Date(),
      },
      create: {
        attemptId,
        questionId,
        selectedOption: selectedOption ? selectedOption.toUpperCase() : null,
        isMarkedForReview: !!isMarkedForReview,
        savedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, savedAt: saved.savedAt });
  } catch (error: any) {
    console.error("Save answer error:", error);
    return NextResponse.json({ error: "Failed to autosave answer" }, { status: 500 });
  }
}
