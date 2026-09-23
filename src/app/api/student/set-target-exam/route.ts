import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureDailyMissions } from "@/lib/missions";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { examId } = await req.json();
    if (!examId) return NextResponse.json({ error: "examId required" }, { status: 400 });

    await db.studentProfile.upsert({
      where: { userId: user.id },
      update: { targetExamId: examId },
      create: {
        userId: user.id,
        targetExamId: examId,
      },
    });

    await ensureDailyMissions(user.id, examId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update target exam" }, { status: 500 });
  }
}
