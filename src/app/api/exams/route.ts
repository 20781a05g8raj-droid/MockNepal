import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const exams = await db.exam.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { order: "asc" },
    });

    const data = exams.map((e) => ({
      id: e.id,
      title: e.title,
      code: e.code,
      categoryName: e.category.name,
    }));

    return NextResponse.json({ exams: data });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json({ exams: [] }, { status: 500 });
  }
}
