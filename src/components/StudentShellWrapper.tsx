"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import StudentSidebar from "./StudentSidebar";
import StudentTopbar from "./StudentTopbar";
import StudentMobileNav from "./StudentMobileNav";

interface StudentShellWrapperProps {
  user: { name: string; email: string; role: string };
  targetExamTitle?: string;
  activePassDays?: number | null;
  streakCount: number;
  xpPoints: number;
  targetExamId?: string | null;
  availableExams?: Array<{
    id: string;
    title: string;
    code: string;
    category: { id: string; name: string; code: string };
  }>;
  children: React.ReactNode;
}

export default function StudentShellWrapper({
  user,
  targetExamTitle,
  activePassDays,
  streakCount,
  xpPoints,
  targetExamId,
  availableExams = [],
  children,
}: StudentShellWrapperProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="student-shell">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            zIndex: 999,
            backdropFilter: "blur(2px)",
          }}
          aria-hidden="true"
        />
      )}

      <StudentSidebar
        user={user}
        targetExamTitle={targetExamTitle}
        activePassDays={activePassDays}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="student-main-area">
        <StudentTopbar
          user={user}
          streakCount={streakCount}
          xpPoints={xpPoints}
          targetExamId={targetExamId}
          targetExamTitle={targetExamTitle}
          availableExams={availableExams}
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />
        <div className="student-content-container">
          {children}
        </div>
        <StudentMobileNav onOpenMenu={() => setMobileOpen(true)} />
      </div>
    </div>
  );
}
