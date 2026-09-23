import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { testId } = await req.json();
    if (!testId) return NextResponse.json({ error: "testId is required" }, { status: 400 });

    const mockTest = await db.mockTest.findUnique({
      where: { id: testId },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    if (!mockTest || mockTest.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Mock test is not available." }, { status: 404 });
    }

    // Check entitlement if test is PREMIUM
    if (mockTest.accessLevel === "PREMIUM") {
      const activeEntitlement = await db.entitlement.findFirst({
        where: {
          userId: user.id,
          isActive: true,
          validUntil: { gt: new Date() },
        },
      });
      if (!activeEntitlement) {
        return NextResponse.json(
          { error: "This mock examination requires an active premium pass." },
          { status: 403 }
        );
      }
    }

    // Check attempt limit
    const previousAttemptsCount = await db.testAttempt.count({
      where: { testId, userId: user.id },
    });

    if (previousAttemptsCount >= mockTest.attemptLimit) {
      return NextResponse.json(
        { error: `You have reached the maximum attempt limit (${mockTest.attemptLimit}) for this test.` },
        { status: 403 }
      );
    }

    // Check for an ongoing in-progress attempt to resume without resetting timer!
    const activeAttempt = await db.testAttempt.findFirst({
      where: {
        testId,
        userId: user.id,
        status: "IN_PROGRESS",
      },
    });

    if (activeAttempt) {
      // Check if active attempt deadline has already passed
      if (new Date() > activeAttempt.deadline) {
        // Auto-close expired attempt
        await db.testAttempt.update({
          where: { id: activeAttempt.id },
          data: { status: "TIMED_OUT", submittedAt: activeAttempt.deadline },
        });
      } else {
        // Resume active attempt
        return NextResponse.json({
          success: true,
          attemptId: activeAttempt.id,
          deadline: activeAttempt.deadline.toISOString(),
          isResume: true,
        });
      }
    }

    if (!mockTest.questions || mockTest.questions.length === 0) {
      return NextResponse.json(
        { error: "This mock test has no questions assigned yet. Please assign questions in the Admin Panel before attempting." },
        { status: 400 }
      );
    }

    // Server calculates authoritative deadline
    const deadline = new Date(Date.now() + mockTest.durationMinutes * 60 * 1000);

    const attempt = await db.testAttempt.create({
      data: {
        userId: user.id,
        testId: mockTest.id,
        status: "IN_PROGRESS",
        deadline,
        startedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      deadline: deadline.toISOString(),
      isResume: false,
    });
  } catch (error: any) {
    console.error("Mock test start error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to initialize mock test attempt." },
      { status: 500 }
    );
  }
}
