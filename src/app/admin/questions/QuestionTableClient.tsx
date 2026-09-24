"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  Eye,
  X,
  ExternalLink,
  Save,
  Check,
  Filter,
  Lightbulb,
  SlidersHorizontal,
} from "lucide-react";

export interface QuestionRowData {
  id: string;
  externalId: string | null;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: string;
  explanation?: string;
  difficulty: string;
  language: string;
  questionType: string;
  status: string;
  subjectId?: string;
  subjectName: string;
  topicId?: string;
  topicName: string;
  examIds?: string[];
  examTitles: string[];
  versionCount: number;
}

interface QuestionTableClientProps {
  questions: QuestionRowData[];
  exams?: { id: string; title: string }[];
  subjects: { id: string; name: string }[];
  topics: { id: string; name: string; subjectId: string }[];
}

export default function QuestionTableClient({
  questions,
  exams = [],
  subjects = [],
  topics = [],
}: QuestionTableClientProps) {
  const router = useRouter();

  const [questionsList, setQuestionsList] = useState<QuestionRowData[]>(questions);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("ALL");
  const [selectedSubjectId, setSelectedSubjectId] = useState("ALL");
  const [selectedTopicId, setSelectedTopicId] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");

  // Selection & Bulk
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Modals
  const [previewQuestion, setPreviewQuestion] = useState<QuestionRowData | null>(null);
  const [quickEditQuestion, setQuickEditQuestion] = useState<QuestionRowData | null>(null);

  // Quick Edit form state
  const [qeText, setQeText] = useState("");
  const [qeOptionA, setQeOptionA] = useState("");
  const [qeOptionB, setQeOptionB] = useState("");
  const [qeOptionC, setQeOptionC] = useState("");
  const [qeOptionD, setQeOptionD] = useState("");
  const [qeCorrect, setQeCorrect] = useState<"A" | "B" | "C" | "D">("A");
  const [qeExplanation, setQeExplanation] = useState("");
  const [qeDifficulty, setQeDifficulty] = useState("INTERMEDIATE");
  const [qeStatus, setQeStatus] = useState("PUBLISHED");
  const [qeSaving, setQeSaving] = useState(false);
  const [qeError, setQeError] = useState("");

  // Topics filtered by selected subject
  const availableTopics =
    selectedSubjectId === "ALL"
      ? topics
      : topics.filter((t) => t.subjectId === selectedSubjectId);

  // Filter questions
  const filteredQuestions = questionsList.filter((q) => {
    if (selectedStatus !== "ALL" && q.status !== selectedStatus) return false;
    if (selectedDifficulty !== "ALL" && q.difficulty !== selectedDifficulty) return false;
    if (selectedSubjectId !== "ALL" && q.subjectId !== selectedSubjectId) return false;
    if (selectedTopicId !== "ALL" && q.topicId !== selectedTopicId) return false;
    if (selectedExamId !== "ALL" && q.examIds && !q.examIds.includes(selectedExamId)) return false;

    if (search.trim()) {
      const query = search.toLowerCase().trim();
      const matchText = q.questionText.toLowerCase().includes(query);
      const matchSubject = q.subjectName.toLowerCase().includes(query);
      const matchTopic = q.topicName.toLowerCase().includes(query);
      const matchOptionA = q.optionA?.toLowerCase().includes(query);
      const matchOptionB = q.optionB?.toLowerCase().includes(query);
      const matchOptionC = q.optionC?.toLowerCase().includes(query);
      const matchOptionD = q.optionD?.toLowerCase().includes(query);
      const matchExplan = q.explanation?.toLowerCase().includes(query);
      const matchExternal = q.externalId?.toLowerCase().includes(query);

      if (
        !matchText &&
        !matchSubject &&
        !matchTopic &&
        !matchOptionA &&
        !matchOptionB &&
        !matchOptionC &&
        !matchOptionD &&
        !matchExplan &&
        !matchExternal
      ) {
        return false;
      }
    }

    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredQuestions.map((q) => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = async (newStatus: "PUBLISHED" | "ARCHIVED" | "DRAFT") => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/questions/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds: selectedIds, newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        setQuestionsList((prev) =>
          prev.map((q) => (selectedIds.includes(q.id) ? { ...q, status: newStatus } : q))
        );
        setMessage(`Successfully marked ${selectedIds.length} questions as ${newStatus}.`);
        setSelectedIds([]);
        router.refresh();
      } else {
        setMessage(data.error || "Status update failed.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this question?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/questions/create?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setQuestionsList((prev) => prev.filter((q) => q.id !== id));
        setMessage("Question successfully deleted.");
        router.refresh();
      } else {
        setMessage("Failed to delete question.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Open Quick Edit
  const handleOpenQuickEdit = (q: QuestionRowData) => {
    setQuickEditQuestion(q);
    setQeText(q.questionText || "");
    setQeOptionA(q.optionA || "");
    setQeOptionB(q.optionB || "");
    setQeOptionC(q.optionC || "");
    setQeOptionD(q.optionD || "");
    setQeCorrect((q.correctOption?.toUpperCase() as any) || "A");
    setQeExplanation(q.explanation || "");
    setQeDifficulty(q.difficulty || "INTERMEDIATE");
    setQeStatus(q.status || "PUBLISHED");
    setQeError("");
  };

  // Save Quick Edit
  const handleSaveQuickEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditQuestion) return;

    if (!qeText.trim()) {
      setQeError("Question text is required.");
      return;
    }
    if (!qeOptionA.trim() || !qeOptionB.trim() || !qeOptionC.trim() || !qeOptionD.trim()) {
      setQeError("All 4 options (A, B, C, D) are required.");
      return;
    }

    setQeSaving(true);
    setQeError("");

    try {
      const res = await fetch("/api/admin/questions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: quickEditQuestion.id,
          subjectId: quickEditQuestion.subjectId,
          topicId: quickEditQuestion.topicId,
          examIds: quickEditQuestion.examIds,
          difficulty: qeDifficulty,
          language: quickEditQuestion.language,
          questionType: quickEditQuestion.questionType,
          status: qeStatus,
          questionText: qeText.trim(),
          optionA: qeOptionA.trim(),
          optionB: qeOptionB.trim(),
          optionC: qeOptionC.trim(),
          optionD: qeOptionD.trim(),
          correctOption: qeCorrect,
          explanation: qeExplanation.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setQeError(data.error || "Failed to update question.");
        setQeSaving(false);
        return;
      }

      // Update local state instantly
      setQuestionsList((prev) =>
        prev.map((q) =>
          q.id === quickEditQuestion.id
            ? {
                ...q,
                questionText: qeText.trim(),
                optionA: qeOptionA.trim(),
                optionB: qeOptionB.trim(),
                optionC: qeOptionC.trim(),
                optionD: qeOptionD.trim(),
                correctOption: qeCorrect,
                explanation: qeExplanation.trim(),
                difficulty: qeDifficulty,
                status: qeStatus,
                versionCount: q.versionCount + 1,
              }
            : q
        )
      );

      setQuickEditQuestion(null);
      setMessage("Question updated successfully!");
      router.refresh();
    } catch {
      setQeError("Network error occurred while saving question.");
    } finally {
      setQeSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: "1.25rem", backgroundColor: "#FFFFFF" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem" }}>
          {/* Search Input */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search question, options, explanation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "2.25rem" }}
            />
            <Search className="w-4 h-4 text-muted" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
          </div>

          {/* Exam Filter */}
          {exams.length > 0 && (
            <select
              className="form-select"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
            >
              <option value="ALL">All Exams</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          )}

          {/* Subject Filter */}
          <select
            className="form-select"
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setSelectedTopicId("ALL");
            }}
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Topic Filter */}
          <select
            className="form-select"
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            disabled={availableTopics.length === 0}
          >
            <option value="ALL">All Topics</option>
            {availableTopics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Difficulty Filter */}
          <select
            className="form-select"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="ALL">All Difficulties</option>
            <option value="BASIC">Basic</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.85rem", paddingTop: "0.75rem", borderTop: "1px solid #F1F5F9" }}>
          <span style={{ fontSize: "0.82rem", color: "#64748B" }}>
            Showing <strong>{filteredQuestions.length}</strong> of <strong>{questionsList.length}</strong> questions
          </span>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedExamId("ALL");
              setSelectedSubjectId("ALL");
              setSelectedTopicId("ALL");
              setSelectedStatus("ALL");
              setSelectedDifficulty("ALL");
            }}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "0.8rem", height: "30px" }}
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Bulk Action Controls */}
      {selectedIds.length > 0 && (
        <div className="alert alert-info flex justify-between items-center" style={{ margin: 0, padding: "0.6rem 1rem" }}>
          <span style={{ fontWeight: 600 }}>
            {selectedIds.length} questions selected
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleBulkStatus("PUBLISHED")}
              disabled={actionLoading}
              className="btn btn-primary btn-sm"
            >
              Publish Selected
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus("DRAFT")}
              disabled={actionLoading}
              className="btn btn-secondary btn-sm"
            >
              Mark as Draft
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus("ARCHIVED")}
              disabled={actionLoading}
              className="btn btn-secondary btn-sm"
            >
              Archive Selected
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className="alert alert-success flex justify-between items-center" style={{ margin: 0 }}>
          <span>{message}</span>
          <button onClick={() => setMessage("")} className="btn btn-ghost btn-sm">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Questions Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length > 0 && selectedIds.length === filteredQuestions.length}
                />
              </th>
              <th style={{ width: "45%" }}>Question Text & Classification</th>
              <th>Difficulty</th>
              <th>Type</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted">
                  No questions found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredQuestions.map((q) => {
                const isSelected = selectedIds.includes(q.id);

                return (
                  <tr key={q.id} style={{ backgroundColor: isSelected ? "var(--color-primary-subtle)" : undefined }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(q.id)}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--color-text)", marginBottom: 4, lineHeight: "1.4" }}>
                        {q.questionText}
                      </div>
                      <div className="text-xs flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="font-semibold text-primary" style={{ backgroundColor: "#EFF6FF", padding: "2px 8px", borderRadius: "4px" }}>
                          {q.subjectName} &gt; {q.topicName}
                        </span>
                        <span className="badge badge-primary" style={{ fontSize: "0.68rem", padding: "1px 6px" }}>
                          {q.language}
                        </span>
                        {q.examTitles && q.examTitles.length > 0 && (
                          <span style={{ fontSize: "0.72rem", color: "#64748B", backgroundColor: "#F1F5F9", padding: "1px 6px", borderRadius: "4px" }}>
                            {q.examTitles.join(", ")}
                          </span>
                        )}
                        {q.externalId && <span className="text-muted">• ID: <code>{q.externalId}</code></span>}
                        <span className="text-muted">• v{q.versionCount}</span>
                      </div>
                    </td>
                    <td>
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
                    </td>
                    <td>
                      <span className="badge badge-accent" style={{ fontSize: "0.75rem" }}>
                        {q.questionType}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          q.status === "PUBLISHED"
                            ? "badge-success"
                            : q.status === "DRAFT"
                            ? "badge-intermediate"
                            : "badge-muted"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="flex justify-end gap-1.5">
                        {/* Preview Button */}
                        <button
                          type="button"
                          onClick={() => setPreviewQuestion(q)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "0.25rem 0.5rem", height: "30px", color: "#0284C7" }}
                          title="Quick Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Edit Modal Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenQuickEdit(q)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: "0.25rem 0.6rem", height: "30px", fontSize: "0.78rem" }}
                          title="Quick Edit Question & Options"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Full Deep Editor Link */}
                        <Link
                          href={`/admin/questions/${q.id}/edit`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "0.25rem 0.5rem", height: "30px" }}
                          title="Open Full Editor (Syllabus Tracks, Versions)"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "0.25rem 0.5rem", height: "30px", color: "var(--color-error)" }}
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= QUICK EDIT MODAL ================= */}
      {quickEditQuestion && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "700px",
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
              border: "1px solid #E2E8F0",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "92vh",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#F8FAFC",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "#0F172A" }}>
                  Quick Edit MCQ Question
                </h3>
                <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
                  {quickEditQuestion.subjectName} &gt; {quickEditQuestion.topicName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQuickEditQuestion(null)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveQuickEdit} style={{ display: "flex", flexDirection: "column", flexGrow: 1, overflow: "hidden" }}>
              <div style={{ padding: "1.25rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", flexGrow: 1 }}>
                {qeError && (
                  <div className="alert alert-error" style={{ margin: 0 }}>
                    {qeError}
                  </div>
                )}

                {/* Question Statement */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>
                    Question Statement (प्रश्न) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={qeText}
                    onChange={(e) => setQeText(e.target.value)}
                    className="form-input"
                    placeholder="Enter question text here..."
                    style={{ width: "100%", resize: "vertical" }}
                  />
                </div>

                {/* 4 Options Grid */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                    Options & Correct Answer (विकल्पहरू) *
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {(["A", "B", "C", "D"] as const).map((opt) => {
                      const val = opt === "A" ? qeOptionA : opt === "B" ? qeOptionB : opt === "C" ? qeOptionC : qeOptionD;
                      const setVal = opt === "A" ? setQeOptionA : opt === "B" ? setQeOptionB : opt === "C" ? setQeOptionC : setQeOptionD;
                      const isCorrect = qeCorrect === opt;

                      return (
                        <div
                          key={opt}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                            padding: "0.4rem 0.6rem",
                            borderRadius: "8px",
                            backgroundColor: isCorrect ? "#F0FDF4" : "#F8FAFC",
                            border: `1.5px solid ${isCorrect ? "#22C55E" : "#E2E8F0"}`,
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: 800,
                              color: isCorrect ? "#166534" : "#475569",
                              minWidth: "48px",
                            }}
                          >
                            <input
                              type="radio"
                              name="quickEditCorrect"
                              checked={isCorrect}
                              onChange={() => setQeCorrect(opt)}
                              style={{ accentColor: "#16A34A", cursor: "pointer" }}
                            />
                            <span>{opt}</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={val}
                            onChange={(e) => setVal(e.target.value)}
                            className="form-input"
                            placeholder={`Option ${opt} text`}
                            style={{ flexGrow: 1, backgroundColor: "#FFFFFF" }}
                          />
                          {isCorrect && (
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#16A34A", whiteSpace: "nowrap" }}>
                              Correct Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>
                    Explanation / Solution Details (व्याख्या)
                  </label>
                  <textarea
                    rows={2}
                    value={qeExplanation}
                    onChange={(e) => setQeExplanation(e.target.value)}
                    className="form-input"
                    placeholder="Explain why this option is correct..."
                    style={{ width: "100%", resize: "vertical" }}
                  />
                </div>

                {/* Difficulty & Status Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.3rem" }}>
                      Difficulty Level
                    </label>
                    <select
                      value={qeDifficulty}
                      onChange={(e) => setQeDifficulty(e.target.value)}
                      className="form-select"
                    >
                      <option value="BASIC">Basic</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.3rem" }}>
                      Publication Status
                    </label>
                    <select
                      value={qeStatus}
                      onChange={(e) => setQeStatus(e.target.value)}
                      className="form-select"
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: "0.85rem 1.25rem",
                  backgroundColor: "#F8FAFC",
                  borderTop: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "0.6rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuickEditQuestion(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={qeSaving}
                  className="btn btn-primary btn-sm"
                  style={{ gap: "0.35rem" }}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{qeSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PREVIEW MODAL ================= */}
      {previewQuestion && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "650px",
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
              border: "1px solid #E2E8F0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#F8FAFC",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Eye className="w-4 h-4 text-sky-600" />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>
                  Question Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                <span className="badge badge-primary">{previewQuestion.subjectName} &gt; {previewQuestion.topicName}</span>
                <span className="badge badge-basic">{previewQuestion.difficulty}</span>
                <span className="badge badge-accent">{previewQuestion.questionType}</span>
                <span className="badge badge-success">{previewQuestion.status}</span>
              </div>

              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.5 }}>
                {previewQuestion.questionText}
              </div>

              {/* 4 Options Preview */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const optText =
                    opt === "A"
                      ? previewQuestion.optionA
                      : opt === "B"
                      ? previewQuestion.optionB
                      : opt === "C"
                      ? previewQuestion.optionC
                      : previewQuestion.optionD;

                  const isCorrect = previewQuestion.correctOption?.toUpperCase() === opt;

                  return (
                    <div
                      key={opt}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "8px",
                        backgroundColor: isCorrect ? "#F0FDF4" : "#F8FAFC",
                        border: `1.5px solid ${isCorrect ? "#22C55E" : "#E2E8F0"}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            backgroundColor: isCorrect ? "#16A34A" : "#E2E8F0",
                            color: isCorrect ? "#FFFFFF" : "#334155",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                          }}
                        >
                          {opt}
                        </span>
                        <span style={{ fontSize: "0.9rem", color: isCorrect ? "#166534" : "#334155", fontWeight: isCorrect ? 600 : 400 }}>
                          {optText || `Option ${opt} text`}
                        </span>
                      </div>
                      {isCorrect && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#16A34A", fontSize: "0.78rem", fontWeight: 700 }}>
                          <Check className="w-3.5 h-3.5" />
                          <span>Correct</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {previewQuestion.explanation && (
                <div
                  style={{
                    backgroundColor: "#FEF3C7",
                    border: "1px solid #FDE68A",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    gap: "0.6rem",
                  }}
                >
                  <Lightbulb className="w-4 h-4 text-amber-600" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong style={{ fontSize: "0.8rem", color: "#92400E", display: "block" }}>Explanation / व्याख्या:</strong>
                    <span style={{ fontSize: "0.84rem", color: "#78350F" }}>{previewQuestion.explanation}</span>
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                padding: "0.85rem 1.25rem",
                backgroundColor: "#F8FAFC",
                borderTop: "1px solid #E2E8F0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const target = previewQuestion;
                  setPreviewQuestion(null);
                  handleOpenQuickEdit(target);
                }}
                className="btn btn-secondary btn-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit This Question</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="btn btn-primary btn-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
