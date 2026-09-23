"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bookmark,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  Check,
} from "lucide-react";

interface QuestionPayload {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  difficulty: string;
  subjectName: string;
  topicName: string;
  questionType: string;
  examYear?: number | null;
  source?: string | null;
  isBookmarked: boolean;
  previousAnswer?: {
    selectedOption: string;
    isCorrect: boolean;
    correctOption: string;
    explanation: string;
  } | null;
}

export default function PracticeRunner({
  sessionId,
  sessionInfo,
  questions,
  initialIndex = 0,
}: {
  sessionId: string;
  sessionInfo: {
    examTitle: string;
    subjectName: string;
    topicName?: string | null;
    totalQuestions: number;
    completedAnswersCount: number;
  };
  questions: QuestionPayload[];
  initialIndex?: number;
}) {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [selectedOption, setSelectedOption] = useState<string | null>(
    questions[initialIndex]?.previousAnswer?.selectedOption || null
  );
  const [submittedData, setSubmittedData] = useState<{
    isCorrect: boolean;
    correctOption: string;
    explanation: string;
    source?: string | null;
  } | null>(
    questions[initialIndex]?.previousAnswer
      ? {
          isCorrect: questions[initialIndex].previousAnswer!.isCorrect,
          correctOption: questions[initialIndex].previousAnswer!.correctOption,
          explanation: questions[initialIndex].previousAnswer!.explanation,
        }
      : null
  );

  const [bookmarked, setBookmarked] = useState(questions[initialIndex]?.isBookmarked || false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Report issue modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("INCORRECT_ANSWER");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  const q = questions[currentIndex];

  useEffect(() => {
    setStartTime(Date.now());
    if (q?.previousAnswer) {
      setSelectedOption(q.previousAnswer.selectedOption);
      setSubmittedData({
        isCorrect: q.previousAnswer.isCorrect,
        correctOption: q.previousAnswer.correctOption,
        explanation: q.previousAnswer.explanation,
      });
    } else {
      setSelectedOption(null);
      setSubmittedData(null);
    }
    setBookmarked(q?.isBookmarked || false);
  }, [currentIndex, q]);

  if (!q) {
    return (
      <div className="card text-center" style={{ padding: "3rem" }}>
        <h2>Practice Session Completed!</h2>
        <p className="text-muted mt-2 mb-4">You have reviewed all questions in this session.</p>
        <Link href={`/student/practice/${sessionId}/results`} className="btn btn-primary">
          View Detailed Results & Performance Breakdown
        </Link>
      </div>
    );
  }

  const handleSelectOption = (letter: string) => {
    if (!submittedData) {
      setSelectedOption(letter);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || submitting) return;

    setSubmitting(true);
    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    try {
      const res = await fetch("/api/student/practice/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: q.id,
          selectedOption,
          timeSpentSeconds: timeSpent,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmittedData({
          isCorrect: data.isCorrect,
          correctOption: data.correctOption,
          explanation: data.explanation,
          source: data.source,
        });

        // Store into question cache
        q.previousAnswer = {
          selectedOption,
          isCorrect: data.isCorrect,
          correctOption: data.correctOption,
          explanation: data.explanation,
        };
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      router.push(`/student/practice/${sessionId}/results`);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await fetch("/api/student/practice/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id }),
      });
      const data = await res.json();
      setBookmarked(data.bookmarked);
    } catch {}
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/student/practice/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: q.id,
          reason: reportReason,
          details: reportDetails,
        }),
      });
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
          setReportDetails("");
        }, 1500);
      }
    } catch {}
  };

  const isSubmitted = !!submittedData;
  const isLast = currentIndex === questions.length - 1;

  const options = [
    { letter: "A", text: q.optionA },
    { letter: "B", text: q.optionB },
    { letter: "C", text: q.optionC },
    { letter: "D", text: q.optionD },
  ];

  return (
    <div className="container-reading" style={{ marginTop: "1rem", marginBottom: "3rem" }}>
      {/* Runner Top Bar */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <Link href="/student/dashboard" className="btn btn-ghost btn-sm" style={{ padding: "0.25rem 0.5rem" }}>
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <span className="badge badge-primary">
            Q {currentIndex + 1} of {questions.length}
          </span>
          <span className="badge badge-muted hide-on-mobile">
            {Math.round(((currentIndex + (isSubmitted ? 1 : 0)) / questions.length) * 100)}% Complete
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`btn btn-sm ${bookmarked ? "btn-primary" : "btn-secondary"}`}
            title={bookmarked ? "Bookmarked (Click to remove)" : "Bookmark question"}
            style={{ padding: "0.2rem 0.55rem", fontSize: "0.8rem" }}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-white" : ""}`} />
            <span>{bookmarked ? "Saved" : "Save"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="btn btn-ghost btn-sm"
            title="Report question error"
            style={{ padding: "0.2rem 0.45rem" }}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-muted" />
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="card" style={{ border: "1.5px solid var(--color-border)", boxShadow: "var(--shadow-sm)", padding: "1.25rem" }}>
        {/* Context metadata */}
        <div className="flex justify-between items-center pb-3 mb-4 flex-wrap gap-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`badge ${
                q.difficulty === "BASIC"
                  ? "badge-basic"
                  : q.difficulty === "HARD"
                  ? "badge-hard"
                  : "badge-intermediate"
              }`}
            >
              {q.difficulty}
            </span>
            {q.questionType === "PREVIOUS_YEAR" && (
              <span className="badge badge-muted">Past Exam {q.examYear ? `(${q.examYear})` : ""}</span>
            )}
            {q.questionType === "CURRENT_AFFAIRS" && (
              <span className="badge badge-accent">Current Affairs</span>
            )}
          </div>

          <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", wordBreak: "break-word" }}>
            {q.subjectName} &gt; {q.topicName}
          </span>
        </div>

        {/* Question Text */}
        <h2 style={{ fontSize: "1.15rem", lineHeight: "1.55", color: "var(--color-text)", marginBottom: "1.5rem", wordBreak: "break-word" }}>
          {q.questionText}
        </h2>

        {/* Option Rows */}
        <div role="radiogroup" aria-label="Question options" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {options.map((opt) => {
            let stateClass = "";
            let statusIcon = null;

            if (isSubmitted) {
              if (opt.letter === submittedData.correctOption) {
                stateClass = "correct";
                statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
              } else if (opt.letter === selectedOption) {
                stateClass = "incorrect";
                statusIcon = <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
              }
            } else if (selectedOption === opt.letter) {
              stateClass = "selected";
            }

            return (
              <button
                key={opt.letter}
                type="button"
                onClick={() => handleSelectOption(opt.letter)}
                disabled={isSubmitted}
                className={`option-row ${stateClass}`}
                aria-checked={selectedOption === opt.letter}
                role="radio"
                style={{ textAlign: "left", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", width: "100%" }}
              >
                <span className="option-letter">{opt.letter}</span>
                <span style={{ flexGrow: 1, wordBreak: "break-word" }}>{opt.text}</span>
                {statusIcon}
              </button>
            );
          })}
        </div>

        {/* Actions Bottom Bar */}
        <div className="flex justify-between items-center mt-6 pt-4 flex-wrap gap-2" style={{ borderTop: "1px solid var(--color-border)" }}>
          <div style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
            {isSubmitted ? (
              submittedData.isCorrect ? (
                <span style={{ color: "var(--color-success)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <CheckCircle2 className="w-4 h-4" /> Correct Answer
                </span>
              ) : (
                <span style={{ color: "var(--color-error)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <XCircle className="w-4 h-4" /> Incorrect. Scheduled in Mistake Notebook.
                </span>
              )
            ) : (
              <span>Select your answer and press Submit</span>
            )}
          </div>

          {!isSubmitted ? (
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={!selectedOption || submitting}
              className="btn btn-primary btn-sm"
              style={{ padding: "0.35rem 0.85rem" }}
            >
              {submitting ? "Checking..." : "Submit Answer"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-accent btn-sm"
              style={{ padding: "0.35rem 0.85rem" }}
            >
              <span>{isLast ? "Complete Session" : "Next Question"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Explanation Card Revealed Post-Submission */}
        {isSubmitted && (
          <div className="alert alert-info mt-6" style={{ display: "block" }}>
            <div className="flex justify-between items-center mb-2">
              <span style={{ fontWeight: 700, color: "var(--color-primary)", fontSize: "0.95rem" }}>
                Official Verified Explanation
              </span>
              {submittedData.source && (
                <span className="text-xs text-muted">Source: {submittedData.source}</span>
              )}
            </div>
            <p style={{ fontSize: "0.925rem", color: "var(--color-text-subheading)", lineHeight: "1.6" }}>
              {submittedData.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Content Error Report Modal */}
      {showReportModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <div className="card" style={{ maxWidth: "480px", width: "100%", backgroundColor: "#FFFFFF" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Report Question Issue</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              Our editorial review team verifies reported issues against official legislation and exam keys.
            </p>

            {reportSuccess ? (
              <div className="alert alert-success">
                <Check className="w-4 h-4" />
                <span>Thank you. Your report has been submitted for editorial review.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <div className="form-group">
                  <label className="form-label">Report Category</label>
                  <select
                    className="form-select"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  >
                    <option value="INCORRECT_ANSWER">Incorrect Answer Key</option>
                    <option value="UNCLEAR_WORDING">Unclear or Ambiguous Wording</option>
                    <option value="OUTDATED">Outdated Information or Data</option>
                    <option value="DUPLICATE">Duplicate Question</option>
                    <option value="TYPO">Typo or Formatting Problem</option>
                    <option value="OTHER">Other Issue</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Details / Citation Reference</label>
                  <textarea
                    required
                    className="form-textarea"
                    rows={3}
                    placeholder="Provide details or reference the relevant Constitution article, Act section, or gazette..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
