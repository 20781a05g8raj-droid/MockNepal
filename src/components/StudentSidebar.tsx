"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  CheckSquare,
  Clock,
  RotateCcw,
  BookOpen,
  Target,
  BarChart3,
  User,
  LogOut,
  CreditCard,
  ShieldCheck,
  X,
} from "lucide-react";

interface StudentSidebarProps {
  user: { name: string; email: string; role: string };
  targetExamTitle?: string;
  activePassDays?: number | null;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function StudentSidebar({
  user,
  targetExamTitle,
  activePassDays,
  mobileOpen = false,
  onCloseMobile,
}: StudentSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const navItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard, color: "#1D4ED8", bg: "#EFF6FF", nepali: "ड्यासबोर्ड" },
    { label: "Course Tracks & Syllabus", href: "/student/exams", icon: Layers, color: "#0D9488", bg: "#F0FDFA", nepali: "पाठ्यक्रम" },
    { label: "Practice MCQs", href: "/student/practice", icon: CheckSquare, color: "#2563EB", bg: "#EFF6FF", nepali: "अभ्यास" },
    { label: "Mock Examinations", href: "/student/mock-tests", icon: Clock, color: "#E11D48", bg: "#FFF1F2", nepali: "नमुना परीक्षा" },
    { label: "Study Notes & PDFs", href: "/student/notes", icon: BookOpen, color: "#4F46E5", bg: "#EEF2FF", nepali: "नोट्स तथा PDF" },
    { label: "Mistake Notebook", href: "/student/mistakes", icon: RotateCcw, color: "#D97706", bg: "#FFFBEB", nepali: "गल्ती पुस्तिका" },
    { label: "Daily Missions", href: "/student/missions", icon: Target, color: "#16A34A", bg: "#F0FDF4", nepali: "दैनिक मिसन" },
    { label: "Performance Analytics", href: "/student/analytics", icon: BarChart3, color: "#7C3AED", bg: "#FAF5FF", nepali: "नतिजा विश्लेषण" },
    { label: "Profile & Settings", href: "/student/profile", icon: User, color: "#475569", bg: "#F1F5F9", nepali: "प्रोफाइल" },
  ];

  return (
    <aside className={`student-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      {/* Brand Header */}
      <div className="student-sidebar-header">
        <div className="flex justify-between items-center">
          <Link
            href="/student/dashboard"
            onClick={() => onCloseMobile?.()}
            className="public-logo"
            style={{ fontSize: "1.1rem" }}
          >
            <BookOpen className="w-5 h-5 text-primary" />
            <span>नेपाल परीक्षा</span>
            <span className="public-logo-badge">STUDENT</span>
          </Link>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="btn btn-ghost btn-sm show-on-mobile"
              style={{ color: "#64748B", padding: "4px" }}
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {targetExamTitle && (
          <div style={{ marginTop: "0.6rem", fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 600, background: "var(--color-primary-subtle)", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={targetExamTitle}>
            🎯 {targetExamTitle}
          </div>
        )}
      </div>

      {/* Navigation items */}
      <nav className="student-sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/student/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onCloseMobile?.()}
              className={`student-nav-item ${isActive ? "active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.55rem 0.75rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: isActive ? item.bg : "transparent",
                color: isActive ? item.color : "var(--color-text)",
                borderLeft: isActive ? `3px solid ${item.color}` : "3px solid transparent",
                fontWeight: isActive ? 700 : 500,
                transition: "all 0.15s ease",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "26px",
                  height: "26px",
                  borderRadius: "6px",
                  backgroundColor: isActive ? "#FFFFFF" : item.bg,
                  color: item.color,
                  boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  flexShrink: 0,
                }}
              >
                <Icon className="w-4 h-4" />
              </span>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                <span style={{ fontSize: "0.85rem" }}>{item.label}</span>
                <span style={{ fontSize: "0.68rem", opacity: 0.7 }}>{item.nepali}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div className="student-sidebar-footer">
        {/* Pass Status */}
        <div style={{ marginBottom: "0.75rem", padding: "0.5rem", backgroundColor: "#FFFFFF", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "0.75rem" }}>
          <div className="flex justify-between items-center mb-1">
            <span style={{ fontWeight: 600 }}>Access Tier:</span>
            {activePassDays !== null && activePassDays !== undefined ? (
              <span className="badge badge-accent" style={{ fontSize: "0.7rem" }}>{activePassDays}d Active</span>
            ) : (
              <span className="badge badge-muted" style={{ fontSize: "0.7rem" }}>Free Tier</span>
            )}
          </div>
          {activePassDays === null || activePassDays === undefined ? (
            <Link href="/pricing" style={{ color: "var(--color-accent)", fontWeight: 600, fontSize: "0.75rem" }}>
              Upgrade to Premium Pass &rarr;
            </Link>
          ) : (
            <span className="text-muted" style={{ fontSize: "0.7rem" }}>Full exam series active</span>
          )}
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center justify-between">
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text)", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name}
            </div>
            <div style={{ fontSize: "0.725rem", color: "var(--color-text-muted)", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-ghost btn-sm"
            title="Sign out"
            style={{ padding: "0.25rem", height: "32px", width: "32px" }}
          >
            <LogOut className="w-4 h-4 text-muted" />
          </button>
        </div>
      </div>
    </aside>
  );
}
