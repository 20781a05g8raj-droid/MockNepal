import Link from "next/link";
import {
  User,
  Search,
  GraduationCap,
  Upload,
  FileText,
  BookOpen,
  Sparkles,
  Layers
} from "lucide-react";

interface PublicNavProps {
  user?: { name: string; role: string } | null;
}

export default function PublicNav({ user }: PublicNavProps) {
  const navItems = [
    { label: "Practice MCQs", href: "/mcqs", icon: BookOpen },
    { label: "Exams", href: "/exams", icon: Layers },
    { label: "Engineering MCQs", href: "/mcqs?cat=ENGINEERING_LICENSE", icon: Layers },
    { label: "Computer MCQs", href: "/mcqs?cat=COMPUTER_OPERATOR", icon: Layers },
    { label: "Notes & Syllabus", href: "/notes", icon: FileText },
    { label: "Pro / Pricing", href: "/pricing", icon: Sparkles },
  ];

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
          padding: "0.55rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Left: Brand Logo (Mock Nepal) */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #DC2626, #EA580C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              boxShadow: "0 2px 6px rgba(220, 38, 38, 0.25)",
            }}
          >
            <GraduationCap className="w-5 h-5" />
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ fontSize: "1.35rem", fontWeight: 900, color: "#DC2626", letterSpacing: "-0.03em" }}>
              Mock
            </span>
            <span style={{ fontSize: "1.35rem", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginLeft: "3px" }}>
              Nepal
            </span>
          </div>
        </Link>

        {/* Center: Slide-able Horizontal Row Navigation Menu */}
        <nav
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "0.5rem",
            overflowX: "auto",
            whiteSpace: "nowrap",
            scrollbarWidth: "none",
            flex: 1,
            justifyContent: "center",
            padding: "0.2rem 0",
          }}
        >
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  color: "#334155",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  padding: "0.45rem 0.85rem",
                  borderRadius: "6px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  transition: "all 150ms ease",
                }}
              >
                <Icon className="w-4 h-4 text-sky-600" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Search & User Account */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexShrink: 0 }}>

          <Link
            href="/mcqs"
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748B",
              border: "1px solid #E2E8F0",
              textDecoration: "none",
              backgroundColor: "#FFFFFF",
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
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#334155",
                  textDecoration: "none",
                  padding: "0.38rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #CBD5E1",
                  whiteSpace: "nowrap",
                }}
              >
                <span>Login</span>
              </Link>
              <Link
                href="/register"
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  backgroundColor: "#0B5ED7",
                  textDecoration: "none",
                  padding: "0.38rem 0.85rem",
                  borderRadius: "6px",
                  whiteSpace: "nowrap",
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
