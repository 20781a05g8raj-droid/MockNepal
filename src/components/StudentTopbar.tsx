import Link from "next/link";
import { Flame, Award, BookOpen, User, CheckCircle2, Menu } from "lucide-react";
import CourseSwitcher from "./CourseSwitcher";

interface StudentTopbarProps {
  user: { name: string; email: string };
  streakCount: number;
  xpPoints: number;
  targetExamId?: string | null;
  targetExamTitle?: string | null;
  availableExams?: Array<{
    id: string;
    title: string;
    code: string;
    category: { id: string; name: string; code: string };
  }>;
  onToggleMobileSidebar?: () => void;
}

export default function StudentTopbar({
  user,
  streakCount,
  xpPoints,
  targetExamId,
  targetExamTitle,
  availableExams = [],
  onToggleMobileSidebar,
}: StudentTopbarProps) {
  return (
    <header className="student-topbar">
      <div className="flex items-center gap-2" style={{ minWidth: 0, flexShrink: 1 }}>
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="btn btn-ghost btn-sm student-hamburger-btn"
            title="Open all sections menu"
            style={{ padding: "0.25rem 0.5rem" }}
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        )}

        {availableExams && availableExams.length > 0 ? (
          <CourseSwitcher
            currentExamId={targetExamId}
            currentExamTitle={targetExamTitle}
            availableExams={availableExams}
          />
        ) : (
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Target:</span>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.88rem",
                color: "var(--color-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "180px",
              }}
            >
              {targetExamTitle || "Nepal Engineering Council"}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
        {/* Streak Indicator */}
        <div
          className="flex items-center gap-1"
          style={{
            backgroundColor: "#FFFBEB",
            border: "1px solid #FDE68A",
            padding: "0.2rem 0.5rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#B45309",
          }}
          title="Daily Study Streak: Consecutive qualifying Nepal study days"
        >
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
          <span className="hide-on-mobile">{streakCount} {streakCount === 1 ? "Day" : "Days"}</span>
          <span className="show-on-mobile">{streakCount}d</span>
        </div>

        {/* XP Points */}
        <div
          className="flex items-center gap-1"
          style={{
            backgroundColor: "var(--color-primary-subtle)",
            border: "1px solid rgba(30, 58, 95, 0.2)",
            padding: "0.2rem 0.5rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "var(--color-primary)",
          }}
          title="Academic Experience Points earned through missions and practice"
        >
          <Award className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="hide-on-mobile">{xpPoints} XP</span>
          <span className="show-on-mobile">{xpPoints}</span>
        </div>

        {/* Profile Link */}
        <Link
          href="/student/profile"
          className="btn btn-secondary btn-sm"
          style={{ padding: "0.25rem 0.55rem", minHeight: "32px", fontSize: "0.8rem" }}
        >
          <User className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hide-on-mobile">{user.name.split(" ")[0]}</span>
        </Link>
      </div>
    </header>
  );
}
