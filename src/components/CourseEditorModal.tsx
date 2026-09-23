"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  Save,
  Trash2,
} from "lucide-react";

export interface CourseData {
  id: string;
  title?: string;
  name?: string; // Support both name or title
  code?: string;
  description?: string;
  categoryId?: string;
  isActive?: boolean;
  category?: {
    id: string;
    name: string;
    code: string;
  };
}

interface CategoryOption {
  id: string;
  name: string;
}

interface CourseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseSaved?: (savedCourse: { id: string; name: string }) => void;
}

export default function CourseEditorModal({
  isOpen,
  onClose,
  onCourseSaved,
}: CourseEditorModalProps) {
  const [activeTab, setActiveTab] = useState<"CREATE" | "LIST">("CREATE");
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Create / Edit Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchCoursesAndCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      if (res.ok) {
        setCourses(data.exams || []);
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !categoryId) {
          setCategoryId(data.categories[0].id);
        }
      }
    } catch {
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCoursesAndCategories();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setCode("");
    setDescription("");
    setIsCustomCategory(false);
    setCustomCategoryName("");
    setIsActive(true);
    setError("");
  };

  const handleOpenEdit = (course: CourseData) => {
    setEditingId(course.id);
    setTitle(course.title || course.name || "");
    setCode(course.code || "");
    setDescription(course.description || "");
    setCategoryId(course.categoryId || course.category?.id || categories[0]?.id || "");
    setIsCustomCategory(false);
    setCustomCategoryName("");
    setIsActive(course.isActive !== false);
    setActiveTab("CREATE");
    setError("");
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setError("Course title is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload: any = {
        title: title.trim(),
        code: code.trim(),
        description: description.trim(),
        categoryId: isCustomCategory ? "" : categoryId,
        customCategoryName: isCustomCategory ? customCategoryName.trim() : "",
        isActive,
      };

      let res: Response;
      if (editingId) {
        payload.id = editingId;
        res = await fetch("/api/admin/courses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save course.");
        setSaving(false);
        return;
      }

      const saved = data.exam;
      setSuccessMsg(editingId ? "Course updated successfully!" : "New course added successfully!");
      
      // Notify parent callback
      if (onCourseSaved && saved) {
        onCourseSaved({ id: saved.id, name: saved.title });
      }

      // Refresh list
      await fetchCoursesAndCategories();
      resetForm();
    } catch {
      setError("Network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="card"
        style={{
          backgroundColor: "#FFFFFF",
          width: "100%",
          maxWidth: "760px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
          padding: "1.75rem",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-3 mb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-primary">Course Administration</span>
              <span className="badge badge-muted">Admin Editor</span>
            </div>
            <h2 style={{ fontSize: "1.35rem", color: "var(--color-primary)" }}>
              Manage Examination & Course Tracks
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Add or edit courses (e.g. Engineering License, Kharidar, Subba, Banking, Army Cadet, Staff Nurse).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-4" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "0.75rem" }}>
          <button
            type="button"
            onClick={() => { setActiveTab("CREATE"); resetForm(); }}
            className={`btn btn-sm ${activeTab === "CREATE" && !editingId ? "btn-primary" : "btn-secondary"}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Course</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("LIST")}
            className={`btn btn-sm ${activeTab === "LIST" ? "btn-primary" : "btn-secondary"}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Courses ({courses.length})</span>
          </button>

          {editingId && activeTab === "CREATE" && (
            <span className="badge badge-accent ml-auto flex items-center gap-1">
              <Edit2 className="w-3 h-3" /> Editing: {title}
            </span>
          )}
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}
        {successMsg && (
          <div className="alert alert-success mb-4 flex justify-between items-center">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="btn btn-ghost btn-sm">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: CREATE OR EDIT FORM */}
        {activeTab === "CREATE" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label font-bold">Course / Examination Title (कोर्सको नाम)</label>
              <input
                type="text"
                required
                placeholder="e.g. Nepal Engineering Council (NEC) License Exam / Lok Sewa Kharidar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="grid-2-cols">
              {/* Category */}
              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label" style={{ marginBottom: 0 }}>Category (श्रेणी)</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(!isCustomCategory)}
                    className="text-xs text-teal-700 font-semibold"
                  >
                    {isCustomCategory ? "Select Existing" : "+ New Category"}
                  </button>
                </div>
                {isCustomCategory ? (
                  <input
                    type="text"
                    required
                    placeholder="Type new category (e.g. Medical Licensing)..."
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    className="form-input"
                  />
                ) : (
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Code */}
              <div className="form-group">
                <label className="form-label">Course Code (ऐच्छिक - Unique Code)</label>
                <input
                  type="text"
                  placeholder="e.g. NEC_CIVIL, LOK_SEWA_KHARIDAR"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Scope (विवरण)</label>
              <textarea
                rows={3}
                placeholder="Brief description of the course, eligibility, papers, or target audience..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isActiveCourse"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label htmlFor="isActiveCourse" style={{ fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}>
                Course is Active and visible to students
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 mt-2" style={{ borderTop: "1px solid var(--color-border)" }}>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="btn btn-primary"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : editingId ? "Update Course" : "Save New Course"}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: LIST AND EDIT COURSES */}
        {activeTab === "LIST" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {courses.length === 0 ? (
              <div className="text-center py-8 text-muted text-sm">
                No courses found. Click &quot;+ Add New Course&quot; to create one.
              </div>
            ) : (
              courses.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: "0.9rem 1rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    backgroundColor: c.isActive !== false ? "#FFFFFF" : "#F8FAFC",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-primary" style={{ fontSize: "0.7rem" }}>
                        {c.category?.name || "General"}
                      </span>
                      {c.code && <span className="badge badge-muted" style={{ fontSize: "0.7rem" }}>{c.code}</span>}
                      {c.isActive === false && (
                        <span className="badge" style={{ backgroundColor: "#FEE2E2", color: "#DC2626", fontSize: "0.7rem" }}>
                          Inactive
                        </span>
                      )}
                    </div>
                    <strong style={{ fontSize: "0.95rem", color: "var(--color-primary)" }}>
                      {c.title || c.name}
                    </strong>
                    {c.description && (
                      <div className="text-xs text-muted mt-0.5" style={{ maxWidth: "500px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.description}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
