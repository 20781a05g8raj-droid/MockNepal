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
  Coffee,
  FileCode,
  Braces,
  LineChart,
  Bot,
  Cloud,
  Radio,
  Cog,
  HardHat,
  Zap,
  TestTube,
  Car,
  Dna,
  Mountain,
  Binary,
  Atom,
  Beaker,
  Coins,
  Users,
  Scale,
  Trees,
  HeartHandshake,
  Vote,
  Sparkles,
  TrendingUp,
  Pill,
  Megaphone,
  Lightbulb,
  BookOpenCheck,
  CalendarDays,
  CalendarRange,
  FileDown,
  UserCheck,
  Building
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();

  // 1. Practice MCQs For Competitive Exams
  const generalSubjects = [
    { title: "Aptitude", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Aptitude", icon: Calculator, color: "#EF4444", bg: "#FEE2E2" },
    { title: "English", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=English", icon: BookA, color: "#10B981", bg: "#D1FAE5" },
    { title: "Verbal Reasoning", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Reasoning", icon: Brain, color: "#3B82F6", bg: "#DBEAFE" },
    { title: "Non-Verbal Reasoning", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Reasoning", icon: Shapes, color: "#F59E0B", bg: "#FEF3C7" },
    { title: "General Knowledge", sub: "Practice MCQ Questions and Answers", href: "/mcqs?subject=GK", icon: Globe, color: "#EAB308", bg: "#FEF9C3" },
    { title: "General Science", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Science", icon: FlaskConical, color: "#14B8A6", bg: "#CCFBF1" },
    { title: "Computer Fundamentals", sub: "Practice MCQ Questions and Answers", href: "/mcqs?cat=COMPUTER_OPERATOR", icon: Monitor, color: "#6366F1", bg: "#E0E7FF" },
    { title: "Data Interpretation", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Data", icon: BarChart3, color: "#06B6D4", bg: "#CFFAFE" },
    { title: "Banking Awareness", sub: "Practice MCQ Questions and Answers", href: "/mcqs?cat=BANKING", icon: Landmark, color: "#64748B", bg: "#F1F5F9" },
    { title: "Current Affairs", sub: "Practice MCQ Questions and Answers", href: "/mcqs?subject=CURRENT_AFFAIRS", icon: Newspaper, color: "#F43F5E", bg: "#FFE4E6" },
  ];

  // 2. Prepare for Popular Competitive Exams
  const popularExams = [
    { title: "Lok Sewa Section Officer", sub: "First Paper GK & Aptitude MCQs", href: "/mcqs?cat=LOK_SEWA&q=Section+Officer", icon: Building2, color: "#2563EB", bg: "#EFF6FF" },
    { title: "Lok Sewa Nayab Subba", sub: "Syllabus MCQs and Model Tests", href: "/mcqs?cat=LOK_SEWA&q=Nayab+Subba", icon: FileCheck2, color: "#059669", bg: "#ECFDF5" },
    { title: "Lok Sewa Kharidar", sub: "General Knowledge & Arithmetic", href: "/mcqs?cat=LOK_SEWA&q=Kharidar", icon: GraduationCap, color: "#D97706", bg: "#FFFBEB" },
    { title: "Banking (NRB, RBB, ADBL)", sub: "Banking Acts, Accounts & Economics", href: "/mcqs?cat=BANKING", icon: Landmark, color: "#DC2626", bg: "#FEF2F2" },
    { title: "Shikshak Sewa (TSC)", sub: "Teaching License & Primary/Secondary", href: "/mcqs?cat=TEACHER_SERVICE", icon: School, color: "#0891B2", bg: "#ECFEFF" },
    { title: "NEC Engineering License", sub: "Civil, Electrical & Computer License", href: "/mcqs?cat=ENGINEERING_LICENSE", icon: Wrench, color: "#475569", bg: "#F8FAFC" },
    { title: "Nepal Police & Security", sub: "Inspector, ASI & Armed Police MCQs", href: "/mcqs?q=Police", icon: Shield, color: "#4F46E5", bg: "#EEF2FF" },
    { title: "Computer Operator (PSC)", sub: "Hardware, OS, Office & IT MCQs", href: "/mcqs?cat=COMPUTER_OPERATOR", icon: Cpu, color: "#7C3AED", bg: "#F5F3FF" },
  ];

  // 3. Computer & Programming MCQs
  const computerSubjects = [
    { title: "Computer Fundamentals", sub: "Practice MCQ Questions and Answers", href: "/mcqs?cat=COMPUTER_OPERATOR&q=Fundamentals", icon: Laptop, color: "#2563EB", bg: "#EFF6FF" },
    { title: "Networking", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Networking", icon: Network, color: "#0891B2", bg: "#ECFEFF" },
    { title: "Database (DBMS)", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Database", icon: Database, color: "#059669", bg: "#ECFDF5" },
    { title: "Web Technology", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Web", icon: Globe, color: "#D97706", bg: "#FFFBEB" },
    { title: "C Programming", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Programming", icon: Terminal, color: "#3B82F6", bg: "#DBEAFE" },
    { title: "C++ Programming", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=OOP", icon: Code, color: "#EF4444", bg: "#FEE2E2" },
    { title: "Java", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Java", icon: Coffee, color: "#B45309", bg: "#FEF3C7" },
    { title: "Python", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Python", icon: FileCode, color: "#059669", bg: "#D1FAE5" },
    { title: "JavaScript", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=JavaScript", icon: Braces, color: "#CA8A04", bg: "#FEF9C3" },
    { title: "Data Science", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Data+Science", icon: LineChart, color: "#0284C7", bg: "#E0F2FE" },
    { title: "Machine Learning", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Machine+Learning", icon: Bot, color: "#475569", bg: "#F1F5F9" },
    { title: "Cloud Computing", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Cloud", icon: Cloud, color: "#4F46E5", bg: "#EEF2FF" },
  ];

  // 4. Engineering & Technical MCQs
  const engineeringSubjects = [
    { title: "Computer Engineering", sub: "Practice MCQ Questions and Answers", href: "/mcqs?cat=ENGINEERING_LICENSE&q=Computer", icon: Cpu, color: "#2563EB", bg: "#EFF6FF" },
    { title: "Electronics & Communication", sub: "Practice MCQ Questions and Answers", href: "/mcqs?cat=ENGINEERING_LICENSE&q=Electronics", icon: Radio, color: "#0891B2", bg: "#ECFEFF" },
    { title: "Mechanical Engineering", sub: "Practice MCQ Questions and Answers", href: "/mcqs?cat=ENGINEERING_LICENSE&q=Mechanical", icon: Cog, color: "#DC2626", bg: "#FEF2F2" },
    { title: "Civil Engineering", sub: "Practice MCQ Questions and Answers", href: "/mcqs?cat=ENGINEERING_LICENSE&q=Civil", icon: HardHat, color: "#D97706", bg: "#FFFBEB" },
    { title: "Electrical Engineering", sub: "Practice MCQ Questions and Answers", href: "/mcqs?cat=ENGINEERING_LICENSE&q=Electrical", icon: Zap, color: "#F59E0B", bg: "#FEF3C7" },
    { title: "Chemical Engineering", sub: "Practice MCQ Questions and Answers", href: "/mcqs?cat=ENGINEERING_LICENSE&q=Chemical", icon: TestTube, color: "#0D9488", bg: "#F0FDFA" },
    { title: "Automobile Engineering", sub: "Practice MCQ Questions and Answers", href: "/mcqs?cat=ENGINEERING_LICENSE&q=Automobile", icon: Car, color: "#4F46E5", bg: "#EEF2FF" },
    { title: "Biotechnology Engineering", sub: "Practice MCQ Questions and Answers", href: "/mcqs?cat=ENGINEERING_LICENSE&q=Biotechnology", icon: Dna, color: "#16A34A", bg: "#DCFCE7" },
    { title: "Mining Engineering", sub: "Practice MCQ Questions and Answers", href: "/mcqs?cat=ENGINEERING_LICENSE&q=Mining", icon: Mountain, color: "#64748B", bg: "#F8FAFC" },
    { title: "Engineering Mathematics", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Mathematics", icon: Binary, color: "#E11D48", bg: "#FFE4E6" },
    { title: "Engineering Physics", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Physics", icon: Atom, color: "#0284C7", bg: "#E0F2FE" },
    { title: "Engineering Chemistry", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Chemistry", icon: Beaker, color: "#059669", bg: "#ECFDF5" },
  ];

  // 5. Graduate & Academic Subjects
  const academicSubjects = [
    { title: "Commerce", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Commerce", icon: Coins, color: "#2563EB", bg: "#EFF6FF" },
    { title: "Management", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Management", icon: Users, color: "#059669", bg: "#ECFDF5" },
    { title: "Law & Constitution", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Constitution", icon: Scale, color: "#DC2626", bg: "#FEF2F2" },
    { title: "Agriculture & Forestry", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Agriculture", icon: Trees, color: "#16A34A", bg: "#DCFCE7" },
    { title: "Sociology", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Sociology", icon: HeartHandshake, color: "#0891B2", bg: "#ECFEFF" },
    { title: "Political Science", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Political+Science", icon: Vote, color: "#3B82F6", bg: "#DBEAFE" },
    { title: "Psychology", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Psychology", icon: Sparkles, color: "#D97706", bg: "#FFFBEB" },
    { title: "Economics", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Economics", icon: TrendingUp, color: "#475569", bg: "#F1F5F9" },
    { title: "Pharmacy", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Pharmacy", icon: Pill, color: "#E11D48", bg: "#FFE4E6" },
    { title: "Mass Communication & Journalism", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Journalism", icon: Megaphone, color: "#0284C7", bg: "#E0F2FE" },
    { title: "Philosophy", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Philosophy", icon: Lightbulb, color: "#CA8A04", bg: "#FEF9C3" },
    { title: "Education", sub: "Practice MCQ Questions and Answers", href: "/mcqs?q=Education", icon: BookOpenCheck, color: "#10B981", bg: "#D1FAE5" },
  ];

  // 6. Latest Current Affairs
  const currentAffairsList = [
    { title: "Daily Current Affairs", sub: "Read and Practice Current Affairs", href: "/mcqs?subject=CURRENT_AFFAIRS&q=Daily", icon: CalendarDays, color: "#2563EB", bg: "#EFF6FF" },
    { title: "Monthly Current Affairs", sub: "Read and Practice Current Affairs", href: "/mcqs?subject=CURRENT_AFFAIRS&q=Monthly", icon: CalendarRange, color: "#059669", bg: "#ECFDF5" },
    { title: "Current Affairs Download", sub: "Read and Practice Current Affairs", href: "/student/notes", icon: FileDown, color: "#DC2626", bg: "#FEF2F2" },
  ];

  // 7. Interview Questions & Answers
  const interviewList = [
    { title: "HR Interview", sub: "Interview Questions and Answers", href: "/mcqs?q=HR+Interview", icon: UserCheck, color: "#2563EB", bg: "#EFF6FF" },
    { title: "Banking Interview", sub: "Interview Questions and Answers", href: "/mcqs?q=Banking+Interview", icon: Building, color: "#059669", bg: "#ECFDF5" },
    { title: "Technical Interview", sub: "Interview Questions and Answers", href: "/mcqs?q=Technical+Interview", icon: Wrench, color: "#D97706", bg: "#FFFBEB" },
  ];

  return (
    <div className="ev-page-wrapper">
      <PublicNav user={user} />

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
