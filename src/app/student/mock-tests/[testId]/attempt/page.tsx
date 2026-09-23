import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import MockTestRunner from "./MockTestRunner";

interface MockTestAttemptPageProps {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}

export default async function MockTestAttemptPage({ params, searchParams }: MockTestAttemptPageProps) {
  const { testId } = await params;
  const { attemptId } = await searchParams;
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (!attemptId) {
    redirect(`/student/mock-tests/${testId}`);
  }

  const attempt = await db.testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      mockTest: {
        include: {
          questions: {
            include: {
              question: {
                include: {
                  versions: { orderBy: { versionNumber: "desc" }, take: 1 },
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
      answers: true,
    },
  });

  if (!attempt || attempt.userId !== user.id) {
    notFound();
  }

  // If already submitted or timed out, take directly to results
  if (attempt.status === "SUBMITTED" || attempt.status === "TIMED_OUT") {
    redirect(`/student/mock-tests/${testId}/results/${attempt.id}`);
  }

  // If server deadline is in the past, close attempt and redirect
  if (new Date() > attempt.deadline) {
    redirect(`/student/mock-tests/${testId}/results/${attempt.id}`);
  }

  const mockTest = attempt.mockTest;
  const answersMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  const questionsPayload = mockTest.questions.map((tq) => {
    const q = tq.question;
    const v = q.versions[0];
    const savedAns = answersMap.get(q.id);

    // SECURITY: DO NOT expose correctOption or explanation to student during active test!
    return {
      id: q.id,
      order: tq.order,
      questionText: v?.questionText || "Question",
      optionA: v?.optionA || "",
      optionB: v?.optionB || "",
      optionC: v?.optionC || "",
      optionD: v?.optionD || "",
      selectedOption: savedAns?.selectedOption || null,
      isMarkedForReview: savedAns?.isMarkedForReview || false,
    };
  });

  return (
    <MockTestRunner
      attemptId={attempt.id}
      testId={mockTest.id}
      testTitle={mockTest.title}
      serverDeadlineMs={attempt.deadline.getTime()}
      totalQuestions={mockTest.totalQuestions}
      questions={questionsPayload}
    />
  );
}
