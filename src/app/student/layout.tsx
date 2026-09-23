import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureDailyMissions } from "@/lib/missions";
import StudentShellWrapper from "@/components/StudentShellWrapper";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure daily missions are populated for today's Nepal date
  await ensureDailyMissions(user.id, user.targetExamId);

  // Fetch full student profile with target exam and active entitlement
  const profile = await db.studentProfile.findUnique({
    where: { userId: user.id },
    include: { targetExam: true },
  });

  const activeEntitlement = await db.entitlement.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      validUntil: { gt: new Date() },
    },
  });

  let activePassDays: number | null = null;
  if (activeEntitlement) {
    const diffMs = activeEntitlement.validUntil.getTime() - Date.now();
    activePassDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  // Fetch all available active exams for the switcher
  const availableExams = await db.exam.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { order: "asc" },
  });

  return (
    <StudentShellWrapper
      user={user}
      targetExamTitle={profile?.targetExam?.title}
      activePassDays={activePassDays}
      streakCount={profile?.streakCount ?? 0}
      xpPoints={profile?.xpPoints ?? 0}
      targetExamId={profile?.targetExamId}
      availableExams={availableExams}
    >
      {children}
    </StudentShellWrapper>
  );
}

