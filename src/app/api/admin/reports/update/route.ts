import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reportId, status, adminNotes } = await req.json();

    if (!reportId || !status) {
      return NextResponse.json({ error: "reportId and status are required" }, { status: 400 });
    }

    const updated = await db.contentReport.update({
      where: { id: reportId },
      data: {
        status,
        adminNotes: adminNotes || undefined,
      },
    });

    return NextResponse.json({ success: true, report: updated });
  } catch (error: any) {
    console.error("Update report error:", error);
    return NextResponse.json({ error: "Failed to update content report" }, { status: 500 });
  }
}
