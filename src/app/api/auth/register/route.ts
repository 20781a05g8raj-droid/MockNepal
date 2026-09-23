import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSessionUser } from "@/lib/auth";
import { getTodayNepalDateString } from "@/lib/nepal-date";
import { ensureDailyMissions } from "@/lib/missions";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, targetExamId, languagePreference } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const todayNepal = getTodayNepalDateString();

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "STUDENT",
        profile: {
          create: {
            targetExamId: targetExamId || null,
            languagePreference: languagePreference || "NEPALI",
            dailyStudyTargetMinutes: 45,
            streakCount: 0,
            lastActiveNepalDate: todayNepal,
            xpPoints: 0,
          },
        },
      },
    });

    // Generate initial daily missions for the student
    await ensureDailyMissions(user.id, targetExamId);

    await setSessionUser({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({ success: true, redirectUrl: "/student/dashboard" });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "An error occurred during account creation" }, { status: 500 });
  }
}
