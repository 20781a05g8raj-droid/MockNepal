import { db } from "./db";

export type TopicProficiency = "INSUFFICIENT_DATA" | "NEEDS_IMPROVEMENT" | "DEVELOPING" | "STRONG";

export interface TopicPerformanceResult {
  topicId: string;
  topicName: string;
  subjectName: string;
  totalAttempts: number;
  correctAnswers: number;
  accuracyPercent: number | null;
  status: TopicProficiency;
  statusLabel: string;
}

export async function calculateTopicPerformance(userId: string): Promise<TopicPerformanceResult[]> {
  // Aggregate recent topic attempts
  const progressRecords = await db.topicProgress.findMany({
    where: { userId },
    include: {
      topic: {
        include: { subject: true },
      },
    },
    orderBy: { lastPracticedAt: "desc" },
  });

  return progressRecords.map((record) => {
    const total = record.questionsAttempted;
    const correct = record.questionsCorrect;

    if (total < 10) {
      return {
        topicId: record.topicId,
        topicName: record.topic.name,
        subjectName: record.topic.subject.name,
        totalAttempts: total,
        correctAnswers: correct,
        accuracyPercent: total > 0 ? Math.round((correct / total) * 100) : null,
        status: "INSUFFICIENT_DATA",
        statusLabel: "Insufficient Data (< 10 attempts)",
      };
    }

    const accuracy = Math.round((correct / total) * 100);

    if (accuracy < 50) {
      return {
        topicId: record.topicId,
        topicName: record.topic.name,
        subjectName: record.topic.subject.name,
        totalAttempts: total,
        correctAnswers: correct,
        accuracyPercent: accuracy,
        status: "NEEDS_IMPROVEMENT",
        statusLabel: "Needs Improvement (< 50%)",
      };
    } else if (accuracy < 75) {
      return {
        topicId: record.topicId,
        topicName: record.topic.name,
        subjectName: record.topic.subject.name,
        totalAttempts: total,
        correctAnswers: correct,
        accuracyPercent: accuracy,
        status: "DEVELOPING",
        statusLabel: "Developing (50% - 74%)",
      };
    } else {
      return {
        topicId: record.topicId,
        topicName: record.topic.name,
        subjectName: record.topic.subject.name,
        totalAttempts: total,
        correctAnswers: correct,
        accuracyPercent: accuracy,
        status: "STRONG",
        statusLabel: "Strong Performance (≥ 75%)",
      };
    }
  });
}
