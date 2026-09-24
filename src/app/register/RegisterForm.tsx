"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface ExamOption {
  id: string;
  title: string;
  categoryName: string;
}

export default function RegisterForm({ exams }: { exams: ExamOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialExamId = searchParams.get("examId") || (exams[0]?.id ?? "");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetExamId, setTargetExamId] = useState(initialExamId);
  const [languagePreference, setLanguagePreference] = useState("BOTH");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          targetExamId,
          languagePreference,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      try {
        localStorage.setItem("mocknepal_logged_in", "true");
      } catch {}

      router.push(data.redirectUrl || "/student/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="name">Full Name</label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input"
          placeholder="e.g. Ramesh Karki"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
          placeholder="e.g. ramesh@example.com"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="password">Password (min. 6 characters)</label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          placeholder="••••••••"
        />
      </div>

      {/* Onboarding Exam Selection (PRD Section 6) */}
      <div className="form-group">
        <label className="form-label" htmlFor="exam">Target Examination</label>
        <select
          id="exam"
          value={targetExamId}
          onChange={(e) => setTargetExamId(e.target.value)}
          className="form-select"
        >
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.title} ({exam.categoryName})
            </option>
          ))}
        </select>
        <span className="form-hint">You can change your target examination at any time in your profile.</span>
      </div>

      <div className="form-group">
        <label className="form-label">Study Language Preference</label>
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2" style={{ cursor: "pointer", fontSize: "0.9rem" }}>
            <input
              type="radio"
              name="lang"
              value="NEPALI"
              checked={languagePreference === "NEPALI"}
              onChange={() => setLanguagePreference("NEPALI")}
            />
            <span>Nepali (नेपाली)</span>
          </label>
          <label className="flex items-center gap-2" style={{ cursor: "pointer", fontSize: "0.9rem" }}>
            <input
              type="radio"
              name="lang"
              value="ENGLISH"
              checked={languagePreference === "ENGLISH"}
              onChange={() => setLanguagePreference("ENGLISH")}
            />
            <span>English</span>
          </label>
          <label className="flex items-center gap-2" style={{ cursor: "pointer", fontSize: "0.9rem" }}>
            <input
              type="radio"
              name="lang"
              value="BOTH"
              checked={languagePreference === "BOTH"}
              onChange={() => setLanguagePreference("BOTH")}
            />
            <span>Both / Bilingual</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-full mt-4"
      >
        {loading ? "Creating Account..." : "Create Account & Start Learning"}
      </button>
    </form>
  );
}
