import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import ExamvedaQuestionCard, { ExamvedaQuestionData } from "@/components/ExamvedaQuestionCard";
import {
  BookOpen,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileText,
  Calendar,
  Award,
  Lock,
  ArrowRight,
  Compass,
  GraduationCap,
  ShieldCheck,
  Zap,
  FolderOpen,
  HelpCircle,
  Scale,
  CheckSquare,
  AlertCircle
} from "lucide-react";

interface McqsPageProps {
  searchParams: Promise<{
    subjectId?: string;
    subject?: string;
    cat?: string;
    exam?: string;
    topic?: string;
    difficulty?: string;
    q?: string;
    page?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function McqsBrowsePage({ searchParams }: McqsPageProps) {
  const user = await getSessionUser();
  const params = await searchParams;

  const currentSubjectId = params.subjectId;
  const currentSubjectCode = params.subject;
  const currentCatCode = params.cat;
  const currentTopicId = params.topic;
  const searchQuery = params.q?.trim() || "";
  const difficultyFilter = params.difficulty;
  const currentPage = parseInt(params.page || "1", 10) || 1;
  const pageSize = 10;

  // 1. Check if user is Pro
  let isPro = false;
  if (user) {
    if (user.role === "ADMIN" || user.role === "CONTENT_EDITOR") {
      isPro = true;
    } else {
      try {
        const activeEntitlement = await db.entitlement.findFirst({
          where: {
            userId: user.id,
            isActive: true,
            validUntil: { gte: new Date() },
          },
        });
        isPro = !!activeEntitlement;
      } catch (e) {
        console.warn("Entitlement query error:", e);
      }
    }
  }

  // 2. Fetch categories and exams for sidebars and directories
  const categories = await db.examCategory.findMany({
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
          _count: { select: { questionExams: true, mockTests: true } },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  // 3. Find if a specific subject is selected
  let selectedSubject: any = null;
  if (currentSubjectId) {
    selectedSubject = await db.subject.findUnique({
      where: { id: currentSubjectId },
      include: {
        syllabusVersion: {
          include: {
            exam: {
              include: { category: true },
            },
          },
        },
        topics: {
          include: {
            _count: { select: { questions: true } },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { questions: true } },
      },
    });
  } else if (currentSubjectCode) {
    selectedSubject = await db.subject.findFirst({
      where: {
        OR: [
          { code: currentSubjectCode },
          { code: { contains: currentSubjectCode } },
          { name: { contains: currentSubjectCode } },
        ],
      },
      include: {
        syllabusVersion: {
          include: {
            exam: {
              include: { category: true },
            },
          },
        },
        topics: {
          include: {
            _count: { select: { questions: true } },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { questions: true } },
      },
    });
  }

  // Fetch trending mock tests for right sidebar
  const trendingTests = await db.mockTest.findMany({
    where: { status: "PUBLISHED" },
    include: {
      exam: true,
      _count: { select: { questions: true } },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  // =========================================================================
  // SCENARIO 1: A SPECIFIC SUBJECT IS OPENED (STRICTLY ISOLATED SUBJECT VIEW)
  // =========================================================================
  if (selectedSubject) {
    const activeExam = selectedSubject.syllabusVersion?.exam;
    const activeCat = activeExam?.category;

    // Build filter strictly scoped to this subject
    const whereClause: any = {
      subjectId: selectedSubject.id,
      status: "PUBLISHED",
    };

    if (currentTopicId) {
      whereClause.topicId = currentTopicId;
    }

    if (difficultyFilter && ["BASIC", "INTERMEDIATE", "HARD"].includes(difficultyFilter)) {
      whereClause.difficulty = difficultyFilter;
    }

    if (searchQuery) {
      whereClause.OR = [
        { versions: { some: { questionText: { contains: searchQuery } } } },
        { versions: { some: { explanation: { contains: searchQuery } } } },
      ];
    }

    const totalQuestionsCount = await db.question.count({
      where: whereClause,
    });

    const questionsRaw = await db.question.findMany({
      where: whereClause,
      include: {
        subject: true,
        topic: true,
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
        questionExams: {
          include: { exam: true },
        },
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "asc" },
    });

    // Determine current topic name if filtered
    const activeTopic = currentTopicId
      ? selectedSubject.topics.find((t: any) => t.id === currentTopicId)
      : null;

    // Free limit: 5 questions free per subject for free students
    const freeQuestionsLimit = 5;
    const questions: ExamvedaQuestionData[] = questionsRaw
      .filter((q) => q.versions.length > 0)
      .map((q, idx) => {
        const v = q.versions[0];
        const globalIndex = (currentPage - 1) * pageSize + idx;
        const isLockedForUser = !isPro && (q.accessLevel === "PREMIUM" || globalIndex >= freeQuestionsLimit);

        return {
          id: q.id,
          questionText: v.questionText,
          optionA: v.optionA,
          optionB: v.optionB,
          optionC: v.optionC,
          optionD: v.optionD,
          correctOption: v.correctOption,
          explanation: v.explanation,
          subjectName: selectedSubject.name,
          topicName: q.topic?.name,
          difficulty: q.difficulty,
          examYear: q.examYear,
          source: q.source,
          accessLevel: q.accessLevel,
          isLocked: isLockedForUser,
        };
      });

    const totalPages = Math.ceil(totalQuestionsCount / pageSize);

    // Other subjects in the same exam for fast switching
    const sisterSubjects = activeExam?.syllabi?.[0]?.subjects || [];

    return (
      <div className="public-layout">
        <PublicNav user={user} />

        <main style={{ backgroundColor: "#F8FAFC", flexGrow: 1 }}>
          {/* ================= 1. MODERN SLEEK SUBJECT HERO BANNER ================= */}
          <div
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0369A1 100%)",
              color: "#FFFFFF",
              padding: "2rem 1.5rem 1.75rem",
              boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.2)",
            }}
          >
            <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
              {/* Breadcrumb Navigation */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.82rem",
                  color: "#94A3B8",
                  marginBottom: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <Link href="/" style={{ color: "#BAE6FD", textDecoration: "none" }}>
                  गृहपृष्ठ (Home)
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                <Link href="/mcqs" style={{ color: "#BAE6FD", textDecoration: "none" }}>
                  विषय सूची (All Subjects)
                </Link>
                {activeExam && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    <span style={{ color: "#E2E8F0" }}>{activeExam.title}</span>
                  </>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                <span style={{ color: "#FFFFFF", fontWeight: 700 }}>{selectedSubject.name}</span>
              </div>

              {/* Title & Status Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "1.25rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <span
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        backdropFilter: "blur(6px)",
                        color: "#E0F2FE",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.25rem 0.65rem",
                        borderRadius: "999px",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      {activeExam?.title || "आधिकारिक परीक्षा"}
                    </span>
                    <span
                      style={{
                        backgroundColor: "#0284C7",
                        color: "#FFFFFF",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.55rem",
                        borderRadius: "4px",
                      }}
                    >
                      Code: {selectedSubject.code}
                    </span>
                  </div>

                  <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 0.4rem 0", lineHeight: 1.25 }}>
                    {selectedSubject.name}
                  </h1>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", fontSize: "0.88rem", color: "#BAE6FD" }}>
                    <span>
                      📊 कुल उपलब्ध: <strong style={{ color: "#FFFFFF" }}>{totalQuestionsCount} प्रश्नहरू</strong>
                    </span>
                    <span>•</span>
                    <span>
                      ⚖️ नेगेटिभ मार्किङ: <strong style={{ color: "#FFFFFF" }}>-२०% (-०.४ अंक)</strong>
                    </span>
                    <span>•</span>
                    <span>
                      🏛️ आधिकारिक पाठ्यक्रम: <strong style={{ color: "#FFFFFF" }}>नेपाल सरकार / काउन्सिल</strong>
                    </span>
                  </div>
                </div>

                {/* Right: Free vs Pro Status */}
                <div>
                  {isPro ? (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        backgroundColor: "#FEF3C7",
                        color: "#92400E",
                        padding: "0.5rem 1rem",
                        borderRadius: "999px",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>PRO UNLOCKED (सबै प्रश्नहरू खुला)</span>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "0.4rem",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          color: "#FFFFFF",
                          padding: "0.35rem 0.8rem",
                          borderRadius: "999px",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          border: "1px solid rgba(255, 255, 255, 0.25)",
                        }}
                      >
                        <Lock className="w-3.5 h-3.5 text-sky-200" />
                        <span>निशुल्क पूर्वावलोकन (५ प्रश्न खुला)</span>
                      </span>

                      <Link
                        href="/pricing"
                        style={{
                          backgroundColor: "#F59E0B",
                          color: "#0F172A",
                          padding: "0.45rem 1rem",
                          borderRadius: "6px",
                          fontWeight: 800,
                          fontSize: "0.82rem",
                          textDecoration: "none",
                          boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
                        }}
                      >
                        सबै {totalQuestionsCount} प्रश्न अनलक गर्नुहोस् (रु. ४९९) →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-Topics Segmented Tab Bar */}
              {selectedSubject.topics.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    overflowX: "auto",
                    paddingTop: "1.25rem",
                    marginTop: "1.25rem",
                    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                    scrollbarWidth: "none",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#BAE6FD", whiteSpace: "nowrap" }}>
                    अध्यायहरू:
                  </span>

                  <Link
                    href={`/mcqs?subjectId=${selectedSubject.id}`}
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.35rem 0.85rem",
                      borderRadius: "999px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      textDecoration: "none",
                      backgroundColor: !currentTopicId ? "#FFFFFF" : "rgba(255, 255, 255, 0.12)",
                      color: !currentTopicId ? "#0369A1" : "#E0F2FE",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      transition: "all 150ms ease",
                    }}
                  >
                    सबै अध्यायहरू ({selectedSubject._count.questions})
                  </Link>

                  {selectedSubject.topics.map((top: any) => {
                    const isTopicActive = currentTopicId === top.id;
                    return (
                      <Link
                        key={top.id}
                        href={`/mcqs?subjectId=${selectedSubject.id}&topic=${top.id}`}
                        style={{
                          fontSize: "0.8rem",
                          padding: "0.35rem 0.85rem",
                          borderRadius: "999px",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          textDecoration: "none",
                          backgroundColor: isTopicActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.12)",
                          color: isTopicActive ? "#0369A1" : "#E0F2FE",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          transition: "all 150ms ease",
                        }}
                      >
                        {top.name} ({top._count.questions})
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ================= 2. PROFESSIONAL 2-COLUMN MAIN LAYOUT ================= */}
          <div
            style={{
              maxWidth: "1280px",
              margin: "2rem auto 4rem",
              padding: "0 1.25rem",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 340px",
              gap: "2rem",
              alignItems: "start",
            }}
          >
            {/* ================= LEFT / MAIN: QUESTIONS FEED ================= */}
            <section style={{ minWidth: 0 }}>
              {/* Question Stream Toolbar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  backgroundColor: "#FFFFFF",
                  padding: "0.85rem 1.25rem",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                  marginBottom: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div style={{ fontSize: "0.9rem", color: "#334155", fontWeight: 600 }}>
                  {activeTopic ? (
                    <span>
                      अध्याय: <strong style={{ color: "#0F172A" }}>{activeTopic.name}</strong> ({totalQuestionsCount} प्रश्न)
                    </span>
                  ) : (
                    <span>
                      देखाउँदै: <strong style={{ color: "#0F172A" }}>{questions.length} / {totalQuestionsCount} प्रश्नहरू</strong>
                    </span>
                  )}
                </div>

                {/* Difficulty Filters */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B", marginRight: "0.25rem" }}>
                    तह:
                  </span>
                  {[
                    { label: "सबै", val: "" },
                    { label: "Basic", val: "BASIC" },
                    { label: "Intermediate", val: "INTERMEDIATE" },
                    { label: "Hard", val: "HARD" },
                  ].map((item) => {
                    const isActive = (difficultyFilter || "") === item.val;
                    return (
                      <Link
                        key={item.val}
                        href={`/mcqs?${new URLSearchParams({
                          subjectId: selectedSubject.id,
                          ...(currentTopicId ? { topic: currentTopicId } : {}),
                          ...(item.val ? { difficulty: item.val } : {}),
                        }).toString()}`}
                        style={{
                          fontSize: "0.76rem",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "6px",
                          fontWeight: 700,
                          textDecoration: "none",
                          backgroundColor: isActive ? "#0284C7" : "#F1F5F9",
                          color: isActive ? "#FFFFFF" : "#475569",
                          border: `1px solid ${isActive ? "#0284C7" : "#CBD5E1"}`,
                        }}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Questions Stream */}
              {questions.length === 0 ? (
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "14px",
                    padding: "3.5rem 1.5rem",
                    textAlign: "center",
                  }}
                >
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 style={{ fontSize: "1.2rem", color: "#1E293B", fontWeight: 700 }}>
                    यस विषयमा हाल कुनै प्रश्न भेटिएन
                  </h3>
                  <p style={{ color: "#64748B", marginTop: "0.5rem", fontSize: "0.9rem" }}>
                    छानिएको अध्याय वा तहका लागि प्रश्नहरू उपलब्ध छैन। कृपया अन्य अध्याय छान्नुहोस्।
                  </p>
                  <div className="mt-4">
                    <Link
                      href={`/mcqs?subjectId=${selectedSubject.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      यस विषयका सबै प्रश्नहरू हेर्नुहोस्
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  {questions.map((q, idx) => {
                    const globalQNum = (currentPage - 1) * pageSize + idx + 1;
                    return (
                      <ExamvedaQuestionCard
                        key={q.id}
                        questionNumber={globalQNum}
                        question={q}
                      />
                    );
                  })}

                  {/* Clean Pagination */}
                  {totalPages > 1 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "0.4rem",
                        marginTop: "2.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {currentPage > 1 && (
                        <Link
                          href={`/mcqs?${new URLSearchParams({
                            subjectId: selectedSubject.id,
                            ...(currentTopicId ? { topic: currentTopicId } : {}),
                            ...(difficultyFilter ? { difficulty: difficultyFilter } : {}),
                            page: String(currentPage - 1),
                          }).toString()}`}
                          style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "8px",
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #CBD5E1",
                            color: "#1E293B",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          ‹ अघिल्लो (Prev)
                        </Link>
                      )}

                      {Array.from({ length: totalPages }, (_, i) => {
                        const pageNum = i + 1;
                        const isCurrent = pageNum === currentPage;
                        return (
                          <Link
                            key={pageNum}
                            href={`/mcqs?${new URLSearchParams({
                              subjectId: selectedSubject.id,
                              ...(currentTopicId ? { topic: currentTopicId } : {}),
                              ...(difficultyFilter ? { difficulty: difficultyFilter } : {}),
                              page: String(pageNum),
                            }).toString()}`}
                            style={{
                              minWidth: "38px",
                              height: "38px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "8px",
                              fontSize: "0.88rem",
                              fontWeight: 800,
                              textDecoration: "none",
                              backgroundColor: isCurrent ? "#0284C7" : "#FFFFFF",
                              color: isCurrent ? "#FFFFFF" : "#1E293B",
                              border: `1px solid ${isCurrent ? "#0284C7" : "#CBD5E1"}`,
                              boxShadow: isCurrent ? "0 2px 6px rgba(2, 132, 199, 0.3)" : "none",
                            }}
                          >
                            {pageNum}
                          </Link>
                        );
                      })}

                      {currentPage < totalPages && (
                        <Link
                          href={`/mcqs?${new URLSearchParams({
                            subjectId: selectedSubject.id,
                            ...(currentTopicId ? { topic: currentTopicId } : {}),
                            ...(difficultyFilter ? { difficulty: difficultyFilter } : {}),
                            page: String(currentPage + 1),
                          }).toString()}`}
                          style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "8px",
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #CBD5E1",
                            color: "#1E293B",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          पछिल्लो (Next) ›
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ================= RIGHT COMPANION SIDEBAR ================= */}
            <aside style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Card 1: Official Marking Scheme */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "14px",
                  padding: "1.25rem",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.75rem" }}>
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A" }}>
                    परीक्षा मूल्यांकन नियम
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0.6rem", backgroundColor: "#F0FDF4", borderRadius: "6px", color: "#166534" }}>
                    <span>✓ प्रत्येक सही उत्तर:</span>
                    <strong>+१.० अंक</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0.6rem", backgroundColor: "#FEF2F2", borderRadius: "6px", color: "#991B1B" }}>
                    <span>✗ प्रत्येक गलत उत्तर:</span>
                    <strong>-०.२ अंक (-२०%)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0.6rem", backgroundColor: "#F8FAFC", borderRadius: "6px", color: "#475569" }}>
                    <span>○ खाली/अनुत्तरित:</span>
                    <strong>०.० अंक</strong>
                  </div>
                </div>

                <p style={{ fontSize: "0.75rem", color: "#94A3B8", marginTop: "0.75rem", lineHeight: 1.5, margin: "0.75rem 0 0" }}>
                  लोक सेवा, शिक्षक सेवा तथा काउन्सिल परीक्षामा नेगेटिभ मार्किङ अनिवार्य लागू हुन्छ।
                </p>
              </div>

              {/* Card 2: Study Notes & Syllabus PDF */}
              <div
                style={{
                  background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
                  color: "#FFFFFF",
                  borderRadius: "14px",
                  padding: "1.25rem",
                  boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.4rem" }}>
                  <FileText className="w-4 h-4 text-sky-200" />
                  <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                    अध्ययन नोट तथा PDF
                  </span>
                </div>

                <p style={{ fontSize: "0.82rem", color: "#E0F2FE", lineHeight: 1.5, marginBottom: "1rem" }}>
                  {selectedSubject.name} का आधिकारिक अध्ययन नोट, सुत्र तथा पाठ्यक्रम PDF हरू डाउनलोड गर्नुहोस्।
                </p>

                <Link
                  href={`/notes?subjectId=${selectedSubject.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    backgroundColor: "#FFFFFF",
                    color: "#0369A1",
                    padding: "0.6rem 1rem",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    textDecoration: "none",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <FileText className="w-4 h-4" />
                  <span>विषयगत नोटहरू हेर्नुहोस् (PDF)</span>
                </Link>
              </div>

              {/* Card 3: Other Subjects in this Exam */}
              {sisterSubjects.length > 1 && (
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "14px",
                    padding: "1.25rem",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.75rem" }}>
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0F172A" }}>
                      यस परीक्षाका अन्य विषयहरू
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {sisterSubjects.map((sub: any) => {
                      const isCurrent = sub.id === selectedSubject.id;
                      return (
                        <Link
                          key={sub.id}
                          href={`/mcqs?subjectId=${sub.id}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.55rem 0.75rem",
                            borderRadius: "8px",
                            fontSize: "0.82rem",
                            textDecoration: "none",
                            backgroundColor: isCurrent ? "#F0F9FF" : "transparent",
                            color: isCurrent ? "#0284C7" : "#334155",
                            fontWeight: isCurrent ? 800 : 500,
                            border: isCurrent ? "1px solid #BAE6FD" : "1px solid transparent",
                            transition: "all 150ms ease",
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            • {sub.name}
                          </span>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              backgroundColor: isCurrent ? "#0284C7" : "#F1F5F9",
                              color: isCurrent ? "#FFFFFF" : "#64748B",
                              padding: "0.15rem 0.45rem",
                              borderRadius: "999px",
                              fontWeight: 700,
                            }}
                          >
                            {sub._count?.questions || 0}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Card 4: Switch to Entire Subject Directory */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "14px",
                  padding: "1rem 1.25rem",
                  textAlign: "center",
                }}
              >
                <Link
                  href="/mcqs"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    color: "#0284C7",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <Compass className="w-4 h-4" />
                  <span>सम्पूर्ण विषय निर्देशिका (All Subjects) →</span>
                </Link>
              </div>
            </aside>
          </div>
        </main>

        <PublicFooter />
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 2: NO SUBJECT SELECTED YET (BEAUTIFUL SUBJECT DIRECTORY)
  // =========================================================================

  // Fetch all subjects with question count
  const allSubjects = await db.subject.findMany({
    include: {
      syllabusVersion: {
        include: {
          exam: {
            include: { category: true },
          },
        },
      },
      topics: {
        take: 4,
        select: { id: true, name: true },
        orderBy: { order: "asc" },
      },
      _count: { select: { questions: true } },
    },
    orderBy: [
      { syllabusVersion: { exam: { order: "asc" } } },
      { order: "asc" },
    ],
  });

  // Filter subjects by category or search if query provided
  let filteredSubjects = allSubjects;
  if (currentCatCode) {
    filteredSubjects = filteredSubjects.filter(
      (s) => s.syllabusVersion?.exam?.category?.code === currentCatCode
    );
  }
  if (searchQuery) {
    filteredSubjects = filteredSubjects.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.syllabusVersion?.exam?.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="public-layout">
      <PublicNav user={user} />

      <main style={{ backgroundColor: "#F8FAFC", flexGrow: 1, padding: "2.5rem 1.25rem 4rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Header Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #0369A1 100%)",
              borderRadius: "16px",
              padding: "2.5rem 2rem",
              color: "#FFFFFF",
              marginBottom: "2rem",
              boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.2)",
            }}
          >
            <div style={{ maxWidth: "800px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(8px)",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "999px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                <Compass className="w-4 h-4 text-sky-300" />
                <span>विषय छनोट निर्देशिका (Subject Directory)</span>
              </div>

              <h1 style={{ fontSize: "2.2rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "0.75rem" }}>
                अभ्यास गर्न चाहेको विषय छान्नुहोस्
              </h1>
              <p style={{ fontSize: "1rem", color: "#BAE6FD", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                प्रत्येक विषयको पाठ्यक्रम, अध्याय र प्रश्नहरू छुट्टाछुट्टै राखिएका छन्। तल दिइएका विषयहरू मध्ये कुनै एक छान्नुहोस् र सोही विषयका प्रश्नहरू मात्र अभ्यास गर्नुहोस्।
              </p>

              {/* Free vs Pro Value Bar */}
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "10px",
                  padding: "0.85rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.85rem" }}>
                  <div>
                    <span style={{ color: "#7DD3FC", fontWeight: 700 }}>निशुल्क (Free):</span>{" "}
                    <span>५ प्रश्न प्रति विषय निशुल्क अभ्यास</span>
                  </div>
                  <div>
                    <span style={{ color: "#FDE047", fontWeight: 700 }}>Mock Nepal PRO ⭐:</span>{" "}
                    <span>सबै विषय, १०,०००+ प्रश्न र विस्तृत समाधान</span>
                  </div>
                </div>

                <Link
                  href="/pricing"
                  style={{
                    backgroundColor: "#F59E0B",
                    color: "#0F172A",
                    padding: "0.4rem 0.9rem",
                    borderRadius: "6px",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    textDecoration: "none",
                  }}
                >
                  Pro योजना हेर्नुहोस् (रु. ४९९)
                </Link>
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              overflowX: "auto",
              paddingBottom: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <Link
              href="/mcqs"
              style={{
                fontSize: "0.85rem",
                padding: "0.45rem 1rem",
                borderRadius: "999px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                textDecoration: "none",
                backgroundColor: !currentCatCode ? "#0284C7" : "#FFFFFF",
                color: !currentCatCode ? "#FFFFFF" : "#475569",
                border: `1px solid ${!currentCatCode ? "#0284C7" : "#CBD5E1"}`,
              }}
            >
              सबै विषयहरू ({allSubjects.length})
            </Link>

            {categories.map((cat) => {
              const isCurrent = currentCatCode === cat.code;
              return (
                <Link
                  key={cat.id}
                  href={`/mcqs?cat=${cat.code}`}
                  style={{
                    fontSize: "0.85rem",
                    padding: "0.45rem 1rem",
                    borderRadius: "999px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    textDecoration: "none",
                    backgroundColor: isCurrent ? "#0284C7" : "#FFFFFF",
                    color: isCurrent ? "#FFFFFF" : "#475569",
                    border: `1px solid ${isCurrent ? "#0284C7" : "#CBD5E1"}`,
                  }}
                >
                  {cat.name.split("(")[0]}
                </Link>
              );
            })}
          </div>

          {/* Subjects Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filteredSubjects.map((sub) => {
              const examTitle = sub.syllabusVersion?.exam?.title || "नेपाल परीक्षा";
              const qCount = sub._count.questions;
              const hasFreeSample = qCount > 0;

              return (
                <div
                  key={sub.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "14px",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
                    transition: "transform 150ms, box-shadow 150ms",
                  }}
                >
                  <div>
                    {/* Top Badges */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", gap: "0.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          backgroundColor: "#E0F2FE",
                          color: "#0369A1",
                          padding: "0.2rem 0.55rem",
                          borderRadius: "4px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "60%",
                        }}
                      >
                        {examTitle}
                      </span>

                      <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            backgroundColor: hasFreeSample ? "#DCFCE7" : "#FEF3C7",
                            color: hasFreeSample ? "#166534" : "#92400E",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "4px",
                          }}
                        >
                          {hasFreeSample ? "Free Sample" : "Pro Only"}
                        </span>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0F172A" }}>
                          {qCount} प्रश्न
                        </span>
                      </div>
                    </div>

                    {/* Subject Name */}
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0F172A", marginBottom: "0.5rem", lineHeight: 1.3 }}>
                      {sub.name}
                    </h2>

                    {/* Sub topics preview */}
                    {sub.topics.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1.25rem" }}>
                        {sub.topics.map((t) => (
                          <span
                            key={t.id}
                            style={{
                              fontSize: "0.72rem",
                              backgroundColor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              color: "#475569",
                              padding: "0.15rem 0.45rem",
                              borderRadius: "4px",
                            }}
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", marginTop: "1rem" }}>
                    <Link
                      href={`/mcqs?subjectId=${sub.id}`}
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                        backgroundColor: "#0284C7",
                        color: "#FFFFFF",
                        padding: "0.65rem 1rem",
                        borderRadius: "8px",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        textDecoration: "none",
                        boxShadow: "0 2px 4px rgba(2, 132, 199, 0.25)",
                      }}
                    >
                      <span>यस विषयको MCQ खोल्नुहोस्</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href={`/notes?subjectId=${sub.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        color: "#334155",
                        padding: "0.65rem 0.75rem",
                        borderRadius: "8px",
                        textDecoration: "none",
                      }}
                      title="यस विषयका नोटहरू हेर्नुहोस्"
                    >
                      <FileText className="w-4 h-4 text-sky-600" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
