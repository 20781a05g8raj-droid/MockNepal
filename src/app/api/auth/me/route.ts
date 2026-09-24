import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    // Fetch full profile info including target exam details
    const profile = await db.studentProfile.findUnique({
      where: { userId: session.id },
      include: { targetExam: true },
    });

    return NextResponse.json({
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        targetExamId: session.targetExamId,
        targetExamTitle: profile?.targetExam?.title || null,
        streakCount: profile?.streakCount || 0,
        xpPoints: profile?.xpPoints || 0,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ user: null });
  }
}
