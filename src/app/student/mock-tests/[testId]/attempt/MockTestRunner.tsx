"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Flag,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

interface TestQuestionPayload {
  id: string;
  order: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  selectedOption: string | null;
  isMarkedForReview: boolean;
}

export default function MockTestRunner({
  attemptId,
  testId,
  testTitle,
  serverDeadlineMs,
  totalQuestions,
  questions,
}: {
  attemptId: string;
  testId: string;
  testTitle: string;
  serverDeadlineMs: number;
  totalQuestions: number;
  questions: TestQuestionPayload[];
}) {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionsState, setQuestionsState] = useState<TestQuestionPayload[]>(questions);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(
    Math.max(0, Math.floor((serverDeadlineMs - Date.now()) / 1000))
  );

  const [saveStatus, setSaveStatus] = useState<"SAVED" | "SAVING" | "ERROR">("SAVED");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  const currentQ = questionsState[currentIndex];

  // Synchronized countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((serverDeadlineMs - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        // Automatically submit test on timer expiry
        handleSubmitTest(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [serverDeadlineMs]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = async (letter: string | null) => {
    const nextVal = currentQ.selectedOption === letter ? null : letter;

    const updated = [...questionsState];
    updated[currentIndex] = {
      ...currentQ,
      selectedOption: nextVal,
    };
    setQuestionsState(updated);
    setSaveStatus("SAVING");

    try {
      const res = await fetch("/api/student/mock-tests/save-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          questionId: currentQ.id,
          selectedOption: nextVal,
          isMarkedForReview: currentQ.isMarkedForReview,
        }),
      });

      const data = await res.json();
      if (data.isExpired) {
        handleSubmitTest(true);
      } else if (res.ok) {
        setSaveStatus("SAVED");
      } else {
        setSaveStatus("ERROR");
      }
    } catch {
      setSaveStatus("ERROR");
    }
  };

  const handleToggleReview = async () => {
    const nextMarked = !currentQ.isMarkedForReview;
    const updated = [...questionsState];
    updated[currentIndex] = {
      ...currentQ,
      isMarkedForReview: nextMarked,
    };
    setQuestionsState(updated);

    try {
      await fetch("/api/student/mock-tests/save-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          questionId: currentQ.id,
          selectedOption: currentQ.selectedOption,
          isMarkedForReview: nextMarked,
        }),
      });
    } catch {}
  };

  const handleSubmitTest = async (autoSubmit: boolean = false) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/student/mock-tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });

      if (res.ok) {
        router.push(`/student/mock-tests/${testId}/results/${attemptId}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Counts for overview
  const answeredCount = questionsState.filter((q) => q.selectedOption !== null).length;
  const markedReviewCount = questionsState.filter((q) => q.isMarkedForReview).length;
  const unansweredCount = questionsState.length - answeredCount;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      {/* Test Shell Top Bar */}
      <header
        style={{
          minHeight: "56px",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.4rem 1rem",
          position: "sticky",
          top: 0,
          zIndex: 30,
          gap: "0.5rem",
        }}
      >
        <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
          <button
            type="button"
            onClick={() => setMobilePaletteOpen(true)}
            className="btn btn-ghost btn-sm mobile-palette-btn"
            title="Question navigator"
            style={{ padding: "0.3rem 0.55rem" }}
          >
            <Menu className="w-4 h-4" />
            <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>Q{currentIndex + 1}</span>
          </button>
          <div style={{ minWidth: 0 }}>
            <div className="text-xs text-muted hide-on-mobile">Active Mock Examination</div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.88rem",
                color: "var(--color-primary)",
                maxWidth: "min(280px, 45vw)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {testTitle}
            </div>
          </div>
        </div>

        {/* Save Status & Timer */}
        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
          <div style={{ fontSize: "0.75rem" }} className="hide-on-mobile">
            {saveStatus === "SAVED" && <span style={{ color: "var(--color-success)" }}>● Autosaved</span>}
            {saveStatus === "SAVING" && <span style={{ color: "var(--color-warning)" }}>Saving...</span>}
            {saveStatus === "ERROR" && <span style={{ color: "var(--color-error)" }}>Save warning!</span>}
          </div>

          <div
            className="flex items-center gap-1.5"
            style={{
              backgroundColor: timeLeftSeconds < 300 ? "#FEE2E2" : "#EFF6FF",
              color: timeLeftSeconds < 300 ? "#B91C1C" : "var(--color-primary)",
              border: `1.5px solid ${timeLeftSeconds < 300 ? "#FECACA" : "#BFDBFE"}`,
              padding: "0.25rem 0.55rem",
              borderRadius: "var(--radius-full)",
              fontWeight: 800,
              fontSize: "0.9rem",
              fontFamily: "var(--font-mono)",
            }}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="btn btn-primary btn-sm"
            style={{ padding: "0.25rem 0.65rem", fontSize: "0.82rem" }}
          >
            Submit
          </button>
        </div>
      </header>

      {/* Main Split Layout: Question Area + Question Navigator Palette */}
      <div style={{ display: "flex", flexGrow: 1, width: "100%", maxWidth: "100%", minWidth: 0 }}>
        {/* Left / Main Question Area */}
        <main style={{ flexGrow: 1, padding: "1rem 0.75rem", maxWidth: "900px", margin: "0 auto", width: "100%", minWidth: 0 }}>
          <div className="card" style={{ border: "1.5px solid var(--color-border)", boxShadow: "var(--shadow-sm)", padding: "1.25rem" }}>
            {/* Top Question Controls */}
            <div className="flex justify-between items-center pb-3 mb-4 flex-wrap gap-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-2">
                <span className="badge badge-primary">
                  Q {currentIndex + 1} of {questionsState.length}
                </span>
                {currentQ.isMarkedForReview && (
                  <span className="badge badge-intermediate">Flagged for Review</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleReview}
                  className={`btn btn-sm ${currentQ.isMarkedForReview ? "btn-accent" : "btn-secondary"}`}
                  style={{ fontSize: "0.78rem", padding: "0.2rem 0.55rem" }}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{currentQ.isMarkedForReview ? "Unflag" : "Mark Review"}</span>
                </button>

                {currentQ.selectedOption && (
                  <button
                    type="button"
                    onClick={() => handleSelectOption(null)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: "0.78rem", color: "var(--color-error)", padding: "0.2rem 0.4rem" }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Question Text */}
            <h2 style={{ fontSize: "1.15rem", lineHeight: "1.55", color: "var(--color-text)", marginBottom: "1.5rem", wordBreak: "break-word" }}>
              {currentQ.questionText}
            </h2>

            {/* Options (Radio selection) */}
            <div role="radiogroup" aria-label="Mock examination options" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { letter: "A", text: currentQ.optionA },
                { letter: "B", text: currentQ.optionB },
                { letter: "C", text: currentQ.optionC },
                { letter: "D", text: currentQ.optionD },
              ].map((opt) => (
                <button
                  key={opt.letter}
                  type="button"
                  onClick={() => handleSelectOption(opt.letter)}
                  className={`option-row ${currentQ.selectedOption === opt.letter ? "selected" : ""}`}
                  aria-checked={currentQ.selectedOption === opt.letter}
                  role="radio"
                  style={{ textAlign: "left", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", width: "100%" }}
                >
                  <span className="option-letter">{opt.letter}</span>
                  <span style={{ flexGrow: 1, wordBreak: "break-word" }}>{opt.text}</span>
                  {currentQ.selectedOption === opt.letter && (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Navigation footer */}
            <div className="flex justify-between items-center mt-6 pt-4 flex-wrap gap-2" style={{ borderTop: "1px solid var(--color-border)" }}>
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="btn btn-secondary btn-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <span className="text-xs text-muted hide-on-mobile">
                Autosaved selection is recorded on the server
              </span>

              {currentIndex < questionsState.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="btn btn-primary btn-sm"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="btn btn-accent btn-sm"
                >
                  <span>Review & Submit</span>
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Right / Desktop Question Palette */}
        <aside
          style={{
            width: "300px",
            backgroundColor: "#FFFFFF",
            borderLeft: "1px solid var(--color-border)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
          className="desktop-palette"
        >
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Question Navigator</h3>

          {/* Palette Legend */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.75rem", marginBottom: "1.25rem", color: "var(--color-text-muted)" }}>
            <div className="flex items-center gap-1.5">
              <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: "var(--color-primary)" }} />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: "var(--color-warning)" }} />
              <span>Review ({markedReviewCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: "#E2E8F0" }} />
              <span>Unanswered ({unansweredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ width: 12, height: 12, borderRadius: 3, border: "2px solid var(--color-primary)", backgroundColor: "transparent" }} />
              <span>Current</span>
            </div>
          </div>

          {/* Question grid palette */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", overflowY: "auto", maxHeight: "400px", paddingRight: "4px" }}>
            {questionsState.map((q, idx) => {
              let bg = "#F1F5F9";
              let text = "var(--color-text)";

              if (q.selectedOption) {
                bg = "var(--color-primary)";
                text = "#FFFFFF";
              } else if (q.isMarkedForReview) {
                bg = "var(--color-warning)";
                text = "#FFFFFF";
              }

              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    height: "36px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: bg,
                    color: text,
                    border: isCurrent ? "2.5px solid var(--color-accent)" : "1px solid var(--color-border)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title={`Question ${idx + 1}: ${q.selectedOption ? "Answered (" + q.selectedOption + ")" : "Unanswered"}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="btn btn-primary btn-full"
            >
              Submit Final Test
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile Question Palette Drawer */}
      {mobilePaletteOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "flex-end",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              width: "85%",
              maxWidth: "340px",
              height: "100%",
              backgroundColor: "#FFFFFF",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              boxShadow: "-4px 0 20px rgba(0,0,0,0.2)",
            }}
          >
            <div className="flex justify-between items-center pb-3 mb-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Question Navigator</h3>
              <button
                type="button"
                onClick={() => setMobilePaletteOpen(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Palette Legend */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.75rem", marginBottom: "1rem", color: "var(--color-text-muted)" }}>
              <div className="flex items-center gap-1.5">
                <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: "var(--color-primary)" }} />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: "var(--color-warning)" }} />
                <span>Review ({markedReviewCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: "#E2E8F0" }} />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ width: 10, height: 10, borderRadius: 3, border: "2px solid var(--color-primary)", backgroundColor: "transparent" }} />
                <span>Current</span>
              </div>
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", overflowY: "auto", maxHeight: "55vh", paddingRight: "4px" }}>
              {questionsState.map((q, idx) => {
                let bg = "#F1F5F9";
                let text = "var(--color-text)";

                if (q.selectedOption) {
                  bg = "var(--color-primary)";
                  text = "#FFFFFF";
                } else if (q.isMarkedForReview) {
                  bg = "var(--color-warning)";
                  text = "#FFFFFF";
                }

                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setMobilePaletteOpen(false);
                    }}
                    style={{
                      height: "36px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: bg,
                      color: text,
                      border: isCurrent ? "2.5px solid var(--color-accent)" : "1px solid var(--color-border)",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: "auto", paddingTop: "1.25rem" }}>
              <button
                type="button"
                onClick={() => {
                  setMobilePaletteOpen(false);
                  setShowSubmitModal(true);
                }}
                className="btn btn-primary btn-full"
              >
                Submit Examination
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <div className="card" style={{ maxWidth: "480px", width: "100%", backgroundColor: "#FFFFFF" }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Submit Mock Examination?</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
              Please review your attempt summary before confirming submission. Once submitted, your answers cannot be altered.
            </p>

            <div style={{ backgroundColor: "#F8FAFC", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              <div className="flex justify-between py-1" style={{ borderBottom: "1px dashed var(--color-border)" }}>
                <span>Answered Questions:</span>
                <strong style={{ color: "var(--color-primary)" }}>{answeredCount}</strong>
              </div>
              <div className="flex justify-between py-1" style={{ borderBottom: "1px dashed var(--color-border)" }}>
                <span>Marked for Review:</span>
                <strong style={{ color: "var(--color-warning)" }}>{markedReviewCount}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Unanswered Questions:</span>
                <strong style={{ color: "var(--color-error)" }}>{unansweredCount}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="btn btn-secondary"
              >
                Return to Test
              </button>
              <button
                type="button"
                onClick={() => handleSubmitTest(false)}
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? "Grading & Submitting..." : "Yes, Confirm Submission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
