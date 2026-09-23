import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Play,
  ArrowRight,
  Award,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PracticeResultsPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function PracticeResultsPage({ params }: PracticeResultsPageProps) {
  const { sessionId } = await params;
  const user = await getSessionUser();
  if (!user) return redirect("/login");

  let session: any = null;
  try {
    session = await db.practiceSession.findUnique({
      where: { id: sessionId },
      include: {
        exam: true,
        subject: true,
        topic: true,
        answers: {
          include: {
            questionVersion: {
              include: {
                question: {
                  include: { topic: true },
                },
              },
            },
          },
          orderBy: { submittedAt: "asc" },
        },
      },
    });
  } catch (e) {
    console.warn("DB lookup error on results page:", e);
  }

  if (!session && sessionId.startsWith("sess_")) {
    try {
      const decodedJson = Buffer.from(sessionId.slice(5), "base64url").toString("utf-8");
      const decoded = JSON.parse(decodedJson);
      if (decoded.u === user.id) {
        const exam = await db.exam.findUnique({ where: { id: decoded.e } });
        const subject = await db.subject.findUnique({ where: { id: decoded.s } });
        const topic = decoded.t && decoded.t !== "ALL" ? await db.topic.findUnique({ where: { id: decoded.t } }) : null;

        if (exam && subject) {
          session = {
            id: decoded.id || sessionId,
            userId: user.id,
            examId: decoded.e,
            subjectId: decoded.s,
            topicId: decoded.t && decoded.t !== "ALL" ? decoded.t : null,
            difficultyFilter: decoded.d || "ALL",
            totalQuestions: decoded.c || 10,
            status: "COMPLETED",
            startedAt: new Date(decoded.ts || Date.now()),
            completedAt: new Date(),
            exam,
            subject,
            topic,
            answers: [],
          };
        }
      }
    } catch (e) {
      console.error("Failed to decode session on results page:", e);
    }
  }

  if (!session || session.userId !== user.id) {
    notFound();
  }

  const answers = session.answers || [];
  const totalSubmitted = answers.length;
  const correctCount = answers.filter((a: any) => a.isCorrect).length;
  const incorrectCount = totalSubmitted - correctCount;
  const unansweredCount = Math.max(0, session.totalQuestions - totalSubmitted);

  const accuracyPercent = totalSubmitted > 0
    ? Math.round((correctCount / totalSubmitted) * 100)
    : null;

  const totalTimeSeconds = answers.reduce((acc: number, a: any) => acc + a.timeSpentSeconds, 0);
  const avgTimePerQuestion = totalSubmitted > 0
    ? Math.round(totalTimeSeconds / totalSubmitted)
    : 0;

  // Topic breakdown
  const topicStatsMap = new Map<string, { name: string; total: number; correct: number }>();
  for (const a of answers) {
    const tName = a.questionVersion.question.topic?.name || "General";
    const curr = topicStatsMap.get(tName) || { name: tName, total: 0, correct: 0 };
    curr.total++;
    if (a.isCorrect) curr.correct++;
    topicStatsMap.set(tName, curr);
  }
  const topicStats = Array.from(topicStatsMap.values());

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center gap-2 text-sm text-muted mb-3">
        <Link href="/student/dashboard" className="text-muted hover-underline">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/student/practice" className="text-muted hover-underline">Practice Sessions</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Session Results</span>
      </div>

      <div className="card mb-4" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#DCFCE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            color: "#16A34A",
          }}
        >
          <Award className="w-8 h-8" />
        </div>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Practice Session Complete!
        </h1>
        <p className="text-muted" style={{ maxWidth: "500px", margin: "0 auto 1.5rem" }}>
          Track: <strong>{session.exam.title}</strong> • Subject: <strong>{session.subject.name}</strong>
          {session.topic && <span> • Topic: <strong>{session.topic.name}</strong></span>}
        </p>

        {/* Big Metrics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1rem",
            maxWidth: "640px",
            margin: "0 auto 2rem",
          }}
        >
          <div className="card" style={{ padding: "1.25rem 1rem", backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#16A34A" }}>
              {correctCount}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#166534", fontWeight: 600 }}>Correct Answers</div>
          </div>

          <div className="card" style={{ padding: "1.25rem 1rem", backgroundColor: "#FEF2F2", borderColor: "#FECACA" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#DC2626" }}>
              {incorrectCount}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#991B1B", fontWeight: 600 }}>Incorrect Answers</div>
          </div>

          <div className="card" style={{ padding: "1.25rem 1rem", backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0F172A" }}>
              {accuracyPercent !== null ? `${accuracyPercent}%` : "N/A"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600 }}>Accuracy Rate</div>
          </div>

          <div className="card" style={{ padding: "1.25rem 1rem", backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0F172A" }}>
              {avgTimePerQuestion}s
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600 }}>Avg Speed/Qn</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 flex-wrap">
          <Link href="/student/practice" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Play className="w-4 h-4 fill-white" />
            <span>Start Another Practice</span>
          </Link>
          <Link href="/student/mistakes" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <RotateCcw className="w-4 h-4" />
            <span>Review Mistake Notebook</span>
          </Link>
          <Link href="/student/dashboard" className="btn btn-secondary">
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
