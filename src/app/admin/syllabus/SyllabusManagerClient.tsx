"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  FolderTree,
  ChevronRight,
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
          <span>Add Subject to {activeExam?.title.split(" ")[0]}</span>
        </button>
      </div>

      {/* Exam Track Tabs */}
      <div className="flex gap-2 border-b pb-2 flex-wrap" style={{ borderColor: "var(--color-border)" }}>
        {exams.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setActiveExamId(e.id)}
            className={`btn btn-sm ${activeExamId === e.id ? "btn-primary" : "btn-secondary"}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{e.title}</span>
          </button>
        ))}
      </div>

      {/* Subjects & Topics Tree */}
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
          activeSubjects.map((sub) => (
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
