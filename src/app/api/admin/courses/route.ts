import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const exams = await db.exam.findMany({
      include: {
        category: true,
        syllabi: {
          include: {
            subjects: {
              include: {
                _count: { select: { topics: true, questions: true } },
              },
            },
          },
        },
        _count: {
          select: {
            questionExams: true,
            mockTests: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const categories = await db.examCategory.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ exams, categories });
  } catch (error: any) {
    console.error("Fetch courses error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      code,
      description,
      categoryId: rawCategoryId,
      customCategoryName,
      order,
      isActive,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Course title is required." }, { status: 400 });
    }

    // 1. Resolve or create category
    let effectiveCategoryId = rawCategoryId;
    if (customCategoryName && customCategoryName.trim()) {
      const trimmedCat = customCategoryName.trim();
      let cat = await db.examCategory.findFirst({
        where: { name: { equals: trimmedCat } },
      });

      if (!cat) {
        const catCode = trimmedCat
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "_")
          .substring(0, 30) || `CAT_${Date.now()}`;

        cat = await db.examCategory.create({
          data: {
            name: trimmedCat,
            code: catCode,
          },
        });
      }

      effectiveCategoryId = cat.id;
    }

    if (!effectiveCategoryId) {
      // Default to first category if available, or create a general one
      const firstCat = await db.examCategory.findFirst({ orderBy: { order: "asc" } });
      if (firstCat) {
        effectiveCategoryId = firstCat.id;
      } else {
        const newCat = await db.examCategory.create({
          data: {
            name: "General Competitive Examinations",
            code: "GENERAL_EXAMS",
          },
        });
        effectiveCategoryId = newCat.id;
      }
    }

    // Generate unique code if not provided
    let effectiveCode = code && code.trim() ? code.trim().toUpperCase() : "";
    if (!effectiveCode) {
      effectiveCode = title
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "_")
        .substring(0, 35);
      
      const existingWithCode = await db.exam.findUnique({ where: { code: effectiveCode } });
      if (existingWithCode) {
        effectiveCode = `${effectiveCode}_${Date.now().toString().slice(-4)}`;
      }
    }

    // 2. Create the Exam / Course
    const exam = await db.exam.create({
      data: {
        categoryId: effectiveCategoryId,
        title: title.trim(),
        code: effectiveCode,
        description: description?.trim() || `Official preparation track for ${title.trim()}`,
        order: typeof order === "number" ? order : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: {
        category: true,
      },
    });

    // 3. Auto-initialize an official SyllabusVersion so subjects and topics can attach immediately
    await db.syllabusVersion.create({
      data: {
        examId: exam.id,
        versionCode: "2081_OFFICIAL",
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, exam });
  } catch (error: any) {
    console.error("Create course error:", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A course with this code already exists. Please choose a unique code." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create course." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title, code, description, categoryId, isActive, order } = body;

    if (!id) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const existing = await db.exam.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const updated = await db.exam.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        code: code !== undefined ? code.trim().toUpperCase() : existing.code,
        description: description !== undefined ? description.trim() : existing.description,
        categoryId: categoryId || existing.categoryId,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        order: typeof order === "number" ? order : existing.order,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, exam: updated });
  } catch (error: any) {
    console.error("Update course error:", error);
    return NextResponse.json({ error: "Failed to update course." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Check if course has questions or mock tests
    const questionCount = await db.questionExam.count({ where: { examId: id } });
    if (questionCount > 0) {
      // Soft-delete by setting isActive to false to prevent cascading corruption
      await db.exam.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        deactivated: true,
        message: "Course has existing linked questions, so it was marked as Inactive instead of permanently deleted.",
      });
    }

    await db.exam.delete({ where: { id } });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("Delete course error:", error);
    return NextResponse.json({ error: "Failed to delete course." }, { status: 500 });
  }
}
