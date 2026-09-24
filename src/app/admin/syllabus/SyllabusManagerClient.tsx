"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  FolderTree,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  LayoutGrid,
  Search,
  Layers,
  FileText,
  HelpCircle,
  Clock,
  X,
  CheckCircle2,
} from "lucide-react";

interface TopicItem {
  id: string;
  name: string;
  code: string;
  estimatedMinutes: number;
  order: number;
  _count: { questions: number; notes: number };
}

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  order: number;
  topics: TopicItem[];
}

interface ExamSyllabus {
  id: string;
  title: string;
  code: string;
  description: string;
  syllabi: {
    id: string;
    versionCode: string;
    subjects: SubjectItem[];
  }[];
}

export default function SyllabusManagerClient({ exams }: { exams: ExamSyllabus[] }) {
  const router = useRouter();

  const [examsList, setExamsList] = useState<ExamSyllabus[]>(exams);
  const [activeExamId, setActiveExamId] = useState<string>(exams[0]?.id || "");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Exam Track Slider Controls
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [viewMode, setViewMode] = useState<"slider" | "wrap">("slider");

  // Subject Filter & Search Controls
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("ALL");
  const [topicSearch, setTopicSearch] = useState("");
  const subjectSliderRef = useRef<HTMLDivElement>(null);
  const [canScrollSubLeft, setCanScrollSubLeft] = useState(false);
  const [canScrollSubRight, setCanScrollSubRight] = useState(false);

  // Check scroll positions
  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
    if (subjectSliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = subjectSliderRef.current;
      setCanScrollSubLeft(scrollLeft > 5);
      setCanScrollSubRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [examsList, activeExamId, viewMode]);

  // Mouse wheel horizontal scrolling on Exam Slider
  useEffect(() => {
    const el = sliderRef.current;
    if (!el || viewMode !== "slider") return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        checkScroll();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [viewMode, examsList]);

  // Mouse wheel horizontal scrolling on Subject Slider
  useEffect(() => {
    const el = subjectSliderRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        checkScroll();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [activeExamId]);

  const slideExam = (dir: "left" | "right") => {
    if (sliderRef.current) {
      const distance = 350;
      sliderRef.current.scrollBy({
        left: dir === "left" ? -distance : distance,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  const slideSubject = (dir: "left" | "right") => {
    if (subjectSliderRef.current) {
      const distance = 280;
      subjectSliderRef.current.scrollBy({
        left: dir === "left" ? -distance : distance,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  // Modals
  const [subjectModal, setSubjectModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    examId: string;
    subjectId?: string;
    name: string;
    code: string;
  }>({
    isOpen: false,
    isEditing: false,
    examId: "",
    name: "",
    code: "",
  });

  const [topicModal, setTopicModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    subjectId: string;
    topicId?: string;
    name: string;
    code: string;
    estimatedMinutes: number;
  }>({
    isOpen: false,
    isEditing: false,
    subjectId: "",
    name: "",
    code: "",
    estimatedMinutes: 30,
  });

  const activeExam = examsList.find((e) => e.id === activeExamId) || examsList[0];
  const activeSyllabus = activeExam?.syllabi[0];
  const activeSubjects = activeSyllabus?.subjects || [];

  // Save Subject
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      let res: Response;
      if (subjectModal.isEditing) {
        res = await fetch("/api/admin/syllabus", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "UPDATE_SUBJECT",
            id: subjectModal.subjectId,
            name: subjectModal.name,
            code: subjectModal.code,
          }),
        });
      } else {
        res = await fetch("/api/admin/syllabus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ADD_SUBJECT",
            examId: subjectModal.examId,
            name: subjectModal.name,
            code: subjectModal.code,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save subject.");
        setLoading(false);
        return;
      }

      if (subjectModal.isEditing) {
        setExamsList((prev) =>
          prev.map((ex) => {
            if (ex.id !== subjectModal.examId && ex.id !== activeExamId) return ex;
            return {
              ...ex,
              syllabi: ex.syllabi.map((syl) => ({
                ...syl,
                subjects: syl.subjects.map((sub) =>
                  sub.id === subjectModal.subjectId
                    ? { ...sub, name: subjectModal.name, code: subjectModal.code }
                    : sub
                ),
              })),
            };
          })
        );
      } else {
        const newSub: SubjectItem = {
          id: data.subject?.id || `sub_${Date.now()}`,
          name: subjectModal.name,
          code: subjectModal.code || `SUB_${Date.now()}`,
          order: (activeSubjects.length || 0) + 1,
          topics: [],
        };
        setExamsList((prev) =>
          prev.map((ex) => {
            if (ex.id !== subjectModal.examId && ex.id !== activeExamId) return ex;
            const existingSyllabus = ex.syllabi[0] || { id: "syl_1", versionCode: "2081_GENERAL", subjects: [] };
            return {
              ...ex,
              syllabi: [
                {
                  ...existingSyllabus,
                  subjects: [...(existingSyllabus.subjects || []), newSub],
                },
              ],
            };
          })
        );
      }

      setSubjectModal({ isOpen: false, isEditing: false, examId: "", name: "", code: "" });
      setSuccessMsg(subjectModal.isEditing ? "Subject updated successfully!" : "Subject created successfully!");
      router.refresh();
    } catch {
      setErrorMsg("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Subject
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete subject "${name}" and all its topics?`)) return;
    try {
      const res = await fetch(`/api/admin/syllabus?type=SUBJECT&id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setExamsList((prev) =>
          prev.map((ex) => {
            if (ex.id !== activeExamId) return ex;
            return {
              ...ex,
              syllabi: ex.syllabi.map((syl) => ({
                ...syl,
                subjects: syl.subjects.filter((s) => s.id !== id),
              })),
            };
          })
        );
        setSuccessMsg("Subject deleted successfully.");
        router.refresh();
      } else {
        alert("Failed to delete subject.");
      }
    } catch {
      alert("Error deleting subject.");
    }
  };

  // Save Topic
  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      let res: Response;
      if (topicModal.isEditing) {
        res = await fetch("/api/admin/syllabus", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "UPDATE_TOPIC",
            id: topicModal.topicId,
            name: topicModal.name,
            code: topicModal.code,
            estimatedMinutes: topicModal.estimatedMinutes,
          }),
        });
      } else {
        res = await fetch("/api/admin/syllabus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ADD_TOPIC",
            subjectId: topicModal.subjectId,
            name: topicModal.name,
            code: topicModal.code,
            estimatedMinutes: topicModal.estimatedMinutes,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save topic.");
        setLoading(false);
        return;
      }

      if (topicModal.isEditing) {
        setExamsList((prev) =>
          prev.map((ex) => {
            if (ex.id !== activeExamId) return ex;
            return {
              ...ex,
              syllabi: ex.syllabi.map((syl) => ({
                ...syl,
                subjects: syl.subjects.map((sub) => {
                  if (sub.id !== topicModal.subjectId) return sub;
                  return {
                    ...sub,
                    topics: sub.topics.map((top) =>
                      top.id === topicModal.topicId
                        ? {
                            ...top,
                            name: topicModal.name,
                            code: topicModal.code,
                            estimatedMinutes: topicModal.estimatedMinutes,
                          }
                        : top
                    ),
                  };
                }),
              })),
            };
          })
        );
      } else {
        const newTopic: TopicItem = {
          id: data.topic?.id || `top_${Date.now()}`,
          name: topicModal.name,
          code: topicModal.code || `TOP_${Date.now()}`,
          estimatedMinutes: topicModal.estimatedMinutes || 30,
          order: 99,
          _count: { questions: 0, notes: 0 },
        };
        setExamsList((prev) =>
          prev.map((ex) => {
            if (ex.id !== activeExamId) return ex;
            return {
              ...ex,
              syllabi: ex.syllabi.map((syl) => ({
                ...syl,
                subjects: syl.subjects.map((sub) => {
                  if (sub.id !== topicModal.subjectId) return sub;
                  return {
                    ...sub,
                    topics: [...(sub.topics || []), newTopic],
                  };
                }),
              })),
            };
          })
        );
      }

      setTopicModal({ isOpen: false, isEditing: false, subjectId: "", name: "", code: "", estimatedMinutes: 30 });
      setSuccessMsg(topicModal.isEditing ? "Topic updated successfully!" : "Topic created successfully!");
      router.refresh();
    } catch {
      setErrorMsg("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Topic
  const handleDeleteTopic = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete topic "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/syllabus?type=TOPIC&id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setExamsList((prev) =>
          prev.map((ex) => {
            if (ex.id !== activeExamId) return ex;
            return {
              ...ex,
              syllabi: ex.syllabi.map((syl) => ({
                ...syl,
                subjects: syl.subjects.map((sub) => ({
                  ...sub,
                  topics: sub.topics.filter((t) => t.id !== id),
                })),
              })),
            };
          })
        );
        setSuccessMsg("Topic deleted successfully.");
        router.refresh();
      } else {
        alert("Failed to delete topic.");
      }
    } catch {
      alert("Error deleting topic.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Messages */}
      {successMsg && (
        <div className="alert alert-success flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="btn btn-ghost btn-sm"><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-error flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="btn btn-ghost btn-sm"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: "1.5rem" }}>Syllabus & Curriculum Management</h1>
          <p className="text-sm text-muted">
            Directly configure official examination syllabi, subjects, topics, and study durations.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setSubjectModal({
              isOpen: true,
              isEditing: false,
              examId: activeExamId,
              name: "",
              code: "",
            })
          }
          className="btn btn-primary btn-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject to Course</span>
        </button>
      </div>

      {/* ================= 1. EXAMINATION TRACKS SLIDER ================= */}
      <div
        className="card"
        style={{
          padding: "1rem 1.25rem",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {/* Slider Controls Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0F172A" }}>
              Examination Tracks
            </span>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                backgroundColor: "#EFF6FF",
                color: "#1D4ED8",
                padding: "2px 8px",
                borderRadius: "999px",
              }}
            >
              {examsList.length} Tracks
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {/* Jump to exam dropdown */}
            <select
              value={activeExamId}
              onChange={(e) => {
                setActiveExamId(e.target.value);
                setSelectedSubjectFilter("ALL");
                setTopicSearch("");
              }}
              className="form-select"
              style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem", height: "30px", width: "auto" }}
            >
              {examsList.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>

            {/* Slider Navigation Arrows */}
            {viewMode === "slider" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <button
                  type="button"
                  onClick={() => slideExam("left")}
                  disabled={!canScrollLeft}
                  className="btn btn-ghost btn-sm"
                  style={{
                    width: "30px",
                    height: "30px",
                    padding: 0,
                    border: "1px solid #E2E8F0",
                    opacity: canScrollLeft ? 1 : 0.4,
                    cursor: canScrollLeft ? "pointer" : "default",
                  }}
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => slideExam("right")}
                  disabled={!canScrollRight}
                  className="btn btn-ghost btn-sm"
                  style={{
                    width: "30px",
                    height: "30px",
                    padding: 0,
                    border: "1px solid #E2E8F0",
                    opacity: canScrollRight ? 1 : 0.4,
                    cursor: canScrollRight ? "pointer" : "default",
                  }}
                  title="Scroll Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* View Mode Switcher: Slide vs Wrap */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "slider" ? "wrap" : "slider")}
              className="btn btn-ghost btn-sm"
              style={{
                fontSize: "0.76rem",
                padding: "0.25rem 0.6rem",
                height: "30px",
                border: "1px solid #E2E8F0",
              }}
              title={viewMode === "slider" ? "Switch to multi-row view" : "Switch to sliding row"}
            >
              {viewMode === "slider" ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
                  <span>Wrap</span>
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Slide</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* The Track Buttons Slider */}
        <div style={{ position: "relative", minWidth: 0, width: "100%" }}>
          {/* Gradient edge masks when sliding */}
          {viewMode === "slider" && canScrollLeft && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "28px",
                background: "linear-gradient(to right, rgba(255,255,255,0.95), transparent)",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />
          )}
          {viewMode === "slider" && canScrollRight && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: "28px",
                background: "linear-gradient(to left, rgba(255,255,255,0.95), transparent)",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />
          )}

          <div
            ref={sliderRef}
            onScroll={checkScroll}
            style={{
              display: "flex",
              gap: "0.5rem",
              overflowX: viewMode === "slider" ? "auto" : "visible",
              flexWrap: viewMode === "slider" ? "nowrap" : "wrap",
              scrollBehavior: "smooth",
              padding: "4px 2px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              minWidth: 0,
            }}
          >
            {examsList.map((e) => {
              const isActive = activeExamId === e.id;
              const subCount = e.syllabi[0]?.subjects?.length || 0;

              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    setActiveExamId(e.id);
                    setSelectedSubjectFilter("ALL");
                    setTopicSearch("");
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.85rem",
                    borderRadius: "8px",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 150ms ease",
                    backgroundColor: isActive ? "#0B5ED7" : "#F8FAFC",
                    color: isActive ? "#FFFFFF" : "#334155",
                    border: `1.5px solid ${isActive ? "#0B5ED7" : "#CBD5E1"}`,
                    boxShadow: isActive ? "0 2px 6px rgba(11, 94, 215, 0.3)" : "none",
                  }}
                >
                  <BookOpen className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-sky-600"}`} />
                  <span>{e.title}</span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "1px 6px",
                      borderRadius: "999px",
                      backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "#E2E8F0",
                      color: isActive ? "#FFFFFF" : "#64748B",
                    }}
                  >
                    {subCount} Subjects
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= 2. SUBJECTS QUICK SLIDER & SEARCH BAR ================= */}
      {activeSubjects.length > 0 && (
        <div
          className="card"
          style={{
            padding: "0.85rem 1.25rem",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            {/* Subject Pills Slider */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexGrow: 1, minWidth: 0 }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B", whiteSpace: "nowrap" }}>
                Filter Subject:
              </span>

              {/* Slider Left Arrow */}
              <button
                type="button"
                onClick={() => slideSubject("left")}
                disabled={!canScrollSubLeft}
                className="btn btn-ghost btn-sm"
                style={{
                  width: "26px",
                  height: "26px",
                  padding: 0,
                  border: "1px solid #E2E8F0",
                  opacity: canScrollSubLeft ? 1 : 0.4,
                  cursor: canScrollSubLeft ? "pointer" : "default",
                  flexShrink: 0,
                }}
                title="Scroll Left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div
                ref={subjectSliderRef}
                onScroll={checkScroll}
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  overflowX: "auto",
                  scrollBehavior: "smooth",
                  scrollbarWidth: "none",
                  whiteSpace: "nowrap",
                  flexGrow: 1,
                  padding: "2px 0",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedSubjectFilter("ALL")}
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    padding: "0.3rem 0.75rem",
                    borderRadius: "999px",
                    border: `1px solid ${selectedSubjectFilter === "ALL" ? "#0284C7" : "#CBD5E1"}`,
                    backgroundColor: selectedSubjectFilter === "ALL" ? "#0284C7" : "#FFFFFF",
                    color: selectedSubjectFilter === "ALL" ? "#FFFFFF" : "#475569",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  All Subjects ({activeSubjects.length})
                </button>

                {activeSubjects.map((sub) => {
                  const isSel = selectedSubjectFilter === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubjectFilter(sub.id)}
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        padding: "0.3rem 0.75rem",
                        borderRadius: "999px",
                        border: `1px solid ${isSel ? "#0284C7" : "#CBD5E1"}`,
                        backgroundColor: isSel ? "#0284C7" : "#FFFFFF",
                        color: isSel ? "#FFFFFF" : "#475569",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      {sub.name} ({sub.topics.length})
                    </button>
                  );
                })}
              </div>

              {/* Slider Right Arrow */}
              <button
                type="button"
                onClick={() => slideSubject("right")}
                disabled={!canScrollSubRight}
                className="btn btn-ghost btn-sm"
                style={{
                  width: "26px",
                  height: "26px",
                  padding: 0,
                  border: "1px solid #E2E8F0",
                  opacity: canScrollSubRight ? 1 : 0.4,
                  cursor: canScrollSubRight ? "pointer" : "default",
                  flexShrink: 0,
                }}
                title="Scroll Right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Search */}
            <div style={{ position: "relative", minWidth: "220px" }}>
              <input
                type="text"
                placeholder="Search subject or topic..."
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                className="form-input"
                style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem 0.3rem 2rem", height: "32px", width: "100%" }}
              />
              <Search
                className="w-3.5 h-3.5 text-muted"
                style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)" }}
              />
              {topicSearch && (
                <button
                  type="button"
                  onClick={() => setTopicSearch("")}
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94A3B8",
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. SUBJECTS & TOPICS TREE ================= */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {activeSubjects.length === 0 ? (
          <div className="card text-center py-12 text-muted">
            <FolderTree className="w-8 h-8 mx-auto mb-2 text-muted opacity-50" />
            <p>No subjects configured for this examination yet.</p>
            <button
              onClick={() =>
                setSubjectModal({
                  isOpen: true,
                  isEditing: false,
                  examId: activeExamId,
                  name: "",
                  code: "",
                })
              }
              className="btn btn-primary btn-sm mt-3"
            >
              <Plus className="w-4 h-4" /> Add First Subject
            </button>
          </div>
        ) : (
          activeSubjects
            .filter((sub) => {
              if (selectedSubjectFilter !== "ALL" && sub.id !== selectedSubjectFilter) {
                return false;
              }
              if (topicSearch.trim()) {
                const q = topicSearch.toLowerCase().trim();
                const matchSub = sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q);
                const matchTopic = sub.topics.some(
                  (t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)
                );
                if (!matchSub && !matchTopic) return false;
              }
              return true;
            })
            .map((sub) => (
            <div
              key={sub.id}
              className="card"
              style={{
                border: "1.5px solid var(--color-border)",
                backgroundColor: "#FFFFFF",
                padding: "1.25rem",
              }}
            >
              {/* Subject Header Row */}
              <div className="flex justify-between items-center pb-3 mb-3 border-b flex-wrap gap-2" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--color-primary-subtle)",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", margin: 0, color: "var(--color-primary)" }}>
                      {sub.name}
                    </h3>
                    <span className="text-xs text-muted font-mono">Code: {sub.code} • {sub.topics.length} topics</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setTopicModal({
                        isOpen: true,
                        isEditing: false,
                        subjectId: sub.id,
                        name: "",
                        code: "",
                        estimatedMinutes: 30,
                      })
                    }
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.8rem", padding: "0.25rem 0.6rem" }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Topic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSubjectModal({
                        isOpen: true,
                        isEditing: true,
                        examId: activeExamId,
                        subjectId: sub.id,
                        name: sub.name,
                        code: sub.code,
                      })
                    }
                    className="btn btn-ghost btn-sm"
                    title="Edit Subject"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    className="btn btn-ghost btn-sm text-red-600"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Topics Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
                {sub.topics.length === 0 ? (
                  <div className="text-xs text-muted py-2 col-span-full">
                    No topics created yet under this subject. Click "Add Topic" to create one.
                  </div>
                ) : (
                  sub.topics.map((top, topIdx) => (
                    <div
                      key={top.id}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: "var(--radius-md)",
                        padding: "0.75rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                backgroundColor: "#F1F5F9",
                                color: "#475569",
                                padding: "0.1rem 0.4rem",
                                borderRadius: "4px",
                              }}
                            >
                              Unit {topIdx + 1}
                            </span>
                            <span className="text-xs text-muted font-mono">{top.code}</span>
                          </div>
                          <div className="font-semibold text-sm">{top.name}</div>
                        </div>

                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setTopicModal({
                                isOpen: true,
                                isEditing: true,
                                subjectId: sub.id,
                                topicId: top.id,
                                name: top.name,
                                code: top.code,
                                estimatedMinutes: top.estimatedMinutes,
                              })
                            }
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "2px", height: "auto" }}
                            title="Edit Unit"
                          >
                            <Edit className="w-3.5 h-3.5 text-muted" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTopic(top.id, top.name)}
                            className="btn btn-ghost btn-sm text-red-600"
                            style={{ padding: "2px", height: "auto" }}
                            title="Delete Unit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted pt-2 border-t" style={{ borderColor: "#E2E8F0" }}>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {top.estimatedMinutes} mins
                        </span>
                        <div className="flex gap-2">
                          <span title="MCQ Questions" className="font-semibold text-sky-700">{top._count.questions} MCQs</span>
                          <span>•</span>
                          <span title="Study Notes">{top._count.notes} Notes</span>
                        </div>
                      </div>

                      {/* Unit Direct Actions for Admin */}
                      <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: "#F1F5F9" }}>
                        <Link
                          href={`/admin/questions/new?examId=${activeExam.id}&subjectId=${sub.id}&topicId=${top.id}`}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem", height: "auto", flex: 1 }}
                          title="Add a new MCQ directly to this unit"
                        >
                          + Add MCQ
                        </Link>
                        <Link
                          href={`/admin/questions?topicId=${top.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem", height: "auto", flex: 1 }}
                          title="View all questions in this unit"
                        >
                          View MCQs
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* SUBJECT MODAL */}
      {subjectModal.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="card"
            style={{
              backgroundColor: "#FFFFFF",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="flex justify-between items-center pb-2 mb-3 border-b">
              <h3 style={{ fontSize: "1.15rem", margin: 0 }}>
                {subjectModal.isEditing ? "Edit Subject" : "Add Subject to Examination"}
              </h3>
              <button
                type="button"
                onClick={() => setSubjectModal({ ...subjectModal, isOpen: false })}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Subject Name (विषयको नाम)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. General Knowledge, Banking & Audit..."
                  value={subjectModal.name}
                  onChange={(e) => setSubjectModal({ ...subjectModal, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject Code (Optional identifier)</label>
                <input
                  type="text"
                  placeholder="e.g. GK, BANK_LAW, PUBLIC_ADMIN..."
                  value={subjectModal.code}
                  onChange={(e) => setSubjectModal({ ...subjectModal, code: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSubjectModal({ ...subjectModal, isOpen: false })}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? "Saving..." : subjectModal.isEditing ? "Update Subject" : "Create Subject"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOPIC MODAL */}
      {topicModal.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="card"
            style={{
              backgroundColor: "#FFFFFF",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="flex justify-between items-center pb-2 mb-3 border-b">
              <h3 style={{ fontSize: "1.15rem", margin: 0 }}>
                {topicModal.isEditing ? "Edit Topic" : "Add Topic to Subject"}
              </h3>
              <button
                type="button"
                onClick={() => setTopicModal({ ...topicModal, isOpen: false })}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Topic Name (शीर्षक)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fundamental Rights, Geography of Nepal..."
                  value={topicModal.name}
                  onChange={(e) => setTopicModal({ ...topicModal, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Topic Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. NEPAL_GEO, ARTICLE_285..."
                  value={topicModal.code}
                  onChange={(e) => setTopicModal({ ...topicModal, code: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Study Time (Minutes)</label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={topicModal.estimatedMinutes}
                  onChange={(e) => setTopicModal({ ...topicModal, estimatedMinutes: parseInt(e.target.value, 10) || 30 })}
                  className="form-input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setTopicModal({ ...topicModal, isOpen: false })}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? "Saving..." : topicModal.isEditing ? "Update Topic" : "Create Topic"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
