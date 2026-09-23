import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { questionIds, newStatus } = await req.json();

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0 || !newStatus) {
      return NextResponse.json({ error: "questionIds and newStatus required" }, { status: 400 });
    }

    if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // If publishing, ensure question versions have 4 options, valid correct option, and explanation
    if (newStatus === "PUBLISHED") {
      const questionsToCheck = await db.question.findMany({
        where: { id: { in: questionIds } },
        include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
      });

      for (const q of questionsToCheck) {
        const v = q.versions[0];
        if (!v || !v.optionA || !v.optionB || !v.optionC || !v.optionD || !v.correctOption || !v.explanation) {
          return NextResponse.json(
            { error: `Question ${q.id} cannot be published: missing options, answer key, or explanation.` },
            { status: 400 }
          );
        }
      }
    }

    await db.question.updateMany({
      where: { id: { in: questionIds } },
      data: { status: newStatus },
    });

    return NextResponse.json({ success: true, count: questionIds.length });
  } catch (error: any) {
    console.error("Update question status error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
