import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("testId");

    if (!testId) {
      return NextResponse.json({ error: "Test ID is required." }, { status: 400 });
    }

    const test = await db.mockTest.findUnique({
      where: { id: testId },
      include: {
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
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found." }, { status: 404 });
    }

    // Also fetch available published questions not yet in this test
    const assignedIds = test.questions.map((q) => q.questionId);
    const availableQuestions = await db.question.findMany({
      where: {
        status: "PUBLISHED",
        id: { notIn: assignedIds },
        OR: [
          { questionExams: { some: { examId: test.examId } } },
          { subject: { syllabusVersion: { examId: test.examId } } },
        ],
      },
      include: {
        subject: true,
        topic: true,
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      },
      take: 50,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      assigned: test.questions.map((tq) => ({
        id: tq.id,
        questionId: tq.questionId,
        order: tq.order,
        questionText: tq.question.versions[0]?.questionText || "Question",
        difficulty: tq.question.difficulty,
        language: tq.question.language,
        subjectName: tq.question.subject.name,
        topicName: tq.question.topic.name,
      })),
      available: availableQuestions.map((q) => ({
        id: q.id,
        questionText: q.versions[0]?.questionText || "Question",
        difficulty: q.difficulty,
        language: q.language,
        subjectName: q.subject.name,
        topicName: q.topic.name,
      })),
    });
  } catch (error: any) {
    console.error("Get test questions error:", error);
    return NextResponse.json({ error: "Failed to fetch test questions." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { testId, questionIds } = await req.json();

    if (!testId || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: "Test ID and question IDs are required." }, { status: 400 });
    }

    const currentCount = await db.mockTestQuestion.count({ where: { testId } });

    for (let i = 0; i < questionIds.length; i++) {
      const qid = questionIds[i];
      const existing = await db.mockTestQuestion.findUnique({
        where: { testId_questionId: { testId, questionId: qid } },
      });

      if (!existing) {
        await db.mockTestQuestion.create({
          data: {
            testId,
            questionId: qid,
            order: currentCount + i + 1,
          },
        });
      }
    }

    return NextResponse.json({ success: true, addedCount: questionIds.length });
  } catch (error: any) {
    console.error("Add test questions error:", error);
    return NextResponse.json({ error: "Failed to add questions." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get("testId");
    const questionId = searchParams.get("questionId");

    if (!testId || !questionId) {
      return NextResponse.json({ error: "Test ID and Question ID are required." }, { status: 400 });
    }

    await db.mockTestQuestion.delete({
      where: { testId_questionId: { testId, questionId } },
    });

    return NextResponse.json({ success: true, removedQuestionId: questionId });
  } catch (error: any) {
    console.error("Remove test question error:", error);
    return NextResponse.json({ error: "Failed to remove question." }, { status: 500 });
  }
}
