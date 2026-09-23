import Link from "next/link";
import {
  ChevronDown,
  User,
  Search,
  SlidersHorizontal,
  GraduationCap
} from "lucide-react";

interface PublicNavProps {
  user?: { name: string; role: string } | null;
}

export default function PublicNav({ user }: PublicNavProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0.65rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
        }}
      >
        {/* Left: Examveda Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, #DC2626, #EA580C)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
              }}
            >
              <GraduationCap className="w-5 h-5" />
            </div>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: "1.35rem", fontWeight: 900, color: "#DC2626", letterSpacing: "-0.03em" }}>
                Exam
              </span>
              <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em" }}>
                veda
              </span>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#0284C7", marginLeft: "4px", alignSelf: "flex-start" }}>
                NEPAL
              </span>
            </div>
          </Link>

          {/* Center Navigation Dropdowns */}
          <nav className="hidden md:flex items-center gap-1" style={{ fontSize: "0.88rem", fontWeight: 600 }}>
            <Link
              href="/mcqs"
              className="flex items-center gap-1"
              style={{
                color: "#334155",
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                textDecoration: "none",
                transition: "color 150ms",
              }}
            >
              <span>Practice MCQs</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/exams"
              className="flex items-center gap-1"
              style={{
                color: "#334155",
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                textDecoration: "none",
                transition: "color 150ms",
              }}
            >
              <span>Exams</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/mcqs?cat=ENGINEERING_LICENSE"
              className="flex items-center gap-1"
              style={{
                color: "#334155",
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                textDecoration: "none",
                transition: "color 150ms",
              }}
            >
              <span>Engineering MCQs</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/mcqs?cat=COMPUTER_OPERATOR"
              className="flex items-center gap-1"
              style={{
                color: "#334155",
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                textDecoration: "none",
                transition: "color 150ms",
              }}
            >
              <span>Computer MCQs</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/pricing"
              className="flex items-center gap-1"
              style={{
                color: "#334155",
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                textDecoration: "none",
                transition: "color 150ms",
              }}
            >
              <span>More</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </nav>
        </div>

        {/* Right: Search / Controls & User */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            href="/mcqs"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748B",
              border: "1px solid #E2E8F0",
              textDecoration: "none",
            }}
            title="Search MCQs"
          >
            <Search className="w-4 h-4" />
          </Link>

          {user ? (
            <Link
              href={
                user.role === "ADMIN" || user.role === "CONTENT_EDITOR"
                  ? "/admin/dashboard"
                  : "/student/dashboard"
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.35rem 0.85rem",
                backgroundColor: "#F1F5F9",
                border: "1px solid #CBD5E1",
                borderRadius: "999px",
                color: "#0F172A",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "#0284C7",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                }}
              >
                <User className="w-3.5 h-3.5" />
              </div>
              <span>{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#334155",
                  textDecoration: "none",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                }}
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Login</span>
              </Link>
              <Link
                href="/register"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  backgroundColor: "#0B5ED7",
                  textDecoration: "none",
                  padding: "0.4rem 0.95rem",
                  borderRadius: "6px",
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
