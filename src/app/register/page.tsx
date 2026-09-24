import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { BookOpen } from "lucide-react";
import RegisterForm from "./RegisterForm";

import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) {
    if (user.role === "ADMIN" || user.role === "CONTENT_EDITOR" || user.role === "OWNER") {
      redirect("/admin/dashboard");
    }
    redirect("/student/dashboard");
  }
  const exams = await db.exam.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { order: "asc" },
  });

  const formattedExams = exams.map((e) => ({
    id: e.id,
    title: e.title,
    categoryName: e.category.name.split(" ")[0],
  }));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ height: "64px", backgroundColor: "#FFFFFF", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem" }}>
        <Link href="/" className="public-logo">
          <BookOpen className="w-6 h-6 text-primary" />
          <span>नेपाल परीक्षा</span>
        </Link>
        <Link href="/login" className="btn btn-secondary btn-sm">
          Already have an account? Sign In
        </Link>
      </header>

      {/* Main Form Container */}
      <main style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2.5rem 1rem" }}>
        <div style={{ width: "100%", maxWidth: "480px" }}>
          <div className="card" style={{ border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }}>
            <div className="text-center mb-6">
              <span className="badge badge-primary mb-2">Student Onboarding</span>
              <h1 style={{ fontSize: "1.5rem" }}>Join Nepal Exam Preparation</h1>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                Select your target examination to receive customized syllabus recommendations and daily missions.
              </p>
            </div>

            <Suspense fallback={<div className="text-center py-6 text-sm text-muted">Loading form...</div>}>
              <RegisterForm exams={formattedExams} />
            </Suspense>

            <div className="text-center mt-4" style={{ fontSize: "0.85rem" }}>
              <span className="text-muted">Already registered? </span>
              <Link href="/login" style={{ fontWeight: 600 }}>
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
