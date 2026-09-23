"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, ArrowRight, AlertCircle } from "lucide-react";

export default function StartTestButton({ testId }: { testId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedRules, setAcceptedRules] = useState(false);

  const handleStart = async () => {
    if (!acceptedRules) {
      setError("Please check the agreement box confirming you understand the examination rules.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/student/mock-tests/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start test attempt.");
        setLoading(false);
        return;
      }

      router.push(`/student/mock-tests/${testId}/attempt?attemptId=${data.attemptId}`);
    } catch {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <label className="flex items-start gap-2.5" style={{ cursor: "pointer", fontSize: "0.875rem" }}>
        <input
          type="checkbox"
          checked={acceptedRules}
          onChange={(e) => {
            setAcceptedRules(e.target.checked);
            if (e.target.checked) setError("");
          }}
          style={{ marginTop: 3 }}
        />
        <span style={{ color: "var(--color-text-subheading)", lineHeight: "1.5" }}>
          I have read and agree to the examination instructions. I understand that the timer cannot be paused, closing the window will not stop the timer, and unanswered questions will receive zero marks.
        </span>
      </label>

      <button
        type="button"
        onClick={handleStart}
        disabled={loading}
        className="btn btn-primary btn-lg"
        style={{ marginTop: "0.5rem" }}
      >
        <Play className="w-5 h-5" />
        <span>{loading ? "Starting Examination Shell..." : "Begin Examination Now"}</span>
      </button>
    </div>
  );
}
