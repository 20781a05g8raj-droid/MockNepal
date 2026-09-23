"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  CheckCircle2,
  Archive,
  Edit,
  Plus,
  Upload,
  AlertCircle,
  Eye,
  Check,
  Trash2,
} from "lucide-react";

interface QuestionRowData {
  id: string;
  externalId: string | null;
  questionText: string;
  difficulty: string;
  language: string;
  questionType: string;
  status: string;
  subjectName: string;
  topicName: string;
  examTitles: string[];
  versionCount: number;
}

export default function QuestionTableClient({
  questions,
  subjects,
  topics,
}: {
  questions: QuestionRowData[];
  subjects: { id: string; name: string }[];
  topics: { id: string; name: string; subjectId: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get("difficulty") || "ALL");
  const [selectedSubjectId, setSelectedSubjectId] = useState(searchParams.get("subjectId") || "ALL");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [previewQuestion, setPreviewQuestion] = useState<QuestionRowData | null>(null);

  // Filter client-side
  const filteredQuestions = questions.filter((q) => {
    if (selectedStatus !== "ALL" && q.status !== selectedStatus) return false;
    if (selectedDifficulty !== "ALL" && q.difficulty !== selectedDifficulty) return false;
    if (search && !q.questionText.toLowerCase().includes(search.toLowerCase())) return false;
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
        setMessage("Question successfully deleted.");
        router.refresh();
      } else {
        setMessage("Failed to delete question.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Search and Filters Bar */}
      <div className="card card-compact" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="grid-filters-4">
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search question text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "2.25rem" }}
            />
            <Search className="w-4 h-4 text-muted" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
          </div>

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

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedStatus("ALL");
              setSelectedDifficulty("ALL");
            }}
            className="btn btn-ghost btn-sm"
          >
            Reset Filters
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
        <div className="alert alert-info" style={{ margin: 0 }}>
          {message}
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
                <td colSpan={6} className="text-center py-6 text-muted">
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
                      <div className="text-xs flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-primary" style={{ backgroundColor: "#EFF6FF", padding: "2px 8px", borderRadius: "4px" }}>
                          {q.subjectName} &gt; {q.topicName}
                        </span>
                        <span className="badge badge-primary" style={{ fontSize: "0.68rem", padding: "1px 6px" }}>
                          {q.language}
                        </span>
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
                        <Link
                          href={`/admin/questions/${q.id}/edit`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "0.25rem 0.5rem", height: "30px" }}
                          title="Edit Question"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
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
    </div>
  );
}
