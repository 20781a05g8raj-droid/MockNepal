import Link from "next/link";
import { GraduationCap, ShieldCheck, CheckCircle2, MapPin, Mail, Phone } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="public-footer" style={{ backgroundColor: "#0B1329", color: "#94A3B8" }}>
      {/* Top Banner inside Footer */}
      <div
        className="container"
        style={{
          paddingBottom: "2rem",
          marginBottom: "2.5rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              backgroundColor: "#0284C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
            }}
          >
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div style={{ color: "#FFFFFF", fontWeight: 800, fontSize: "1.25rem" }}>
              नेपाल <span style={{ color: "#38BDF8" }}>ExamVeda</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
              Nepal's Dedicated Objective MCQ Practice & Mock Test Engine
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            १०,०००+ प्रमाणीकृत वस्तुगत प्रश्नहरू
          </span>
          <span className="flex items-center gap-1.5 text-sky-400">
            <ShieldCheck className="w-4 h-4" />
            २०% नेगेटिभ मार्किङ नियम
          </span>
        </div>
      </div>

      {/* Main 5-Column Category Matrix */}
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2rem",
          marginBottom: "2.5rem",
        }}
      >
        {/* Col 1: Lok Sewa Aayog */}
        <div>
          <h4 style={{ color: "#F8FAFC", marginBottom: "1rem", fontSize: "0.95rem", fontWeight: 700, borderLeft: "3px solid #38BDF8", paddingLeft: "0.5rem" }}>
            लोक सेवा आयोग (PSC)
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.85rem" }}>
            <li><Link href="/mcqs?cat=LOK_SEWA&exam=OFFICER">शाखा अधिकृत (Section Officer)</Link></li>
            <li><Link href="/mcqs?cat=LOK_SEWA&exam=NASU">नायब सुब्बा (Nayab Subba)</Link></li>
            <li><Link href="/mcqs?cat=LOK_SEWA&exam=KHARIDAR">खरिदार (Kharidar)</Link></li>
            <li><Link href="/mcqs?cat=LOK_SEWA&exam=COMPUTER_OPERATOR">कम्प्युटर अपरेटर (Computer Operator)</Link></li>
            <li><Link href="/mcqs?cat=LOK_SEWA&exam=POLICE">नेपाल प्रहरी / APF (ASI/Inspector)</Link></li>
            <li><Link href="/mcqs?cat=LOK_SEWA&exam=HEALTH">स्वास्थ्य सेवा (Staff Nurse / HA)</Link></li>
          </ul>
        </div>

        {/* Col 2: Banking & Financial */}
        <div>
          <h4 style={{ color: "#F8FAFC", marginBottom: "1rem", fontSize: "0.95rem", fontWeight: 700, borderLeft: "3px solid #10B981", paddingLeft: "0.5rem" }}>
            बैंकिङ सेवा (Banking Exams)
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.85rem" }}>
            <li><Link href="/mcqs?cat=BANKING&exam=NRB_ASSISTANT">नेपाल राष्ट्र बैंक (NRB Level 4 & 6)</Link></li>
            <li><Link href="/mcqs?cat=BANKING&exam=RBB">राष्ट्रिय वाणिज्य बैंक (RBB Level 4 & 5)</Link></li>
            <li><Link href="/mcqs?cat=BANKING&exam=NBL">नेपाल बैंक लिमिटेड (NBL)</Link></li>
            <li><Link href="/mcqs?cat=BANKING&exam=ADBL">कृषि विकास बैंक (ADBL)</Link></li>
            <li><Link href="/mcqs?subject=BANKING_LAW">बैंकिङ ऐन नियम (BAFIA, NRB Act)</Link></li>
            <li><Link href="/mcqs?subject=MONETARY_POLICY">मौद्रिक नीति तथा लेखा (Accounts)</Link></li>
          </ul>
        </div>

        {/* Col 3: TSC & Public Sansthan */}
        <div>
          <h4 style={{ color: "#F8FAFC", marginBottom: "1rem", fontSize: "0.95rem", fontWeight: 700, borderLeft: "3px solid #F59E0B", paddingLeft: "0.5rem" }}>
            शिक्षक सेवा तथा संस्थान
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.85rem" }}>
            <li><Link href="/mcqs?cat=TEACHER_SERVICE&level=PRAVI">शिक्षक सेवा प्रा.वि. (Primary)</Link></li>
            <li><Link href="/mcqs?cat=TEACHER_SERVICE&level=NIMAVI">निम्न माध्यमिक तह (NiMaVi)</Link></li>
            <li><Link href="/mcqs?cat=TEACHER_SERVICE&level=MAVI">माध्यमिक तह (MaVi)</Link></li>
            <li><Link href="/mcqs?cat=TEACHER_SERVICE&exam=LICENSE">अध्यापन अनुमति पत्र (Teaching License)</Link></li>
            <li><Link href="/mcqs?cat=SANSTHAN&exam=NTC">नेपाल टेलिकम (NTC Level 4 & 5)</Link></li>
            <li><Link href="/mcqs?cat=SANSTHAN&exam=NEA">नेपाल विद्युत प्राधिकरण (NEA)</Link></li>
          </ul>
        </div>

        {/* Col 4: Licensing & Higher Entrances */}
        <div>
          <h4 style={{ color: "#F8FAFC", marginBottom: "1rem", fontSize: "0.95rem", fontWeight: 700, borderLeft: "3px solid #8B5CF6", paddingLeft: "0.5rem" }}>
            लाइसेन्स तथा प्रवेश परीक्षा
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.85rem" }}>
            <li><Link href="/mcqs?cat=ENGINEERING_LICENSE&exam=NEC_CIVIL">NEC Civil Engineering License</Link></li>
            <li><Link href="/mcqs?cat=ENGINEERING_LICENSE&exam=NEC_COMPUTER">NEC Computer / IT License</Link></li>
            <li><Link href="/mcqs?cat=MEDICAL&exam=MEC_CEE">Medical CEE (MBBS/BDS/B.Sc Nursing)</Link></li>
            <li><Link href="/mcqs?cat=MEDICAL&exam=NMCLE">Nepal Medical Council (NMCLE)</Link></li>
            <li><Link href="/mcqs?cat=ENTRANCE&exam=IOE">TU IOE Entrance (Pulchowk / Thapathali)</Link></li>
            <li><Link href="/mcqs?cat=ENTRANCE&exam=CMAT">CMAT Entrance (BBA/BIM/BHM)</Link></li>
          </ul>
        </div>

        {/* Col 5: General Subjects & Platform */}
        <div>
          <h4 style={{ color: "#F8FAFC", marginBottom: "1rem", fontSize: "0.95rem", fontWeight: 700, borderLeft: "3px solid #EF4444", paddingLeft: "0.5rem" }}>
            सामान्य ज्ञान तथा समसामयिक
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.85rem" }}>
            <li><Link href="/mcqs?subject=NEPAL_GEOGRAPHY">नेपालको भूगोल (Rivers, Peaks, Parks)</Link></li>
            <li><Link href="/mcqs?subject=NEPAL_HISTORY">नेपालको इतिहास तथा संस्कृति</Link></li>
            <li><Link href="/mcqs?subject=CONSTITUTION">नेपालको संविधान २०७२</Link></li>
            <li><Link href="/mcqs?subject=CURRENT_AFFAIRS">नेपाल समसामयिक २०८१/२०८२</Link></li>
            <li><Link href="/exams">सम्पूर्ण पाठ्यक्रम (Syllabus Catalog)</Link></li>
            <li><Link href="/pricing">प्रिमियम मोक टेस्ट पास</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer */}
      <div
        className="container"
        style={{
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          fontSize: "0.82rem",
        }}
      >
        <div>
          © {new Date().getFullYear()} Nepal ExamVeda Portal. Designed specifically for Lok Sewa, Banking, TSC & Licensing aspirants in Nepal.
        </div>
        <div className="flex gap-4">
          <Link href="/pricing#refund-policy" className="hover:text-white transition">Refund Policy</Link>
          <span>•</span>
          <Link href="/about#editorial" className="hover:text-white transition">Academic Accuracy</Link>
          <span>•</span>
          <Link href="/about#privacy" className="hover:text-white transition">Privacy Policy</Link>
          <span>•</span>
          <Link href="/about" className="hover:text-white transition">About Us</Link>
        </div>
      </div>
    </footer>
  );
}

