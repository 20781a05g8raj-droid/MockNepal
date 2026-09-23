"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
  XCircle,
  Check,
} from "lucide-react";

interface RowResult {
  rowNumber: number;
  raw: Record<string, any>;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ValidationData {
  jobId: string;
  filename: string;
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  rowResults: RowResult[];
}

export default function ExcelImportWizard() {
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [validationData, setValidationData] = useState<ValidationData | null>(null);
  const [error, setError] = useState("");
  const [committedCount, setCommittedCount] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    setValidating(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/excel/validate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to validate spreadsheet.");
        setValidating(false);
        return;
      }

      setValidationData(data);
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setValidating(false);
    }
  };

  const handleCommit = async () => {
    if (!validationData) return;
    setCommitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/excel/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: validationData.jobId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to commit questions.");
        setCommitting(false);
        return;
      }

      setCommittedCount(data.importedCount);
    } catch {
      setError("Network error while committing import.");
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Step Progress Tracker */}
      <div className="card card-compact" style={{ backgroundColor: "#FFFFFF" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", textAlign: "center", fontSize: "0.85rem" }}>
          <div style={{ fontWeight: 700, color: "var(--color-primary)" }}>
            1. Download Template
          </div>
          <div style={{ fontWeight: 700, color: file ? "var(--color-primary)" : "var(--color-text-muted)" }}>
            2. Upload Spreadsheet
          </div>
          <div style={{ fontWeight: 700, color: validationData ? "var(--color-primary)" : "var(--color-text-muted)" }}>
            3. Review Row Errors
          </div>
          <div style={{ fontWeight: 700, color: committedCount !== null ? "var(--color-success)" : "var(--color-text-muted)" }}>
            4. Confirm Draft Import
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* State 1 & 2: Template Download & File Upload */}
      {!validationData && committedCount === null && (
        <div className="card" style={{ border: "1.5px solid var(--color-border)" }}>
          <div className="card-header pb-3 mb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div>
              <span className="badge badge-primary mb-1">Spreadsheet Ingestion</span>
              <h2 style={{ fontSize: "1.25rem" }}>Bulk Question Upload (.xlsx)</h2>
            </div>
            <a
              href="/api/admin/excel/template"
              className="btn btn-secondary btn-sm"
              download
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official Template (.xlsx)</span>
            </a>
          </div>

          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
            Upload questions adhering to the 17-column PRD specification. Spreadsheets are validated on the server for valid foreign keys, four non-empty options, and required explanations. Formulas are ignored.
          </p>

          <div
            style={{
              border: "2px dashed var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "3rem 1.5rem",
              textAlign: "center",
              backgroundColor: "#F8FAFC",
              cursor: "pointer",
            }}
            onClick={() => document.getElementById("excelFileInput")?.click()}
          >
            <FileSpreadsheet className="w-12 h-12 text-primary mx-auto mb-3" />
            <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>
              {file ? file.name : "Click to browse or drop your .xlsx spreadsheet here"}
            </div>
            <span className="text-xs text-muted">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports Microsoft Excel (.xlsx) and plain .csv"}
            </span>

            <input
              id="excelFileInput"
              type="file"
              accept=".xlsx,.csv"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleValidate}
              disabled={!file || validating}
              className="btn btn-primary"
            >
              <Upload className="w-4 h-4" />
              <span>{validating ? "Validating Spreadsheet Rows..." : "Validate Spreadsheet"}</span>
            </button>
          </div>
        </div>
      )}

      {/* State 3: Row-by-Row Review Grid (PRD Section 9.5) */}
      {validationData && committedCount === null && (
        <div className="card" style={{ border: "1.5px solid var(--color-border)" }}>
          <div className="card-header pb-3 mb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div>
              <span className="badge badge-accent mb-1">Step 3 of 4: Validation Review</span>
              <h2 style={{ fontSize: "1.25rem" }}>Reviewing: {validationData.filename}</h2>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setValidationData(null);
                  setFile(null);
                }}
                className="btn btn-secondary btn-sm"
              >
                Cancel & Re-upload
              </button>

              <button
                type="button"
                onClick={handleCommit}
                disabled={committing || validationData.validRowsCount === 0}
                className="btn btn-primary btn-sm"
              >
                <span>{committing ? "Importing Drafts..." : `Import ${validationData.validRowsCount} Valid Rows as Drafts`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Validation Metrics Strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", backgroundColor: "#F8FAFC", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", marginBottom: "1.5rem", textAlign: "center" }}>
            <div>
              <span className="text-xs text-muted">Total Rows in Sheet</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text)" }}>
                {validationData.totalRows}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted">Valid Rows</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-success)" }}>
                {validationData.validRowsCount}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted">Invalid / Error Rows</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: validationData.invalidRowsCount > 0 ? "var(--color-error)" : "var(--color-success)" }}>
                {validationData.invalidRowsCount}
              </div>
            </div>
          </div>

          {validationData.invalidRowsCount > 0 && (
            <div className="alert alert-warning mb-4" style={{ fontSize: "0.85rem" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Attention:</strong> {validationData.invalidRowsCount} rows contain validation errors and will be skipped if you proceed. You can import the valid rows now or correct your spreadsheet and re-upload.
              </span>
            </div>
          )}

          {/* Row-by-Row Review Table */}
          <div className="table-container" style={{ maxHeight: "450px", overflowY: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "70px" }}>Row #</th>
                  <th>Status</th>
                  <th>Question Preview</th>
                  <th>Exam / Subject / Topic</th>
                  <th>Validation Feedback / Reason</th>
                </tr>
              </thead>
              <tbody>
                {validationData.rowResults.map((r) => (
                  <tr
                    key={r.rowNumber}
                    style={{ backgroundColor: r.isValid ? "#FFFFFF" : "var(--color-error-bg)" }}
                  >
                    <td><strong>Row {r.rowNumber}</strong></td>
                    <td>
                      {r.isValid ? (
                        <span className="badge badge-success flex items-center gap-1">
                          <Check className="w-3 h-3" /> Valid
                        </span>
                      ) : (
                        <span className="badge badge-hard flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Invalid
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "0.875rem" }}>
                        {r.raw.question || <em className="text-muted">Empty question text</em>}
                      </div>
                      <div className="text-xs text-muted">
                        Key: Option {r.raw.correct_option || "?"} • Diff: {r.raw.difficulty || "?"}
                      </div>
                    </td>
                    <td className="text-xs text-muted">
                      {r.raw.exam_code} &gt; {r.raw.subject_code} &gt; {r.raw.topic_code}
                    </td>
                    <td>
                      {r.errors.length > 0 ? (
                        <ul style={{ listStyle: "none", color: "var(--color-error)", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: 2 }}>
                          {r.errors.map((err, i) => (
                            <li key={i}>• {err}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--color-success)" }}>
                          ✓ Passed all validation checks
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* State 4: Confirmation & Import Success */}
      {committedCount !== null && (
        <div className="card text-center py-8" style={{ border: "2px solid var(--color-success)" }}>
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
          <h2 style={{ fontSize: "1.5rem", color: "var(--color-primary)" }}>
            Successfully Imported {committedCount} Questions as DRAFTS!
          </h2>
          <p className="text-muted text-sm mt-2 mb-6" style={{ maxWidth: "550px", margin: "0.5rem auto 1.5rem" }}>
            In accordance with PRD Section 9, imported questions remain in DRAFT status until an editor or administrator reviews and publishes them.
          </p>

          <div className="flex justify-center gap-3">
            <Link href="/admin/questions?status=DRAFT" className="btn btn-primary">
              Review Imported Drafts in Question Bank &rarr;
            </Link>
            <button
              type="button"
              onClick={() => {
                setCommittedCount(null);
                setValidationData(null);
                setFile(null);
              }}
              className="btn btn-secondary"
            >
              Upload Another Spreadsheet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
