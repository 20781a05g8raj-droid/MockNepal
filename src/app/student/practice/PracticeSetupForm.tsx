"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, Sparkles, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";

interface ExamData {
  id: string;
  title: string;
  subjects: {
    id: string;
    name: string;
    code: string;
    topics: { id: string; name: string; code: string }[];
  }[];
}

export default function PracticeSetupForm({
  exams,
  defaultExamId,
  defaultSubjectId,
  defaultTopicId,
  isPremium,
}: {
  exams: ExamData[];
  defaultExamId?: string;
  defaultSubjectId?: string;
  defaultTopicId?: string;
  isPremium: boolean;
}) {
  const router = useRouter();

  const [selectedExamId, setSelectedExamId] = useState(defaultExamId || exams[0]?.id || "");
  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  const [selectedSubjectId, setSelectedSubjectId] = useState(
    defaultSubjectId || currentExam?.subjects[0]?.id || ""
  );
  const currentSubject = currentExam?.subjects.find((s) => s.id === selectedSubjectId) || currentExam?.subjects[0];

  const [selectedTopicId, setSelectedTopicId] = useState(defaultTopicId || "ALL");
  const [difficulty, setDifficulty] = useState("ALL");
  const [questionCount, setQuestionCount] = useState("10");

  const [eligibleCount, setEligibleCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  // Update subject list when exam changes
  useEffect(() => {
    if (currentExam && (!currentSubject || !currentExam.subjects.some((s) => s.id === selectedSubjectId))) {
      setSelectedSubjectId(currentExam.subjects[0]?.id || "");
      setSelectedTopicId("ALL");
    }
  }, [selectedExamId, currentExam, currentSubject, selectedSubjectId]);

  // Query eligible questions count in real-time
  useEffect(() => {
    if (!selectedExamId || !selectedSubjectId) return;

    let isMounted = true;
    setLoadingCount(true);

    const queryUrl = `/api/student/practice/count?examId=${selectedExamId}&subjectId=${selectedSubjectId}&topicId=${selectedTopicId}&difficulty=${difficulty}`;

    fetch(queryUrl)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setEligibleCount(typeof data.count === "number" ? data.count : 0);
          setLoadingCount(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingCount(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedExamId, selectedSubjectId, selectedTopicId, difficulty]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibleCount || eligibleCount === 0) {
      setError("No questions available for the chosen criteria.");
      return;
    }

    setError("");
    setStarting(true);

    try {
      const res = await fetch("/api/student/practice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExamId,
          subjectId: selectedSubjectId,
          topicId: selectedTopicId,
          difficultyFilter: difficulty,
          questionCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to launch session");
        setStarting(false);
        return;
      }

      router.push(`/student/practice/${data.sessionId}`);
    } catch {
      setError("An unexpected network error occurred");
      setStarting(false);
    }
  };

  return (
    <form onSubmit={handleStart} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Section 1: Target Examination (Soft Blue) */}
      <div
        style={{
          backgroundColor: "#F0F7FF",
          border: "1.5px solid #BFDBFE",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            style={{
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
            }}
          >
            चरण १
          </span>
          <label className="form-label mb-0" htmlFor="examSelect" style={{ color: "#1E40AF", fontWeight: 700, fontSize: "0.95rem" }}>
            1. Target Examination Track (लक्ष्य परीक्षा)
          </label>
        </div>
        <select
          id="examSelect"
          className="form-select"
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          style={{ backgroundColor: "#FFFFFF", borderColor: "#BFDBFE" }}
        >
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {/* Section 2: Subject & Topic (Soft Teal) */}
      <div
        style={{
          backgroundColor: "#F0FDFA",
          border: "1.5px solid #99F6E4",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            style={{
              backgroundColor: "#0D9488",
              color: "#FFFFFF",
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
            }}
          >
            चरण २
          </span>
          <span style={{ color: "#115E59", fontWeight: 700, fontSize: "0.95rem" }}>
            2. Curriculum Subject & Topic (विषय र शीर्षक)
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div>
            <label className="form-label" htmlFor="subjectSelect" style={{ fontSize: "0.825rem", color: "#134E4A" }}>
              Subject (विषय)
            </label>
            <select
              id="subjectSelect"
              className="form-select"
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopicId("ALL");
              }}
              style={{ backgroundColor: "#FFFFFF", borderColor: "#99F6E4" }}
            >
              {currentExam?.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.topics.length} topics)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="topicSelect" style={{ fontSize: "0.825rem", color: "#134E4A" }}>
              Specific Topic (शीर्षक - ऐच्छिक)
            </label>
            <select
              id="topicSelect"
              className="form-select"
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              style={{ backgroundColor: "#FFFFFF", borderColor: "#99F6E4" }}
            >
              <option value="ALL">All Topics in {currentSubject?.name || "Subject"}</option>
              {currentSubject?.topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Difficulty Tier (Soft Amber) */}
      <div
        style={{
          backgroundColor: "#FFFBEB",
          border: "1.5px solid #FDE68A",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            style={{
              backgroundColor: "#D97706",
              color: "#FFFFFF",
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
            }}
          >
            चरण ३
          </span>
          <label className="form-label mb-0" style={{ color: "#92400E", fontWeight: 700, fontSize: "0.95rem" }}>
            3. Difficulty Tier (कठिनाइ स्तर)
          </label>
        </div>
        <div className="flex flex-wrap gap-2.5 mt-2">
          {[
            { value: "ALL", label: "Mixed / All Levels", nepali: "सबै स्तर" },
            { value: "BASIC", label: "Basic (Direct Recall)", nepali: "सामान्य" },
            { value: "INTERMEDIATE", label: "Intermediate (Reasoning)", nepali: "मध्यम" },
            { value: "HARD", label: "Hard (Exam Application)", nepali: "उच्च" },
          ].map((d) => {
            const isSelected = difficulty === d.value;
            return (
              <label
                key={d.value}
                className="flex items-center gap-2"
                style={{
                  cursor: "pointer",
                  padding: "0.5rem 0.85rem",
                  borderRadius: "var(--radius-md)",
                  border: isSelected ? "2px solid #D97706" : "1px solid #FDE68A",
                  backgroundColor: isSelected ? "#FEF3C7" : "#FFFFFF",
                  fontSize: "0.85rem",
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? "#92400E" : "#78350F",
                  transition: "all 0.15s ease",
                }}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={d.value}
                  checked={isSelected}
                  onChange={() => setDifficulty(d.value)}
                />
                <span>{d.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Section 4: Question Count (Soft Violet) */}
      <div
        style={{
          backgroundColor: "#FAF5FF",
          border: "1.5px solid #E9D5FF",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            style={{
              backgroundColor: "#7C3AED",
              color: "#FFFFFF",
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
            }}
          >
            चरण ४
          </span>
          <label className="form-label mb-0" style={{ color: "#6B21A8", fontWeight: 700, fontSize: "0.95rem" }}>
            4. Number of Questions (प्रश्न सङ्ख्या)
          </label>
        </div>
        <div className="flex gap-2.5 mt-2 flex-wrap">
          {["5", "10", "15", "20"].map((c) => {
            const isSelected = questionCount === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setQuestionCount(c)}
                style={{
                  flex: "1 1 120px",
                  minHeight: "42px",
                  borderRadius: "var(--radius-md)",
                  border: isSelected ? "2px solid #7C3AED" : "1px solid #E9D5FF",
                  backgroundColor: isSelected ? "#7C3AED" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "#6B21A8",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {c} Questions
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 5: Real-Time Pool Summary (Soft Emerald) */}
      <div
        style={{
          backgroundColor: "#F0FDF4",
          padding: "1.1rem 1.25rem",
          borderRadius: "var(--radius-lg)",
          border: "1.5px solid #BBF7D0",
        }}
      >
        <div className="flex justify-between items-center mb-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span
              style={{
                backgroundColor: "#16A34A",
                color: "#FFFFFF",
                fontSize: "0.7rem",
                fontWeight: 700,
                padding: "0.2rem 0.5rem",
                borderRadius: "4px",
              }}
            >
              उपलब्धता
            </span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#166534" }}>Available Question Pool:</span>
          </div>
          {loadingCount ? (
            <span className="text-xs text-muted">Checking database...</span>
          ) : (
            <span
              style={{
                backgroundColor: eligibleCount && eligibleCount > 0 ? "#DCFCE7" : "#FEE2E2",
                color: eligibleCount && eligibleCount > 0 ? "#15803D" : "#B91C1C",
                border: eligibleCount && eligibleCount > 0 ? "1px solid #86EFAC" : "1px solid #FCA5A5",
                fontSize: "0.85rem",
                fontWeight: 700,
                padding: "0.25rem 0.65rem",
                borderRadius: "var(--radius-full)",
              }}
            >
              {eligibleCount ?? 0} Eligible Questions
            </span>
          )}
        </div>

        <p style={{ fontSize: "0.8rem", color: "#15803D", marginTop: "0.25rem" }}>
          {isPremium ? (
            "You have full access to all verified questions without daily allowances."
          ) : (
            "Showing verified question pool. Practice engine draws unseen questions first with exact -20% Lok Sewa penalty model."
          )}
        </p>
      </div>

      {/* Launch Action */}
      <button
        type="submit"
        disabled={starting || loadingCount || eligibleCount === 0}
        className="btn btn-primary btn-full btn-lg"
        style={{
          background: "linear-gradient(135deg, #1D4ED8, #2563EB)",
          border: "none",
          padding: "0.85rem 1.5rem",
          fontWeight: 700,
          boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <Play className="w-5 h-5 fill-white" />
        <span>{starting ? "Initializing Practice Session..." : "Launch Practice Session (अभ्यास सुरु गर्नुहोस्)"}</span>
      </button>
    </form>
  );
}
