import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { incrementMissionProgress } from "@/lib/missions";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { topicId, isMarkedCompleted } = await req.json();

    if (!topicId) {
      return NextResponse.json({ error: "topicId is required" }, { status: 400 });
    }

    const record = await db.topicProgress.upsert({
      where: {
        userId_topicId: {
          userId: user.id,
          topicId,
        },
      },
      update: {
        isMarkedCompleted: !!isMarkedCompleted,
      },
      create: {
        userId: user.id,
        topicId,
        isMarkedCompleted: !!isMarkedCompleted,
      },
    });

    if (isMarkedCompleted) {
      await incrementMissionProgress(user.id, "TOPIC_NOTE", 1);
    }

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error("Topic progress update error:", error);
    return NextResponse.json({ error: "Failed to update topic progress" }, { status: 500 });
  }
}
