"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
  Award,
  BookOpen,
  Copy
} from "lucide-react";

export interface ExamvedaQuestionData {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string; // "A" | "B" | "C" | "D"
  explanation: string;
  subjectName?: string;
  topicName?: string;
  difficulty?: string;
  examYear?: number | null;
  source?: string | null;
}

interface ExamvedaQuestionCardProps {
  questionNumber: number;
  question: ExamvedaQuestionData;
  showCategoryBadge?: boolean;
}

export default function ExamvedaQuestionCard({
  questionNumber,
  question,
  showCategoryBadge = true,
}: ExamvedaQuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const options = [
    { key: "A", label: "A", text: question.optionA },
    { key: "B", label: "B", text: question.optionB },
    { key: "C", label: "C", text: question.optionC },
    { key: "D", label: "D", text: question.optionD },
  ];

  const handleSelect = (key: string) => {
    setSelectedOption(key);
  };

  const handleCopy = () => {
    const textToCopy = `${questionNumber}. ${question.questionText}\n(A) ${question.optionA}\n(B) ${question.optionB}\n(C) ${question.optionC}\n(D) ${question.optionD}\n\nCorrect Answer: ${question.correctOption}\nExplanation: ${question.explanation}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="examveda-qcard" id={`q-${question.id}`}>
      {/* Header Info Bar */}
      <div className="examveda-qcard-header">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="examveda-qnum">
            <BookOpen className="w-4 h-4" />
            Question {questionNumber}
          </span>

          {question.subjectName && (
            <span className="badge badge-primary" style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem" }}>
              {question.subjectName}
            </span>
          )}

          {question.topicName && (
            <span className="badge badge-muted" style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem" }}>
              {question.topicName}
            </span>
          )}

          {question.examYear && (
            <span
              style={{
                fontSize: "0.75rem",
                color: "#9A3412",
                backgroundColor: "#FFEDD5",
                padding: "0.15rem 0.5rem",
                borderRadius: "4px",
                fontWeight: 600,
              }}
            >
              BS {question.examYear}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="btn btn-ghost btn-sm"
            style={{ padding: "0.25rem 0.5rem", height: "auto" }}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
          >
            <Bookmark
              className="w-4 h-4"
              style={{
                fill: isBookmarked ? "#0284C7" : "none",
                color: isBookmarked ? "#0284C7" : "#64748B",
              }}
            />
          </button>

          <button
            onClick={handleCopy}
            className="btn btn-ghost btn-sm"
            style={{ padding: "0.25rem 0.5rem", height: "auto" }}
            title="Copy question"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="examveda-qtext">{question.questionText}</div>

      {/* 4 Interactive Option Rows */}
      <div className="examveda-options-grid">
        {options.map((opt) => {
          let btnClass = "examveda-option-btn";
          const isSelected = selectedOption === opt.key;
          const isCorrect = question.correctOption === opt.key;

          if (selectedOption !== null) {
            if (isCorrect) {
              btnClass += " opt-correct";
            } else if (isSelected && !isCorrect) {
              btnClass += " opt-wrong";
            }
          }

          return (
            <button
              key={opt.key}
              type="button"
              className={btnClass}
              onClick={() => handleSelect(opt.key)}
            >
              <span className="examveda-opt-letter">{opt.label}</span>
              <span style={{ flex: 1 }}>{opt.text}</span>

              {selectedOption !== null && isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
              {selectedOption !== null && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Action Bar */}
      <div className="examveda-card-toolbar">
        <button
          type="button"
          onClick={() => setShowSolution(!showSolution)}
          className={`examveda-btn-view-ans ${showSolution ? "active" : ""}`}
        >
          {showSolution ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Hide Answer</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>View Answer</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-3 text-xs text-muted">
          {question.difficulty && (
            <span>
              Level: <strong>{question.difficulty}</strong>
            </span>
          )}
          {question.source && (
            <span className="hidden sm:inline">
              Source: <em>{question.source}</em>
            </span>
          )}
        </div>
      </div>

      {/* Expandable Solution / Explanation Box */}
      {showSolution && (
        <div className="examveda-solution-box">
          <div className="examveda-sol-badge">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Correct Answer: Option {question.correctOption} (
              {question.correctOption === "A"
                ? "क"
                : question.correctOption === "B"
                ? "ख"
                : question.correctOption === "C"
                ? "ग"
                : "घ"}
              )
            </span>
          </div>

          <div className="examveda-sol-text">
            <strong>Detailed Explanation (विस्तृत व्याख्या):</strong>
            <p style={{ marginTop: "0.4rem", whiteSpace: "pre-line" }}>
              {question.explanation}
            </p>
          </div>

          {question.source && (
            <div className="examveda-sol-source">
              <Award className="w-3.5 h-3.5" />
              <span>Official Reference: {question.source}</span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
