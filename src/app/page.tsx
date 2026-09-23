import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import ExamvedaQuestionCard, { ExamvedaQuestionData } from "@/components/ExamvedaQuestionCard";
import {
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  ShieldCheck,
  GraduationCap,
  Flame,
  ArrowRight,
  Cpu,
  Landmark,
  FileCheck
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();

  // Fetch categories with exams, syllabi and question counts
  let categories: any[] = [];
  let featuredQuestions: ExamvedaQuestionData[] = [];
  let totalQuestions = 0;
  let totalMockTests = 0;

  try {
    categories = await db.examCategory.findMany({
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
            _count: {
              select: { questionExams: true, mockTests: true },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    // Fetch 3 realistic published questions with full versions for live practice on homepage
    const featuredQuestionsRaw = await db.question.findMany({
      where: { status: "PUBLISHED" },
      include: {
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
        subject: true,
        topic: true,
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    featuredQuestions = featuredQuestionsRaw
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

    totalQuestions = await db.question.count({ where: { status: "PUBLISHED" } });
    totalMockTests = await db.mockTest.count({ where: { status: "PUBLISHED" } });
  } catch (error) {
    console.error("Database query error on homepage:", error);
  }

  const categoryHighlights = [
    {
      title: "लोक सेवा आयोग (Lok Sewa / PSC)",
      code: "LOK_SEWA",
      badge: "लो",
      color: "#1D4ED8",
      desc: "शाखा अधिकृत, नायब सुब्बा, खरिदार, कम्प्युटर अपरेटर र सुरक्षा निकायका आधिकारिक पाठ्यक्रम अनुसारका वस्तुगत प्रश्नहरू।",
      tags: ["शाखा अधिकृत", "नासु", "खरिदार", "कम्प्युटर अपरेटर"],
      href: "/mcqs?cat=LOK_SEWA",
    },
    {
      title: "बैंकिङ सेवा (Banking Exams)",
      code: "BANKING",
      badge: "बैं",
      color: "#059669",
      desc: "नेपाल राष्ट्र बैंक (NRB), राष्ट्रिय वाणिज्य बैंक (RBB), कृषि विकास बैंक (ADBL) का ऐन-नियम, लेखा र बैंकिङ MCQs।",
      tags: ["NRB Assistant", "RBB Level 4", "NBL", "BAFIA Act"],
      href: "/mcqs?cat=BANKING",
    },
    {
      title: "शिक्षक सेवा आयोग (TSC)",
      code: "TEACHER_SERVICE",
      badge: "शि",
      color: "#D97706",
      desc: "प्राथमिक (प्रा.वि.), निम्न माध्यमिक (नि.मा.वि.), माध्यमिक (मा.वि.) र अध्यापन अनुमति पत्र (Teaching License) तयारी।",
      tags: ["प्रा.वि.", "नि.मा.वि.", "मा.वि.", "अध्यापन लाइसेन्स"],
      href: "/mcqs?cat=TEACHER_SERVICE",
    },
    {
      title: "इन्जिनियरिङ काउन्सिल (NEC License)",
      code: "ENGINEERING_LICENSE",
      badge: "इ",
      color: "#4F46E5",
      desc: "नेपाल इन्जिनियरिङ परिषद् (NEC) द्वारा संचालित सिभिल, कम्प्युटर र इलेक्ट्रिकल इन्जिनियरिङ लाइसेन्स परीक्षा।",
      tags: ["NEC Civil License", "NEC Computer", "NBC 105", "Ethics"],
      href: "/mcqs?cat=ENGINEERING_LICENSE",
    },
    {
      title: "चिकित्सा तथा स्वास्थ्य लाइसेन्स",
      code: "MEDICAL",
      badge: "स्वा",
      color: "#DC2626",
      desc: "Medical Education Commission (CEE), Nepal Medical Council (NMCLE) र Nursing Council (NNC) परीक्षा तयारी।",
      tags: ["CEE Entrance", "NMCLE", "Staff Nurse", "HA License"],
      href: "/mcqs?cat=MEDICAL",
    },
    {
      title: "नेपाल सामान्य ज्ञान तथा समसामयिक",
      code: "GK",
      badge: "GK",
      color: "#7C3AED",
      desc: "नेपालको भूगोल, इतिहास, संस्कृति, संविधान २०७२ र राष्ट्रिय तथा अन्तर्राष्ट्रिय समसामयिक घटनाक्रम २०८१/२०८२।",
      tags: ["नेपालको भूगोल", "नेपालको इतिहास", "संविधान २०७२", "समसामयिक २०८१"],
      href: "/mcqs?subject=GK",
    },
  ];

  return (
    <div className="public-layout">
      <PublicNav user={user} />

      {/* ================= 1. EXAMVEDA-STYLE HERO BANNER ================= */}
      <section
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)",
          borderBottom: "1px solid #E2E8F0",
          padding: "3.5rem 1.5rem 3rem",
        }}
      >
        <div className="container" style={{ maxWidth: "960px", textAlign: "center" }}>
          <div
            className="badge badge-primary mb-3"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.3rem 0.8rem",
            }}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>नेपालको आधिकारिक वस्तुगत परीक्षा तयारी पोर्टल</span>
          </div>

          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              lineHeight: 1.25,
              color: "#0F172A",
              marginBottom: "1rem",
              letterSpacing: "-0.02em",
            }}
          >
            MCQ Questions and Solutions for all{" "}
            <span style={{ color: "#0284C7" }}>Nepal Competitive Exams</span>
          </h1>

          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.6,
              color: "#475569",
              marginBottom: "2rem",
              maxWidth: "780px",
              margin: "0 auto 2rem",
            }}
          >
            लोक सेवा आयोग, बैंकिङ, शिक्षक सेवा, इन्जिनियरिङ लाइसेन्स र प्रवेश परीक्षाका
            हजारौं वस्तुगत प्रश्नहरू नि:शुल्क हल गर्नुहोस्, विस्तृत उत्तर र व्याख्या हेर्नुहोस्।
          </p>

          {/* Examveda Prominent Search Box */}
          <form
            action="/mcqs"
            method="GET"
            style={{
              maxWidth: "680px",
              margin: "0 auto 1.5rem",
              display: "flex",
              gap: "0.5rem",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              borderRadius: "999px",
              backgroundColor: "#FFFFFF",
              padding: "0.35rem 0.5rem 0.35rem 1.25rem",
              border: "2px solid #CBD5E1",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", flex: 1, gap: "0.75rem" }}>
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="q"
                placeholder="Search Nepal MCQs (खरिदार, अधिकृत, NRB, NEC License, संविधान, भूगोल)..."
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: "0.95rem",
                  color: "#0F172A",
                  backgroundColor: "transparent",
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                borderRadius: "999px",
                padding: "0.65rem 1.5rem",
                backgroundColor: "#0284C7",
                borderColor: "#0284C7",
                fontWeight: 700,
              }}
            >
              खोजी गर्नुहोस्
            </button>
          </form>

          {/* Quick Search Tag Pills */}
          <div
            className="flex items-center justify-center gap-2 flex-wrap"
            style={{ fontSize: "0.82rem", color: "#64748B" }}
          >
            <span className="font-semibold text-slate-700">लोकप्रिय खोजी:</span>
            {[
              { label: "शाखा अधिकृत", q: "शाखा अधिकृत" },
              { label: "नायब सुब्बा", q: "नायब सुब्बा" },
              { label: "खरिदार", q: "खरिदार" },
              { label: "नेपाल राष्ट्र बैंक", q: "नेपाल राष्ट्र बैंक" },
              { label: "NEC License", q: "NEC" },
              { label: "नेपालको संविधान", q: "संविधान" },
              { label: "नेपालको भूगोल", q: "भूगोल" },
              { label: "समसामयिक २०८१", q: "समसामयिक" },
            ].map((pill, idx) => (
              <Link
                key={idx}
                href={`/mcqs?q=${encodeURIComponent(pill.q)}`}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "999px",
                  padding: "0.2rem 0.65rem",
                  color: "#334155",
                  textDecoration: "none",
                  transition: "all 150ms",
                }}
              >
                {pill.label}
              </Link>
            ))}
          </div>

          {/* Key Features Banner */}
          <div
            className="flex items-center justify-center gap-8 mt-8 flex-wrap"
            style={{ fontSize: "0.85rem", color: "#64748B", borderTop: "1px solid #E2E8F0", paddingTop: "1.25rem" }}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{totalQuestions}+ प्रमाणीकृत वस्तुगत प्रश्नहरू</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>नि:शुल्क अभ्यास तथा विस्तृत व्याख्या</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>लोक सेवा २०% नेगेटिभ मार्किङ नियम</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{totalMockTests}+ अनलाइन नमुना परीक्षाहरू</span>
            </span>
          </div>
        </div>
      </section>

      {/* ================= 2. EXAMVEDA CATEGORY MATRIX ================= */}
      <section style={{ padding: "3.5rem 1.5rem", backgroundColor: "#FFFFFF" }}>
        <div className="container">
          <div className="text-center mb-8">
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#0284C7",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              नेपाल परीक्षा पाठ्यक्रम
            </span>
            <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0F172A", marginTop: "0.3rem" }}>
              Explore Competitive Exam Categories
            </h2>
            <p style={{ maxWidth: "620px", margin: "0.4rem auto 0", color: "#64748B", fontSize: "0.95rem" }}>
              आफ्नो परीक्षा विधा छान्नुहोस् र अध्याय अनुसारका महत्वपूर्ण प्रश्नोत्तरहरू तुरुन्त अभ्यास गर्नुहोस्।
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {categoryHighlights.map((cat, idx) => (
              <div
                key={idx}
                className="card card-hover flex flex-col justify-between"
                style={{
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  transition: "transform 150ms ease, box-shadow 150ms ease",
                }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        backgroundColor: cat.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontWeight: 800,
                        fontSize: "1rem",
                        flexShrink: 0,
                      }}
                    >
                      {cat.badge}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>
                        {cat.title}
                      </h3>
                      <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>
                        आधिकारिक पाठ्यक्रम
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.55, marginBottom: "1rem" }}>
                    {cat.desc}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cat.tags.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          backgroundColor: "#F1F5F9",
                          color: "#334155",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href={cat.href}
                  className="btn btn-secondary btn-sm btn-full"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: 600,
                    borderColor: "#CBD5E1",
                  }}
                >
                  <span>वस्तुगत प्रश्नहरू अभ्यास गर्नुहोस्</span>
                  <ChevronRight className="w-4 h-4 text-sky-600" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 3. LIVE EXAMVEDA PRACTICE FEED ON HOMEPAGE ================= */}
      <section style={{ padding: "3.5rem 1.5rem", backgroundColor: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}>
        <div className="container">
          <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
            <div>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#059669",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                प्रत्यक्ष अभ्यास (Live Practice)
              </span>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", marginTop: "0.25rem" }}>
                Practice Trending MCQs with Instant Answers
              </h2>
              <p style={{ color: "#64748B", fontSize: "0.92rem", marginTop: "0.25rem" }}>
                उत्तर छान्नुहोस् र तुरुन्त सही/गलत तथा आधिकारिक व्याख्या परीक्षण गर्नुहोस्।
              </p>
            </div>

            <Link href="/mcqs" className="btn btn-primary btn-sm" style={{ backgroundColor: "#0284C7" }}>
              <span>सबै प्रश्नहरू हेर्नुहोस् (Explore All MCQs)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div style={{ maxWidth: "880px", margin: "0 auto" }}>
            {featuredQuestions.map((q, idx) => (
              <ExamvedaQuestionCard
                key={q.id}
                questionNumber={idx + 1}
                question={q}
              />
            ))}

            <div className="text-center mt-6">
              <Link href="/mcqs" className="btn btn-secondary btn-lg" style={{ borderColor: "#CBD5E1" }}>
                <span>थप १००+ वस्तुगत प्रश्नहरू अभ्यास गर्नुहोस्</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. ALL-SUBJECTS MEGA DIRECTORY ================= */}
      <section style={{ padding: "3.5rem 1.5rem", backgroundColor: "#FFFFFF", borderTop: "1px solid #E2E8F0" }}>
        <div className="container">
          <div className="text-center mb-8">
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#4F46E5", textTransform: "uppercase" }}>
              विषयगत सूची (Subject Directory)
            </span>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", marginTop: "0.25rem" }}>
              Browse MCQs by Subject & Curriculum Topic
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {categories.flatMap((cat: any) =>
              (cat.exams || []).flatMap((ex: any) =>
                (ex.syllabi || []).flatMap((syl: any) =>
                  (syl.subjects || []).map((sub: any) => (
                    <div
                      key={sub.id}
                      style={{
                        padding: "1rem",
                        borderRadius: "8px",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0F172A", marginBottom: "0.5rem" }}>
                        {sub.name}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: "0.75rem" }}>
                        {cat.name.split("(")[0]} • {sub._count.questions} MCQs
                      </div>
                      <Link
                        href={`/mcqs?cat=${cat.code}&subject=${sub.code}`}
                        style={{
                          fontSize: "0.8rem",
                          color: "#0284C7",
                          fontWeight: 600,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <span>प्रश्नोत्तर हेर्नुहोस्</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))
                )
              )
            )}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
