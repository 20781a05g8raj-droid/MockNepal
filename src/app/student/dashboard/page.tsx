import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTodayNepalDateString } from "@/lib/nepal-date";
import ExamvedaSubjectGrid, { SubjectSection, ExamvedaSubject } from "@/components/ExamvedaSubjectGrid";
import {
  Play,
  RotateCcw,
  Target,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Layers,
  FileText,
  Compass,
  Sparkles,
  Zap,
  Flame,
  Search,
} from "lucide-react";
import {
  generalSubjects,
  popularExams,
  computerSubjects,
  engineeringSubjects,
  academicSubjects,
  currentAffairsList,
  interviewList,
} from "@/lib/home-categories";

export default async function StudentDashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const todayNepal = getTodayNepalDateString();

  // 1. Student profile & Target Exam with all subjects, topics, and question counts
  const profile = await db.studentProfile.findUnique({
    where: { userId: user.id },
    include: {
      targetExam: {
        include: {
          category: true,
          syllabi: {
            include: {
              subjects: {
                include: {
                  topics: {
                    include: {
                      _count: { select: { questions: true, notes: true } },
                    },
                  },
                  _count: { select: { questions: true } },
                },
                orderBy: { order: "asc" },
              },
            },
          },
          _count: { select: { questionExams: true, mockTests: true } },
        },
      },
    },
  });

  const targetExam = profile?.targetExam;
  const syllabus = targetExam?.syllabi[0];
  const subjects = syllabus?.subjects || [];
  const allTopics = subjects.flatMap((s) => s.topics);
  const totalTopicsCount = allTopics.length;
  const totalQuestionsCount = targetExam?._count.questionExams || 0;

  // 2. Count total notes available for this course
  const totalNotesCount = allTopics.reduce((acc, t) => acc + t._count.notes, 0);

  // 3. Unfinished practice session (Continue Learning)
  const activeSession = await db.practiceSession.findFirst({
    where: {
      userId: user.id,
      status: "IN_PROGRESS",
      ...(targetExam ? { examId: targetExam.id } : {}),
    },
    include: {
      exam: true,
      subject: true,
      topic: true,
      _count: { select: { answers: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  // 4. Today's daily missions
  const dailyMissions = await db.dailyMission.findMany({
    where: { userId: user.id, nepalDate: todayNepal },
  });

  // 5. Mistake revision items due today or overdue
  const dueRevisions = await db.revisionItem.findMany({
    where: {
      userId: user.id,
      isMastered: false,
      nextRevisionDueNepalDate: { lte: todayNepal },
    },
    include: {
      question: {
        include: {
          topic: true,
          versions: { orderBy: { versionNumber: "desc" }, take: 1 },
        },
      },
    },
  });

  // 6. Syllabus topic progress
  const progressRecords = await db.topicProgress.findMany({
    where: { userId: user.id },
  });
  const progressMap = new Map(progressRecords.map((p) => [p.topicId, p]));

  const completedTopicsCount = allTopics.filter((t) => progressMap.get(t.id)?.isMarkedCompleted).length;
  const syllabusCompletionPercent = totalTopicsCount > 0
    ? Math.round((completedTopicsCount / totalTopicsCount) * 100)
    : 0;

  // 7. Recent practice accuracy
  const recentAnswers = await db.attemptAnswer.findMany({
    where: {
      session: {
        userId: user.id,
        ...(targetExam ? { examId: targetExam.id } : {}),
      },
    },
    take: 50,
    orderBy: { submittedAt: "desc" },
  });
  const totalRecent = recentAnswers.length;
  const correctRecent = recentAnswers.filter((a) => a.isCorrect).length;
  const recentAccuracyPercent = totalRecent > 0
    ? Math.round((correctRecent / totalRecent) * 100)
    : null;

  // 8. Available Mock Tests strictly for this target course
  const mockTests = await db.mockTest.findMany({
    where: {
      status: "PUBLISHED",
      ...(targetExam ? { examId: targetExam.id } : {}),
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  // 9. Fetch all categories, exams, subjects and units across the Nepal curriculum for the Examveda Grid
  const allCategories = await db.examCategory.findMany({
    include: {
      exams: {
        where: { isActive: true },
        include: {
          syllabi: {
            include: {
              subjects: {
                include: {
                  topics: {
                    include: {
                      _count: { select: { questions: true } },
                    },
                    orderBy: { order: "asc" },
                  },
                  _count: { select: { questions: true } },
                },
                orderBy: { order: "asc" },
              },
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  // Authentic Examveda Palette from Reference Images 2 & 3
  const examvedaPalette = [
    "#DC2626", // Red (Aptitude, MS PowerPoint)
    "#2563EB", // Royal Blue (Reasoning)
    "#EC4899", // Pink (Non Verbal Reasoning)
    "#9333EA", // Purple (English)
    "#059669", // Green (DI, MS Word)
    "#BE123C", // Crimson (GK)
    "#9F1239", // Wine (Statewise GK)
    "#1E3A8A", // Navy (History GK)
    "#15803D", // Forest Green (Geography GK)
    "#C2410C", // Rust (Physics GK, Operating System)
    "#BE185D", // Rose (Chemistry GK, Data Science)
    "#0D9488", // Teal (Biology GK)
    "#65A30D", // Lime Green (Computer Fundamental)
    "#16A34A", // Bright Green (MS Excel)
    "#0284C7", // Sky Blue (Machine Learning)
    "#EA580C", // Tangerine (Cloud Computing)
    "#4338CA", // Indigo (Banking Laws)
    "#4F46E5", // Engineering Design
  ];

  let colorCounter = 0;
  const examvedaSections: SubjectSection[] = [];

  allCategories.forEach((cat) => {
    const subjectsMap = new Map<string, ExamvedaSubject>();

    cat.exams.forEach((exam) => {
      const syl = exam.syllabi[0];
      if (!syl) return;

      syl.subjects.forEach((s) => {
        if (!subjectsMap.has(s.id)) {
          const color = examvedaPalette[colorCounter % examvedaPalette.length];
          colorCounter++;

          subjectsMap.set(s.id, {
            id: s.id,
            name: s.name,
            code: s.code,
            color,
            examId: exam.id,
            examTitle: exam.title,
            units: s.topics.map((t) => ({
              id: t.id,
              name: t.name,
              code: t.code,
              estimatedMinutes: t.estimatedMinutes,
              questionsCount: t._count.questions,
            })),
          });
        }
      });
    });

    if (subjectsMap.size > 0) {
      let title = `${cat.name} MCQ Question For Practice`;
      if (cat.code === "LOK_SEWA") {
        title = "Competitive Exam MCQ Question For Practice";
      } else if (cat.code === "COMPUTER_OPERATOR") {
        title = "Computer Related MCQ Question For Practice";
      } else if (cat.code === "BANKING") {
        title = "Banking & Financial MCQ Question For Practice";
      } else if (cat.code === "ENGINEERING_LICENSE") {
        title = "Engineering & Technical Licensing MCQ Question For Practice";
      } else if (cat.code === "TEACHER_SERVICE") {
        title = "Teacher Service Commission MCQ Question For Practice";
      } else if (cat.code === "MEDICAL") {
        title = "Medical & Health Entrance MCQ Question For Practice";
      }

      examvedaSections.push({
        title,
        subtitle: `(${cat.name}) • Click any subject to open Units & MCQs`,
        subjects: Array.from(subjectsMap.values()),
      });
    }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* 1. HERO PREPARATION BANNER (DEEP NAVY & INDIGO) */}
      <div className="card student-hero-banner">
        <div className="student-hero-header">
          <div style={{ flex: "1 1 300px", minWidth: 0 }}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.25)",
                  color: "#93C5FD",
                  border: "1px solid rgba(147, 197, 253, 0.3)",
                  padding: "0.2rem 0.55rem",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  maxWidth: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                🎯 {targetExam?.category.name || "Preparation Track"}
              </span>
              <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                📅 {todayNepal}
              </span>
            </div>

            <h1 className="student-hero-title">
              {targetExam ? targetExam.title : "Select Your Preparation Course"}
            </h1>

            <p className="student-hero-desc">
              {targetExam?.description || "Select an official syllabus track to configure isolated MCQs, study notes, and mock tests."}
            </p>
          </div>

          <div className="student-hero-actions">
            <Link
              href={targetExam ? `/student/exams/${targetExam.id}` : "/student/exams"}
              className="btn btn-sm"
              style={{ backgroundColor: "#38BDF8", color: "#0F172A", fontWeight: 700, border: "none" }}
            >
              <Compass className="w-4 h-4" />
              <span>Full Curriculum</span>
            </Link>
            <Link
              href="/student/exams"
              className="btn btn-ghost btn-sm"
              style={{ color: "#E2E8F0", border: "1px solid rgba(255, 255, 255, 0.2)" }}
            >
              Browse Other Courses
            </Link>
          </div>
        </div>

        {/* Quick Summary Chips: 1-Row Horizontal on Mobile */}
        <div className="student-hero-chips">
          <div className="student-hero-chip" style={{ backgroundColor: "rgba(30, 58, 138, 0.45)", borderColor: "rgba(96, 165, 250, 0.3)" }}>
            <div className="student-hero-chip-lbl" style={{ color: "#93C5FD" }}>Subjects</div>
            <div className="student-hero-chip-val">{subjects.length} Subjects</div>
          </div>
          <div className="student-hero-chip" style={{ backgroundColor: "rgba(13, 148, 136, 0.4)", borderColor: "rgba(45, 212, 191, 0.3)" }}>
            <div className="student-hero-chip-lbl" style={{ color: "#5EEAD4" }}>Topics</div>
            <div className="student-hero-chip-val">{totalTopicsCount} Topics</div>
          </div>
          <div className="student-hero-chip" style={{ backgroundColor: "rgba(99, 102, 241, 0.4)", borderColor: "rgba(165, 180, 252, 0.3)" }}>
            <div className="student-hero-chip-lbl" style={{ color: "#C7D2FE" }}>MCQs</div>
            <div className="student-hero-chip-val">{totalQuestionsCount} Qs</div>
          </div>
          <div className="student-hero-chip" style={{ backgroundColor: "rgba(217, 119, 6, 0.4)", borderColor: "rgba(252, 211, 77, 0.3)" }}>
            <div className="student-hero-chip-lbl" style={{ color: "#FDE68A" }}>Notes & PDFs</div>
            <div className="student-hero-chip-val">{totalNotesCount} Docs</div>
          </div>
          <div className="student-hero-chip" style={{ backgroundColor: "rgba(225, 29, 72, 0.4)", borderColor: "rgba(253, 164, 175, 0.3)" }}>
            <div className="student-hero-chip-lbl" style={{ color: "#FECDD3" }}>Mock Tests</div>
            <div className="student-hero-chip-val">{mockTests.length} Tests</div>
          </div>
        </div>
      </div>

      {/* 2. SECTION A: DAILY ACTION & REVISION RADAR (COLOR-CODED VIBRANT ACTION CARDS) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span
            style={{
              backgroundColor: "#EFF6FF",
              color: "#1D4ED8",
              border: "1px solid #BFDBFE",
              padding: "0.25rem 0.75rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "0.04em",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            SECTION 1: DAILY FOCUS & REVISION (दैनिक अभ्यास र रिभिजन)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Card 1: Continue Learning (VIBRANT BLUE THEME) */}
          <div
            className="card flex flex-col justify-between"
            style={{
              backgroundColor: "#F0F7FF",
              border: "2px solid #BFDBFE",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.08)",
            }}
          >
            <div>
              <div className="card-header pb-2 mb-3" style={{ borderBottom: "1px solid #DBEAFE" }}>
                <span
                  style={{
                    backgroundColor: "#2563EB",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "var(--radius-full)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Play className="w-3.5 h-3.5" />
                  1. Practice & MCQ Drill
                </span>
                <span style={{ fontSize: "0.75rem", color: "#2563EB", fontWeight: 700 }}>Active</span>
              </div>

              {activeSession ? (
                <div>
                  <h3 style={{ fontSize: "1.05rem", color: "#1E3A8A", marginBottom: "0.3rem" }}>
                    Active Practice Session
                  </h3>
                  <p style={{ fontSize: "0.825rem", color: "#475569", marginBottom: "1rem" }}>
                    {activeSession.subject.name} {activeSession.topic ? `• ${activeSession.topic.name}` : ""}
                  </p>

                  <div style={{ backgroundColor: "#FFFFFF", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid #BFDBFE", marginBottom: "1rem" }}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "#475569" }}>Session Progress:</span>
                      <strong style={{ color: "#1E40AF" }}>{activeSession._count.answers} of {activeSession.totalQuestions} Qs</strong>
                    </div>
                    <div className="progress-bar" style={{ height: "6px", backgroundColor: "#DBEAFE" }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(activeSession._count.answers / activeSession.totalQuestions) * 100}%`,
                          backgroundColor: "#2563EB",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: "1.05rem", color: "#1E3A8A", marginBottom: "0.3rem" }}>
                    Ready for Next Topic Set
                  </h3>
                  <p style={{ fontSize: "0.825rem", color: "#475569", marginBottom: "1rem", lineHeight: "1.5" }}>
                    No paused practice session. Launch a focused 10-question MCQ set strictly based on your official syllabus.
                  </p>
                  <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #BFDBFE", borderRadius: "var(--radius-md)", padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "#1E40AF", marginBottom: "1rem" }}>
                    ⭐ Verified model and past exam papers without repetition.
                  </div>
                </div>
              )}
            </div>

            <Link
              href={activeSession ? `/student/practice/${activeSession.id}` : "/student/practice"}
              className="btn btn-sm btn-full"
              style={{ backgroundColor: "#2563EB", color: "#FFFFFF", fontWeight: 700, border: "none" }}
            >
              <span>{activeSession ? "Resume Ongoing Session" : "Start New Practice Set"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Daily Missions (VIBRANT EMERALD GREEN THEME) */}
          <div
            className="card flex flex-col justify-between"
            style={{
              backgroundColor: "#F0FDF4",
              border: "2px solid #BBF7D0",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 4px 12px rgba(22, 163, 74, 0.08)",
            }}
          >
            <div>
              <div className="card-header pb-2 mb-3" style={{ borderBottom: "1px solid #DCFCE7" }}>
                <span
                  style={{
                    backgroundColor: "#16A34A",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "var(--radius-full)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Target className="w-3.5 h-3.5" />
                  2. Today&apos;s Missions
                </span>
                <span style={{ fontSize: "0.75rem", color: "#16A34A", fontWeight: 700 }}>XP Rewards</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
                {dailyMissions.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      backgroundColor: m.isCompleted ? "#DCFCE7" : "#FFFFFF",
                      border: `1px solid ${m.isCompleted ? "#86EFAC" : "#BBF7D0"}`,
                      padding: "0.6rem 0.75rem",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: m.isCompleted ? "#15803D" : "#1F2937" }}>
                        {m.title}
                      </span>
                      {m.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <span style={{ fontSize: "0.7rem", backgroundColor: "#FEF3C7", color: "#B45309", padding: "1px 6px", borderRadius: "9999px", fontWeight: 700 }}>
                          +{m.xpEarned} XP
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted mb-1">
                      <span>{m.currentCount} / {m.targetCount}</span>
                      <span>{Math.min(100, Math.round((m.currentCount / m.targetCount) * 100))}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: "4px", backgroundColor: "#E2E8F0" }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(100, (m.currentCount / m.targetCount) * 100)}%`,
                          backgroundColor: m.isCompleted ? "#16A34A" : "#0D9488",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/student/missions"
              className="btn btn-sm btn-full"
              style={{ backgroundColor: "#DCFCE7", color: "#166534", border: "1px solid #86EFAC", fontWeight: 700 }}
            >
              <span>View Missions & Rewards</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Spaced Revision (WARM AMBER / ORANGE THEME) */}
          <div
            className="card flex flex-col justify-between"
            style={{
              backgroundColor: "#FFFBEB",
              border: "2px solid #FDE68A",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 4px 12px rgba(217, 119, 6, 0.08)",
            }}
          >
            <div>
              <div className="card-header pb-2 mb-3" style={{ borderBottom: "1px solid #FEF3C7" }}>
                <span
                  style={{
                    backgroundColor: "#D97706",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "var(--radius-full)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  3. Spaced Revision Due
                </span>
                <span style={{ fontSize: "0.75rem", color: "#D97706", fontWeight: 700 }}>Spaced Repetition</span>
              </div>

              {dueRevisions.length > 0 ? (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span style={{ fontSize: "2.25rem", fontWeight: 800, color: "#D97706", lineHeight: 1 }}>
                      {dueRevisions.length}
                    </span>
                    <div style={{ fontSize: "0.85rem", color: "#78350F", lineHeight: "1.3" }}>
                      <strong>Mistake items</strong> due for review today.
                    </div>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#92400E", marginBottom: "1rem", lineHeight: "1.5" }}>
                    Items scheduled according to the scientific spaced repetition algorithm (1d &rarr; 3d &rarr; 7d &rarr; 14d).
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#166534" }}>All Caught Up!</span>
                  </div>
                  <p style={{ fontSize: "0.825rem", color: "#78350F", marginBottom: "1rem", lineHeight: "1.5" }}>
                    No mistake questions are due for review today. Great discipline maintaining your retention schedule.
                  </p>
                </div>
              )}
            </div>

            <Link
              href={dueRevisions.length > 0 ? "/student/mistakes/revision" : "/student/mistakes"}
              className="btn btn-sm btn-full"
              style={{
                backgroundColor: dueRevisions.length > 0 ? "#D97706" : "#FEF3C7",
                color: dueRevisions.length > 0 ? "#FFFFFF" : "#92400E",
                border: dueRevisions.length > 0 ? "none" : "1px solid #FDE68A",
                fontWeight: 700,
              }}
            >
              <span>{dueRevisions.length > 0 ? "Start Scheduled Revision" : "Open Mistake Notebook"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ================= SEARCH CARD ================= */}
      <div className="ev-search-card" style={{ maxWidth: "100%", margin: "0 0 0.5rem 0" }}>
        <span className="ev-search-label">
          Search MCQs, Topics & Exams
        </span>
        <form action="/mcqs" method="GET" className="ev-search-box">
          <input
            type="text"
            name="q"
            placeholder="Search any question, subject, topic or examination..."
            className="ev-search-input"
          />
          <button type="submit" className="ev-search-btn">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>
      </div>

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

      {/* SECTION 3: Dynamic Nepal Curriculum Syllabus Tracks & Subjects */}
      <div>
        <ExamvedaSubjectGrid sections={examvedaSections} />
      </div>

      {/* SECTION 4: Computer & Programming MCQs */}
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

      {/* SECTION 5: Engineering & Technical MCQs */}
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

      {/* SECTION 6: Graduate & Academic Subjects */}
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

      {/* SECTION 7: Latest Current Affairs */}
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

      {/* SECTION 8: Interview Questions & Answers */}
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

      {/* 4. SECTION C: EXAM READINESS & EVALUATION (TEAL, PURPLE & ROSE CARDS) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span
            style={{
              backgroundColor: "#E0F2FE",
              color: "#0369A1",
              border: "1px solid #BAE6FD",
              padding: "0.25rem 0.75rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              fontWeight: 800,
              letterSpacing: "0.04em",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
            SECTION 3: READINESS & EVALUATION (तयारी तथा परीक्षा मूल्याङ्कन)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Card 1: Syllabus Coverage (TEAL THEME) */}
          <div
            className="card flex flex-col justify-between"
            style={{
              backgroundColor: "#F0FDFA",
              border: "2px solid #99F6E4",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 4px 12px rgba(13, 148, 136, 0.08)",
            }}
          >
            <div>
              <div className="card-header pb-2 mb-3" style={{ borderBottom: "1px solid #CCFBF1" }}>
                <span
                  style={{
                    backgroundColor: "#0D9488",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "var(--radius-full)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Syllabus Coverage
                </span>
                <span style={{ fontSize: "0.75rem", color: "#0D9488", fontWeight: 700 }}>
                  {syllabusCompletionPercent}% Done
                </span>
              </div>

              <p style={{ fontSize: "0.825rem", color: "#134E4A", marginBottom: "1rem", lineHeight: "1.5" }}>
                Topics completed across your enrolled course track.
              </p>

              <div className="progress-bar mb-3" style={{ height: "6px", backgroundColor: "#CCFBF1" }}>
                <div className="progress-fill" style={{ width: `${syllabusCompletionPercent}%`, backgroundColor: "#0D9488" }} />
              </div>

              <div className="flex justify-between text-xs text-muted mb-4">
                <span style={{ color: "#0F766E", fontWeight: 600 }}>{completedTopicsCount} Topics Completed</span>
                <span style={{ color: "#64748B" }}>{totalTopicsCount - completedTopicsCount} Remaining</span>
              </div>
            </div>

            <Link
              href={targetExam ? `/student/exams/${targetExam.id}` : "/student/exams"}
              className="btn btn-sm btn-full"
              style={{ backgroundColor: "#CCFBF1", color: "#115E59", border: "1px solid #99F6E4", fontWeight: 700 }}
            >
              View Topic Checklist
            </Link>
          </div>

          {/* Card 2: Practice Accuracy (PURPLE THEME) */}
          <div
            className="card flex flex-col justify-between"
            style={{
              backgroundColor: "#FAF5FF",
              border: "2px solid #E9D5FF",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 4px 12px rgba(124, 58, 237, 0.08)",
            }}
          >
            <div>
              <div className="card-header pb-2 mb-3" style={{ borderBottom: "1px solid #F3E8FF" }}>
                <span
                  style={{
                    backgroundColor: "#7C3AED",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "var(--radius-full)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Recent Accuracy
                </span>
                <span style={{ fontSize: "0.75rem", color: "#7C3AED", fontWeight: 700 }}>Performance</span>
              </div>

              {recentAccuracyPercent !== null ? (
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span style={{ fontSize: "2.25rem", fontWeight: 800, color: recentAccuracyPercent >= 75 ? "#15803D" : recentAccuracyPercent >= 50 ? "#B45309" : "#B91C1C", lineHeight: 1 }}>
                      {recentAccuracyPercent}%
                    </span>
                    <span className="text-xs text-muted">across last {totalRecent} answers</span>
                  </div>

                  <p style={{ fontSize: "0.82rem", color: "#581C87", marginBottom: "1rem", lineHeight: "1.5" }}>
                    {recentAccuracyPercent >= 75
                      ? "Strong performance. You are meeting target competitive cut-off thresholds."
                      : recentAccuracyPercent >= 50
                      ? "Developing. Review detailed explanations to reinforce core concepts."
                      : "Needs improvement. Focus on study notes and revision items before taking mock tests."}
                  </p>
                </div>
              ) : (
                <div className="text-muted text-sm py-4" style={{ color: "#7E22CE" }}>
                  No submitted answers recorded yet. Launch a practice set to view accuracy.
                </div>
              )}
            </div>

            <Link
              href="/student/analytics"
              className="btn btn-sm btn-full"
              style={{ backgroundColor: "#F3E8FF", color: "#581C87", border: "1px solid #D8B4FE", fontWeight: 700 }}
            >
              Detailed Performance Breakdown
            </Link>
          </div>

          {/* Card 3: Course-Specific Mock Tests (ROSE THEME) */}
          <div
            className="card flex flex-col justify-between"
            style={{
              backgroundColor: "#FFF1F2",
              border: "2px solid #FECDD3",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 4px 12px rgba(225, 29, 72, 0.08)",
            }}
          >
            <div>
              <div className="card-header pb-2 mb-3" style={{ borderBottom: "1px solid #FFE4E6" }}>
                <span
                  style={{
                    backgroundColor: "#E11D48",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "var(--radius-full)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Course Mock Tests
                </span>
                <span style={{ fontSize: "0.75rem", color: "#E11D48", fontWeight: 700 }}>
                  {mockTests.length} Tests
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                {mockTests.length === 0 ? (
                  <div className="text-xs text-muted py-4 text-center">
                    No mock tests published for this specific course track yet.
                  </div>
                ) : (
                  mockTests.map((t) => (
                    <div key={t.id} style={{ padding: "0.55rem 0.75rem", backgroundColor: "#FFFFFF", border: "1px solid #FECDD3", borderRadius: "var(--radius-md)", fontSize: "0.825rem" }}>
                      <div style={{ fontWeight: 700, color: "#881337" }}>{t.title}</div>
                      <div className="text-xs text-muted flex justify-between mt-1">
                        <span>{t.durationMinutes}m • {t.totalQuestions} Qs</span>
                        <Link href={`/student/mock-tests/${t.id}`} style={{ color: "#E11D48", fontWeight: 700 }}>
                          Take Test &rarr;
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Link
              href="/student/mock-tests"
              className="btn btn-sm btn-full"
              style={{ backgroundColor: "#FFE4E6", color: "#9F1239", border: "1px solid #FECDD3", fontWeight: 700 }}
            >
              Browse All Mock Tests
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

