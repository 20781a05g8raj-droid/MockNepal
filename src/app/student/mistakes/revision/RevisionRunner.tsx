"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

interface RevisionItemPayload {
  questionId: string;
  stage: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  subjectName: string;
  topicName: string;
}

export default function RevisionRunner({ items }: { items: RevisionItemPayload[] }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    correctOption: string;
    explanation: string;
    newStage?: number;
    nextRevisionDueNepalDate?: string;
    isMastered?: boolean;
  } | null>(null);

  const currentItem = items[currentIndex];

  if (!currentItem) {
    return (
      <div className="card text-center" style={{ padding: "3rem" }}>
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h2>Scheduled Revision Complete!</h2>
        <p className="text-muted mt-2 mb-4">
          All currently due mistake questions have been revised.
        </p>
        <Link href="/student/mistakes" className="btn btn-primary">
          Return to Mistake Notebook
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedOption || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/student/mistakes/submit-revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentItem.questionId,
          selectedOption,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setResult(null);
    } else {
      router.push("/student/mistakes");
    }
  };

  const isSubmitted = !!result;
  const isLast = currentIndex === items.length - 1;

  const options = [
    { letter: "A", text: currentItem.optionA },
    { letter: "B", text: currentItem.optionB },
    { letter: "C", text: currentItem.optionC },
    { letter: "D", text: currentItem.optionD },
  ];

  return (
    <div className="container-reading" style={{ marginTop: "1rem", marginBottom: "3rem" }}>
      {/* Top Header */}
      <div className="flex justify-between items-center mb-4">
        <Link href="/student/mistakes" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Revision</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="badge badge-intermediate">
            Revision Item {currentIndex + 1} of {items.length}
          </span>
          <span className="badge badge-muted">
            Current Stage: {currentItem.stage}
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="card" style={{ border: "1.5px solid var(--color-border)" }}>
        <div className="flex justify-between items-center pb-3 mb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <span className="badge badge-primary">{currentItem.subjectName}</span>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            {currentItem.topicName}
          </span>
        </div>

        <h2 style={{ fontSize: "1.25rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
          {currentItem.questionText}
        </h2>

        {/* Options */}
        <div role="radiogroup" aria-label="Revision options">
          {options.map((opt) => {
            let stateClass = "";
            if (isSubmitted) {
              if (opt.letter === result.correctOption) {
                stateClass = "correct";
              } else if (opt.letter === selectedOption) {
                stateClass = "incorrect";
              }
            } else if (selectedOption === opt.letter) {
              stateClass = "selected";
            }

            return (
              <button
                key={opt.letter}
                type="button"
                onClick={() => !isSubmitted && setSelectedOption(opt.letter)}
                disabled={isSubmitted}
                className={`option-row ${stateClass}`}
                role="radio"
                aria-checked={selectedOption === opt.letter}
              >
                <span className="option-letter">{opt.letter}</span>
                <span style={{ flexGrow: 1 }}>{opt.text}</span>
                {isSubmitted && opt.letter === result.correctOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
                {isSubmitted && opt.letter === selectedOption && selectedOption !== result.correctOption && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center mt-6 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
          <div style={{ fontSize: "0.85rem" }}>
            {isSubmitted ? (
              result.isCorrect ? (
                <span style={{ color: "var(--color-success)", fontWeight: 700 }}>
                  ✓ Correct! {result.isMastered ? "Promoted to Mastered!" : `Advanced to Stage ${result.newStage} (Next due: ${result.nextRevisionDueNepalDate})`}
                </span>
              ) : (
                <span style={{ color: "var(--color-error)", fontWeight: 700 }}>
                  ✗ Incorrect. Reset back to Stage 1 (Due tomorrow).
                </span>
              )
            ) : (
              <span className="text-muted">Choose your answer and click Submit</span>
            )}
          </div>

          {!isSubmitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedOption || submitting}
              className="btn btn-primary"
            >
              {submitting ? "Checking..." : "Submit Revision"}
            </button>
          ) : (
            <button type="button" onClick={handleNext} className="btn btn-accent">
              <span>{isLast ? "Complete Scheduled Revision" : "Next Item"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Post-submission explanation */}
        {isSubmitted && (
          <div className="alert alert-info mt-6" style={{ display: "block" }}>
            <div style={{ fontWeight: 700, marginBottom: "0.25rem", color: "var(--color-primary)" }}>
              Verified Explanation:
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-subheading)", lineHeight: "1.6" }}>
              {result.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
