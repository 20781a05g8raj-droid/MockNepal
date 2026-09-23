"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export default function TopicCheckbox({
  topicId,
  initialCompleted,
}: {
  topicId: string;
  initialCompleted: boolean;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const nextState = !completed;
    setCompleted(nextState);
    setLoading(true);

    try {
      await fetch("/api/student/topic-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, isMarkedCompleted: nextState }),
      });
      router.refresh();
    } catch {
      setCompleted(!nextState); // rollback
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`btn btn-sm ${completed ? "btn-accent" : "btn-secondary"}`}
      style={{ minHeight: "32px", padding: "0.2rem 0.6rem", fontSize: "0.75rem" }}
      title={completed ? "Marked completed (Click to uncheck)" : "Click to mark completed"}
    >
      {completed ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>Completed</span>
        </>
      ) : (
        <span>Mark Complete</span>
      )}
    </button>
  );
}
