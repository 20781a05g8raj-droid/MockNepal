import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTodayNepalDateString } from "@/lib/nepal-date";
import { ensureDailyMissions } from "@/lib/missions";
import { Target, Flame, Award, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";

export default async function MissionsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const todayNepal = getTodayNepalDateString();
  const missions = await ensureDailyMissions(user.id, user.targetExamId);

  const profile = await db.studentProfile.findUnique({
    where: { userId: user.id },
  });

  const completedMissionsCount = missions.filter((m) => m.isCompleted).length;
  const allMissionsCompleted = completedMissionsCount === missions.length && missions.length > 0;

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Top Banner: Vibrant Emerald Green */}
      <div
        className="card"
        style={{
          backgroundColor: "#F0FDF4",
          border: "2px solid #BBF7D0",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 4px 14px rgba(22, 163, 74, 0.08)",
        }}
      >
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                style={{
                  backgroundColor: "#16A34A",
                  color: "#FFFFFF",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.25rem 0.65rem",
                  borderRadius: "var(--radius-full)",
                }}
              >
                🎯 Daily Discipline • दैनिक लक्ष्य
              </span>
              <span style={{ fontSize: "0.75rem", color: "#15803D", fontWeight: 600 }}>
                Nepal Date: {todayNepal}
              </span>
            </div>
            <h1 style={{ fontSize: "1.55rem", color: "#14532D", fontWeight: 800 }}>
              Today&apos;s Learning Missions
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#166534", marginTop: "0.3rem", maxWidth: "600px" }}>
              निरन्तर अध्ययन बानी विकास गर्नुहोस्। दैनिक मिसन पूरा गर्दा तपाईंको streak सुरक्षित हुन्छ र शैक्षिक XP प्राप्त हुन्छ।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div style={{ textAlign: "center", padding: "0.6rem 1.1rem", backgroundColor: "#FEF3C7", borderRadius: "var(--radius-md)", border: "1.5px solid #FCD34D", boxShadow: "0 2px 6px rgba(217,119,6,0.15)" }}>
              <div className="flex items-center justify-center gap-1.5 text-amber-600 font-extrabold">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                <span style={{ fontSize: "1.4rem" }}>{profile?.streakCount ?? 0}</span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#92400E", fontWeight: 700 }}>Day Streak</span>
            </div>

            <div style={{ textAlign: "center", padding: "0.6rem 1.1rem", backgroundColor: "#EFF6FF", borderRadius: "var(--radius-md)", border: "1.5px solid #BFDBFE", boxShadow: "0 2px 6px rgba(37,99,235,0.15)" }}>
              <div className="flex items-center justify-center gap-1.5 text-blue-600 font-extrabold">
                <Award className="w-5 h-5 text-blue-600" />
                <span style={{ fontSize: "1.4rem" }}>{profile?.xpPoints ?? 0}</span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#1E40AF", fontWeight: 700 }}>Academic XP</span>
            </div>
          </div>
        </div>

        {allMissionsCompleted && (
          <div
            style={{
              backgroundColor: "#DCFCE7",
              border: "1.5px solid #86EFAC",
              borderRadius: "var(--radius-md)",
              padding: "0.9rem 1.25rem",
              marginTop: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#14532D",
            }}
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <strong>Daily Missions Successfully Completed for {todayNepal}!</strong>
              <div style={{ fontSize: "0.85rem", marginTop: 2, color: "#166534" }}>
                आजको अध्ययन लक्ष्य सुरक्षित भयो। भोलि बिहान नयाँ मिसनका साथ पुनः भेटौँला (Asia/Kathmandu)।
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Missions Checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {missions.map((mission, idx) => {
          const pct = Math.min(100, Math.round((mission.currentCount / mission.targetCount) * 100));

          return (
            <div
              key={mission.id}
              className="card"
              style={{
                border: mission.isCompleted ? "1.5px solid #86EFAC" : "1.5px solid #BBF7D0",
                borderLeft: mission.isCompleted ? "5px solid #16A34A" : "5px solid #10B981",
                backgroundColor: mission.isCompleted ? "#F0FDF4" : "#FFFFFF",
                boxShadow: "0 2px 8px rgba(22, 163, 74, 0.05)",
              }}
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      style={{
                        backgroundColor: "#DCFCE7",
                        color: "#15803D",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                      }}
                    >
                      Task {idx + 1}
                    </span>
                    <span
                      style={{
                        backgroundColor: "#FEF3C7",
                        color: "#92400E",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "var(--radius-full)",
                        border: "1px solid #FDE68A",
                      }}
                    >
                      +{mission.xpEarned} XP
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.15rem", color: "#14532D", fontWeight: 700 }}>
                    {mission.title}
                  </h3>
                </div>

                {mission.isCompleted ? (
                  <span
                    style={{
                      backgroundColor: "#16A34A",
                      color: "#FFFFFF",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.35rem 0.75rem",
                      borderRadius: "var(--radius-full)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed</span>
                  </span>
                ) : (
                  <Link
                    href={mission.actionUrl}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: "#16A34A",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      padding: "0.45rem 1rem",
                      border: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)",
                    }}
                  >
                    <span>Start Task</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-muted mb-1.5">
                  <span style={{ fontWeight: 600, color: "#166534" }}>Progress: {mission.currentCount} of {mission.targetCount}</span>
                  <span style={{ fontWeight: 700, color: "#15803D" }}>{pct}%</span>
                </div>
                <div className="progress-bar" style={{ backgroundColor: "#E2E8F0", height: "8px" }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      backgroundColor: mission.isCompleted ? "#16A34A" : "#10B981",
                      borderRadius: "var(--radius-full)",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Streak Rule Disclosure (PRD Section 14) */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #BBF7D0",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <strong style={{ fontSize: "0.875rem", color: "#14532D" }}>Streak Rules & Transparency:</strong>
        </div>
        <p style={{ fontSize: "0.825rem", color: "#475569", lineHeight: "1.5" }}>
          A qualifying study day is recorded when you complete your daily learning tasks. Streaks count consecutive calendar days according to Nepal Standard Time (`Asia/Kathmandu`). Missing a day resets the streak counter to 1 on your next qualifying day.
        </p>
      </div>
    </div>
  );
}
