import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const mockTests = await db.mockTest.findMany({
      include: {
        exam: true,
        questions: {
          include: {
            question: {
              include: {
                subject: true,
                topic: true,
                versions: { orderBy: { versionNumber: "desc" }, take: 1 },
              },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ mockTests });
  } catch (error: any) {
    console.error("Fetch mock tests error:", error);
    return NextResponse.json({ error: "Failed to fetch mock tests." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      examId,
      title,
      description,
      durationMinutes,
      totalQuestions,
      marksPerCorrect,
      negativePenaltyPercent,
      attemptLimit,
      accessLevel,
      status,
      questionIds,
      autoPopulate,
    } = body;

    if (!examId || !title || !title.trim()) {
      return NextResponse.json({ error: "Exam track and Title are required." }, { status: 400 });
    }

    const test = await db.mockTest.create({
      data: {
        examId,
        title: title.trim(),
        description: description ? description.trim() : "Official Model Examination Paper",
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : 45,
        totalQuestions: totalQuestions ? parseInt(totalQuestions, 10) : 50,
        marksPerCorrect: marksPerCorrect ? parseFloat(marksPerCorrect) : 2.0,
        negativePenaltyPercent: negativePenaltyPercent ? parseFloat(negativePenaltyPercent) : 20.0,
        attemptLimit: attemptLimit ? parseInt(attemptLimit, 10) : 3,
        accessLevel: accessLevel || "FREE",
        status: status || "PUBLISHED",
      },
    });

    let assignedIds: string[] = Array.isArray(questionIds) ? questionIds : [];

    // If auto-populate requested, find available published questions for this exam
    if (autoPopulate && assignedIds.length === 0) {
      const availableQuestions = await db.question.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { questionExams: { some: { examId } } },
            { subject: { syllabusVersion: { examId } } },
          ],
        },
        take: test.totalQuestions,
        select: { id: true },
      });
      assignedIds = availableQuestions.map((q) => q.id);
    }

    // Attach questions
    for (let i = 0; i < assignedIds.length; i++) {
      await db.mockTestQuestion.create({
        data: {
          testId: test.id,
          questionId: assignedIds[i],
          order: i + 1,
        },
      });
    }

    return NextResponse.json({ success: true, testId: test.id, assignedCount: assignedIds.length });
  } catch (error: any) {
    console.error("Create mock test error:", error);
    return NextResponse.json({ error: "Failed to create mock test." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
      title,
      description,
      durationMinutes,
      totalQuestions,
      marksPerCorrect,
      negativePenaltyPercent,
      attemptLimit,
      accessLevel,
      status,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Test ID is required." }, { status: 400 });
    }

    const updated = await db.mockTest.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        description: description !== undefined ? description.trim() : undefined,
        durationMinutes: durationMinutes !== undefined ? parseInt(durationMinutes, 10) : undefined,
        totalQuestions: totalQuestions !== undefined ? parseInt(totalQuestions, 10) : undefined,
        marksPerCorrect: marksPerCorrect !== undefined ? parseFloat(marksPerCorrect) : undefined,
        negativePenaltyPercent: negativePenaltyPercent !== undefined ? parseFloat(negativePenaltyPercent) : undefined,
        attemptLimit: attemptLimit !== undefined ? parseInt(attemptLimit, 10) : undefined,
        accessLevel: accessLevel || undefined,
        status: status || undefined,
      },
    });

    return NextResponse.json({ success: true, mockTest: updated });
  } catch (error: any) {
    console.error("Update mock test error:", error);
    return NextResponse.json({ error: "Failed to update mock test." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Test ID is required." }, { status: 400 });
    }

    await db.mockTest.delete({ where: { id } });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("Delete mock test error:", error);
    return NextResponse.json({ error: "Failed to delete mock test." }, { status: 500 });
  }
}
