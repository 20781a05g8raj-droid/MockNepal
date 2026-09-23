import { db } from "@/lib/db";
import AdminNotesClient from "./AdminNotesClient";

export default async function AdminNotesPage() {
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

  const exams = await db.exam.findMany({
    where: { isActive: true },
    select: { id: true, title: true },
    orderBy: { order: "asc" },
  });

  const subjects = await db.subject.findMany({
    select: { id: true, name: true },
    orderBy: { order: "asc" },
  });

  const topics = await db.topic.findMany({
    select: { id: true, name: true, subjectId: true },
    orderBy: { order: "asc" },
  });

  const formattedNotes = notes.map((n) => ({
    id: n.id,
    title: n.title,
    noteType: n.noteType || "ARTICLE",
    pdfUrl: n.pdfUrl,
    pdfFileName: n.pdfFileName,
    fileSizeBytes: n.fileSizeBytes,
    summary: n.summary,
    contentHtml: n.contentHtml,
    source: n.source,
    accessLevel: n.accessLevel,
    status: n.status,
    verifiedAt: n.verifiedAt ? n.verifiedAt.toISOString() : null,
    topicId: n.topicId,
    topicName: n.topic.name,
    subjectId: n.topic.subject.id,
    subjectName: n.topic.subject.name,
    examId: n.topic.subject.syllabusVersion.exam.id,
    examTitle: n.topic.subject.syllabusVersion.exam.title,
  }));

  return (
    <AdminNotesClient
      initialNotes={formattedNotes}
      exams={exams}
      subjects={subjects}
      topics={topics}
    />
  );
}
