"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ListChecks,
  Search,
  BookOpen,
  Award,
  Layers,
} from "lucide-react";

interface FormattedMockTest {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  marksPerCorrect: number;
  negativePenaltyPercent: number;
  accessLevel: string;
  status: string;
  attemptLimit: number;
  examId: string;
  examTitle: string;
  questionCount: number;
  attemptCount: number;
}

interface AdminMockTestsClientProps {
  initialTests: FormattedMockTest[];
  exams: { id: string; title: string }[];
}

export default function AdminMockTestsClient({
  initialTests,
  exams,
}: AdminMockTestsClientProps) {
  const router = useRouter();

  const [tests, setTests] = useState<FormattedMockTest[]>(initialTests);
  const [search, setSearch] = useState("");
  const [selectedExamFilter, setSelectedExamFilter] = useState("ALL");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Create / Edit Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<FormattedMockTest | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [examId, setExamId] = useState(exams[0]?.id || "");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [totalQuestions, setTotalQuestions] = useState(50);
  const [marksPerCorrect, setMarksPerCorrect] = useState(2.0);
  const [negativePenaltyPercent, setNegativePenaltyPercent] = useState(20.0);
  const [attemptLimit, setAttemptLimit] = useState(3);
  const [accessLevel, setAccessLevel] = useState("FREE");
  const [status, setStatus] = useState("PUBLISHED");
  const [autoPopulate, setAutoPopulate] = useState(true);

  // Question Management Modal State
  const [questionModal, setQuestionModal] = useState<{
    isOpen: boolean;
    test: FormattedMockTest | null;
    assigned: any[];
    available: any[];
    loading: boolean;
  }>({
    isOpen: false,
    test: null,
    assigned: [],
    available: [],
    loading: false,
  });

  const filteredTests = tests.filter((t) => {
    if (selectedExamFilter !== "ALL" && t.examId !== selectedExamFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const resetForm = () => {
    setTitle("");
    setExamId(exams[0]?.id || "");
    setDescription("");
    setDurationMinutes(45);
    setTotalQuestions(50);
    setMarksPerCorrect(2.0);
    setNegativePenaltyPercent(20.0);
    setAttemptLimit(3);
    setAccessLevel("FREE");
    setStatus("PUBLISHED");
    setAutoPopulate(true);
    setEditingTest(null);
    setErrorMsg("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsTestModalOpen(true);
  };

  const handleOpenEdit = (t: FormattedMockTest) => {
    setEditingTest(t);
    setTitle(t.title);
    setExamId(t.examId);
    setDescription(t.description);
    setDurationMinutes(t.durationMinutes);
    setTotalQuestions(t.totalQuestions);
    setMarksPerCorrect(t.marksPerCorrect);
    setNegativePenaltyPercent(t.negativePenaltyPercent);
    setAttemptLimit(t.attemptLimit);
    setAccessLevel(t.accessLevel);
    setStatus(t.status);
    setAutoPopulate(false);
    setErrorMsg("");
    setIsTestModalOpen(true);
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const payload: any = {
        title,
        examId,
        description,
        durationMinutes,
        totalQuestions,
        marksPerCorrect,
        negativePenaltyPercent,
        attemptLimit,
        accessLevel,
        status,
        autoPopulate,
      };

      let res: Response;
      if (editingTest) {
        payload.id = editingTest.id;
        res = await fetch("/api/admin/mock-tests", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/mock-tests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save mock test.");
        setLoading(false);
        return;
      }

      setIsTestModalOpen(false);
      resetForm();
      setSuccessMsg(editingTest ? "Mock test updated successfully!" : "Mock test created successfully!");
      router.refresh();
    } catch {
      setErrorMsg("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (id: string, testTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete mock test "${testTitle}"?`)) return;
    try {
      const res = await fetch(`/api/admin/mock-tests?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTests((prev) => prev.filter((t) => t.id !== id));
        setSuccessMsg("Mock test deleted successfully.");
        router.refresh();
      } else {
        alert("Failed to delete mock test.");
      }
    } catch {
      alert("Error deleting mock test.");
    }
  };

  const handleToggleStatus = async (test: FormattedMockTest) => {
    const newStatus = test.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch("/api/admin/mock-tests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: test.id, status: newStatus }),
      });
      if (res.ok) {
        setTests((prev) =>
          prev.map((t) => (t.id === test.id ? { ...t, status: newStatus } : t))
        );
        router.refresh();
      }
    } catch {
      alert("Failed to toggle status.");
    }
  };

  // Open Questions Manager Modal
  const handleOpenQuestionsManager = async (test: FormattedMockTest) => {
    setQuestionModal({
      isOpen: true,
      test,
      assigned: [],
      available: [],
      loading: true,
    });

    try {
      const res = await fetch(`/api/admin/mock-tests/questions?testId=${test.id}`);
      const data = await res.json();
      if (res.ok) {
        setQuestionModal({
          isOpen: true,
          test,
          assigned: data.assigned || [],
          available: data.available || [],
          loading: false,
        });
      }
    } catch {
      setQuestionModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleAddQuestionToTest = async (questionId: string) => {
    if (!questionModal.test) return;
    try {
      const res = await fetch("/api/admin/mock-tests/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: questionModal.test.id, questionIds: [questionId] }),
      });
      if (res.ok) {
        handleOpenQuestionsManager(questionModal.test);
        router.refresh();
      }
    } catch {
      alert("Failed to add question.");
    }
  };

  const handleRemoveQuestionFromTest = async (questionId: string) => {
    if (!questionModal.test) return;
    try {
      const res = await fetch(
        `/api/admin/mock-tests/questions?testId=${questionModal.test.id}&questionId=${questionId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        handleOpenQuestionsManager(questionModal.test);
        router.refresh();
      }
    } catch {
      alert("Failed to remove question.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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

      {/* Top Action Bar */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: "1.5rem" }}>Mock Test Builder & Scheduling</h1>
          <p className="text-sm text-muted">
            Configure examination papers, duration, official Lok Sewa negative marking, and question assignments.
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            <span>Create New Mock Test</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="card card-compact" style={{ backgroundColor: "#FFFFFF" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr", gap: "1rem", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search mock tests by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "2.25rem" }}
            />
            <Search className="w-4 h-4 text-muted" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
          </div>

          <select
            className="form-select"
            value={selectedExamFilter}
            onChange={(e) => setSelectedExamFilter(e.target.value)}
          >
            <option value="ALL">All Examination Tracks</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mock Tests Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "30%" }}>Test Title</th>
              <th>Exam Track</th>
              <th>Duration</th>
              <th>Questions</th>
              <th>Scoring & Penalty</th>
              <th>Access</th>
              <th>Status</th>
              <th>Student Attempts</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-muted">
                  No mock tests found. Click "Create New Mock Test" to build one.
                </td>
              </tr>
            ) : (
              filteredTests.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--color-primary)", marginBottom: 2 }}>
                      {t.title}
                    </div>
                    <div className="text-xs text-muted">
                      Limit: {t.attemptLimit} attempt{t.attemptLimit > 1 ? "s" : ""} per student
                    </div>
                  </td>
                  <td className="text-sm font-semibold">{t.examTitle}</td>
                  <td>
                    <span className="flex items-center gap-1 text-xs">
                      <Clock className="w-3.5 h-3.5 text-muted" /> {t.durationMinutes} mins
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-basic font-mono font-bold">
                      {t.questionCount} / {t.totalQuestions} Qs
                    </span>
                  </td>
                  <td className="text-xs">
                    <span className="font-semibold text-emerald-700">+{t.marksPerCorrect}</span> /{" "}
                    <span className="font-semibold text-rose-600">
                      -{((t.marksPerCorrect * t.negativePenaltyPercent) / 100).toFixed(2)} ({t.negativePenaltyPercent}%)
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${t.accessLevel === "PREMIUM" ? "badge-accent" : "badge-muted"}`}>
                      {t.accessLevel}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(t)}
                      className={`badge cursor-pointer ${t.status === "PUBLISHED" ? "badge-success" : "badge-intermediate"}`}
                      title="Click to toggle status"
                    >
                      {t.status}
                    </button>
                  </td>
                  <td>
                    <strong className="text-xs">{t.attemptCount} attempts</strong>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenQuestionsManager(t)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0.25rem 0.5rem", height: "30px" }}
                        title="Manage Questions in this Test"
                      >
                        <ListChecks className="w-3.5 h-3.5 text-teal-700" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(t)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0.25rem 0.5rem", height: "30px" }}
                        title="Edit Settings"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTest(t.id, t.title)}
                        className="btn btn-ghost btn-sm text-red-600"
                        style={{ padding: "0.25rem 0.5rem", height: "30px" }}
                        title="Delete Test"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MOCK TEST MODAL */}
      {isTestModalOpen && (
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
              maxWidth: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="flex justify-between items-center pb-3 mb-4 border-b">
              <h2 style={{ fontSize: "1.25rem" }}>
                {editingTest ? "Edit Mock Test Settings" : "Create New Model Mock Test"}
              </h2>
              <button onClick={() => setIsTestModalOpen(false)} className="btn btn-ghost btn-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Mock Test Title (परीक्षाको नाम)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lok Sewa Section Officer Paper 1 Full Model Test 02"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label className="form-label">Exam Track</label>
                  <select
                    className="form-select"
                    value={examId}
                    onChange={(e) => setExamId(e.target.value)}
                  >
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Attempt Limit Per Student</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={attemptLimit}
                    onChange={(e) => setAttemptLimit(parseInt(e.target.value, 10) || 1)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Instructions / Description</label>
                <textarea
                  rows={2}
                  placeholder="Exam instructions, sections covered, negative marking guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">Duration (Min)</label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 45)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Qs</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(parseInt(e.target.value, 10) || 50)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Marks/Correct</label>
                  <input
                    type="number"
                    step="0.5"
                    min={0.5}
                    max={10}
                    value={marksPerCorrect}
                    onChange={(e) => setMarksPerCorrect(parseFloat(e.target.value) || 2.0)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Penalty (%)</label>
                  <input
                    type="number"
                    step="1"
                    min={0}
                    max={100}
                    value={negativePenaltyPercent}
                    onChange={(e) => setNegativePenaltyPercent(parseFloat(e.target.value) || 20.0)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label className="form-label">Access Level</label>
                  <select
                    className="form-select"
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                  >
                    <option value="FREE">Free Tier</option>
                    <option value="PREMIUM">Premium Package Required</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              {!editingTest && (
                <div className="card card-compact" style={{ backgroundColor: "#F8FAFC", border: "1px solid var(--color-border)" }}>
                  <label className="flex items-center gap-2 cursor-pointer" style={{ margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={autoPopulate}
                      onChange={(e) => setAutoPopulate(e.target.checked)}
                    />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      Auto-populate with published questions for this exam track
                    </span>
                  </label>
                  <p className="text-xs text-muted" style={{ marginLeft: "1.5rem", marginTop: "0.25rem" }}>
                    If enabled, the system automatically pulls available questions from the question bank matching this examination track.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? "Saving..." : editingTest ? "Update Mock Test" : "Create Mock Test"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE QUESTIONS MODAL */}
      {questionModal.isOpen && (
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
              maxWidth: "900px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="flex justify-between items-center pb-3 mb-4 border-b">
              <div>
                <h2 style={{ fontSize: "1.25rem" }}>
                  Manage Questions: {questionModal.test?.title}
                </h2>
                <p className="text-xs text-muted">
                  Currently Assigned: <strong>{questionModal.assigned.length}</strong> / {questionModal.test?.totalQuestions} questions
                </p>
              </div>
              <button
                onClick={() => setQuestionModal({ isOpen: false, test: null, assigned: [], available: [], loading: false })}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {questionModal.loading ? (
              <div className="text-center py-12 text-muted">Loading test questions...</div>
            ) : (
              <div className="grid-2-cols" style={{ gap: "1.25rem" }}>
                {/* Currently Assigned */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <h3 style={{ fontSize: "1rem", color: "var(--color-primary)" }}>
                    Assigned Questions ({questionModal.assigned.length})
                  </h3>

                  <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {questionModal.assigned.length === 0 ? (
                      <div className="card card-compact text-xs text-muted text-center py-6">
                        No questions assigned yet. Add from the right panel.
                      </div>
                    ) : (
                      questionModal.assigned.map((q, idx) => (
                        <div
                          key={q.id}
                          className="card card-compact"
                          style={{
                            backgroundColor: "#F8FAFC",
                            border: "1px solid var(--color-border)",
                            padding: "0.6rem 0.75rem",
                          }}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-bold font-mono">Q{idx + 1}.</span>
                            <div className="text-xs" style={{ flexGrow: 1, lineHeight: "1.4" }}>
                              {q.questionText}
                              <div className="text-muted mt-1">
                                {q.subjectName} &gt; {q.topicName}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestionFromTest(q.questionId)}
                              className="btn btn-ghost btn-sm text-red-600"
                              style={{ padding: "2px", height: "auto" }}
                              title="Remove from Test"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Available to Add */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <h3 style={{ fontSize: "1rem", color: "var(--color-text)" }}>
                    Available in Question Bank ({questionModal.available.length})
                  </h3>

                  <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {questionModal.available.length === 0 ? (
                      <div className="card card-compact text-xs text-muted text-center py-6">
                        No other available published questions for this exam track.
                      </div>
                    ) : (
                      questionModal.available.map((q) => (
                        <div
                          key={q.id}
                          className="card card-compact"
                          style={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid var(--color-border)",
                            padding: "0.6rem 0.75rem",
                          }}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="text-xs" style={{ flexGrow: 1, lineHeight: "1.4" }}>
                              {q.questionText}
                              <div className="text-muted mt-1">
                                {q.subjectName} &gt; {q.topicName}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddQuestionToTest(q.id)}
                              className="btn btn-primary btn-sm"
                              style={{ padding: "2px 8px", height: "auto", fontSize: "0.75rem" }}
                            >
                              <Plus className="w-3 h-3" /> Add
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                type="button"
                onClick={() => setQuestionModal({ isOpen: false, test: null, assigned: [], available: [], loading: false })}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
