import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { questionId } = await req.json();
    if (!questionId) return NextResponse.json({ error: "questionId is required" }, { status: 400 });

    const existing = await db.bookmark.findUnique({
      where: {
        userId_itemType_itemId: {
          userId: user.id,
          itemType: "QUESTION",
          itemId: questionId,
        },
      },
    });

    if (existing) {
      await db.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ bookmarked: false });
    } else {
      await db.bookmark.create({
        data: {
          userId: user.id,
          itemType: "QUESTION",
          itemId: questionId,
        },
      });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}
