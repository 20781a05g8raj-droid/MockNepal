import { db } from "./db";
import { getTodayNepalDateString, isYesterdayNepalDate } from "./nepal-date";

export async function ensureDailyMissions(userId: string, targetExamId?: string | null) {
  const today = getTodayNepalDateString();

  // Check if missions already exist for today
  const existing = await db.dailyMission.findMany({
    where: {
      userId,
      nepalDate: today,
    },
  });

  if (existing.length >= 2) {
    return existing;
  }

  // Generate deterministic 3 tasks:
  // 1. Practice count
  // 2. Mistake revision count
  // 3. Topic learning

  const missions = [];

  const practiceMission = await db.dailyMission.upsert({
    where: {
      userId_nepalDate_taskType: {
        userId,
        nepalDate: today,
        taskType: "PRACTICE_COUNT",
      },
    },
    update: {},
    create: {
      userId,
      nepalDate: today,
      taskType: "PRACTICE_COUNT",
      title: "Practice at least 10 MCQs in your target exam syllabus",
      targetCount: 10,
      currentCount: 0,
      isCompleted: false,
      xpEarned: 50,
      actionUrl: "/student/practice",
    },
  });
  missions.push(practiceMission);

  const revisionMission = await db.dailyMission.upsert({
    where: {
      userId_nepalDate_taskType: {
        userId,
        nepalDate: today,
        taskType: "MISTAKE_REVISION",
      },
    },
    update: {},
    create: {
      userId,
      nepalDate: today,
      taskType: "MISTAKE_REVISION",
      title: "Review 3 due items from your Mistake Notebook",
      targetCount: 3,
      currentCount: 0,
      isCompleted: false,
      xpEarned: 40,
      actionUrl: "/student/mistakes",
    },
  });
  missions.push(revisionMission);

  const noteMission = await db.dailyMission.upsert({
    where: {
      userId_nepalDate_taskType: {
        userId,
        nepalDate: today,
        taskType: "TOPIC_NOTE",
      },
    },
    update: {},
    create: {
      userId,
      nepalDate: today,
      taskType: "TOPIC_NOTE",
      title: "Read 1 official topic study note and mark topic progress",
      targetCount: 1,
      currentCount: 0,
      isCompleted: false,
      xpEarned: 30,
      actionUrl: "/student/notes",
    },
  });
  missions.push(noteMission);

  return missions;
}

export async function incrementMissionProgress(userId: string, taskType: string, amount: number = 1) {
  const today = getTodayNepalDateString();
  const mission = await db.dailyMission.findUnique({
    where: {
      userId_nepalDate_taskType: {
        userId,
        nepalDate: today,
        taskType,
      },
    },
  });

  if (!mission) return;

  const newCount = mission.currentCount + amount;
  const isNowCompleted = newCount >= mission.targetCount;

  await db.dailyMission.update({
    where: { id: mission.id },
    data: {
      currentCount: newCount,
      isCompleted: isNowCompleted,
    },
  });

  // If newly completed, award XP and check streak
  if (isNowCompleted && !mission.isCompleted) {
    await awardXPAndCheckStreak(userId, mission.xpEarned, today);
  }
}

async function awardXPAndCheckStreak(userId: string, xp: number, todayNepal: string) {
  const profile = await db.studentProfile.findUnique({
    where: { userId },
  });

  if (!profile) return;

  // Check if all today's missions are completed
  const allMissions = await db.dailyMission.findMany({
    where: { userId, nepalDate: todayNepal },
  });
  const allDone = allMissions.length > 0 && allMissions.every((m) => m.isCompleted);

  let newStreak = profile.streakCount;
  if (allDone && profile.lastActiveNepalDate !== todayNepal) {
    if (profile.lastActiveNepalDate && isYesterdayNepalDate(profile.lastActiveNepalDate)) {
      newStreak += 1;
    } else if (!profile.lastActiveNepalDate) {
      newStreak = 1;
    } else {
      newStreak = 1; // broken streak restarted
    }
  }

  await db.studentProfile.update({
    where: { userId },
    data: {
      xpPoints: { increment: xp },
      streakCount: newStreak,
      lastActiveNepalDate: allDone ? todayNepal : profile.lastActiveNepalDate,
    },
  });
}
