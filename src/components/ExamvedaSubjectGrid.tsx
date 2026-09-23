"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  Play,
  FileText,
  Layers,
  Sparkles
} from "lucide-react";

export interface SubjectUnit {
  id: string;
  name: string;
  code: string;
  estimatedMinutes: number;
  questionsCount: number;
}

export interface ExamvedaSubject {
  id: string;
  name: string;
  code: string;
  color: string;
  examId?: string;
  examTitle?: string;
  units: SubjectUnit[];
}

export interface SubjectSection {
  title: string;
  subtitle?: string;
  subjects: ExamvedaSubject[];
}

interface ExamvedaSubjectGridProps {
  sections: SubjectSection[];
}

export default function ExamvedaSubjectGrid({ sections }: ExamvedaSubjectGridProps) {
  const [selectedSubject, setSelectedSubject] = useState<ExamvedaSubject | null>(null);

  const handleOpenSubject = (subject: ExamvedaSubject) => {
    setSelectedSubject(subject);
  };

  const handleClose = () => {
    setSelectedSubject(null);
  };

  return (
    <div>
      {sections.map((section, sIdx) => {
        if (!section.subjects || section.subjects.length === 0) return null;

        return (
          <div key={sIdx} style={{ marginBottom: "2.5rem" }}>
            {/* Examveda-style Section Heading with Teal Underline */}
            <div className="examveda-section-heading">
              <span>{section.title}</span>
              {section.subtitle && (
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#64748B",
                  }}
                >
                  {section.subtitle}
                </span>
              )}
            </div>

            {/* 2-Column Banner Grid matching Reference Images 2 & 3 */}
            <div className="examveda-banner-grid">
              {section.subjects.map((subj) => (
                <div
                  key={subj.id}
                  className="examveda-subject-card"
                  style={{ backgroundColor: subj.color }}
                  onClick={() => handleOpenSubject(subj)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleOpenSubject(subj);
                    }
                  }}
                  title={`Click to view all units and MCQs for ${subj.name}`}
                >
                  <span className="examveda-subject-title">{subj.name}</span>

                  {/* 3D Folded White Paper Badge with (MCQ) Stamp */}
                  <div className="examveda-paper-badge">
                    <div
                      className="examveda-stamp-circle"
                      style={{ color: subj.color }}
                    >
                      (MCQ)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* ================= SUBJECT UNITS / TOPICS MODAL ================= */}
      {selectedSubject && (
        <div
          className="examveda-unit-drawer-overlay"
          onClick={handleClose}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="examveda-unit-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="examveda-unit-drawer-header"
              style={{ backgroundColor: selectedSubject.color }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    opacity: 0.9,
                  }}
                >
                  {selectedSubject.examTitle || "Curriculum Track"} • Subject Units
                </span>
                <h3
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    marginTop: "0.2rem",
                  }}
                >
                  {selectedSubject.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: "999px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  cursor: "pointer",
                }}
                aria-label="Close units modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Unit List */}
            <div className="examveda-unit-drawer-body">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                  fontSize: "0.88rem",
                  color: "#64748B",
                }}
              >
                <span>
                  Total Units / Topics: <strong>{selectedSubject.units.length}</strong>
                </span>
                <span>
                  Total MCQs:{" "}
                  <strong>
                    {selectedSubject.units.reduce(
                      (acc, u) => acc + u.questionsCount,
                      0
                    )}
                  </strong>
                </span>
              </div>

              {selectedSubject.units.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2.5rem 1rem",
                    color: "#64748B",
                  }}
                >
                  <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p>यस विषयमा हाल कुनै एकाइ थपिएको छैन।</p>
                </div>
              ) : (
                selectedSubject.units.map((unit, uIdx) => (
                  <div key={unit.id} className="examveda-unit-card">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "0.1rem 0.45rem",
                            borderRadius: "4px",
                            backgroundColor: "#F1F5F9",
                            color: "#475569",
                          }}
                        >
                          Unit {uIdx + 1}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted">
                          <Clock className="w-3 h-3" />
                          {unit.estimatedMinutes} mins
                        </span>
                      </div>

                      <h4
                        style={{
                          fontSize: "0.98rem",
                          fontWeight: 700,
                          color: "#0F172A",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {unit.name}
                      </h4>

                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: unit.questionsCount > 0 ? "#0284C7" : "#94A3B8",
                        }}
                      >
                        {unit.questionsCount} Verified MCQs
                      </span>
                    </div>

                    {/* Direct Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <Link
                        href={`/student/practice?subjectId=${selectedSubject.id}&topicId=${unit.id}${
                          selectedSubject.examId ? `&examId=${selectedSubject.examId}` : ""
                        }`}
                        className="btn btn-primary btn-sm"
                        style={{
                          backgroundColor: selectedSubject.color,
                          borderColor: selectedSubject.color,
                          fontSize: "0.8rem",
                          padding: "0.35rem 0.75rem",
                        }}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Practice Test</span>
                      </Link>

                      <Link
                        href={`/mcqs?topic=${unit.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontSize: "0.8rem",
                          padding: "0.35rem 0.75rem",
                        }}
                        title="View with instant answer toggle"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">View MCQs</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
