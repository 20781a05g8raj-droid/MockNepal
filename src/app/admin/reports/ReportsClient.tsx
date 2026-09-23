"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Edit, XCircle, Clock } from "lucide-react";

interface ReportItem {
  id: string;
  reason: string;
  details: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
  questionId: string;
  questionText: string;
  subjectName: string;
  topicName: string;
}

export default function ReportsClient({ reports }: { reports: ReportItem[] }) {
  const router = useRouter();
  const [activeReport, setActiveReport] = useState<ReportItem | null>(reports[0] || null);
  const [selectedStatus, setSelectedStatus] = useState("OPEN");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const filteredReports = reports.filter((r) => {
    if (selectedStatus === "ALL") return true;
    return r.status === selectedStatus;
  });

  const handleUpdateStatus = async (newStatus: string) => {
    if (!activeReport) return;
    setUpdating(true);

    try {
      const res = await fetch("/api/admin/reports/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: activeReport.id,
          status: newStatus,
          adminNotes,
        }),
      });

      if (res.ok) {
        activeReport.status = newStatus;
        activeReport.adminNotes = adminNotes;
        router.refresh();
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }}>
      {/* Reports List */}
      <div className="card" style={{ padding: "1rem" }}>
        <div className="flex justify-between items-center mb-3">
          <h3 style={{ fontSize: "1.05rem" }}>Student Submissions</h3>
          <select
            className="form-select"
            style={{ width: "auto", padding: "0.25rem 0.5rem", fontSize: "0.8rem", height: "32px" }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted">
            No reports in this category.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {filteredReports.map((r) => {
              const isSelected = activeReport?.id === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setActiveReport(r);
                    setAdminNotes(r.adminNotes || "");
                  }}
                  style={{
                    textAlign: "left",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${isSelected ? "var(--color-primary)" : "var(--color-border)"}`,
                    backgroundColor: isSelected ? "var(--color-primary-subtle)" : "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="badge badge-primary" style={{ fontSize: "0.7rem" }}>
                      {r.reason}
                    </span>
                    <span
                      className={`badge ${
                        r.status === "OPEN"
                          ? "badge-intermediate"
                          : r.status === "RESOLVED"
                          ? "badge-success"
                          : "badge-muted"
                      }`}
                      style={{ fontSize: "0.7rem" }}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.questionText}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    By {r.userName} • {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Detail & Action Pane */}
      {activeReport ? (
        <div className="card" style={{ border: "1.5px solid var(--color-border)" }}>
          <div className="card-header pb-3 mb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div>
              <span className="badge badge-intermediate mb-1">Report Triage</span>
              <h3 style={{ fontSize: "1.15rem" }}>Category: {activeReport.reason}</h3>
            </div>
            <Link
              href={`/admin/questions/${activeReport.questionId}/edit`}
              className="btn btn-primary btn-sm"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Question / Key</span>
            </Link>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <span className="text-xs text-muted">Target Question:</span>
            <div style={{ fontWeight: 600, fontSize: "1rem", marginTop: 2, padding: "0.75rem", backgroundColor: "#F8FAFC", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
              {activeReport.questionText}
            </div>
            <div className="text-xs text-muted mt-1">
              {activeReport.subjectName} &gt; {activeReport.topicName}
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <span className="text-xs text-muted">Student Details / Citation Note:</span>
            <div style={{ padding: "0.75rem", backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "var(--radius-md)", fontSize: "0.9rem", color: "#92400E", marginTop: 2 }}>
              &ldquo;{activeReport.details}&rdquo;
            </div>
            <div className="text-xs text-muted mt-1">
              Submitted by: <strong>{activeReport.userName}</strong> ({activeReport.userEmail})
            </div>
          </div>

          {/* Editorial Notes */}
          <div className="form-group mb-6">
            <label className="form-label">Administrator Audit Note / Resolution Justification</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Record why this issue was resolved or dismissed (e.g. Verified against Constitution Article 27)..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-2 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
            <span className="text-xs text-muted">Status: {activeReport.status}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleUpdateStatus("UNDER_REVIEW")}
                disabled={updating}
                className="btn btn-secondary btn-sm"
              >
                Mark Under Review
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus("DISMISSED")}
                disabled={updating}
                className="btn btn-secondary btn-sm"
              >
                Dismiss Report
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus("RESOLVED")}
                disabled={updating}
                className="btn btn-primary btn-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center" style={{ padding: "3rem" }}>
          <AlertTriangle className="w-10 h-10 text-muted mx-auto mb-2" />
          <p className="text-muted">Select a report from the list to investigate and resolve.</p>
        </div>
      )}
    </div>
  );
}
