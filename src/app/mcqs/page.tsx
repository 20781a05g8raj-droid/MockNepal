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
  Award
} from "lucide-react";

interface McqsPageProps {
  searchParams: Promise<{
    cat?: string;
    exam?: string;
    subject?: string;
    topic?: string;
    difficulty?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function McqsBrowsePage({ searchParams }: McqsPageProps) {
  const user = await getSessionUser();
  const params = await searchParams;

  const currentCatCode = params.cat;
  const currentSubjectCode = params.subject;
  const currentTopicId = params.topic;
  const searchQuery = params.q?.trim() || "";
  const difficultyFilter = params.difficulty;
  const currentPage = parseInt(params.page || "1", 10) || 1;
  const pageSize = 10;

  // 1. Fetch categories with exams and subjects for the left sidebar
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
                  },
                  _count: { select: { questions: true } },
                },
              },
            },
          },
          _count: { select: { questionExams: true, mockTests: true } },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  // 2. Build where filter for questions
  const whereClause: any = {
    status: "PUBLISHED",
  };

  if (difficultyFilter && ["BASIC", "INTERMEDIATE", "HARD"].includes(difficultyFilter)) {
    whereClause.difficulty = difficultyFilter;
  }

  if (currentTopicId) {
    whereClause.topicId = currentTopicId;
  } else if (currentSubjectCode) {
    whereClause.subject = {
      code: { contains: currentSubjectCode },
    };
  }

  if (currentCatCode) {
    whereClause.questionExams = {
      some: {
        exam: {
          category: { code: currentCatCode },
        },
      },
    };
  }

  if (searchQuery) {
    whereClause.OR = [
      { versions: { some: { questionText: { contains: searchQuery } } } },
      { versions: { some: { explanation: { contains: searchQuery } } } },
      { subject: { name: { contains: searchQuery } } },
      { topic: { name: { contains: searchQuery } } },
    ];
  }

  // Count total questions matching filter
  const totalQuestionsCount = await db.question.count({
    where: whereClause,
  });

  // Fetch paginated questions with latest version
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
        include: {
          exam: true,
        },
      },
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
  });

  // Format into ExamvedaQuestionData
  const questions: ExamvedaQuestionData[] = questionsRaw
    .filter((q) => q.versions.length > 0)
    .map((q) => {
      const v = q.versions[0];
      return {
        id: q.id,
        questionText: v.questionText,
        optionA: v.optionA,
        optionB: v.optionB,
        optionC: v.optionC,
        optionD: v.optionD,
        correctOption: v.correctOption,
        explanation: v.explanation,
        subjectName: q.subject?.name,
        topicName: q.topic?.name,
        difficulty: q.difficulty,
        examYear: q.examYear,
        source: q.source,
      };
    });

  const totalPages = Math.ceil(totalQuestionsCount / pageSize);

  // Fetch trending mock tests for right sidebar
  const trendingTests = await db.mockTest.findMany({
    where: { status: "PUBLISHED" },
    include: {
      exam: true,
      _count: { select: { questions: true } },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="public-layout">
      <PublicNav user={user} />

      <main style={{ backgroundColor: "#F8FAFC", flexGrow: 1 }}>
        {/* Breadcrumb & Section Header Banner */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #E2E8F0",
            padding: "1rem 1.5rem",
          }}
        >
          <div className="container">
            <div className="flex items-center gap-2 text-xs text-muted mb-2 flex-wrap">
              <Link href="/" className="hover:text-primary">
                गृहपृष्ठ (Home)
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/mcqs" className="hover:text-primary">
                MCQ Practice
              </Link>
              {currentCatCode && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">
                    {currentCatCode.replace("_", " ")}
                  </span>
                </>
              )}
            </div>

            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "#0F172A" }}>
                  {searchQuery
                    ? `खोज परिणाम: "${searchQuery}"`
                    : currentCatCode
                    ? `नेपाल ${currentCatCode.replace("_", " ")} वस्तुगत प्रश्नोत्तर`
                    : "नेपाल वस्तुगत परीक्षा प्रश्न संग्रह (Nepal MCQ Question Bank)"}
                </h1>
                <p style={{ fontSize: "0.88rem", color: "#64748B", marginTop: "0.25rem" }}>
                  अभ्यास गर्नुहोस् र प्रत्येक प्रश्नको विस्तृत समाधान, व्याख्या तथा कानुनी आधार हेर्नुहोस्। (Total: {totalQuestionsCount} प्रश्नहरू)
                </p>
              </div>

              {/* Difficulty Filter Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> तह:
                </span>
                {[
                  { label: "सबै (All)", val: "" },
                  { label: "आधारभूत (Basic)", val: "BASIC" },
                  { label: "मध्यम (Intermediate)", val: "INTERMEDIATE" },
                  { label: "कठिन (Hard)", val: "HARD" },
                ].map((item) => {
                  const isActive = (difficultyFilter || "") === item.val;
                  return (
                    <Link
                      key={item.val}
                      href={`/mcqs?${new URLSearchParams({
                        ...(currentCatCode ? { cat: currentCatCode } : {}),
                        ...(currentSubjectCode ? { subject: currentSubjectCode } : {}),
                        ...(currentTopicId ? { topic: currentTopicId } : {}),
                        ...(searchQuery ? { q: searchQuery } : {}),
                        ...(item.val ? { difficulty: item.val } : {}),
                      }).toString()}`}
                      style={{
                        fontSize: "0.78rem",
                        padding: "0.25rem 0.65rem",
                        borderRadius: "999px",
                        fontWeight: 600,
                        textDecoration: "none",
                        backgroundColor: isActive ? "#0284C7" : "#FFFFFF",
                        color: isActive ? "#FFFFFF" : "#475569",
                        border: `1px solid ${isActive ? "#0284C7" : "#CBD5E1"}`,
                        transition: "all 150ms",
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Examveda 3-Column Layout Container */}
        <div className="container examveda-main-layout">
          {/* ================= LEFT SIDEBAR ================= */}
          <aside className="examveda-sidebar-left">
            {/* Quick Category Browser */}
            <div className="examveda-sidebar-card">
              <div className="examveda-sidebar-title">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-600" />
                  पाठ्यक्रम वर्गीकरण (Categories)
                </span>
              </div>
              <ul className="examveda-topic-list">
                <li className="examveda-topic-item">
                  <Link
                    href="/mcqs"
                    className={`examveda-topic-link ${!currentCatCode ? "active" : ""}`}
                  >
                    <span>सबै प्रश्नहरू (All MCQs)</span>
                    <span className="examveda-count-pill">{totalQuestionsCount}</span>
                  </Link>
                </li>
                {categories.map((cat) => {
                  const isCurrent = currentCatCode === cat.code;
                  const catQCount = cat.exams.reduce(
                    (acc, ex) => acc + ex._count.questionExams,
                    0
                  );
                  return (
                    <li key={cat.id} className="examveda-topic-item">
                      <Link
                        href={`/mcqs?cat=${cat.code}`}
                        className={`examveda-topic-link ${isCurrent ? "active" : ""}`}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                          {cat.name.split("(")[0]}
                        </span>
                        <span className="examveda-count-pill">{catQCount}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Subjects & Topics Tree */}
            <div className="examveda-sidebar-card">
              <div className="examveda-sidebar-title">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  विषय तथा अध्याय (Subjects)
                </span>
              </div>
              <div style={{ maxHeight: "420px", overflowY: "auto" }}>
                {categories.map((cat) => (
                  <div key={cat.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <div
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#F8FAFC",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#64748B",
                        textTransform: "uppercase",
                      }}
                    >
                      {cat.name}
                    </div>
                    <ul className="examveda-topic-list">
                      {cat.exams.flatMap((ex) =>
                        ex.syllabi.flatMap((syl) =>
                          syl.subjects.map((sub) => (
                            <li key={sub.id} className="examveda-topic-item">
                              <Link
                                href={`/mcqs?cat=${cat.code}&subject=${sub.code}`}
                                className={`examveda-topic-link ${
                                  currentSubjectCode === sub.code ? "active" : ""
                                }`}
                              >
                                <span style={{ fontSize: "0.82rem" }}>• {sub.name}</span>
                                <span className="examveda-count-pill">
                                  {sub._count.questions}
                                </span>
                              </Link>
                            </li>
                          ))
                        )
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ================= CENTER QUESTION STREAM ================= */}
          <section className="examveda-center-col" style={{ minWidth: 0 }}>
            {questions.length === 0 ? (
              <div
                className="card text-center"
                style={{ padding: "3rem 1.5rem", backgroundColor: "#FFFFFF" }}
              >
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 style={{ fontSize: "1.2rem", color: "#1E293B" }}>
                  कुनै पनि प्रश्न फेला परेन (No questions found)
                </h3>
                <p style={{ color: "#64748B", marginTop: "0.5rem", fontSize: "0.9rem" }}>
                  तपाईंले छान्नुभएको फिल्टर वा खोजी शब्दका लागि हाल प्रश्न उपलब्ध छैन। कृपया अन्य विषय छान्नुहोस्।
                </p>
                <div className="mt-4">
                  <Link href="/mcqs" className="btn btn-primary btn-sm">
                    सबै प्रश्नहरू हेर्नुहोस् (Reset Filters)
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                {/* Questions Feed */}
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

                {/* Examveda-style Pagination */}
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
                          ...(currentCatCode ? { cat: currentCatCode } : {}),
                          ...(currentSubjectCode ? { subject: currentSubjectCode } : {}),
                          ...(currentTopicId ? { topic: currentTopicId } : {}),
                          ...(searchQuery ? { q: searchQuery } : {}),
                          page: String(currentPage - 1),
                        }).toString()}`}
                        className="btn btn-secondary btn-sm"
                      >
                        ‹ अघिल्लो (Prev)
                      </Link>
                    )}

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                      }
                      const isCurrent = pageNum === currentPage;
                      return (
                        <Link
                          key={pageNum}
                          href={`/mcqs?${new URLSearchParams({
                            ...(currentCatCode ? { cat: currentCatCode } : {}),
                            ...(currentSubjectCode ? { subject: currentSubjectCode } : {}),
                            ...(currentTopicId ? { topic: currentTopicId } : {}),
                            ...(searchQuery ? { q: searchQuery } : {}),
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
                          ...(currentCatCode ? { cat: currentCatCode } : {}),
                          ...(currentSubjectCode ? { subject: currentSubjectCode } : {}),
                          ...(currentTopicId ? { topic: currentTopicId } : {}),
                          ...(searchQuery ? { q: searchQuery } : {}),
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

          {/* ================= RIGHT SIDEBAR ================= */}
          <aside className="examveda-sidebar-right">
            {/* Daily Nepal Current Affairs Widget */}
            <div className="examveda-sidebar-card">
              <div className="examveda-sidebar-title">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <TrendingUp className="w-4 h-4" />
                  नेपाल समसामयिक २०८१
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    backgroundColor: "#FEF3C7",
                    color: "#92400E",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "4px",
                    fontWeight: 700,
                  }}
                >
                  NEW
                </span>
              </div>
              <div style={{ padding: "1rem" }}>
                <p style={{ fontSize: "0.85rem", color: "#334155", lineHeight: "1.5" }}>
                  लोक सेवा आयोग तथा बैंकिङ परीक्षाका लागि अति सम्भावित पछिल्ला समसामयिक वस्तुगत प्रश्नोत्तरहरू।
                </p>
                <Link
                  href="/mcqs?subject=CURRENT_AFFAIRS"
                  className="btn btn-primary btn-sm btn-full mt-3"
                  style={{ backgroundColor: "#0284C7", borderColor: "#0284C7" }}
                >
                  <span>समसामयिक प्रश्नहरू हल गर्नुहोस्</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Trending Mock Tests Widget */}
            <div className="examveda-sidebar-card">
              <div className="examveda-sidebar-title">
                <span className="flex items-center gap-1.5 text-rose-700">
                  <Award className="w-4 h-4" />
                  लोकप्रिय नमुना परीक्षा (Mock Tests)
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
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t.durationMinutes} मिनेट
                      </span>
                      <span>•</span>
                      <span>{t._count.questions} प्रश्नहरू</span>
                    </div>
                  </div>
                ))}

                <Link href="/exams" className="btn btn-secondary btn-sm btn-full mt-3">
                  सबै नमुना परीक्षाहरू (Catalog)
                </Link>
              </div>
            </div>

            {/* Official Marking Guidance Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #1E293B, #0F172A)",
                color: "#FFFFFF",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  नेपाल परीक्षा मूल्यांकन नियम
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "#94A3B8", lineHeight: "1.6" }}>
                लोक सेवा तथा सुरक्षा निकायमा प्रत्येक गलत उत्तर बापत २०% (-०.४ अंक) कट्टा गरिन्छ। हाम्रो प्रणालीले आधिकारिक मूल्यांकन विधि लागू गर्दछ।
              </p>
              <div className="mt-3">
                <Link
                  href="/register"
                  className="btn btn-sm btn-full"
                  style={{ backgroundColor: "#38BDF8", color: "#0F172A", fontWeight: 700 }}
                >
                  विद्यार्थी खाता खोल्नुहोस्
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
