"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  X,
  ExternalLink,
  Upload,
  Download,
  FileCheck,
} from "lucide-react";

interface FormattedNote {
  id: string;
  title: string;
  noteType: string;
  pdfUrl?: string | null;
  pdfFileName?: string | null;
  fileSizeBytes?: number | null;
  summary: string | null;
  contentHtml: string;
  source: string | null;
  accessLevel: string;
  status: string;
  verifiedAt: string | null;
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  examId: string;
  examTitle: string;
}

interface AdminNotesClientProps {
  initialNotes: FormattedNote[];
  exams: { id: string; title: string }[];
  subjects: { id: string; name: string }[];
  topics: { id: string; name: string; subjectId: string }[];
}

export default function AdminNotesClient({
  initialNotes,
  exams,
  subjects,
  topics,
}: AdminNotesClientProps) {
  const router = useRouter();

  const [notes, setNotes] = useState<FormattedNote[]>(initialNotes);
  const [search, setSearch] = useState("");
  const [selectedExamFilter, setSelectedExamFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<FormattedNote | null>(null);
  const [previewNote, setPreviewNote] = useState<FormattedNote | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [noteType, setNoteType] = useState<"ARTICLE" | "PDF">("ARTICLE");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");
  const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const [examId, setExamId] = useState(exams[0]?.id || "");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [customSubjectName, setCustomSubjectName] = useState("");
  const [topicId, setTopicId] = useState(topics[0]?.id || "");
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [customTopicName, setCustomTopicName] = useState("");
  const [summary, setSummary] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [source, setSource] = useState("");
  const [accessLevel, setAccessLevel] = useState("FREE");
  const [status, setStatus] = useState("PUBLISHED");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const filteredTopics = topics.filter((t) => t.subjectId === subjectId);

  // Filtered Notes
  const filteredNotes = notes.filter((n) => {
    if (selectedExamFilter !== "ALL" && n.examId !== selectedExamFilter) return false;
    if (selectedStatusFilter !== "ALL" && n.status !== selectedStatusFilter) return false;
    if (selectedTypeFilter !== "ALL" && (n.noteType || "ARTICLE") !== selectedTypeFilter) return false;
    if (
      search &&
      !n.title.toLowerCase().includes(search.toLowerCase()) &&
      !n.topicName.toLowerCase().includes(search.toLowerCase()) &&
      !n.subjectName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const resetForm = () => {
    setTitle("");
    setNoteType("ARTICLE");
    setPdfUrl("");
    setPdfFileName("");
    setFileSizeBytes(null);
    setSummary("");
    setContentHtml("");
    setSource("");
    setAccessLevel("FREE");
    setStatus("PUBLISHED");
    setIsCustomSubject(false);
    setCustomSubjectName("");
    setIsCustomTopic(false);
    setCustomTopicName("");
    setError("");
    setEditingNote(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (note: FormattedNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setNoteType((note.noteType as "ARTICLE" | "PDF") || "ARTICLE");
    setPdfUrl(note.pdfUrl || "");
    setPdfFileName(note.pdfFileName || "");
    setFileSizeBytes(note.fileSizeBytes || null);
    setExamId(note.examId);
    setSubjectId(note.subjectId);
    setTopicId(note.topicId);
    setSummary(note.summary || "");
    setContentHtml(note.contentHtml || "");
    setSource(note.source || "");
    setAccessLevel(note.accessLevel);
    setStatus(note.status);
    setIsCustomSubject(false);
    setCustomSubjectName("");
    setIsCustomTopic(false);
    setCustomTopicName("");
    setError("");
    setIsCreateModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Please select a valid PDF document (.pdf)");
      return;
    }

    setIsUploadingPdf(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/notes/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to upload PDF");
        return;
      }

      setPdfUrl(data.url);
      setPdfFileName(data.fileName);
      setFileSizeBytes(data.fileSizeBytes);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
      }
    } catch {
      setError("Network error uploading PDF file.");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (noteType === "PDF" && !pdfUrl) {
      setError("Please upload a PDF document or provide a PDF URL.");
      setLoading(false);
      return;
    }

    if (noteType === "ARTICLE" && !contentHtml.trim()) {
      setError("Article note content is required.");
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        title,
        noteType,
        pdfUrl: noteType === "PDF" ? pdfUrl : null,
        pdfFileName: noteType === "PDF" ? pdfFileName : null,
        fileSizeBytes: noteType === "PDF" ? fileSizeBytes : null,
        examId,
        subjectId: isCustomSubject ? "" : subjectId,
        customSubjectName: isCustomSubject ? customSubjectName.trim() : "",
        topicId: isCustomTopic ? "" : (topicId || filteredTopics[0]?.id),
        customTopicName: isCustomTopic ? customTopicName.trim() : "",
        contentHtml: noteType === "ARTICLE" ? contentHtml : "",
        summary,
        source,
        accessLevel,
        status,
      };

      let res: Response;
      if (editingNote) {
        payload.id = editingNote.id;
        res = await fetch("/api/admin/notes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save note");
        setLoading(false);
        return;
      }

      setIsCreateModalOpen(false);
      resetForm();
      setSuccessMsg(editingNote ? "Note updated successfully!" : "Note created successfully!");
      router.refresh();
    } catch {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this study note?")) return;
    try {
      const res = await fetch(`/api/admin/notes?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        setSuccessMsg("Note deleted successfully.");
        router.refresh();
      } else {
        alert("Failed to delete note.");
      }
    } catch {
      alert("Error deleting note.");
    }
  };

  const handleToggleStatus = async (note: FormattedNote) => {
    const newStatus = note.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch("/api/admin/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, status: newStatus }),
      });
      if (res.ok) {
        setNotes((prev) =>
          prev.map((n) => (n.id === note.id ? { ...n, status: newStatus } : n))
        );
        router.refresh();
      }
    } catch {
      alert("Failed to toggle status.");
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {successMsg && (
        <div className="alert alert-success flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="btn btn-ghost btn-sm">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: "1.5rem" }}>Study Notes & Syllabus Documents</h1>
          <p className="text-sm text-muted">
            Upload PDF textbooks, legislative gazettes, or write rich article notes organized by course and subject.
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            <span>Add Study Note (PDF / Article)</span>
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="card" style={{ padding: "1rem" }}>
        <div className="grid-filters-4">
          <div style={{ position: "relative" }}>
            <Search className="w-4 h-4 text-muted" style={{ position: "absolute", left: "10px", top: "11px" }} />
            <input
              type="text"
              placeholder="Search by title, subject, or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "38px" }}
            />
          </div>

          <div>
            <select
              className="form-select"
              value={selectedExamFilter}
              onChange={(e) => setSelectedExamFilter(e.target.value)}
              style={{ height: "38px" }}
            >
              <option value="ALL">All Courses / Exams</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.title}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-select"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              style={{ height: "38px" }}
            >
              <option value="ALL">All Formats (PDF & Article)</option>
              <option value="PDF">📄 PDF Documents Only</option>
              <option value="ARTICLE">📝 Articles Only</option>
            </select>
          </div>

          <div>
            <select
              className="form-select"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{ height: "38px" }}
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Title & Format</th>
              <th>Course / Subject</th>
              <th>Topic</th>
              <th>Access</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No study notes found matching criteria. Click &quot;Add Study Note&quot; to upload a PDF or write an article.
                </td>
              </tr>
            ) : (
              filteredNotes.map((n) => (
                <tr key={n.id}>
                  <td>
                    <div className="flex items-center gap-2 mb-1">
                      {n.noteType === "PDF" ? (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: "#FEE2E2",
                            color: "#B91C1C",
                            border: "1px solid #FCA5A5",
                            fontWeight: 700,
                            fontSize: "0.725rem",
                          }}
                        >
                          📄 PDF {n.fileSizeBytes ? `(${formatFileSize(n.fileSizeBytes)})` : ""}
                        </span>
                      ) : (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: "#EFF6FF",
                            color: "#1D4ED8",
                            border: "1px solid #BFDBFE",
                            fontWeight: 700,
                            fontSize: "0.725rem",
                          }}
                        >
                          📝 Article
                        </span>
                      )}
                      {n.source && <span className="text-xs text-muted">Ref: {n.source}</span>}
                    </div>
                    <strong style={{ fontSize: "0.95rem", color: "var(--color-primary)" }}>{n.title}</strong>
                    {n.summary && (
                      <div className="text-xs text-muted mt-1" style={{ maxWidth: "450px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {n.summary}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{n.examTitle}</div>
                    <div className="text-xs text-muted">{n.subjectName}</div>
                  </td>
                  <td>
                    <span className="badge badge-muted">{n.topicName}</span>
                  </td>
                  <td>
                    <span className={`badge ${n.accessLevel === "PREMIUM" ? "badge-accent" : "badge-basic"}`}>
                      {n.accessLevel}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(n)}
                      className={`badge cursor-pointer ${n.status === "PUBLISHED" ? "badge-success" : "badge-muted"}`}
                      title="Click to toggle Draft / Published"
                    >
                      {n.status}
                    </button>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewNote(n)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0.25rem 0.5rem", height: "30px" }}
                        title="View Note Content"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(n)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0.25rem 0.5rem", height: "30px" }}
                        title="Edit Note"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(n.id)}
                        className="btn btn-ghost btn-sm text-red-600"
                        style={{ padding: "0.25rem 0.5rem", height: "30px" }}
                        title="Delete Note"
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

      {/* CREATE / EDIT MODAL */}
      {isCreateModalOpen && (
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
              maxWidth: "850px",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="flex justify-between items-center pb-3 mb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <h2 style={{ fontSize: "1.25rem" }}>
                {editingNote ? "Edit Study Note" : "Create New Study Note"}
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-ghost btn-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="alert alert-error mb-4">{error}</div>}

            <form onSubmit={handleSaveNote} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Note Format Selector Tabs */}
              <div className="form-group">
                <label className="form-label font-bold">Choose Note Format (फर्म्याट रोज्नुहोस्)</label>
                <div className="grid-2-cols">
                  <button
                    type="button"
                    onClick={() => setNoteType("PDF")}
                    style={{
                      padding: "0.85rem 1rem",
                      borderRadius: "var(--radius-md)",
                      border: noteType === "PDF" ? "2px solid #EF4444" : "1px solid var(--color-border)",
                      backgroundColor: noteType === "PDF" ? "#FEF2F2" : "#F8FAFC",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", backgroundColor: "#FEE2E2", color: "#DC2626" }}>
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: noteType === "PDF" ? "#991B1B" : "var(--color-text)" }}>
                        📄 PDF Document (पिडिएफ फाइल)
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        Upload official textbook, gazette, or syllabus PDF
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNoteType("ARTICLE")}
                    style={{
                      padding: "0.85rem 1rem",
                      borderRadius: "var(--radius-md)",
                      border: noteType === "ARTICLE" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      backgroundColor: noteType === "ARTICLE" ? "var(--color-primary-subtle)" : "#F8FAFC",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ padding: "0.5rem", borderRadius: "var(--radius-sm)", backgroundColor: "#DBEAFE", color: "#1E3A8A" }}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: noteType === "ARTICLE" ? "var(--color-primary)" : "var(--color-text)" }}>
                        📝 Article (लेख / Text Note)
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        Write formatted text, formulas, or constitutional articles
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Note Title (शीर्षक)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nepal Engineering Council Act & Ethics Guide / Constitution Part 3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label className="form-label">Exam / Course Track</label>
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

                {/* Subject with custom typing */}
                <div className="form-group">
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label" style={{ marginBottom: 0 }}>Subject (विषय)</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomSubject(!isCustomSubject)}
                      className="text-xs text-teal-700 font-semibold"
                    >
                      {isCustomSubject ? "Select Existing" : "+ Write Custom"}
                    </button>
                  </div>
                  {isCustomSubject ? (
                    <input
                      type="text"
                      placeholder="Type custom subject name..."
                      value={customSubjectName}
                      onChange={(e) => setCustomSubjectName(e.target.value)}
                      className="form-input"
                    />
                  ) : (
                    <select
                      className="form-select"
                      value={subjectId}
                      onChange={(e) => {
                        setSubjectId(e.target.value);
                        const newF = topics.filter((t) => t.subjectId === e.target.value);
                        setTopicId(newF[0]?.id || "");
                      }}
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Topic with custom typing */}
              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label" style={{ marginBottom: 0 }}>Topic (शीर्षक / च्याप्टर)</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomTopic(!isCustomTopic)}
                    className="text-xs text-teal-700 font-semibold"
                  >
                    {isCustomTopic ? "Select Existing" : "+ Write Custom"}
                  </button>
                </div>
                {isCustomTopic ? (
                  <input
                    type="text"
                    placeholder="Type custom topic name..."
                    value={customTopicName}
                    onChange={(e) => setCustomTopicName(e.target.value)}
                    className="form-input"
                  />
                ) : (
                  <select
                    className="form-select"
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                  >
                    {filteredTopics.length === 0 ? (
                      <option value="">No existing topics for this subject</option>
                    ) : (
                      filteredTopics.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))
                    )}
                  </select>
                )}
              </div>

              {/* PDF Upload Box (Shown if PDF mode selected) */}
              {noteType === "PDF" && (
                <div
                  style={{
                    backgroundColor: "#FEF2F2",
                    border: "1.5px dashed #F87171",
                    borderRadius: "var(--radius-md)",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-red-600" />
                      <strong style={{ fontSize: "0.95rem", color: "#991B1B" }}>Upload PDF Document</strong>
                      <span className="text-xs text-muted">(Supports up to 30MB)</span>
                    </div>

                    {isUploadingPdf && (
                      <span className="badge badge-accent animate-pulse">Uploading file...</span>
                    )}
                  </div>

                  {pdfUrl ? (
                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #FCA5A5",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.75rem 1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{pdfFileName || "Uploaded PDF"}</div>
                          <div className="text-xs text-muted">
                            Path: {pdfUrl} {fileSizeBytes ? `• ${formatFileSize(fileSizeBytes)}` : ""}
                          </div>
                        </div>
                      </div>
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </a>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                      disabled={isUploadingPdf}
                      className="form-input"
                      style={{ padding: "0.4rem" }}
                    />
                  </div>

                  <div className="text-xs text-muted">
                    Alternatively, paste an existing PDF URL below:
                  </div>
                  <input
                    type="text"
                    placeholder="https://example.com/file.pdf or /uploads/notes/file.pdf"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    className="form-input"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Summary / Description (संक्षिप्त जानकारी)</label>
                <textarea
                  rows={2}
                  placeholder="Key highlights, syllabus overview, or points covered in this note..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="form-textarea"
                />
              </div>

              {/* Article Content (Shown if ARTICLE mode selected) */}
              {noteType === "ARTICLE" && (
                <div className="form-group">
                  <label className="form-label">Full Article Content (HTML or formatted text)</label>
                  <textarea
                    rows={8}
                    required={noteType === "ARTICLE"}
                    placeholder="<p>Full study materials, clauses, definitions, and legislative notes...</p>"
                    value={contentHtml}
                    onChange={(e) => setContentHtml(e.target.value)}
                    className="form-textarea font-mono"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
              )}

              <div className="grid-filters-3">
                <div className="form-group">
                  <label className="form-label">Official Source / Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Nepal Gazette / NEC Curriculum 2081"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Access Level</label>
                  <select
                    className="form-select"
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                  >
                    <option value="FREE">Free</option>
                    <option value="PREMIUM">Premium</option>
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

              <div className="flex justify-end gap-2 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || isUploadingPdf}
                  className="btn btn-primary"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? "Saving..." : editingNote ? "Update Note" : "Create Note"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PREVIEW MODAL */}
      {previewNote && (
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
              maxWidth: "850px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="flex justify-between items-center pb-3 mb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-primary">{previewNote.examTitle}</span>
                  <span className="badge badge-muted">{previewNote.subjectName} &gt; {previewNote.topicName}</span>
                  {previewNote.noteType === "PDF" ? (
                    <span className="badge" style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}>📄 PDF</span>
                  ) : (
                    <span className="badge" style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8" }}>📝 Article</span>
                  )}
                </div>
                <h2 style={{ fontSize: "1.3rem" }}>{previewNote.title}</h2>
              </div>
              <button onClick={() => setPreviewNote(null)} className="btn btn-ghost btn-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewNote.summary && (
              <div className="alert alert-info mb-4" style={{ fontSize: "0.85rem" }}>
                <strong>Summary: </strong>
                {previewNote.summary}
              </div>
            )}

            {previewNote.noteType === "PDF" && previewNote.pdfUrl ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div className="flex justify-between items-center p-3 bg-slate-50 border rounded-md">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>{previewNote.pdfFileName || "Document.pdf"}</span>
                    {previewNote.fileSizeBytes && (
                      <span className="text-xs text-muted">({formatFileSize(previewNote.fileSizeBytes)})</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={previewNote.pdfUrl}
                      download
                      className="btn btn-secondary btn-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                    <a
                      href={previewNote.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Fullscreen</span>
                    </a>
                  </div>
                </div>

                <div style={{ width: "100%", height: "500px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                  <iframe
                    src={`${previewNote.pdfUrl}#toolbar=1`}
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                    title={previewNote.title}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{ lineHeight: "1.7", fontSize: "0.95rem", color: "var(--color-text)" }}
                dangerouslySetInnerHTML={{ __html: previewNote.contentHtml }}
              />
            )}

            <div className="flex justify-between items-center pt-4 mt-6 text-xs text-muted" style={{ borderTop: "1px solid var(--color-border)" }}>
              <span>Source: <strong>{previewNote.source || "Official Gazette / Curriculum"}</strong></span>
              <button onClick={() => setPreviewNote(null)} className="btn btn-secondary btn-sm">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
