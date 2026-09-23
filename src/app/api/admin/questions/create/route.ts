import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "CONTENT_EDITOR" && user.role !== "OWNER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      questionId, // If editing existing
      examIds,
      subjectId: rawSubjectId,
      customSubjectName,
      topicId: rawTopicId,
      customTopicName,
      difficulty,
      language,
      questionType,
      examYear,
      source,
      accessLevel,
      status, // "DRAFT" or "PUBLISHED"
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption,
      explanation,
    } = await req.json();

    if (!questionText) {
      return NextResponse.json({ error: "Question text is required" }, { status: 400 });
    }

    // Resolve Exam for syllabus linking if custom subject/topic is created
    let targetExamId = examIds && examIds.length > 0 ? examIds[0] : null;
    if (!targetExamId) {
      const firstExam = await db.exam.findFirst({ orderBy: { order: "asc" } });
      targetExamId = firstExam?.id || null;
    }

    // 1. Resolve Subject (either by ID or custom name)
    let effectiveSubjectId = rawSubjectId;
    if (customSubjectName && customSubjectName.trim()) {
      const trimmedName = customSubjectName.trim();
      // Check if subject already exists
      let subject = await db.subject.findFirst({
        where: { name: { equals: trimmedName } },
      });

      if (!subject) {
        // Need a syllabus version to attach subject to
        let syllabusVersion = await db.syllabusVersion.findFirst({
          where: targetExamId ? { examId: targetExamId } : undefined,
          orderBy: { versionCode: "desc" },
        });

        if (!syllabusVersion && targetExamId) {
          syllabusVersion = await db.syllabusVersion.create({
            data: {
              examId: targetExamId,
              versionCode: "2081_GENERAL",
            },
          });
        }

        if (syllabusVersion) {
          const generatedCode = trimmedName
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "_")
            .substring(0, 30);

          subject = await db.subject.create({
            data: {
              syllabusVersionId: syllabusVersion.id,
              name: trimmedName,
              code: generatedCode || `SUB_${Date.now()}`,
            },
          });
        }
      }

      if (subject) {
        effectiveSubjectId = subject.id;
      }
    }

    if (!effectiveSubjectId) {
      return NextResponse.json({ error: "Subject is required (select existing or type custom name)." }, { status: 400 });
    }

    // 2. Resolve Topic (either by ID or custom name)
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
        const generatedCode = trimmedTopic
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "_")
          .substring(0, 30);

        topic = await db.topic.create({
          data: {
            subjectId: effectiveSubjectId,
            name: trimmedTopic,
            code: generatedCode || `TOP_${Date.now()}`,
          },
        });
      }

      effectiveTopicId = topic.id;
    }

    if (!effectiveTopicId) {
      return NextResponse.json({ error: "Topic is required (select existing or type custom name)." }, { status: 400 });
    }

    // If publishing, enforce all publication rules (PRD Section 7 & 8)
    if (status === "PUBLISHED") {
      if (!optionA || !optionB || !optionC || !optionD) {
        return NextResponse.json({ error: "All four options (A, B, C, D) must be provided to publish." }, { status: 400 });
      }
      if (!correctOption || !["A", "B", "C", "D"].includes(correctOption.toUpperCase())) {
        return NextResponse.json({ error: "Correct option must be one of A, B, C, or D." }, { status: 400 });
      }
      if (!explanation) {
        return NextResponse.json({ error: "Explanation is required before publication." }, { status: 400 });
      }
    }

    const cleanLanguage = (language || "NEPALI").trim();
    const cleanQuestionType = (questionType || "MODEL").trim();

    // IF EDITING EXISTING QUESTION
    if (questionId) {
      const existingQuestion = await db.question.findUnique({
        where: { id: questionId },
        include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
      });

      if (!existingQuestion) {
        return NextResponse.json({ error: "Question not found to update." }, { status: 404 });
      }

      await db.question.update({
        where: { id: questionId },
        data: {
          subjectId: effectiveSubjectId,
          topicId: effectiveTopicId,
          difficulty: difficulty || existingQuestion.difficulty,
          language: cleanLanguage,
          questionType: cleanQuestionType,
          examYear: examYear ? parseInt(examYear, 10) : null,
          source: source || null,
          accessLevel: accessLevel || existingQuestion.accessLevel,
          status: status || existingQuestion.status,
        },
      });

      // Check if version content changed
      const lastVersion = existingQuestion.versions[0];
      const hasContentChanged =
        !lastVersion ||
        lastVersion.questionText !== questionText.trim() ||
        lastVersion.optionA !== (optionA?.trim() || "") ||
        lastVersion.optionB !== (optionB?.trim() || "") ||
        lastVersion.optionC !== (optionC?.trim() || "") ||
        lastVersion.optionD !== (optionD?.trim() || "") ||
        lastVersion.correctOption !== (correctOption ? correctOption.toUpperCase() : "A") ||
        lastVersion.explanation !== (explanation?.trim() || "");

      if (hasContentChanged) {
        const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;
        await db.questionVersion.create({
          data: {
            questionId,
            versionNumber: nextVersionNumber,
            questionText: questionText.trim(),
            optionA: optionA?.trim() || "",
            optionB: optionB?.trim() || "",
            optionC: optionC?.trim() || "",
            optionD: optionD?.trim() || "",
            correctOption: correctOption ? correctOption.toUpperCase() : "A",
            explanation: explanation?.trim() || "",
            authorId: user.id,
          },
        });
      }

      // Update exam relations if provided
      if (examIds && Array.isArray(examIds)) {
        await db.questionExam.deleteMany({ where: { questionId } });
        for (const eid of examIds) {
          await db.questionExam.create({
            data: {
              questionId,
              examId: eid,
            },
          });
        }
      }

      return NextResponse.json({ success: true, questionId, updated: true });
    }

    // IF CREATING NEW QUESTION
    const question = await db.question.create({
      data: {
        subjectId: effectiveSubjectId,
        topicId: effectiveTopicId,
        difficulty: difficulty || "INTERMEDIATE",
        language: cleanLanguage,
        questionType: cleanQuestionType,
        examYear: examYear ? parseInt(examYear, 10) : null,
        source: source || null,
        accessLevel: accessLevel || "FREE",
        status: status || "DRAFT",
      },
    });

    await db.questionVersion.create({
      data: {
        questionId: question.id,
        versionNumber: 1,
        questionText: questionText.trim(),
        optionA: optionA?.trim() || "",
        optionB: optionB?.trim() || "",
        optionC: optionC?.trim() || "",
        optionD: optionD?.trim() || "",
        correctOption: correctOption ? correctOption.toUpperCase() : "A",
        explanation: explanation?.trim() || "",
        authorId: user.id,
      },
    });

    if (examIds && Array.isArray(examIds)) {
      for (const eid of examIds) {
        await db.questionExam.create({
          data: {
            questionId: question.id,
            examId: eid,
          },
        });
      }
    }

    return NextResponse.json({ success: true, questionId: question.id });
  } catch (error: any) {
    console.error("Create question error:", error);
    return NextResponse.json({ error: "Failed to create question." }, { status: 500 });
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
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    await db.question.delete({ where: { id } });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("Delete question error:", error);
    return NextResponse.json({ error: "Failed to delete question." }, { status: 500 });
  }
}
