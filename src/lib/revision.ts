import { db } from "./db";
import { getTodayNepalDateString, addDaysToNepalDate } from "./nepal-date";

const STAGE_INTERVALS: Record<number, number> = {
  1: 1,  // 1 day later
  2: 3,  // 3 days later
  3: 7,  // 7 days later
  4: 14, // 14 days later
};

/**
 * Update the spaced-repetition revision item when a question is answered in practice or revision mode.
 */
export async function handleAnswerRevisionState(userId: string, questionId: string, isCorrect: boolean) {
  const today = getTodayNepalDateString();
  const existing = await db.revisionItem.findUnique({
    where: {
      userId_questionId: { userId, questionId },
    },
  });

  if (!isCorrect) {
    // Incorrect answer: reset to stage 1, due 1 day later (or today if urgent)
    const nextDue = addDaysToNepalDate(today, 1);
    if (existing) {
      await db.revisionItem.update({
        where: { id: existing.id },
        data: {
          stage: 1,
          incorrectCount: { increment: 1 },
          lastAttemptedAt: new Date(),
          nextRevisionDueNepalDate: nextDue,
          isMastered: false,
        },
      });
    } else {
      await db.revisionItem.create({
        data: {
          userId,
          questionId,
          stage: 1,
          incorrectCount: 1,
          lastAttemptedAt: new Date(),
          nextRevisionDueNepalDate: nextDue,
          isMastered: false,
        },
      });
    }
  } else if (existing && !existing.isMastered) {
    // Correct answer during a revision or practice:
    // If it was already in revision, advance the stage
    const nextStage = existing.stage + 1;
    if (nextStage > 4) {
      // Completed stage 4 (14 days): marked as mastered!
      await db.revisionItem.update({
        where: { id: existing.id },
        data: {
          stage: 4,
          isMastered: true,
          lastAttemptedAt: new Date(),
        },
      });
    } else {
      const daysToAdd = STAGE_INTERVALS[nextStage] ?? 14;
      const nextDue = addDaysToNepalDate(today, daysToAdd);
      await db.revisionItem.update({
        where: { id: existing.id },
        data: {
          stage: nextStage,
          lastAttemptedAt: new Date(),
          nextRevisionDueNepalDate: nextDue,
        },
      });
    }
  }
}
