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
        syllabi: {
          include: {
            subjects: {
              include: {
                topics: {
                  include: {
                    _count: {
                      select: { questions: true, notes: true },
                    },
                  },
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ exams });
  } catch (error: any) {
    console.error("Fetch syllabus error:", error);
    return NextResponse.json({ error: "Failed to fetch syllabus data." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, examId, subjectId, name, code, estimatedMinutes } = body;

    if (action === "ADD_SUBJECT") {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: "Subject name is required." }, { status: 400 });
      }

      let syllabusVersion = await db.syllabusVersion.findFirst({
        where: { examId },
        orderBy: { versionCode: "desc" },
      });

      if (!syllabusVersion) {
        syllabusVersion = await db.syllabusVersion.create({
          data: { examId, versionCode: "2081_GENERAL" },
        });
      }

      const generatedCode = (code || name)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "_")
        .substring(0, 30);

      const subject = await db.subject.create({
        data: {
          syllabusVersionId: syllabusVersion.id,
          name: name.trim(),
          code: generatedCode || `SUB_${Date.now()}`,
        },
      });

      return NextResponse.json({ success: true, subject });
    }

    if (action === "ADD_TOPIC") {
      if (!subjectId) {
        return NextResponse.json({ error: "Subject ID is required." }, { status: 400 });
      }
      if (!name || !name.trim()) {
        return NextResponse.json({ error: "Topic name is required." }, { status: 400 });
      }

      const generatedCode = (code || name)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "_")
        .substring(0, 30);

      const topic = await db.topic.create({
        data: {
          subjectId,
          name: name.trim(),
          code: generatedCode || `TOP_${Date.now()}`,
          estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : 30,
        },
      });

      return NextResponse.json({ success: true, topic });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Create syllabus item error:", error);
    return NextResponse.json({ error: "Failed to create item." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, id, name, code, estimatedMinutes, order } = body;

    if (action === "UPDATE_SUBJECT") {
      if (!id || !name) {
        return NextResponse.json({ error: "Subject ID and Name are required." }, { status: 400 });
      }

      const updated = await db.subject.update({
        where: { id },
        data: {
          name: name.trim(),
          code: code ? code.trim() : undefined,
          order: order !== undefined ? parseInt(order, 10) : undefined,
        },
      });

      return NextResponse.json({ success: true, subject: updated });
    }

    if (action === "UPDATE_TOPIC") {
      if (!id || !name) {
        return NextResponse.json({ error: "Topic ID and Name are required." }, { status: 400 });
      }

      const updated = await db.topic.update({
        where: { id },
        data: {
          name: name.trim(),
          code: code ? code.trim() : undefined,
          estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : undefined,
          order: order !== undefined ? parseInt(order, 10) : undefined,
        },
      });

      return NextResponse.json({ success: true, topic: updated });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Update syllabus item error:", error);
    return NextResponse.json({ error: "Failed to update item." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "SUBJECT" or "TOPIC"
    const id = searchParams.get("id");

    if (!id || !type) {
      return NextResponse.json({ error: "ID and type are required." }, { status: 400 });
    }

    if (type === "SUBJECT") {
      await db.subject.delete({ where: { id } });
      return NextResponse.json({ success: true, deletedId: id });
    }

    if (type === "TOPIC") {
      await db.topic.delete({ where: { id } });
      return NextResponse.json({ success: true, deletedId: id });
    }

    return NextResponse.json({ error: "Invalid type." }, { status: 400 });
  } catch (error: any) {
    console.error("Delete syllabus item error:", error);
    return NextResponse.json({ error: "Failed to delete item." }, { status: 500 });
  }
}
