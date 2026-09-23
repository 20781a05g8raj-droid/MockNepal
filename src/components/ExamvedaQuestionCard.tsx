"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
  Award,
  BookOpen,
  Copy,
  Lock,
  Sparkles,
  HelpCircle,
  Scale,
  Share2
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
  accessLevel?: string; // "FREE" | "PREMIUM"
  isLocked?: boolean;
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

  const isLocked = question.isLocked || false;

  const options = [
    { key: "A", label: "A", nepaliLabel: "क", text: question.optionA },
    { key: "B", label: "B", nepaliLabel: "ख", text: question.optionB },
    { key: "C", label: "C", nepaliLabel: "ग", text: question.optionC },
    { key: "D", label: "D", nepaliLabel: "घ", text: question.optionD },
  ];

  const handleSelect = (key: string) => {
    if (isLocked) return;
    setSelectedOption(key);
    // Automatically open explanation after user attempts
    setShowSolution(true);
  };

  const handleCopy = () => {
    if (isLocked) return;
    const textToCopy = `प्रश्न नं. ${questionNumber}: ${question.questionText}\n(A) ${question.optionA}\n(B) ${question.optionB}\n(C) ${question.optionC}\n(D) ${question.optionD}\n\nसही उत्तर: Option ${question.correctOption}\nव्याख्या: ${question.explanation}\nस्रोत: ${question.source || "Mock Nepal"}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const correctNepaliOption =
    question.correctOption === "A"
      ? "क"
      : question.correctOption === "B"
      ? "ख"
      : question.correctOption === "C"
      ? "ग"
      : "घ";

  return (
    <article
      id={`q-${question.id}`}
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "16px",
        padding: "1.75rem",
        marginBottom: "1.75rem",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
        transition: "all 200ms ease",
      }}
    >
      {/* ================= 1. CARD TOP METADATA BAR ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid #F1F5F9",
          marginBottom: "1.25rem",
        }}
      >
        {/* Left: Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          {/* Question Number Pill */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
              color: "#FFFFFF",
              fontSize: "0.82rem",
              fontWeight: 800,
              padding: "0.3rem 0.75rem",
              borderRadius: "999px",
              boxShadow: "0 2px 4px rgba(2, 132, 199, 0.25)",
            }}
          >
            <span>Q. {questionNumber < 10 ? `0${questionNumber}` : questionNumber}</span>
          </span>

          {/* Tier Badge: FREE vs PRO */}
          {question.accessLevel === "PREMIUM" || isLocked ? (
            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                color: "#B45309",
                backgroundColor: "#FEF3C7",
                border: "1px solid #FDE68A",
                padding: "0.2rem 0.6rem",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>PRO EXCLUSIVE</span>
            </span>
          ) : (
            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 700,
                color: "#15803D",
                backgroundColor: "#DCFCE7",
                border: "1px solid #BBF7D0",
                padding: "0.2rem 0.6rem",
                borderRadius: "999px",
              }}
            >
              FREE SAMPLE
            </span>
          )}

          {/* Difficulty Badge */}
          {question.difficulty && (
            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 600,
                padding: "0.2rem 0.6rem",
                borderRadius: "999px",
                backgroundColor:
                  question.difficulty === "BASIC"
                    ? "#F0FDF4"
                    : question.difficulty === "HARD"
                    ? "#FEF2F2"
                    : "#F8FAFC",
                color:
                  question.difficulty === "BASIC"
                    ? "#166534"
                    : question.difficulty === "HARD"
                    ? "#991B1B"
                    : "#475569",
                border: "1px solid #E2E8F0",
              }}
            >
              {question.difficulty === "BASIC"
                ? "🟢 आधारभूत (Basic)"
                : question.difficulty === "HARD"
                ? "🔴 कठिन (Hard)"
                : "🟡 मध्यम (Intermediate)"}
            </span>
          )}

          {/* Exam Year Badge */}
          {question.examYear && (
            <span
              style={{
                fontSize: "0.74rem",
                color: "#7C2D12",
                backgroundColor: "#FFEDD5",
                border: "1px solid #FED7AA",
                padding: "0.2rem 0.55rem",
                borderRadius: "999px",
                fontWeight: 700,
              }}
            >
              वि.सं. {question.examYear}
            </span>
          )}
        </div>

        {/* Right: Quick Tools (Bookmark, Copy) */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          {!isLocked && (
            <>
              <button
                type="button"
                onClick={() => setIsBookmarked(!isBookmarked)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isBookmarked ? "#FEF3C7" : "#F8FAFC",
                  border: isBookmarked ? "1px solid #FDE68A" : "1px solid #E2E8F0",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
                title={isBookmarked ? "बुकमार्क हटाइयो" : "यो प्रश्न बुकमार्क गर्नुहोस्"}
              >
                <Bookmark
                  className="w-4 h-4"
                  style={{
                    fill: isBookmarked ? "#D97706" : "none",
                    color: isBookmarked ? "#D97706" : "#64748B",
                  }}
                />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                style={{
                  height: "34px",
                  padding: "0 0.65rem",
                  borderRadius: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  backgroundColor: copied ? "#ECFDF5" : "#F8FAFC",
                  border: copied ? "1px solid #A7F3D0" : "1px solid #E2E8F0",
                  color: copied ? "#059669" : "#64748B",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
                title="प्रश्न प्रतिलिपि (Copy) गर्नुहोस्"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ================= 2. QUESTION STATEMENT ================= */}
      <div
        style={{
          fontSize: "1.18rem",
          fontWeight: 600,
          lineHeight: 1.65,
          color: "#0F172A",
          marginBottom: "1.5rem",
          letterSpacing: "-0.01em",
        }}
      >
        {question.questionText}
      </div>

      {/* ================= 3. OPTIONS OR LOCKED CARD ================= */}
      {isLocked ? (
        /* PRO UPGRADE CARD */
        <div
          style={{
            margin: "1.25rem 0",
            padding: "2rem 1.5rem",
            background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
            border: "1.5px dashed #F59E0B",
            borderRadius: "14px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.08)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#FEF3C7",
              border: "2px solid #FDE68A",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "0.75rem",
              boxShadow: "0 2px 8px rgba(217, 119, 6, 0.2)",
            }}
          >
            <Lock className="w-5 h-5 text-amber-700" />
          </div>

          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: 800,
              color: "#92400E",
              marginBottom: "0.4rem",
            }}
          >
            यो प्रश्न Mock Nepal PRO मा मात्र उपलब्ध छ
          </h3>

          <p
            style={{
              fontSize: "0.9rem",
              color: "#78350F",
              maxWidth: "540px",
              margin: "0 auto 1.25rem",
              lineHeight: 1.6,
            }}
          >
            यस प्रश्नका ४ वटै वस्तुगत विकल्पहरू (Options), सही उत्तर र विस्तृत आधिकारिक कानुनी तथा प्राविधिक व्याख्या हेर्न Mock Nepal PRO पासमा अपग्रेड गर्नुहोस्।
          </p>

          <Link
            href="/pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#0284C7",
              color: "#FFFFFF",
              padding: "0.65rem 1.5rem",
              borderRadius: "8px",
              fontWeight: 800,
              fontSize: "0.92rem",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
              transition: "transform 150ms ease",
            }}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Mock Nepal PRO अनलक गर्नुहोस् (रु. ४९९ मात्र)</span>
          </Link>
        </div>
      ) : (
        /* INTERACTIVE OPTIONS GRID */
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {options.map((opt) => {
            const isSelected = selectedOption === opt.key;
            const isCorrect = question.correctOption === opt.key;

            let bgColor = "#FFFFFF";
            let borderColor = "#E2E8F0";
            let textColor = "#1E293B";
            let letterBg = "#F1F5F9";
            let letterColor = "#475569";

            if (selectedOption !== null) {
              if (isCorrect) {
                // Correct Option State
                bgColor = "#F0FDF4";
                borderColor = "#10B981";
                textColor = "#065F46";
                letterBg = "#10B981";
                letterColor = "#FFFFFF";
              } else if (isSelected && !isCorrect) {
                // Wrong Selected State
                bgColor = "#FEF2F2";
                borderColor = "#EF4444";
                textColor = "#991B1B";
                letterBg = "#EF4444";
                letterColor = "#FFFFFF";
              }
            }

            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleSelect(opt.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.9rem",
                  padding: "0.95rem 1.25rem",
                  borderRadius: "12px",
                  border: `1.5px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  color: textColor,
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                  transition: "all 150ms ease",
                  boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {/* Letter Icon Circle */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: letterBg,
                    color: letterColor,
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    flexShrink: 0,
                    transition: "all 150ms ease",
                  }}
                >
                  {opt.label}
                </div>

                {/* Option Content Text */}
                <div style={{ flex: 1, fontSize: "0.98rem", fontWeight: 500, lineHeight: 1.5 }}>
                  {opt.text}
                </div>

                {/* Status Indicator Icon */}
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
      )}

      {/* ================= 4. CARD ACTION TOOLBAR ================= */}
      {!isLocked && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
            paddingTop: "1rem",
            borderTop: "1px solid #F1F5F9",
          }}
        >
          {/* Solution Toggle Button */}
          <button
            type="button"
            onClick={() => setShowSolution(!showSolution)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.55rem 1.15rem",
              fontSize: "0.88rem",
              fontWeight: 700,
              borderRadius: "8px",
              backgroundColor: showSolution ? "#0F172A" : "#0284C7",
              color: "#FFFFFF",
              border: "none",
              cursor: "pointer",
              transition: "all 150ms ease",
              boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)",
            }}
          >
            {showSolution ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>व्याख्या बन्द गर्नुहोस् (Hide Solution)</span>
              </>
            ) : (
              <>
                <HelpCircle className="w-4 h-4" />
                <span>उत्तर तथा विस्तृत व्याख्या हेर्नुहोस् (View Solution)</span>
              </>
            )}
          </button>

          {/* Source Tag */}
          {question.source && (
            <div
              style={{
                fontSize: "0.8rem",
                color: "#64748B",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                backgroundColor: "#F8FAFC",
                padding: "0.3rem 0.65rem",
                borderRadius: "6px",
                border: "1px solid #E2E8F0",
              }}
            >
              <Award className="w-3.5 h-3.5 text-sky-600" />
              <span>स्रोत: {question.source}</span>
            </div>
          )}
        </div>
      )}

      {/* ================= 5. EXPANDABLE SOLUTION DRAWER ================= */}
      {!isLocked && showSolution && (
        <div
          style={{
            marginTop: "1.25rem",
            padding: "1.5rem",
            borderRadius: "12px",
            backgroundColor: "#F8FAFC",
            border: "1.5px solid #E2E8F0",
            borderLeft: "5px solid #10B981",
            animation: "fadeIn 200ms ease-in-out",
          }}
        >
          {/* Correct Option Banner */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#DCFCE7",
              border: "1px solid #86EFAC",
              color: "#166534",
              fontWeight: 800,
              fontSize: "0.95rem",
              padding: "0.45rem 1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              सही उत्तर: Option {question.correctOption} ({correctNepaliOption})
            </span>
          </div>

          {/* Explanation Text */}
          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: 800,
                color: "#0F172A",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "0.4rem",
              }}
            >
              विस्तृत व्याख्या (Detailed Explanation):
            </div>
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.7,
                color: "#334155",
                whiteSpace: "pre-line",
                margin: 0,
              }}
            >
              {question.explanation}
            </p>
          </div>

          {/* Official Reference / Legal Basis Callout */}
          {question.source && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#FFFFFF",
                border: "1px solid #CBD5E1",
                padding: "0.6rem 0.9rem",
                borderRadius: "8px",
                fontSize: "0.82rem",
                color: "#475569",
              }}
            >
              <Scale className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>
                <strong>आधिकारिक कानुनी / प्राविधिक आधार:</strong> {question.source}
              </span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
