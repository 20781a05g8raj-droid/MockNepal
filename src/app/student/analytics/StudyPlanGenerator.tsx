"use client";

import { useState } from "react";
import { Calendar, Clock, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface WeakTopicItem {
  topicName: string;
  subjectName: string;
  status: string;
  accuracy: number | null;
}

export default function StudyPlanGenerator({
  weakTopics,
  unfinishedTopicsCount,
  revisionDueCount,
}: {
  weakTopics: WeakTopicItem[];
  unfinishedTopicsCount: number;
  revisionDueCount: number;
}) {
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [targetExamWeeks, setTargetExamWeeks] = useState(8);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    // Deterministic rule calculation (PRD Section 16.3):
    // 1. Reserve 25% of daily time for Spaced Revision
    const revisionMinutes = Math.round(dailyMinutes * 0.25);
    const learningMinutes = dailyMinutes - revisionMinutes;

    // 2. Average topic takes ~40 minutes
    const totalDays = targetExamWeeks * 7;
    const studyDays = targetExamWeeks * 6; // 1 rest day / week
    const totalAvailableStudyHours = Math.round((dailyMinutes * studyDays) / 60);

    // Prioritize weak topics first, then unfinished topics
    const highPriorityTopics = weakTopics.filter((t) => t.status === "NEEDS_IMPROVEMENT");
    const mediumPriorityTopics = weakTopics.filter((t) => t.status === "DEVELOPING");

    setGeneratedPlan({
      dailyMinutes,
      studyDays,
      revisionMinutes,
      learningMinutes,
      totalAvailableStudyHours,
      highPriorityCount: highPriorityTopics.length,
      mediumPriorityCount: mediumPriorityTopics.length,
      isWorkloadFeasible: unfinishedTopicsCount * 40 <= totalAvailableStudyHours * 60,
    });
  };

  return (
    <div className="card" style={{ border: "1.5px solid var(--color-border)" }}>
      <div className="card-header">
        <div>
          <span className="badge badge-accent mb-1">Deterministic Planning</span>
          <h3 className="card-title">Rule-Based Personalized Study Plan</h3>
        </div>
      </div>

      <form onSubmit={handleGenerate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="form-group">
          <label className="form-label">Daily Available Study Time</label>
          <select
            className="form-select"
            value={dailyMinutes}
            onChange={(e) => setDailyMinutes(parseInt(e.target.value, 10))}
          >
            <option value={30}>30 minutes / day</option>
            <option value={45}>45 minutes / day</option>
            <option value={60}>60 minutes / day (Recommended)</option>
            <option value={90}>90 minutes / day</option>
            <option value={120}>2 hours / day (Intensive)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Target Exam Horizon</label>
          <select
            className="form-select"
            value={targetExamWeeks}
            onChange={(e) => setTargetExamWeeks(parseInt(e.target.value, 10))}
          >
            <option value={4}>4 weeks (1 month sprint)</option>
            <option value={8}>8 weeks (2 months comprehensive)</option>
            <option value={12}>12 weeks (3 months standard)</option>
            <option value={24}>24 weeks (6 months long term)</option>
          </select>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" className="btn btn-primary btn-full btn-sm">
            Generate Transparent Weekly Schedule
          </button>
        </div>
      </form>

      {generatedPlan && (
        <div style={{ backgroundColor: "#F8FAFC", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
          <div className="flex justify-between items-center mb-3">
            <h4 style={{ fontSize: "1rem" }}>Your Recommended Daily Workload Distribution</h4>
            <span className="badge badge-primary">{generatedPlan.dailyMinutes} mins / day</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div style={{ padding: "0.75rem", backgroundColor: "#FFFFFF", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
              <div className="text-xs text-muted">Daily Spaced Revision (25%)</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-warning)" }}>
                {generatedPlan.revisionMinutes} mins
              </div>
              <div className="text-xs text-muted mt-0.5">Clearing mistake notebook items</div>
            </div>

            <div style={{ padding: "0.75rem", backgroundColor: "#FFFFFF", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
              <div className="text-xs text-muted">Syllabus Learning & MCQs (75%)</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-primary)" }}>
                {generatedPlan.learningMinutes} mins
              </div>
              <div className="text-xs text-muted mt-0.5">Covering weak & unfinished topics</div>
            </div>
          </div>

          {generatedPlan.highPriorityCount > 0 ? (
            <div className="alert alert-warning" style={{ fontSize: "0.85rem", marginBottom: 0 }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>{generatedPlan.highPriorityCount} Weak Topics Detected (&lt;50% accuracy):</strong> Your schedule prioritizes these topics before proceeding to new chapters.
              </span>
            </div>
          ) : (
            <div className="alert alert-success" style={{ fontSize: "0.85rem", marginBottom: 0 }}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>
                No critical weak topics (&lt;50%) currently detected. Your plan balances standard syllabus progression with spaced revision.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
