import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notes = await db.note.findMany({
      include: {
        topic: {
          include: {
            subject: {
              include: {
                syllabusVersion: {
                  include: { exam: true },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch (error: any) {
    console.error("Fetch notes error:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
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
      examId,
      subjectId: rawSubjectId,
      customSubjectName,
      topicId: rawTopicId,
      customTopicName,
      noteType,
      pdfUrl,
      pdfFileName,
      fileSizeBytes,
      contentHtml,
      summary,
      source,
      accessLevel,
      status,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Note title is required." }, { status: 400 });
    }

    const type = noteType === "PDF" ? "PDF" : "ARTICLE";

    if (type === "PDF" && (!pdfUrl || !pdfUrl.trim())) {
      return NextResponse.json({ error: "PDF file or document URL is required for PDF notes." }, { status: 400 });
    }

    if (type === "ARTICLE" && (!contentHtml || !contentHtml.trim())) {
      return NextResponse.json({ error: "Article content is required." }, { status: 400 });
    }

    // Resolve subject
    let effectiveSubjectId = rawSubjectId;
    if (customSubjectName && customSubjectName.trim()) {
      const trimmedSub = customSubjectName.trim();
      let subject = await db.subject.findFirst({
        where: { name: { equals: trimmedSub } },
      });

      if (!subject) {
        let syllabusVersion = await db.syllabusVersion.findFirst({
          where: examId ? { examId } : undefined,
          orderBy: { versionCode: "desc" },
        });

        if (!syllabusVersion && examId) {
          syllabusVersion = await db.syllabusVersion.create({
            data: { examId, versionCode: "2081_GENERAL" },
          });
        }

        if (syllabusVersion) {
          subject = await db.subject.create({
            data: {
              syllabusVersionId: syllabusVersion.id,
              name: trimmedSub,
              code: trimmedSub.toUpperCase().replace(/[^A-Z0-9]/g, "_").substring(0, 30) || `SUB_${Date.now()}`,
            },
          });
        }
      }

      if (subject) effectiveSubjectId = subject.id;
    }

    if (!effectiveSubjectId) {
      return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    }

    // Resolve topic
    let effectiveTopicId = rawTopicId;
    if (customTopicName && customTopicName.trim()) {
      const trimmedTopic = customTopicName.trim();
      let topic = await db.topic.findFirst({
        where: {
          subjectId: effectiveSubjectId,
          name: { equals: trimmedTopic },
        },
      });

      if (!topic) {
        topic = await db.topic.create({
          data: {
            subjectId: effectiveSubjectId,
            name: trimmedTopic,
            code: trimmedTopic.toUpperCase().replace(/[^A-Z0-9]/g, "_").substring(0, 30) || `TOP_${Date.now()}`,
          },
        });
      }

      if (topic) effectiveTopicId = topic.id;
    }

    if (!effectiveTopicId) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const note = await db.note.create({
      data: {
        title: title.trim(),
        topicId: effectiveTopicId,
        noteType: type,
        contentHtml: contentHtml ? contentHtml.trim() : "",
        pdfUrl: type === "PDF" ? pdfUrl.trim() : null,
        pdfFileName: type === "PDF" && pdfFileName ? pdfFileName.trim() : null,
        fileSizeBytes: type === "PDF" && fileSizeBytes ? parseInt(fileSizeBytes, 10) : null,
        summary: summary ? summary.trim() : null,
        source: source ? source.trim() : "Official Gazette / Curriculum",
        accessLevel: accessLevel || "FREE",
        status: status || "PUBLISHED",
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, noteId: note.id });
  } catch (error: any) {
    console.error("Create note error:", error);
    return NextResponse.json({ error: "Failed to create study note." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
      title,
      topicId,
      noteType,
      pdfUrl,
      pdfFileName,
      fileSizeBytes,
      contentHtml,
      summary,
      source,
      accessLevel,
      status,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    const existing = await db.note.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const updated = await db.note.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        topicId: topicId || existing.topicId,
        noteType: noteType || existing.noteType,
        pdfUrl: pdfUrl !== undefined ? pdfUrl : existing.pdfUrl,
        pdfFileName: pdfFileName !== undefined ? pdfFileName : existing.pdfFileName,
        fileSizeBytes: fileSizeBytes !== undefined ? fileSizeBytes : existing.fileSizeBytes,
        contentHtml: contentHtml !== undefined ? contentHtml.trim() : existing.contentHtml,
        summary: summary !== undefined ? summary?.trim() : existing.summary,
        source: source !== undefined ? source?.trim() : existing.source,
        accessLevel: accessLevel || existing.accessLevel,
        status: status || existing.status,
      },
    });

    return NextResponse.json({ success: true, note: updated });
  } catch (error: any) {
    console.error("Update note error:", error);
    return NextResponse.json({ error: "Failed to update study note." }, { status: 500 });
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
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    await db.note.delete({ where: { id } });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("Delete note error:", error);
    return NextResponse.json({ error: "Failed to delete study note." }, { status: 500 });
  }
}
