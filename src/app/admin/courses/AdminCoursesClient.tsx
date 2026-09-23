"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Layers,
  GraduationCap,
  Users,
  Compass,
  FileQuestion,
  Clock,
  Eye,
  X,
} from "lucide-react";
import CourseEditorModal, { CourseData } from "@/components/CourseEditorModal";

interface FormattedCourse {
  id: string;
  title: string;
  code: string;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  isActive: boolean;
  order: number;
  subjectsCount: number;
  topicsCount: number;
  questionsCount: number;
  mockTestsCount: number;
  studentsCount: number;
}

interface AdminCoursesClientProps {
  initialCourses: FormattedCourse[];
  categories: { id: string; name: string }[];
}

export default function AdminCoursesClient({
  initialCourses,
  categories,
}: AdminCoursesClientProps) {
  const router = useRouter();

  const [courses, setCourses] = useState<FormattedCourse[]>(initialCourses);
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const filteredCourses = courses.filter((c) => {
    if (selectedCategoryFilter !== "ALL" && c.categoryId !== selectedCategoryFilter) return false;
    if (selectedStatusFilter === "ACTIVE" && !c.isActive) return false;
    if (selectedStatusFilter === "INACTIVE" && c.isActive) return false;
    if (
      search &&
      !c.title.toLowerCase().includes(search.toLowerCase()) &&
      !c.code.toLowerCase().includes(search.toLowerCase()) &&
      !c.categoryName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleToggleActive = async (course: FormattedCourse) => {
    const updatedStatus = !course.isActive;
    try {
      const res = await fetch("/api/admin/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: course.id, isActive: updatedStatus }),
      });

      if (res.ok) {
        setCourses((prev) =>
          prev.map((c) => (c.id === course.id ? { ...c, isActive: updatedStatus } : c))
        );
        router.refresh();
      }
    } catch {
      alert("Failed to update course status.");
    }
  };

  const handleDeleteCourse = async (course: FormattedCourse) => {
    if (!confirm(`Are you sure you want to delete or deactivate "${course.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/courses?id=${course.id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        if (data.deactivated) {
          setCourses((prev) =>
            prev.map((c) => (c.id === course.id ? { ...c, isActive: false } : c))
          );
          setSuccessMsg(data.message || "Course was deactivated.");
        } else {
          setCourses((prev) => prev.filter((c) => c.id !== course.id));
          setSuccessMsg("Course deleted permanently.");
        }
        router.refresh();
      } else {
        alert(data.error || "Failed to delete course.");
      }
    } catch {
      alert("Error deleting course.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {successMsg && (
        <div className="alert alert-success flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="btn btn-ghost btn-sm">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: "1.5rem" }}>Course & Examination Track Management</h1>
          <p className="text-sm text-muted">
            Configure courses, licensing exams, syllabus tracks, and control student access.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Course</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        <div className="card" style={{ padding: "1.25rem" }}>
          <div className="flex items-center justify-between text-muted mb-1 text-xs font-bold uppercase">
            <span>Total Courses</span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary)" }}>
            {courses.length}
          </div>
          <div className="text-xs text-muted mt-1">
            {courses.filter((c) => c.isActive).length} active preparation tracks
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div className="flex items-center justify-between text-muted mb-1 text-xs font-bold uppercase">
            <span>Categories</span>
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary)" }}>
            {categories.length}
          </div>
          <div className="text-xs text-muted mt-1">
            Engineering, Lok Sewa, Banking, etc.
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div className="flex items-center justify-between text-muted mb-1 text-xs font-bold uppercase">
            <span>Total Questions</span>
            <FileQuestion className="w-4 h-4 text-primary" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary)" }}>
            {courses.reduce((acc, c) => acc + c.questionsCount, 0)}
          </div>
          <div className="text-xs text-muted mt-1">
            Across all verified question banks
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div className="flex items-center justify-between text-muted mb-1 text-xs font-bold uppercase">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary)" }}>
            {courses.reduce((acc, c) => acc + c.studentsCount, 0)}
          </div>
          <div className="text-xs text-muted mt-1">
            Active candidate target registrations
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="card" style={{ padding: "1rem" }}>
        <div className="grid-filters-3">
          <div style={{ position: "relative" }}>
            <Search className="w-4 h-4 text-muted" style={{ position: "absolute", left: "10px", top: "11px" }} />
            <input
              type="text"
              placeholder="Search courses by title, code, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "38px" }}
            />
          </div>

          <div>
            <select
              className="form-select"
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              style={{ height: "38px" }}
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-select"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{ height: "38px" }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Tracks Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Course Track</th>
              <th>Category</th>
              <th>Curriculum (Subjects/Topics)</th>
              <th>MCQ Pool</th>
              <th>Mock Tests</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted">
                  No courses match your filter criteria. Click &quot;Add New Course&quot; to create one.
                </td>
              </tr>
            ) : (
              filteredCourses.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong style={{ fontSize: "0.95rem", color: "var(--color-primary)" }}>
                      {c.title}
                    </strong>
                    <div className="text-xs text-muted mt-0.5">
                      Code: <span className="font-mono">{c.code}</span>
                    </div>
                    {c.description && (
                      <div className="text-xs text-muted mt-1" style={{ maxWidth: "450px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-primary">{c.categoryName}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      {c.subjectsCount} Subjects
                    </div>
                    <div className="text-xs text-muted">
                      {c.topicsCount} Topics
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-basic">{c.questionsCount} questions</span>
                  </td>
                  <td>
                    <span className="badge badge-muted">{c.mockTestsCount} tests</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c)}
                      className={`badge cursor-pointer ${c.isActive ? "badge-success" : "badge-muted"}`}
                      title="Click to toggle Active / Inactive"
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/admin/syllabus`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "0.25rem 0.5rem", height: "30px" }}
                        title="View Course Syllabus"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Syllabus</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(c)}
                        className="btn btn-ghost btn-sm text-red-600"
                        style={{ padding: "0.25rem 0.5rem", height: "30px" }}
                        title="Deactivate / Delete Course"
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

      {/* Course Editor Modal */}
      <CourseEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCourseSaved={(savedCourse) => {
          setSuccessMsg(`Course "${savedCourse.name}" created / updated successfully!`);
          router.refresh();
        }}
      />
    </div>
  );
}
