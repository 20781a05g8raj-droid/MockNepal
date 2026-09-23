import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { ShieldCheck, BookOpen, CheckCircle2, Award, FileText } from "lucide-react";

export default async function AboutPage() {
  const user = await getSessionUser();

  return (
    <div className="public-layout">
      <PublicNav user={user} />

      <main style={{ padding: "4rem 1.5rem", backgroundColor: "var(--color-bg)", flexGrow: 1 }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="text-center mb-8">
            <span className="badge badge-primary mb-2">Academic Transparency</span>
            <h1>Our Editorial & Preparation Standard</h1>
            <p style={{ maxWidth: "600px", margin: "0.5rem auto 0", fontSize: "1.05rem" }}>
              How content is authored, checked against official Nepal legislation, and deterministically scored without generative AI dependencies.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="card" id="editorial">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 style={{ fontSize: "1.25rem" }}>Zero Runtime Generative AI Policy</h2>
              </div>
              <p style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "var(--color-text-subheading)" }}>
                Government competitive examinations require absolute legal and factual accuracy. Generative AI models are prone to hallucinating constitution articles, misquoting acts, and inventing answers. Therefore, all MCQs, answer options, and explanations on this platform are authored and reviewed by human curriculum editors. Selection algorithms, mock test scoring, and spaced repetition schedules operate on 100% deterministic rules.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 style={{ fontSize: "1.25rem" }}>Authoritative Sources & Citations</h2>
              </div>
              <p style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "var(--color-text-subheading)", marginBottom: "1rem" }}>
                Questions and notes explicitly cite verified public-sector sources:
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>The Constitution of Nepal (2072):</strong> Fundamental rights, state directives, and commissions.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Civil Service Act 2049 & Regulations 2050:</strong> Leaves, ethics, retirement, and administration.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Nepal Law Commission & Rajpatra (Gazette):</strong> Official statutory amendments.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Central Bureau of Statistics & Survey Department:</strong> Verified demographic and geographical data.</span>
                </li>
              </ul>
            </div>

            <div className="card" id="privacy">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-primary" />
                <h2 style={{ fontSize: "1.25rem" }}>Student Data Integrity & Privacy</h2>
              </div>
              <p style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "var(--color-text-subheading)" }}>
                Student attempt history, mistake notebooks, and syllabus completion states belong to the student. Progress records are retained permanently across free and premium transitions. No attempt records are erased when a paid pass expires.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
