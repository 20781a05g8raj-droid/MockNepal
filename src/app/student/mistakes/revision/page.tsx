import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTodayNepalDateString } from "@/lib/nepal-date";
import RevisionRunner from "./RevisionRunner";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function RevisionPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const todayNepal = getTodayNepalDateString();

  // Fetch only due mistake items
  const dueItems = await db.revisionItem.findMany({
    where: {
      userId: user.id,
      isMastered: false,
      nextRevisionDueNepalDate: { lte: todayNepal },
    },
    include: {
      question: {
        include: {
          subject: true,
          topic: true,
          versions: { orderBy: { versionNumber: "desc" }, take: 1 },
        },
      },
    },
  });

  if (dueItems.length === 0) {
    return (
      <div className="container-reading" style={{ marginTop: "2rem" }}>
        <div className="card text-center" style={{ padding: "3rem" }}>
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h2>No Revision Items Due Today!</h2>
          <p className="text-muted mt-2 mb-4">
            You are completely caught up on your spaced repetition schedule.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/student/mistakes" className="btn btn-secondary">
              View All Mistakes in Notebook
            </Link>
            <Link href="/student/practice" className="btn btn-primary">
              Practice New Questions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const payload = dueItems.map((item) => {
    const q = item.question;
    const v = q.versions[0];
    return {
      questionId: q.id,
      stage: item.stage,
      questionText: v?.questionText || "",
      optionA: v?.optionA || "",
      optionB: v?.optionB || "",
      optionC: v?.optionC || "",
      optionD: v?.optionD || "",
      subjectName: q.subject.name,
      topicName: q.topic.name,
    };
  });

  return <RevisionRunner items={payload} />;
}
