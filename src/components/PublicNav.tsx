import Link from "next/link";
import {
  BookOpen,
  Search,
  User,
  ArrowRight,
  Flame,
  Calendar,
  Layers,
  GraduationCap
} from "lucide-react";

interface PublicNavProps {
  user?: { name: string; role: string } | null;
}

export default function PublicNav({ user }: PublicNavProps) {
  const categories = [
    { label: "Lok Sewa (लोक सेवा)", href: "/mcqs?cat=LOK_SEWA", badge: "लो", color: "#1D4ED8" },
    { label: "Banking (बैंकिङ)", href: "/mcqs?cat=BANKING", badge: "बैं", color: "#059669" },
    { label: "Shikshak Sewa (TSC)", href: "/mcqs?cat=TEACHER_SERVICE", badge: "शि", color: "#D97706" },
    { label: "NEC Engineering", href: "/mcqs?cat=ENGINEERING_LICENSE", badge: "इ", color: "#4F46E5" },
    { label: "Computer Operator", href: "/mcqs?cat=COMPUTER_OPERATOR", badge: "क", color: "#0284C7" },
    { label: "नेपाल सामान्य ज्ञान (GK)", href: "/mcqs?subject=GK", badge: "GK", color: "#DC2626" },
    { label: "समसामयिक (Current Affairs)", href: "/mcqs?subject=CURRENT_AFFAIRS", badge: "सम", color: "#7C3AED" },
    { label: "Mock Tests (नमुना परीक्षा)", href: "/exams", badge: "न", color: "#E11D48" },
  ];

  return (
    <header className="public-header" style={{ position: "sticky", top: 0, zIndex: 100 }}>
      {/* 1. Examveda Top Utilities Bar */}
      <div className="examveda-topbar">
        <div className="examveda-topbar-inner">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sky-400 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>नेपालको नं. १ अनलाइन वस्तुगत परीक्षा पोर्टल (Nepal MCQ Hub)</span>
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>नेपाल समय (Asia/Kathmandu: UTC+5:45)</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/exams" className="text-slate-300 hover:text-white transition">
              पाठ्यक्रम (Syllabus)
            </Link>
            <Link href="/pricing" className="text-slate-300 hover:text-white transition">
              प्रिमियम योजना
            </Link>
            <Link href="/about" className="text-slate-300 hover:text-white transition">
              मद्दत (Help)
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Logo & Search Bar Container */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          padding: "0.75rem 1rem",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "8px",
                backgroundColor: "#1E3A5F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
              }}
            >
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  lineHeight: "1.1",
                  letterSpacing: "-0.02em",
                }}
              >
                नेपाल <span style={{ color: "#0284C7" }}>ExamVeda</span>
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: "#64748B",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Nepal Competitive Exams Portal
              </div>
            </div>
          </Link>

          {/* Examveda-style Global Search Bar */}
          <form
            action="/mcqs"
            method="GET"
            className="examveda-search-form"
            style={{ flex: 1, minWidth: "260px" }}
          >
            <Search className="examveda-search-icon" />
            <input
              type="text"
              name="q"
              placeholder="Search Nepal MCQs (खरिदार, अधिकृत, NRB, NEC, भूगोल, संविधान)..."
              className="examveda-search-input"
            />
          </form>

          {/* Action Links & Auth */}
          <div className="flex items-center gap-3">
            <Link
              href="/mcqs"
              className="btn btn-ghost btn-sm hidden sm:inline-flex"
              style={{ color: "#0369A1", fontWeight: 600 }}
            >
              <BookOpen className="w-4 h-4" />
              <span>MCQ Practice</span>
            </Link>

            {user ? (
              <Link
                href={
                  user.role === "ADMIN" || user.role === "CONTENT_EDITOR"
                    ? "/admin/dashboard"
                    : "/student/dashboard"
                }
                className="btn btn-primary btn-sm"
              >
                <User className="w-4 h-4" />
                <span>{user.name.split(" ")[0]}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn btn-secondary btn-sm">
                  Sign In
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Start Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Examveda-style Category Ribbon Bar */}
      <nav className="examveda-nav-ribbon" aria-label="Exam Categories">
        <div className="examveda-ribbon-container">
          <Link href="/mcqs" className="examveda-ribbon-link">
            <Layers className="w-4 h-4" />
            <span>All MCQs (सबै प्रश्नहरू)</span>
          </Link>

          {categories.map((cat, idx) => (
            <Link key={idx} href={cat.href} className="examveda-ribbon-link">
              <span
                className="examveda-ribbon-badge"
                style={{ backgroundColor: cat.color }}
              >
                {cat.badge}
              </span>
              <span>{cat.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

