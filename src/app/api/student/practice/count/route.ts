import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const examId = searchParams.get("examId");
  const subjectId = searchParams.get("subjectId");
  const topicId = searchParams.get("topicId");
  const difficulty = searchParams.get("difficulty") || "ALL";

  if (!examId || !subjectId) {
    return NextResponse.json({ error: "examId and subjectId are required" }, { status: 400 });
  }

  // Check user entitlement
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
    questionExams: {
      some: { examId },
    },
    ...(!isPremium ? { accessLevel: "FREE" } : {}),
  };

  if (topicId && topicId !== "ALL") {
    whereClause.topicId = topicId;
  }

  if (difficulty && difficulty !== "ALL") {
    whereClause.difficulty = difficulty.toUpperCase();
  }

  const count = await db.question.count({ where: whereClause });

  return NextResponse.json({ count, isPremium });
}
