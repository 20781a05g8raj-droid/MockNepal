import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import {
  Search,
  CheckCircle2,
  ChevronRight,
  Calculator,
  BookA,
  Brain,
  Shapes,
  Globe,
  FlaskConical,
  Monitor,
  BarChart3,
  Landmark,
  Newspaper,
  Building2,
  FileCheck2,
  GraduationCap,
  School,
  Wrench,
  Shield,
  Cpu,
  Laptop,
  Network,
  Database,
  Terminal,
  Code,
  Sparkles,
  Zap,
  Lock,
  ArrowRight,
  BookOpen,
  FileText,
  Upload,
  Layers,
  Award,
  Download
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();

  // 1. Core Nepal Exam Streams
  const examStreams = [
    {
      title: "लोक सेवा खरिदार (Kharidar)",
      sub: "सामान्य ज्ञान, आधारभूत गणित तथा कार्यालय सञ्चालन",
      href: "/mcqs?cat=LOK_SEWA&q=Kharidar",
      icon: GraduationCap,
      color: "#D97706",
      bg: "#FFFBEB",
      tier: "Free + Pro",
    },
    {
      title: "लोक सेवा नायब सुब्बा (Nayab Subba)",
      sub: "सामान्य ज्ञान, समसामयिक, बौद्धिक परीक्षण (IQ)",
      href: "/mcqs?cat=LOK_SEWA&q=Nayab+Subba",
      icon: FileCheck2,
      color: "#059669",
      bg: "#ECFDF5",
      tier: "Free + Pro",
    },
    {
      title: "शाखा अधिकृत (Section Officer)",
      sub: "प्रशासनिक योग्यता, ऐन कानुन र विश्लेषण",
      href: "/mcqs?cat=LOK_SEWA&q=Section+Officer",
      icon: Building2,
      color: "#2563EB",
      bg: "#EFF6FF",
      tier: "Pro Track",
    },
    {
      title: "नेपाल राष्ट्र बैंक (NRB Assistant)",
      sub: "बैंकिङ ऐन, मौद्रिक नीति, लेखा र अर्थशास्त्र",
      href: "/mcqs?cat=BANKING",
      icon: Landmark,
      color: "#DC2626",
      bg: "#FEF2F2",
      tier: "Free + Pro",
    },
    {
      title: "शिक्षक सेवा आयोग (TSC Primary/Secondary)",
      sub: "शिक्षा मनोविज्ञान, शिक्षण विधि र पाठ्यक्रम",
      href: "/mcqs?cat=TEACHER_SERVICE",
      icon: School,
      color: "#0891B2",
      bg: "#ECFEFF",
      tier: "Free + Pro",
    },
    {
      title: "नेपाल इन्जिनियरिङ काउन्सिल (NEC License)",
      sub: "सिभिल, इलेक्ट्रिकल र कम्प्युटर इन्जिनियरिङ लाइसेन्स",
      href: "/mcqs?cat=ENGINEERING_LICENSE",
      icon: Wrench,
      color: "#475569",
      bg: "#F8FAFC",
      tier: "Pro Track",
    },
    {
      title: "कम्प्युटर अपरेटर (Lok Sewa PSC)",
      sub: "Computer Hardware, OS, MS Office & Networking",
      href: "/mcqs?cat=COMPUTER_OPERATOR",
      icon: Cpu,
      color: "#7C3AED",
      bg: "#F5F3FF",
      tier: "Free + Pro",
    },
    {
      title: "नेपाल प्रहरी तथा सुरक्षा निकाय",
      sub: "प्रहरी निरीक्षक (Inspector), असई (ASI) प्रश्न संग्रह",
      href: "/mcqs?q=Police",
      icon: Shield,
      color: "#4F46E5",
      bg: "#EEF2FF",
      tier: "Free + Pro",
    },
  ];

  // 2. Practice by General Subjects
  const generalSubjects = [
    { title: "सामान्य ज्ञान (Nepal GK)", sub: "भूगोल, इतिहास, संस्कृति र सम्पदा", href: "/mcqs?subject=GK", icon: Globe, color: "#EAB308", bg: "#FEF9C3" },
    { title: "नेपालको संविधान तथा कानुन", sub: "मौलिक हक, राज्यको संरचना र ऐन", href: "/mcqs?subject=CONSTITUTION", icon: BookA, color: "#10B981", bg: "#D1FAE5" },
    { title: "सामान्य बौद्धिक परीक्षण (IQ)", sub: "Verbal & Non-Verbal Reasoning", href: "/mcqs?subject=IQ", icon: Brain, color: "#3B82F6", bg: "#DBEAFE" },
    { title: "समसामयिक घटनाक्रम (Current Affairs)", sub: "राष्ट्रिय तथा अन्तर्राष्ट्रिय समसामयिक", href: "/mcqs?subject=CURRENT_AFFAIRS", icon: Newspaper, color: "#F43F5E", bg: "#FFE4E6" },
    { title: "Computer Fundamentals", sub: "Hardware, Windows, MS Word, Excel", href: "/mcqs?cat=COMPUTER_OPERATOR", icon: Monitor, color: "#6366F1", bg: "#E0E7FF" },
    { title: "Aptitude & Mathematics", sub: "ऐकिक नियम, प्रतिशत, नाफा नोक्सान", href: "/mcqs?q=Mathematics", icon: Calculator, color: "#EF4444", bg: "#FEE2E2" },
  ];

  // 3. Technical & Engineering Subjects
  const engineeringSubjects = [
    { title: "Civil Engineering", sub: "Surveying, Structure, Highway & Hydraulics", href: "/mcqs?cat=ENGINEERING_LICENSE&q=Civil", icon: Wrench, color: "#D97706", bg: "#FFFBEB" },
    { title: "Computer Engineering", sub: "Data Structures, Algorithms & OS", href: "/mcqs?cat=ENGINEERING_LICENSE&q=Computer", icon: Laptop, color: "#2563EB", bg: "#EFF6FF" },
    { title: "Electrical Engineering", sub: "Power Systems, Circuit Theory & Machines", href: "/mcqs?cat=ENGINEERING_LICENSE&q=Electrical", icon: Zap, color: "#F59E0B", bg: "#FEF3C7" },
    { title: "Networking & Security", sub: "IP Addressing, OSI Model & Protocols", href: "/mcqs?q=Networking", icon: Network, color: "#0891B2", bg: "#ECFEFF" },
    { title: "Database Systems (DBMS)", sub: "SQL Queries, Normalization & ACID", href: "/mcqs?q=Database", icon: Database, color: "#059669", bg: "#ECFDF5" },
    { title: "Programming (C / C++)", sub: "Pointers, Functions, OOP Concepts", href: "/mcqs?q=Programming", icon: Terminal, color: "#3B82F6", bg: "#DBEAFE" },
  ];

  return (
    <div className="ev-page-wrapper">
      <PublicNav user={user} />

      {/* ================= 1. HERO BANNER ================= */}
      <section className="ev-hero-section">
        <div className="ev-hero-container">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              backgroundColor: "#E0F2FE",
              color: "#0369A1",
              padding: "0.35rem 0.85rem",
              borderRadius: "999px",
              fontSize: "0.82rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>नेपालको भरपर्दो वस्तुगत परीक्षा तयारी प्लेटफर्म (Mock Nepal)</span>
          </div>

          <h1 className="ev-hero-title">
            नेपाल सरकारी तथा प्राविधिक परीक्षा वस्तुगत प्रश्नोत्तर बैंक
          </h1>

          <p className="ev-hero-desc">
            लोक सेवा आयोग, शिक्षक सेवा आयोग, इन्जिनियरिङ लाइसेन्स तथा बैंकिङ परीक्षाका लागि आधिकारिक पाठ्यक्रममा आधारित छुट्टाछुट्टै विषयगत प्रश्न संग्रह र नमुना परीक्षाहरू।
          </p>

          {/* Search Card Box */}
          <div className="ev-search-card">
            <span className="ev-search-label">
              विषय, परीक्षा वा प्रश्न खोज्नुहोस् (Search MCQs)
            </span>
            <form action="/mcqs" method="GET" className="ev-search-box">
              <input
                type="text"
                name="q"
                placeholder="जस्तै: नेपालको संविधान, खरिदार, सिभिल इन्जिनियरिङ, कम्प्युटर..."
                className="ev-search-input"
              />
              <button type="submit" className="ev-search-btn">
                <Search className="w-4 h-4" />
                <span>खोजी गर्नुहोस्</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ================= 2. FREE VS PRO VALUE CARD BANNER ================= */}
      <section style={{ backgroundColor: "#F1F5F9", padding: "1.75rem 1rem", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              border: "1.5px solid #CBD5E1",
              padding: "1.5rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1.25rem",
            }}
          >
            <div style={{ flex: "1 1 500px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span
                  style={{
                    backgroundColor: "#DCFCE7",
                    color: "#166534",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "4px",
                  }}
                >
                  FREE vs PRO
                </span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                  निशुल्क अभ्यास र Mock Nepal PRO सुविधा
                </h3>
              </div>
              <p style={{ fontSize: "0.88rem", color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                • <strong style={{ color: "#334155" }}>Free Plan:</strong> प्रत्येक विषयका सीमित नमुना प्रश्नहरू (५ प्रश्न प्रति विषय) निशुल्क अभ्यास गर्नुहोस्।<br />
                • <strong style={{ color: "#0284C7" }}>Mock Nepal PRO:</strong> सबै विषयका सम्पूर्ण प्रश्नहरू, पूर्ण विस्तृत व्याख्या, असीमित नमुना परीक्षा, र PDF नोट डाउनलोड (रु. ४९९ मात्र)।
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link
                href="/mcqs"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #0284C7",
                  color: "#0284C7",
                  padding: "0.6rem 1.1rem",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  textDecoration: "none",
                }}
              >
                <BookOpen className="w-4 h-4" />
                <span>विषय सूची हेर्नुहोस्</span>
              </Link>

              <Link
                href="/pricing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  backgroundColor: "#0284C7",
                  color: "#FFFFFF",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  textDecoration: "none",
                  boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)",
                }}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Mock Nepal PRO लिनुहोस्</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. NOTES & SYLLABUS DIRECT PROMOTION BANNER ================= */}
      <section style={{ backgroundColor: "#FFFFFF", padding: "1.75rem 1rem", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #0F172A, #1E3A8A)",
              borderRadius: "14px",
              padding: "1.5rem 1.75rem",
              color: "#FFFFFF",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1.25rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <FileText className="w-5 h-5 text-sky-300" />
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>
                  अध्ययन नोट तथा आधिकारिक पाठ्यक्रम (Notes & Syllabus PDFs)
                </h3>
              </div>
              <p style={{ fontSize: "0.88rem", color: "#BAE6FD", margin: 0 }}>
                लोक सेवा, शिक्षक सेवा र इन्जिनियरिङ लाइसेन्सका आधिकारिक नोट र पाठ्यक्रम PDF हरू डाउनलोड गर्नुहोस् वा शिक्षक/व्यवस्थापकले नयाँ नोट अपलोड गर्नुहोस्।
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link
                href="/syllabus"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  color: "#FFFFFF",
                  padding: "0.55rem 1rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                }}
              >
                <Layers className="w-4 h-4 text-sky-200" />
                <span>पाठ्यक्रम (Syllabus)</span>
              </Link>

              <Link
                href="/notes"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  backgroundColor: "#0284C7",
                  color: "#FFFFFF",
                  padding: "0.55rem 1.1rem",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
              >
                <Download className="w-4 h-4" />
                <span>नोटहरू हेर्नुहोस् (PDF)</span>
              </Link>

              <Link
                href="/admin/notes"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  backgroundColor: "#10B981",
                  color: "#FFFFFF",
                  padding: "0.55rem 1rem",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
              >
                <Upload className="w-4 h-4" />
                <span>PDF नोट अपलोड</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. MAIN CATEGORY SECTIONS CONTAINER ================= */}
      <main className="ev-main-container">
        {/* SECTION 1: Popular Exam Tracks */}
        <section className="ev-section">
          <div className="ev-section-bar">
            <span>लोकप्रिय सरकारी तथा प्राविधिक परीक्षाहरू (Popular Exam Tracks)</span>
          </div>
          <p className="ev-section-desc">
            आफूले तयारी गरिरहेको परीक्षा छान्नुहोस् र सोही परीक्षाका आधिकारिक विषयगत प्रश्नहरू अभ्यास गर्नुहोस्।
          </p>
          <div className="ev-grid-4">
            {examStreams.map((item, idx) => {
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

        {/* SECTION 2: General Subjects */}
        <section className="ev-section">
          <div className="ev-section-bar">
            <span>सामान्य ज्ञान तथा अनिवार्य विषयहरू (General Knowledge & Aptitude)</span>
          </div>
          <p className="ev-section-desc">
            प्रत्येक विषयको आफ्नै छुट्टै प्रश्न बैंक छ। विषय खोलेपछि सोही विषयका प्रश्नहरू मात्र प्रदर्शन हुन्छन्।
          </p>
          <div className="ev-grid-3">
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

        {/* SECTION 3: Engineering & IT */}
        <section className="ev-section">
          <div className="ev-section-bar">
            <span>इन्जिनियरिङ तथा प्राविधिक विषयहरू (Engineering & IT MCQs)</span>
          </div>
          <p className="ev-section-desc">
            नेपाल इन्जिनियरिङ काउन्सिल लाइसेन्स र कम्प्युटर अपरेटरका लागि विषयगत प्रश्नोत्तर।
          </p>
          <div className="ev-grid-3">
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
      </main>

      <PublicFooter />
    </div>
  );
}
