import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import AuthPromptModal from "@/components/AuthPromptModal";
import { Search, CheckCircle2, ChevronRight } from "lucide-react";
import {
  generalSubjects,
  popularExams,
  computerSubjects,
  engineeringSubjects,
  academicSubjects,
  currentAffairsList,
  interviewList,
} from "@/lib/home-categories";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();

  let targetExamTitle: string | null = null;
  if (user?.id) {
    const profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
      include: { targetExam: true },
    });
    targetExamTitle = profile?.targetExam?.title || null;
  }

  return (
    <div className="ev-page-wrapper">
      <PublicNav user={user} />
      <AuthPromptModal user={user} />

      {/* Persistent Login Status / Welcome Banner */}
      {user ? (
        <div style={{ backgroundColor: "#F0FDF4", borderBottom: "1px solid #BBF7D0", padding: "0.65rem 1.25rem" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.88rem", color: "#166534" }}>
              <span style={{ fontSize: "1.2rem" }}>👋</span>
              <span>
                <strong>नमस्ते, {user.name}!</strong> You are signed in. {targetExamTitle ? `Target: ${targetExamTitle}` : "Your preparation progress is actively saved."}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link
                href={user.role === "ADMIN" || user.role === "CONTENT_EDITOR" ? "/admin/dashboard" : "/student/dashboard"}
                style={{ fontSize: "0.82rem", fontWeight: 700, backgroundColor: "#15803D", color: "#FFFFFF", padding: "0.35rem 0.85rem", borderRadius: "6px", textDecoration: "none" }}
              >
                Go to Dashboard
              </Link>
              <Link
                href="/student/practice"
                style={{ fontSize: "0.82rem", fontWeight: 600, backgroundColor: "#FFFFFF", border: "1px solid #86EFAC", color: "#166534", padding: "0.35rem 0.85rem", borderRadius: "6px", textDecoration: "none" }}
              >
                Practice Questions
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: "#EFF6FF", borderBottom: "1px solid #DBEAFE", padding: "0.55rem 1.25rem" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.84rem", color: "#1E40AF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>💡</span>
              <span><strong>New to Mock Nepal?</strong> Sign in or register to track test scores, bookmark questions, and follow syllabus goals.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link href="/login" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1E40AF", textDecoration: "underline" }}>
                Sign In
              </Link>
              <span>•</span>
              <Link href="/register" style={{ fontSize: "0.8rem", fontWeight: 700, backgroundColor: "#2563EB", color: "#FFFFFF", padding: "0.25rem 0.65rem", borderRadius: "4px", textDecoration: "none" }}>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ================= 1. EXAMVEDA HERO BANNER ================= */}
      <section className="ev-hero-section">
        <div className="ev-hero-container">
          <h1 className="ev-hero-title">
            MCQ Questions and Solutions for Competitive Exams
          </h1>

          <div className="ev-hero-badge">
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
            <span>Trusted MCQ Practice Platform</span>
          </div>

          <p className="ev-hero-desc">
            Your one-stop destination for job exam preparation with daily practice questions covering GK, Aptitude, English, Reasoning, Computer, and Current Affairs.
          </p>

          {/* Search Card Box */}
          <div className="ev-search-card">
            <span className="ev-search-label">
              Search MCQs, Topics & Exams
            </span>
            <form action="/mcqs" method="GET" className="ev-search-box">
              <input
                type="text"
                name="q"
                placeholder="Search any question..."
                className="ev-search-input"
              />
              <button type="submit" className="ev-search-btn">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ================= 2. MAIN CATEGORY SECTIONS CONTAINER ================= */}
      <main className="ev-main-container">
        {/* SECTION 1: Practice MCQs For Competitive Exams */}
        <section className="ev-section">
          <div className="ev-section-bar">
            <span>Practice MCQs For Competitive Exams</span>
          </div>
          <p className="ev-section-desc">
            Practice multiple choice questions and answers for competitive exams and entrance tests.
          </p>
          <div className="ev-grid-4">
            {generalSubjects.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <Link key={idx} href={item.href} className="ev-card">
                  <div className="ev-card-left">
                    <div className="ev-card-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="ev-card-text">
                      <div className="ev-card-title">{item.title}</div>
                      <div className="ev-card-sub">{item.sub}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 ev-card-arrow" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: Prepare for Popular Competitive Exams */}
        <section className="ev-section">
          <div className="ev-section-bar">
            <span>Prepare for Popular Competitive Exams</span>
          </div>
          <p className="ev-section-desc">
            Find exam syllabus, preparation resources, subject-wise practice questions and mock tests.
          </p>
          <div className="ev-grid-4">
            {popularExams.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <Link key={idx} href={item.href} className="ev-card">
                  <div className="ev-card-left">
                    <div className="ev-card-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="ev-card-text">
                      <div className="ev-card-title">{item.title}</div>
                      <div className="ev-card-sub">{item.sub}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 ev-card-arrow" />
                </Link>
              );
            })}
          </div>

          {/* Quick Filter Tag Pills */}
          <div className="ev-tags-row">
            <Link href="/exams" className="ev-tag-pill">
              All Exams ▾
            </Link>
            <Link href="/mcqs?cat=LOK_SEWA" className="ev-tag-pill">
              Lok Sewa Exams ▾
            </Link>
            <Link href="/mcqs?cat=BANKING" className="ev-tag-pill">
              Banking Exams ▾
            </Link>
            <Link href="/mcqs?cat=ENGINEERING_LICENSE" className="ev-tag-pill">
              Engineering License ▾
            </Link>
            <Link href="/mcqs?cat=TEACHER_SERVICE" className="ev-tag-pill">
              Teacher Service (TSC) ▾
            </Link>
          </div>
        </section>

        {/* SECTION 3: Computer & Programming MCQs */}
        <section className="ev-section">
          <div className="ev-section-bar">
            <span>Computer & Programming MCQs</span>
          </div>
          <p className="ev-section-desc">
            Practice computer science & programming solved objective MCQs for competitive exams and interviews.
          </p>
          <div className="ev-grid-4">
            {computerSubjects.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <Link key={idx} href={item.href} className="ev-card">
                  <div className="ev-card-left">
                    <div className="ev-card-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="ev-card-text">
                      <div className="ev-card-title">{item.title}</div>
                      <div className="ev-card-sub">{item.sub}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 ev-card-arrow" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: Engineering & Technical MCQs */}
        <section className="ev-section">
          <div className="ev-section-bar">
            <span>Engineering & Technical MCQs</span>
          </div>
          <p className="ev-section-desc">
            Practice engineering solved MCQs for NEC License, engineering government exams and technical services.
          </p>
          <div className="ev-grid-4">
            {engineeringSubjects.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <Link key={idx} href={item.href} className="ev-card">
                  <div className="ev-card-left">
                    <div className="ev-card-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="ev-card-text">
                      <div className="ev-card-title">{item.title}</div>
                      <div className="ev-card-sub">{item.sub}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 ev-card-arrow" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* SECTION 5: Graduate & Academic Subjects */}
        <section className="ev-section">
          <div className="ev-section-bar">
            <span>Graduate & Academic Subjects</span>
          </div>
          <p className="ev-section-desc">
            Practice MCQ questions for graduation programs and higher education subjects.
          </p>
          <div className="ev-grid-4">
            {academicSubjects.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <Link key={idx} href={item.href} className="ev-card">
                  <div className="ev-card-left">
                    <div className="ev-card-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="ev-card-text">
                      <div className="ev-card-title">{item.title}</div>
                      <div className="ev-card-sub">{item.sub}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 ev-card-arrow" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* SECTION 6: Latest Current Affairs */}
        <section className="ev-section">
          <div className="ev-section-bar">
            <span>Latest Current Affairs</span>
          </div>
          <p className="ev-section-desc">
            Stay updated with latest daily and monthly current affairs for upcoming examinations.
          </p>
          <div className="ev-grid-4">
            {currentAffairsList.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <Link key={idx} href={item.href} className="ev-card">
                  <div className="ev-card-left">
                    <div className="ev-card-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="ev-card-text">
                      <div className="ev-card-title">{item.title}</div>
                      <div className="ev-card-sub">{item.sub}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 ev-card-arrow" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* SECTION 7: Interview Questions & Answers */}
        <section className="ev-section">
          <div className="ev-section-bar">
            <span>Interview Questions & Answers</span>
          </div>
          <p className="ev-section-desc">
            Prepare for HR, banking and technical interviews with frequently asked questions.
          </p>
          <div className="ev-grid-4">
            {interviewList.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <Link key={idx} href={item.href} className="ev-card">
                  <div className="ev-card-left">
                    <div className="ev-card-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="ev-card-text">
                      <div className="ev-card-title">{item.title}</div>
                      <div className="ev-card-sub">{item.sub}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 ev-card-arrow" />
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
