"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Sparkles, BookOpen } from "lucide-react";

const DEMO_QUESTIONS = [
  {
    id: "demo-1",
    exam: "Lok Sewa Section Officer (शाखा अधिकृत)",
    subject: "General Knowledge & Contemporary Issues",
    topic: "Geography of Nepal",
    difficulty: "Basic",
    question: "नेपालको कुल क्षेत्रफल कति वर्ग किलोमिटर रहेको छ?",
    options: [
      { letter: "A", text: "१,४७,१८१ वर्ग कि.मि." },
      { letter: "B", text: "१,४७,५१६ वर्ग कि.मि." },
      { letter: "C", text: "१,४८,००० वर्ग कि.मि." },
      { letter: "D", text: "१,४६,१८१ वर्ग कि.मि." },
    ],
    correctOption: "B",
    explanation: "नेपाल सरकारद्वारा लिम्पियाधुरा, लिपुलेक र कालापानीसहितको नयाँ नक्सा जारी भएपछि नेपालको कुल क्षेत्रफल १,४७,५१६ वर्ग किलोमिटर कायम भएको छ।",
  },
  {
    id: "demo-2",
    exam: "Lok Sewa Section Officer (शाखा अधिकृत)",
    subject: "General Knowledge & Contemporary Issues",
    topic: "Constitution of Nepal & Federal Governance",
    difficulty: "Intermediate",
    question: "नेपालको संविधानको कुन धारामा 'सूचनाको हक' सम्बन्धी मौलिक हकको व्यवस्था गरिएको छ?",
    options: [
      { letter: "A", text: "धारा २५ (सम्पत्तिको हक)" },
      { letter: "B", text: "धारा २७ (सूचनाको हक)" },
      { letter: "C", text: "धारा २८ (गोपनीयताको हक)" },
      { letter: "D", text: "धारा २९ (शोषण विरुद्धको हक)" },
    ],
    correctOption: "B",
    explanation: "संविधानको धारा २७ मा सूचनाको हकको व्यवस्था गरिएको छ जसअनुसार प्रत्येक नागरिकलाई आफ्नो वा सार्वजनिक सरोकारको कुनै पनि विषयको सूचना माग्ने र पाउने हक हुनेछ।",
  },
  {
    id: "demo-3",
    exam: "Lok Sewa Section Officer (शाखा अधिकृत)",
    subject: "Public Governance & Civil Service System",
    topic: "Civil Service Act 2049",
    difficulty: "Basic",
    question: "निजामती सेवा ऐन, २०४९ अनुसार निजामती कर्मचारीको अनिवार्य अवकाश पाउने उमेर कति वर्ष तोकिएको छ?",
    options: [
      { letter: "A", text: "५८ वर्ष" },
      { letter: "B", text: "६० वर्ष" },
      { letter: "C", text: "५५ वर्ष" },
      { letter: "D", text: "६२ वर्ष" },
    ],
    correctOption: "A",
    explanation: "निजामती सेवा ऐन, २०४९ को दफा ३३ अनुसार निजामती कर्मचारीले ५८ वर्ष उमेर पुगेपछि अनिवार्य अवकाश पाउने व्यवस्था रहेको छ।",
  }
];

export default function DemoPracticePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const q = DEMO_QUESTIONS[currentIndex];

  const handleSelect = (letter: string) => {
    if (!isSubmitted) {
      setSelectedOption(letter);
    }
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    if (selectedOption === q.correctOption) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < DEMO_QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    }
  };

  const isLast = currentIndex === DEMO_QUESTIONS.length - 1;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <header style={{ height: "64px", backgroundColor: "#FFFFFF", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem" }}>
        <Link href="/" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Demo</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="badge badge-accent">Interactive Sample</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-primary)" }}>
            Question {currentIndex + 1} of {DEMO_QUESTIONS.length}
          </span>
        </div>
        <Link href="/register" className="btn btn-primary btn-sm">
          Create Full Account
        </Link>
      </header>

      {/* Main Container */}
      <main className="container-reading" style={{ marginTop: "2rem", marginBottom: "3rem", flexGrow: 1 }}>
        <div className="card" style={{ border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }}>
          {/* Metadata Bar */}
          <div className="flex justify-between items-center mb-4 pb-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div>
              <span className="badge badge-primary">{q.exam.split(" ")[0]}</span>
              <span className="badge badge-basic" style={{ marginLeft: "0.5rem" }}>{q.difficulty}</span>
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              {q.subject} &gt; {q.topic}
            </span>
          </div>

          {/* Question Text */}
          <h2 style={{ fontSize: "1.25rem", lineHeight: "1.5", marginBottom: "1.5rem", color: "var(--color-text)" }}>
            {q.question}
          </h2>

          {/* Option Rows */}
          <div role="radiogroup" aria-label="Question options">
            {q.options.map((opt) => {
              let stateClass = "";
              if (isSubmitted) {
                if (opt.letter === q.correctOption) {
                  stateClass = "correct";
                } else if (opt.letter === selectedOption) {
                  stateClass = "incorrect";
                }
              } else if (selectedOption === opt.letter) {
                stateClass = "selected";
              }

              return (
                <button
                  key={opt.letter}
                  type="button"
                  onClick={() => handleSelect(opt.letter)}
                  disabled={isSubmitted}
                  className={`option-row ${stateClass}`}
                  aria-checked={selectedOption === opt.letter}
                  role="radio"
                >
                  <span className="option-letter">{opt.letter}</span>
                  <span style={{ flexGrow: 1 }}>{opt.text}</span>
                  {isSubmitted && opt.letter === q.correctOption && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  {isSubmitted && opt.letter === selectedOption && selectedOption !== q.correctOption && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center mt-6 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              {isSubmitted ? (
                selectedOption === q.correctOption ? (
                  <span style={{ color: "var(--color-success)", fontWeight: 600 }}>Correct Answer!</span>
                ) : (
                  <span style={{ color: "var(--color-error)", fontWeight: 600 }}>Incorrect. Check explanation below.</span>
                )
              ) : (
                "Select one option and click Submit Answer"
              )}
            </span>

            {!isSubmitted ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedOption}
                className="btn btn-primary"
              >
                Submit Answer
              </button>
            ) : !isLast ? (
              <button type="button" onClick={handleNext} className="btn btn-accent">
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link href="/register" className="btn btn-primary">
                <span>Finish & Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Explanation Reveal */}
          {isSubmitted && (
            <div className="alert alert-info mt-6" style={{ display: "block" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.25rem", color: "var(--color-primary)" }}>
                Official Verified Explanation
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--color-text-subheading)", lineHeight: "1.6" }}>
                {q.explanation}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
