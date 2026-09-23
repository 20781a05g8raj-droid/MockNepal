"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetTargetExamButton({ examId }: { examId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSetTarget = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/set-target-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSetTarget}
      disabled={loading}
      className="btn btn-primary btn-sm"
      style={{ whiteSpace: "nowrap" }}
    >
      {loading ? "Setting..." : "Set as Target"}
    </button>
  );
}
