import Link from "next/link";
import { db } from "@/lib/db";
import {
  HelpCircle,
  FileText,
  AlertTriangle,
  Upload,
  CreditCard,
  Users,
  CheckCircle2,
  Plus,
  ArrowRight,
} from "lucide-react";

export default async function AdminDashboardPage() {
  // Question statistics
  const totalQuestions = await db.question.count();
  const publishedQuestions = await db.question.count({ where: { status: "PUBLISHED" } });
  const draftQuestions = await db.question.count({ where: { status: "DRAFT" } });
  const basicCount = await db.question.count({ where: { difficulty: "BASIC" } });
  const intermediateCount = await db.question.count({ where: { difficulty: "INTERMEDIATE" } });
  const hardCount = await db.question.count({ where: { difficulty: "HARD" } });

  // Content reports
  const openReportsCount = await db.contentReport.count({ where: { status: "OPEN" } });
  const underReviewReportsCount = await db.contentReport.count({ where: { status: "UNDER_REVIEW" } });

  // Students & Access
  const studentCount = await db.user.count({ where: { role: "STUDENT" } });
  const activeEntitlementsCount = await db.entitlement.count({
    where: { isActive: true, validUntil: { gt: new Date() } },
  });

  // Financial totals
  const successfulOrders = await db.order.findMany({
    where: { status: "SUCCESS" },
    select: { amountNpr: true },
  });
  const totalRevenueNpr = successfulOrders.reduce((a, o) => a + o.amountNpr, 0);

  // Recent Import Jobs
  const recentImports = await db.importJob.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  // Exams with questions counts
  const exams = await db.exam.findMany({
    include: {
      _count: { select: { questionExams: true, mockTests: true } },
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Top Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: "1.5rem" }}>Curriculum & Platform Overview</h1>
          <p className="text-sm text-muted">
            Live system telemetry across question banks, syllabus coverage, reports, and purchases.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin/questions/new" className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            <span>Add Single Question</span>
          </Link>
          <Link href="/admin/questions/import" className="btn btn-secondary btn-sm">
            <Upload className="w-4 h-4" />
            <span>Excel Bulk Upload</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div className="card card-compact" style={{ borderLeft: "4px solid var(--color-primary)" }}>
          <span className="text-xs text-muted">Total Question Bank</span>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-primary)", marginTop: 4 }}>
            {totalQuestions}
          </div>
          <div className="text-xs text-muted mt-1">
            <span style={{ color: "var(--color-success)", fontWeight: 600 }}>{publishedQuestions} Published</span> • {draftQuestions} Drafts
          </div>
        </div>

        <div className="card card-compact" style={{ borderLeft: "4px solid var(--color-warning)" }}>
          <span className="text-xs text-muted">Unresolved Reports</span>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: openReportsCount > 0 ? "var(--color-warning)" : "var(--color-success)", marginTop: 4 }}>
            {openReportsCount}
          </div>
          <div className="text-xs text-muted mt-1">
            {underReviewReportsCount} currently under review
          </div>
        </div>

        <div className="card card-compact" style={{ borderLeft: "4px solid var(--color-accent)" }}>
          <span className="text-xs text-muted">Registered Students</span>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-accent)", marginTop: 4 }}>
            {studentCount}
          </div>
          <div className="text-xs text-muted mt-1">
            {activeEntitlementsCount} active premium passes
          </div>
        </div>

        <div className="card card-compact" style={{ borderLeft: "4px solid var(--color-success)" }}>
          <span className="text-xs text-muted">Verified Payment Revenue</span>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--color-success)", marginTop: 4 }}>
            NPR {totalRevenueNpr.toLocaleString()}
          </div>
          <div className="text-xs text-muted mt-1">
            {successfulOrders.length} verified orders
          </div>
        </div>
      </div>

      {/* Middle Grid: Question Difficulty & Exam Coverage */}
      <div className="grid-2-cols" style={{ gap: "1.5rem" }}>
        {/* Difficulty Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Difficulty Distribution</h3>
            <span className="badge badge-muted">{totalQuestions} Total</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Basic (Direct Recall):</span>
                <strong>{basicCount} ({totalQuestions > 0 ? Math.round((basicCount / totalQuestions) * 100) : 0}%)</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${totalQuestions > 0 ? (basicCount / totalQuestions) * 100 : 0}%`, backgroundColor: "#3B82F6" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Intermediate (Application & Reasoning):</span>
                <strong>{intermediateCount} ({totalQuestions > 0 ? Math.round((intermediateCount / totalQuestions) * 100) : 0}%)</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${totalQuestions > 0 ? (intermediateCount / totalQuestions) * 100 : 0}%`, backgroundColor: "#F59E0B" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Hard (Exam-level Multi-step):</span>
                <strong>{hardCount} ({totalQuestions > 0 ? Math.round((hardCount / totalQuestions) * 100) : 0}%)</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${totalQuestions > 0 ? (hardCount / totalQuestions) * 100 : 0}%`, backgroundColor: "#EF4444" }} />
              </div>
            </div>
          </div>

          <Link href="/admin/questions" className="btn btn-secondary btn-full btn-sm mt-6">
            Manage Question Bank &rarr;
          </Link>
        </div>

        {/* Exam Curriculum Coverage */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Exam Curriculum Coverage</h3>
            <span className="badge badge-primary">{exams.length} Tracks</span>
          </div>

          <div className="table-container mt-2">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Examination</th>
                  <th>Questions</th>
                  <th>Mock Tests</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <strong>{e.title}</strong>
                      <div className="text-xs text-muted">Code: {e.code}</div>
                    </td>
                    <td><span className="badge badge-basic">{e._count.questionExams} MCQs</span></td>
                    <td><span className="badge badge-accent">{e._count.mockTests} Tests</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Excel Bulk Uploads */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Excel Bulk Upload Jobs</h3>
            <p className="card-subtitle">
              All imported rows are staged as DRAFT until reviewed and published.
            </p>
          </div>
          <Link href="/admin/questions/import" className="btn btn-primary btn-sm">
            <span>New Excel Import</span>
            <Upload className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentImports.length === 0 ? (
          <div className="text-muted text-sm py-4 text-center">
            No Excel bulk import jobs recorded yet.
          </div>
        ) : (
          <div className="table-container mt-2">
            <table className="data-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Total Rows</th>
                  <th>Valid Rows</th>
                  <th>Invalid Rows</th>
                  <th>Status</th>
                  <th>Uploaded Date</th>
                </tr>
              </thead>
              <tbody>
                {recentImports.map((job) => (
                  <tr key={job.id}>
                    <td><strong>{job.filename}</strong></td>
                    <td>{job.totalRows}</td>
                    <td><span className="text-emerald-600 font-bold">{job.validRows}</span></td>
                    <td>
                      {job.invalidRows > 0 ? (
                        <span className="text-red-600 font-bold">{job.invalidRows}</span>
                      ) : (
                        <span>0</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${job.status === "COMMITTED" ? "badge-success" : "badge-intermediate"}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="text-xs text-muted">{new Date(job.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
