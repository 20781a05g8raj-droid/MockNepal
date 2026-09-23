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
  FolderOpen
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
      where: { code: currentSubjectCode },
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

    // Format questions and apply Free vs Pro lock
    // Free limit: 5 questions free per subject for free students
    const freeQuestionsLimit = 5;
    const questions: ExamvedaQuestionData[] = questionsRaw
      .filter((q) => q.versions.length > 0)
      .map((q, idx) => {
        const v = q.versions[0];
        const globalIndex = (currentPage - 1) * pageSize + idx;

        // Determine if locked
        // Locked if not Pro AND (question is marked PREMIUM OR student exceeded 5 free preview questions)
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
          {/* Breadcrumb & Section Header */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderBottom: "1px solid #E2E8F0",
              padding: "1.25rem 1.5rem",
            }}
          >
            <div className="container">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-muted mb-2 flex-wrap">
                <Link href="/" className="hover:text-primary">
                  गृहपृष्ठ (Home)
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <Link href="/mcqs" className="hover:text-primary">
                  विषय सूची (All Subjects)
                </Link>
                {activeExam && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-600 font-medium">
                      {activeExam.title}
                    </span>
                  </>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-sky-700">
                  {selectedSubject.name}
                </span>
              </div>

              {/* Title & Question Count Banner */}
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      style={{
                        backgroundColor: "#E0F2FE",
                        color: "#0369A1",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "4px",
                      }}
                    >
                      विषय: {selectedSubject.code}
                    </span>
                    {activeExam && (
                      <span
                        style={{
                          backgroundColor: "#F1F5F9",
                          color: "#475569",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "4px",
                        }}
                      >
                        {activeExam.title}
                      </span>
                    )}
                  </div>

                  <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "#0F172A", margin: "0.25rem 0" }}>
                    {selectedSubject.name} वस्तुगत प्रश्न संग्रह
                  </h1>

                  <p style={{ fontSize: "0.9rem", color: "#64748B", margin: 0 }}>
                    {activeTopic
                      ? `अध्याय: ${activeTopic.name} (कुल ${totalQuestionsCount} प्रश्नहरू)`
                      : `यस विषयमा कुल ${totalQuestionsCount} वटा आधिकारिक प्रश्नहरू उपलब्ध छन्।`}
                  </p>
                </div>

                {/* Free vs Pro Access Status Indicator */}
                <div style={{ textAlign: "right" }}>
                  {isPro ? (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        backgroundColor: "#FEF3C7",
                        color: "#92400E",
                        padding: "0.4rem 0.85rem",
                        borderRadius: "999px",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        border: "1px solid #FDE68A",
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>PRO UNLOCKED (सबै प्रश्न खुला)</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          backgroundColor: "#F1F5F9",
                          color: "#334155",
                          padding: "0.25rem 0.65rem",
                          borderRadius: "999px",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                        }}
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>निशुल्क पूर्वावलोकन (५ प्रश्न खुला)</span>
                      </span>
                      <Link
                        href="/pricing"
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "#0284C7",
                          textDecoration: "none",
                        }}
                      >
                        सबै {totalQuestionsCount} प्रश्न अनलक गर्नुहोस् →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-Topics Pills for this Subject */}
              {selectedSubject.topics.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    overflowX: "auto",
                    paddingTop: "1rem",
                    marginTop: "0.75rem",
                    borderTop: "1px solid #F1F5F9",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B", whiteSpace: "nowrap" }}>
                    अध्यायहरू:
                  </span>

                  <Link
                    href={`/mcqs?subjectId=${selectedSubject.id}`}
                    style={{
                      fontSize: "0.78rem",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "999px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      textDecoration: "none",
                      backgroundColor: !currentTopicId ? "#0284C7" : "#FFFFFF",
                      color: !currentTopicId ? "#FFFFFF" : "#475569",
                      border: `1px solid ${!currentTopicId ? "#0284C7" : "#CBD5E1"}`,
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
                          fontSize: "0.78rem",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "999px",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          textDecoration: "none",
                          backgroundColor: isTopicActive ? "#0284C7" : "#FFFFFF",
                          color: isTopicActive ? "#FFFFFF" : "#475569",
                          border: `1px solid ${isTopicActive ? "#0284C7" : "#CBD5E1"}`,
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

          {/* Subject Content Layout */}
          <div className="container examveda-main-layout" style={{ marginTop: "1.5rem" }}>
            {/* Left Column: Syllabus Navigator */}
            <aside className="examveda-sidebar-left">
              {/* Back to All Subjects */}
              <div style={{ marginBottom: "1rem" }}>
                <Link
                  href="/mcqs"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    padding: "0.6rem 1rem",
                    borderRadius: "8px",
                    color: "#1E293B",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <Compass className="w-4 h-4 text-sky-600" />
                  <span>← अन्य विषय छान्नुहोस्</span>
                </Link>
              </div>

              {/* Sister Subjects in the Same Exam */}
              <div className="examveda-sidebar-card">
                <div className="examveda-sidebar-title">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    {activeExam?.title || "यस परीक्षाका अन्य विषयहरू"}
                  </span>
                </div>

                <ul className="examveda-topic-list">
                  {sisterSubjects.map((sub: any) => {
                    const isCurrent = sub.id === selectedSubject.id;
                    return (
                      <li key={sub.id} className="examveda-topic-item">
                        <Link
                          href={`/mcqs?subjectId=${sub.id}`}
                          className={`examveda-topic-link ${isCurrent ? "active" : ""}`}
                        >
                          <span style={{ fontSize: "0.82rem" }}>• {sub.name}</span>
                          <span className="examveda-count-pill">{sub._count?.questions || 0}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Study Notes & PDFs for this subject */}
              <div className="examveda-sidebar-card">
                <div className="examveda-sidebar-title">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    अध्ययन नोट तथा PDF
                  </span>
                </div>
                <div style={{ padding: "0.85rem" }}>
                  <p style={{ fontSize: "0.82rem", color: "#64748B", lineHeight: 1.5, margin: 0 }}>
                    {selectedSubject.name} का आधिकारिक नोट, सारांश तथा पाठ्यक्रम PDF हरू डाउनलोड गर्नुहोस्।
                  </p>
                  <Link
                    href={`/notes?subjectId=${selectedSubject.id}`}
                    className="btn btn-secondary btn-sm btn-full mt-3"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>यस विषयका नोटहरू हेर्नुहोस्</span>
                  </Link>
                </div>
              </div>
            </aside>

            {/* Center Column: Questions Feed strictly for this Subject */}
            <section className="examveda-center-col" style={{ minWidth: 0 }}>
              {/* Free User Upgrade Banner */}
              {!isPro && totalQuestionsCount > freeQuestionsLimit && (
                <div
                  style={{
                    backgroundColor: "#EFF6FF",
                    border: "1.5px solid #BFDBFE",
                    borderRadius: "10px",
                    padding: "1rem 1.25rem",
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: "#1E40AF", fontSize: "0.92rem" }}>
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>Mock Nepal PRO अपग्रेड</span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "#3B82F6", margin: "0.2rem 0 0" }}>
                      तपाईं निशुल्क खातामा हुनुहुन्छ। पहिलो {freeQuestionsLimit} प्रश्न खुला छन्। बाँकी प्रश्नहरू र विस्तृत व्याख्याका लागि Pro लिनुहोस्।
                    </p>
                  </div>

                  <Link
                    href="/pricing"
                    style={{
                      backgroundColor: "#0284C7",
                      color: "#FFFFFF",
                      padding: "0.45rem 1rem",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      boxShadow: "0 2px 4px rgba(2, 132, 199, 0.3)",
                    }}
                  >
                    <span>रु. ४९९ मा सबै अनलक</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {questions.length === 0 ? (
                <div
                  className="card text-center"
                  style={{ padding: "3rem 1.5rem", backgroundColor: "#FFFFFF", borderRadius: "10px" }}
                >
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 style={{ fontSize: "1.2rem", color: "#1E293B", fontWeight: 700 }}>
                    यस विषयमा हाल कुनै प्रश्न भेटिएन
                  </h3>
                  <p style={{ color: "#64748B", marginTop: "0.5rem", fontSize: "0.9rem" }}>
                    छानिएको अध्याय वा फिल्टरका लागि प्रश्न उपलब्ध छैन। कृपया अन्य अध्याय छान्नुहोस्।
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "0.4rem",
                        marginTop: "2rem",
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
                          className="btn btn-secondary btn-sm"
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
                              minWidth: "36px",
                              height: "36px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "6px",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              textDecoration: "none",
                              backgroundColor: isCurrent ? "#0284C7" : "#FFFFFF",
                              color: isCurrent ? "#FFFFFF" : "#1E293B",
                              border: `1px solid ${isCurrent ? "#0284C7" : "#CBD5E1"}`,
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
                          className="btn btn-secondary btn-sm"
                        >
                          पछिल्लो (Next) ›
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Right Column: Tips & Fast Actions */}
            <aside className="examveda-sidebar-right">
              {/* Quick Marking Card */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  padding: "1.25rem",
                  marginBottom: "1rem",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0F172A" }}>
                    परीक्षा मूल्यांकन नियम
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
                  प्रत्येक गलत उत्तर बापत २०% (-०.४ अंक) कट्टा गरिन्छ। सही उत्तरको मात्र अंक प्राप्त हुन्छ।
                </p>
              </div>

              {/* Upload Notes / PDF Card */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  padding: "1.25rem",
                  marginBottom: "1rem",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0F172A" }}>
                    नोट तथा पाठ्यक्रम PDF
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.5, marginBottom: "0.75rem" }}>
                  शिक्षक वा व्यवस्थापकले नयाँ नोट तथा पाठ्यक्रम सिधै पोर्टलमा थप्न सक्नुहुन्छ।
                </p>
                <Link
                  href="/admin/notes"
                  className="btn btn-primary btn-sm btn-full"
                  style={{ backgroundColor: "#0284C7" }}
                >
                  PDF नोट अपलोड गर्नुहोस्
                </Link>
              </div>

              {/* Trending Tests Widget */}
              {trendingTests.length > 0 && (
                <div className="examveda-sidebar-card">
                  <div className="examveda-sidebar-title">
                    <span className="flex items-center gap-1.5 text-rose-700">
                      <Award className="w-4 h-4" />
                      नमुना परीक्षा (Mock Tests)
                    </span>
                  </div>
                  <div style={{ padding: "0.75rem 1rem" }}>
                    {trendingTests.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          padding: "0.75rem 0",
                          borderBottom: "1px solid #F1F5F9",
                        }}
                      >
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A" }}>
                          {t.title}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted mt-1">
                          <span>{t.durationMinutes} मिनेट</span>
                          <span>•</span>
                          <span>{t._count.questions} प्रश्नहरू</span>
                        </div>
                      </div>
                    ))}
                    <Link href="/exams" className="btn btn-secondary btn-sm btn-full mt-3">
                      सबै नमुना परीक्षाहरू हेर्नुहोस्
                    </Link>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </main>

        <PublicFooter />
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 2: NO SUBJECT SELECTED YET (BEAUTIFUL SUBJECT DIRECTORY)
  // This solves the problem of dumping mixed questions together!
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

      <main style={{ backgroundColor: "#F8FAFC", flexGrow: 1, padding: "2rem 1rem 4rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
                    borderRadius: "12px",
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
                        padding: "0.6rem 1rem",
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
                        padding: "0.6rem 0.75rem",
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
