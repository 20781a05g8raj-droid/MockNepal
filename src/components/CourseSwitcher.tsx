"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, CheckCircle2, Layers, BookOpen, X, Sparkles, ShieldCheck } from "lucide-react";

interface ExamItem {
  id: string;
  title: string;
  code: string;
  category: {
    id: string;
    name: string;
    code: string;
  };
}

interface CourseSwitcherProps {
  currentExamId?: string | null;
  currentExamTitle?: string | null;
  availableExams: ExamItem[];
}

export default function CourseSwitcher({
  currentExamId,
  currentExamTitle,
  availableExams,
}: CourseSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const handleSelectCourse = async (examId: string) => {
    if (examId === currentExamId) {
      setIsOpen(false);
      return;
    }

    setSwitchingId(examId);
    try {
      const res = await fetch("/api/student/set-target-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      }
    } finally {
      setSwitchingId(null);
    }
  };

  // Group by category
  const categoriesMap = new Map<string, { name: string; exams: ExamItem[] }>();
  for (const ex of availableExams) {
    const catName = ex.category?.name || "General Preparation";
    if (!categoriesMap.has(catName)) {
      categoriesMap.set(catName, { name: catName, exams: [] });
    }
    categoriesMap.get(catName)!.exams.push(ex);
  }

  const currentDisplayTitle = currentExamTitle || "Select Target Course";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="course-switcher-btn"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.3rem 0.65rem",
          backgroundColor: "#FFFFFF",
          border: "1.5px solid #CBD5E1",
          borderRadius: "var(--radius-full)",
          cursor: "pointer",
          textAlign: "left",
          maxWidth: "min(320px, calc(100vw - 180px))",
          transition: "all var(--transition-fast)",
        }}
        title="Click to switch your active preparation course"
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "var(--color-primary-subtle)",
            color: "var(--color-primary)",
            fontSize: "0.7rem",
            flexShrink: 0,
          }}
        >
          🎯
        </span>
        <div style={{ overflow: "hidden", minWidth: 0 }}>
          <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", fontWeight: 700 }} className="hide-on-mobile">
            Target Course (तयारी कोर्स)
          </div>
          <div
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "var(--color-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentDisplayTitle}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-0.5" />
      </button>

      {/* Course Switcher Modal */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.75rem",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="card"
            style={{
              backgroundColor: "#FFFFFF",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "88vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              padding: "1.25rem",
            }}
          >
            <div className="flex justify-between items-start pb-3 mb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div>
                <span className="badge badge-primary mb-1">Course Catalog</span>
                <h2 style={{ fontSize: "1.2rem", color: "var(--color-primary)" }}>
                  Select Your Preparation Course
                </h2>
                <p className="text-xs text-muted mt-1">
                  तपाईं कुन परीक्षाको तयारी गर्दै हुनुहुन्छ? कोर्स छान्नुहोस्, सम्पूर्ण प्रश्न र नोटहरू सोही अनुसार फिल्टर हुनेछन्।
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {Array.from(categoriesMap.entries()).map(([catName, { exams }]) => (
                <div key={catName}>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--color-primary)",
                      marginBottom: "0.6rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{catName}</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {exams.map((ex) => {
                      const isSelected = ex.id === currentExamId;
                      const isBusy = switchingId === ex.id;

                      return (
                        <div
                          key={ex.id}
                          onClick={() => !isBusy && handleSelectCourse(ex.id)}
                          style={{
                            padding: "0.75rem 0.9rem",
                            borderRadius: "var(--radius-md)",
                            border: isSelected
                              ? "2px solid var(--color-primary)"
                              : "1px solid var(--color-border)",
                            backgroundColor: isSelected
                              ? "var(--color-primary-subtle)"
                              : "#F8FAFC",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "0.75rem",
                            flexWrap: "wrap",
                            transition: "all var(--transition-fast)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                            <div
                              style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                border: isSelected ? "4px solid var(--color-primary)" : "2px solid #CBD5E1",
                                backgroundColor: isSelected ? "#FFFFFF" : "transparent",
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: "0.95rem",
                                  color: isSelected ? "var(--color-primary)" : "var(--color-text)",
                                }}
                              >
                                {ex.title}
                              </div>
                              <div className="text-xs text-muted mt-0.5">
                                Track Code: {ex.code}
                              </div>
                            </div>
                          </div>

                          <div>
                            {isSelected ? (
                              <span
                                className="badge badge-primary"
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Active Course</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={isBusy}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: "0.75rem", padding: "0.25rem 0.65rem" }}
                              >
                                {isBusy ? "Switching..." : "Switch to this Course"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 mt-6" style={{ borderTop: "1px solid var(--color-border)" }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
