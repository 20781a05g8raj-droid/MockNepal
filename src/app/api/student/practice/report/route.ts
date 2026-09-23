import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { questionId, reason, details } = await req.json();

    if (!questionId || !reason || !details) {
      return NextResponse.json({ error: "Question, reason, and details are required" }, { status: 400 });
    }

    const report = await db.contentReport.create({
      data: {
        userId: user.id,
        questionId,
        reason: reason.toUpperCase(),
        details: details.trim(),
        status: "OPEN",
      },
    });

    return NextResponse.json({ success: true, reportId: report.id });
  } catch (error: any) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Failed to submit content report" }, { status: 500 });
  }
}
