import { db } from "@/lib/db";
import ReportsClient from "./ReportsClient";

export default async function AdminReportsPage() {
  const reports = await db.contentReport.findMany({
    include: {
      user: { select: { name: true, email: true } },
      question: {
        include: {
          subject: true,
          topic: true,
          versions: { orderBy: { versionNumber: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedReports = reports.map((r) => ({
    id: r.id,
    reason: r.reason,
    details: r.details,
    status: r.status,
    adminNotes: r.adminNotes,
    createdAt: r.createdAt.toISOString(),
    userName: r.user.name,
    userEmail: r.user.email,
    questionId: r.question.id,
    questionText: r.question.versions[0]?.questionText || "Question text unavailable",
    subjectName: r.question.subject.name,
    topicName: r.question.topic.name,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem" }}>Content Reports & Corrections</h1>
        <p className="text-sm text-muted">
          Review student error reports, investigate citations, and update question keys without altering historical test scores.
        </p>
      </div>

      <ReportsClient reports={formattedReports} />
    </div>
  );
}
