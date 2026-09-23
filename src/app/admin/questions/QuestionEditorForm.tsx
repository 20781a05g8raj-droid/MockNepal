"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  CheckCircle2,
  Eye,
  ArrowLeft,
  AlertTriangle,
  Plus,
  Radio,
  Layers,
  Edit3,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  Check,
  SlidersHorizontal,
  LayoutGrid,
  Shuffle,
} from "lucide-react";
import CourseEditorModal from "@/components/CourseEditorModal";

interface OptionChoice {
  id: string;
  name: string;
}

interface QuestionEditorProps {
  exams: OptionChoice[];
  subjects: OptionChoice[];
  topics: { id: string; name: string; subjectId: string }[];
  initialData?: any;
}

export default function QuestionEditorForm({
  exams,
  subjects,
  topics,
  initialData,
}: QuestionEditorProps) {
  const router = useRouter();

  const [examList, setExamList] = useState<OptionChoice[]>(exams);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Target Exams
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>(
    initialData?.examIds || (exams[0]?.id ? [exams[0].id] : [])
  );

  // Examination Tracks Slider Controls
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [viewMode, setViewMode] = useState<"slider" | "wrap">("slider");

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [examList, viewMode]);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el || viewMode !== "slider") return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        checkScroll();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [viewMode, examList]);

  const slide = (dir: "left" | "right") => {
    if (sliderRef.current) {
      const distance = 300;
      sliderRef.current.scrollBy({
        left: dir === "left" ? -distance : distance,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 320);
    }
  };

  // Subject: Select existing OR type custom
  const [isCustomSubject, setIsCustomSubject] = useState<boolean>(false);
  const [subjectId, setSubjectId] = useState<string>(
    initialData?.subjectId || subjects[0]?.id || ""
  );
  const [customSubjectName, setCustomSubjectName] = useState<string>("");

  // Topics filtered by subject
  const filteredTopics = topics.filter((t) => t.subjectId === subjectId);

  // Topic: Select existing OR type custom
  const [isCustomTopic, setIsCustomTopic] = useState<boolean>(false);
  const [topicId, setTopicId] = useState<string>(
    initialData?.topicId || filteredTopics[0]?.id || ""
  );
  const [customTopicName, setCustomTopicName] = useState<string>("");

  // Difficulty
  const [difficulty, setDifficulty] = useState<string>(
    initialData?.difficulty || "INTERMEDIATE"
  );

  // Language: Presets OR type custom
  const presetLanguages = ["NEPALI", "ENGLISH", "BOTH"];
  const isInitialLangCustom =
    initialData?.language && !presetLanguages.includes(initialData.language);
  const [isCustomLanguage, setIsCustomLanguage] = useState<boolean>(
    Boolean(isInitialLangCustom)
  );
  const [language, setLanguage] = useState<string>(
    initialData?.language && presetLanguages.includes(initialData.language)
      ? initialData.language
      : "NEPALI"
  );
  const [customLanguage, setCustomLanguage] = useState<string>(
    isInitialLangCustom ? initialData.language : ""
  );

  // Question Type: Presets OR type custom
  const presetTypes = ["MODEL", "PREVIOUS_YEAR", "CURRENT_AFFAIRS", "CASE_STUDY"];
  const isInitialTypeCustom =
    initialData?.questionType && !presetTypes.includes(initialData.questionType);
  const [isCustomType, setIsCustomType] = useState<boolean>(
    Boolean(isInitialTypeCustom)
  );
  const [questionType, setQuestionType] = useState<string>(
    initialData?.questionType && presetTypes.includes(initialData.questionType)
      ? initialData.questionType
      : "MODEL"
  );
  const [customType, setCustomType] = useState<string>(
    isInitialTypeCustom ? initialData.questionType : ""
  );

  // Additional Meta
  const [examYear, setExamYear] = useState<string>(initialData?.examYear || "");
  const [source, setSource] = useState<string>(initialData?.source || "");
  const [accessLevel, setAccessLevel] = useState<string>(
    initialData?.accessLevel || "FREE"
  );

  // Question Stem & 4 Options
  const [questionText, setQuestionText] = useState<string>(
    initialData?.questionText || ""
  );
  const [optionA, setOptionA] = useState<string>(initialData?.optionA || "");
  const [optionB, setOptionB] = useState<string>(initialData?.optionB || "");
  const [optionC, setOptionC] = useState<string>(initialData?.optionC || "");
  const [optionD, setOptionD] = useState<string>(initialData?.optionD || "");
  const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D">(
    initialData?.correctOption || "A"
  );
  const [explanation, setExplanation] = useState<string>(
    initialData?.explanation || ""
  );

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const effectiveSubjectDisplay = isCustomSubject
    ? customSubjectName || "Custom Subject"
    : subjects.find((s) => s.id === subjectId)?.name || "Subject";

  const effectiveTopicDisplay = isCustomTopic
    ? customTopicName || "Custom Topic"
    : topics.find((t) => t.id === topicId)?.name || "Topic";

  const effectiveLanguageDisplay = isCustomLanguage
    ? customLanguage || "Custom Language"
    : language;

  const effectiveTypeDisplay = isCustomType
    ? customType || "Custom Type"
    : questionType;

  const shuffleOptions = () => {
    if (!optionA.trim() && !optionB.trim() && !optionC.trim() && !optionD.trim()) return;
    const currentOptions = [
      { text: optionA, isCorrect: correctOption === "A" },
      { text: optionB, isCorrect: correctOption === "B" },
      { text: optionC, isCorrect: correctOption === "C" },
      { text: optionD, isCorrect: correctOption === "D" },
    ];
    // Fisher-Yates shuffle
    for (let i = currentOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentOptions[i], currentOptions[j]] = [currentOptions[j], currentOptions[i]];
    }
    const letters: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
    const newCorrectIndex = currentOptions.findIndex((o) => o.isCorrect);
    setOptionA(currentOptions[0].text);
    setOptionB(currentOptions[1].text);
    setOptionC(currentOptions[2].text);
    setOptionD(currentOptions[3].text);
    if (newCorrectIndex !== -1) {
      setCorrectOption(letters[newCorrectIndex]);
    }
  };

  const handleSave = async (
    publishStatus: "DRAFT" | "PUBLISHED",
    addNext: boolean = false
  ) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    if (isCustomSubject && !customSubjectName.trim()) {
      setError("Please write the custom Subject name.");
      setLoading(false);
      return;
    }

    if (isCustomTopic && !customTopicName.trim()) {
      setError("Please write the custom Topic name.");
      setLoading(false);
      return;
    }

    if (isCustomLanguage && !customLanguage.trim()) {
      setError("Please enter the custom Language name.");
      setLoading(false);
      return;
    }

    if (isCustomType && !customType.trim()) {
      setError("Please enter the custom Question Type.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/questions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: initialData?.id || initialData?.questionId,
          examIds: selectedExamIds,
          subjectId: isCustomSubject ? "" : subjectId,
          customSubjectName: isCustomSubject ? customSubjectName.trim() : "",
          topicId: isCustomTopic ? "" : (topicId || filteredTopics[0]?.id),
          customTopicName: isCustomTopic ? customTopicName.trim() : "",
          difficulty,
          language: isCustomLanguage ? customLanguage.trim() : language,
          questionType: isCustomType ? customType.trim() : questionType,
          examYear,
          source,
          accessLevel,
          status: publishStatus,
          questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          correctOption,
          explanation,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save question.");
        setLoading(false);
        return;
      }

      if (addNext) {
        setSuccessMsg("Question saved successfully! Ready for next question.");
        setQuestionText("");
        setOptionA("");
        setOptionB("");
        setOptionC("");
        setOptionD("");
        setExplanation("");
        setLoading(false);
      } else {
        router.push("/admin/questions");
        router.refresh();
      }
    } catch {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  };

  return (
    <div
      className={showPreview ? "question-editor-layout" : ""}
      style={{
        gap: "1.5rem",
        minWidth: 0,
        maxWidth: "100%",
        display: showPreview ? undefined : "block",
      }}
    >
      {/* Editor Main Form */}
      <div
        className="card"
        style={{
          border: "1.5px solid var(--color-border)",
          minWidth: 0,
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <div
          className="flex justify-between items-center pb-3 mb-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div>
            <h2 style={{ fontSize: "1.25rem" }}>
              {initialData ? "Edit Question & Create Version" : "Create Individual MCQ"}
            </h2>
            <p className="text-xs text-muted mt-1">
              Admin can select existing curriculum or freely write custom Subject, Topic, Language & Type.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="btn btn-secondary btn-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showPreview ? "Hide Student Preview" : "Live Student Preview"}</span>
          </button>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}
        {successMsg && <div className="alert alert-success mb-4">{successMsg}</div>}

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Section 1: Academic Classification */}
          <div
            style={{
              marginBottom: "1.75rem",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid var(--color-border)",
              minWidth: 0,
              maxWidth: "100%",
            }}
          >
            <span className="badge badge-primary mb-2">1. Academic Classification</span>

            {/* Target Exam Selection with Slider */}
            <div className="form-group mb-3" style={{ minWidth: 0, maxWidth: "100%" }}>
              <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <label className="form-label" style={{ marginBottom: 0, fontWeight: 700 }}>
                    Target Examination Track(s)
                  </label>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      backgroundColor: selectedExamIds.length > 0 ? "rgba(37, 99, 235, 0.1)" : "#F1F5F9",
                      color: selectedExamIds.length > 0 ? "var(--color-primary)" : "#64748B",
                      fontWeight: 600,
                    }}
                  >
                    {selectedExamIds.length} Selected
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Slider Scroll Left/Right Arrows */}
                  {viewMode === "slider" && (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        backgroundColor: "#F1F5F9",
                        padding: "2px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => slide("left")}
                        disabled={!canScrollLeft}
                        className="p-1 rounded hover:bg-white text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Slide Left"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "#94A3B8",
                          padding: "0 4px",
                          userSelect: "none",
                          letterSpacing: "0.5px",
                        }}
                      >
                        SLIDE
                      </span>
                      <button
                        type="button"
                        onClick={() => slide("right")}
                        disabled={!canScrollRight}
                        className="p-1 rounded hover:bg-white text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Slide Right"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Toggle Mode: Slide vs Wrap */}
                  <button
                    type="button"
                    onClick={() => setViewMode(viewMode === "slider" ? "wrap" : "slider")}
                    className="btn btn-ghost btn-sm"
                    style={{
                      fontSize: "0.74rem",
                      padding: "3px 8px",
                      height: "auto",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "#FFFFFF",
                    }}
                    title={viewMode === "slider" ? "Switch to Multi-row Wrap view" : "Switch to Single-line Slider view"}
                  >
                    {viewMode === "slider" ? (
                      <span className="flex items-center gap-1 text-slate-600">
                        <LayoutGrid className="w-3 h-3" /> Wrap
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-600">
                        <SlidersHorizontal className="w-3 h-3" /> Slide
                      </span>
                    )}
                  </button>

                  {/* Course Manager Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsCourseModalOpen(true)}
                    className="btn btn-ghost btn-sm"
                    style={{
                      fontSize: "0.76rem",
                      padding: "3px 10px",
                      height: "auto",
                      color: "var(--color-primary)",
                      fontWeight: 700,
                      border: "1px dashed var(--color-primary)",
                      backgroundColor: "rgba(37, 99, 235, 0.05)",
                    }}
                    title="Add a new course or edit existing tracks"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>➕ Add / Edit Courses</span>
                  </button>
                </div>
              </div>

              {/* Slider Track or Wrap Layout */}
              <div
                style={{
                  position: "relative",
                  minWidth: 0,
                  maxWidth: "100%",
                  backgroundColor: "#F8FAFC",
                  padding: "6px 8px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {viewMode === "slider" ? (
                  <>
                    {/* Left & Right gradient edge masks when scrollable */}
                    {canScrollLeft && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: "30px",
                          background: "linear-gradient(to right, rgba(248, 250, 252, 0.95), transparent)",
                          zIndex: 2,
                          pointerEvents: "none",
                          borderTopLeftRadius: "var(--radius-md)",
                          borderBottomLeftRadius: "var(--radius-md)",
                        }}
                      />
                    )}
                    {canScrollRight && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: "30px",
                          background: "linear-gradient(to left, rgba(248, 250, 252, 0.95), transparent)",
                          zIndex: 2,
                          pointerEvents: "none",
                          borderTopRightRadius: "var(--radius-md)",
                          borderBottomRightRadius: "var(--radius-md)",
                        }}
                      />
                    )}

                    <div
                      ref={sliderRef}
                      onScroll={checkScroll}
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        overflowX: "auto",
                        scrollBehavior: "smooth",
                        padding: "4px 2px",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        minWidth: 0,
                        maxWidth: "100%",
                      }}
                    >
                      {examList.map((exam) => {
                        const isChecked = selectedExamIds.includes(exam.id);
                        return (
                          <button
                            type="button"
                            key={exam.id}
                            onClick={() => {
                              if (isChecked) {
                                setSelectedExamIds(selectedExamIds.filter((id) => id !== exam.id));
                              } else {
                                setSelectedExamIds([...selectedExamIds, exam.id]);
                              }
                            }}
                            className={`btn btn-sm ${isChecked ? "btn-primary" : "btn-secondary"}`}
                            style={{
                              fontSize: "0.78rem",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              borderRadius: "9999px",
                              padding: "5px 12px",
                              transition: "all 0.15s ease",
                              boxShadow: isChecked ? "0 2px 6px rgba(15, 23, 42, 0.15)" : "none",
                              border: isChecked ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                              backgroundColor: isChecked ? "var(--color-primary)" : "#FFFFFF",
                            }}
                          >
                            {isChecked ? (
                              <Check className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  backgroundColor: "#CBD5E1",
                                }}
                              />
                            )}
                            <span>{exam.name}</span>
                          </button>
                        );
                      })}

                      {/* Quick + Add chip at end of track */}
                      <button
                        type="button"
                        onClick={() => setIsCourseModalOpen(true)}
                        className="btn btn-ghost btn-sm"
                        style={{
                          fontSize: "0.76rem",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          borderRadius: "9999px",
                          padding: "5px 12px",
                          border: "1px dashed var(--color-border)",
                          backgroundColor: "#FFFFFF",
                          color: "var(--color-primary)",
                          fontWeight: 600,
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Track</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* Wrap Multi-row Mode */
                  <div className="flex flex-wrap gap-2 py-1">
                    {examList.map((exam) => {
                      const isChecked = selectedExamIds.includes(exam.id);
                      return (
                        <button
                          type="button"
                          key={exam.id}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedExamIds(selectedExamIds.filter((id) => id !== exam.id));
                            } else {
                              setSelectedExamIds([...selectedExamIds, exam.id]);
                            }
                          }}
                          className={`btn btn-sm ${isChecked ? "btn-primary" : "btn-secondary"}`}
                          style={{
                            fontSize: "0.78rem",
                            borderRadius: "9999px",
                            padding: "5px 12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            border: isChecked ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                            backgroundColor: isChecked ? "var(--color-primary)" : "#FFFFFF",
                          }}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                          <span>{exam.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Subject & Topic with Custom Typing Support */}
            <div className="grid-2-cols" style={{ gap: "1.25rem", marginTop: "1rem" }}>
              {/* SUBJECT FIELD */}
              <div className="form-group" style={{ backgroundColor: "#F8FAFC", padding: "0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="form-label" style={{ marginBottom: 0, fontWeight: 700 }}>
                    Subject (विषय)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomSubject(!isCustomSubject)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: "0.75rem", padding: "2px 8px", height: "auto" }}
                  >
                    {isCustomSubject ? (
                      <span className="flex items-center gap-1 text-primary">
                        <ListFilter className="w-3 h-3" /> Select Existing
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-teal-700 font-semibold">
                        <Edit3 className="w-3 h-3" /> ➕ Write Custom Subject
                      </span>
                    )}
                  </button>
                </div>

                {isCustomSubject ? (
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Type custom subject name (e.g. Banking Laws, Constitution)..."
                      value={customSubjectName}
                      onChange={(e) => setCustomSubjectName(e.target.value)}
                      className="form-input"
                      style={{ borderColor: "var(--color-accent)" }}
                    />
                    <span className="text-xs text-muted mt-1 block">
                      A new subject will be automatically created and categorized in the syllabus.
                    </span>
                  </div>
                ) : (
                  <select
                    className="form-select"
                    value={subjectId}
                    onChange={(e) => {
                      setSubjectId(e.target.value);
                      const newFiltered = topics.filter((t) => t.subjectId === e.target.value);
                      setTopicId(newFiltered[0]?.id || "");
                    }}
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* TOPIC FIELD */}
              <div className="form-group" style={{ backgroundColor: "#F8FAFC", padding: "0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="form-label" style={{ marginBottom: 0, fontWeight: 700 }}>
                    Topic (शीर्षक)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomTopic(!isCustomTopic)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: "0.75rem", padding: "2px 8px", height: "auto" }}
                  >
                    {isCustomTopic ? (
                      <span className="flex items-center gap-1 text-primary">
                        <ListFilter className="w-3 h-3" /> Select Existing
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-teal-700 font-semibold">
                        <Edit3 className="w-3 h-3" /> ➕ Write Custom Topic
                      </span>
                    )}
                  </button>
                </div>

                {isCustomTopic ? (
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Type custom topic name (e.g. Article 285, Foreign Exchange Act)..."
                      value={customTopicName}
                      onChange={(e) => setCustomTopicName(e.target.value)}
                      className="form-input"
                      style={{ borderColor: "var(--color-accent)" }}
                    />
                    <span className="text-xs text-muted mt-1 block">
                      A new topic will be automatically added under the chosen subject.
                    </span>
                  </div>
                ) : (
                  <select
                    className="form-select"
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                  >
                    {filteredTopics.length === 0 ? (
                      <option value="">No existing topics for this subject</option>
                    ) : (
                      filteredTopics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>
            </div>

            {/* Difficulty, Language, Question Type */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1rem" }}>
              {/* Difficulty */}
              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select
                  className="form-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="BASIC">Basic (Recall)</option>
                  <option value="INTERMEDIATE">Intermediate (Reasoning)</option>
                  <option value="HARD">Hard (Multi-step)</option>
                </select>
              </div>

              {/* Language with Custom Option */}
              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label" style={{ marginBottom: 0 }}>Language (भाषा)</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomLanguage(!isCustomLanguage)}
                    className="text-xs text-teal-700 font-semibold"
                  >
                    {isCustomLanguage ? "Presets" : "+ Custom"}
                  </button>
                </div>
                {isCustomLanguage ? (
                  <input
                    type="text"
                    placeholder="e.g. Maithili, Bhojpuri, Newari..."
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    className="form-input"
                  />
                ) : (
                  <select
                    className="form-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="NEPALI">Nepali (नेपाली)</option>
                    <option value="ENGLISH">English</option>
                    <option value="BOTH">Bilingual (उभय)</option>
                  </select>
                )}
              </div>

              {/* Question Type with Custom Option */}
              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label" style={{ marginBottom: 0 }}>Question Type (प्रकार)</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomType(!isCustomType)}
                    className="text-xs text-teal-700 font-semibold"
                  >
                    {isCustomType ? "Presets" : "+ Custom"}
                  </button>
                </div>
                {isCustomType ? (
                  <input
                    type="text"
                    placeholder="e.g. Past Paper 2080, Special Practice..."
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="form-input"
                  />
                ) : (
                  <select
                    className="form-select"
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                  >
                    <option value="MODEL">Model Question</option>
                    <option value="PREVIOUS_YEAR">Previous-Year Question</option>
                    <option value="CURRENT_AFFAIRS">Current Affairs</option>
                    <option value="CASE_STUDY">Case Study / Practical</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Question & Four Options */}
          <div
            style={{
              marginBottom: "1.75rem",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
              <span className="badge badge-primary">2. Question & Four Options</span>
              <button
                type="button"
                onClick={shuffleOptions}
                className="btn btn-ghost btn-sm"
                style={{
                  fontSize: "0.78rem",
                  padding: "4px 12px",
                  height: "auto",
                  border: "1px dashed #6366F1",
                  color: "#4F46E5",
                  backgroundColor: "#EEF2FF",
                  fontWeight: 600,
                  borderRadius: "9999px",
                }}
                title="Randomly shuffle options A, B, C, D and automatically update the correct answer key"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>🎲 Shuffle Options Randomly</span>
              </button>
            </div>

            <div className="form-group mt-2">
              <label className="form-label">Question Text (Devanagari or English)</label>
              <textarea
                required
                className="form-textarea"
                rows={3}
                placeholder="Enter complete question stem..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
              {(["A", "B", "C", "D"] as const).map((letter) => {
                const val = letter === "A" ? optionA : letter === "B" ? optionB : letter === "C" ? optionC : optionD;
                const setVal = letter === "A" ? setOptionA : letter === "B" ? setOptionB : letter === "C" ? setOptionC : setOptionD;
                const isCorrect = correctOption === letter;

                return (
                  <div key={letter} className="flex items-center gap-2">
                    <span
                      className="option-letter"
                      style={{
                        width: 36,
                        height: 36,
                        backgroundColor: isCorrect ? "var(--color-primary)" : "#F1F5F9",
                        color: isCorrect ? "#FFFFFF" : "var(--color-text-main)",
                        fontWeight: 700,
                        border: isCorrect ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      }}
                    >
                      {letter}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${letter} text...`}
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                      className="form-input flex-1"
                      style={{
                        borderColor: isCorrect ? "var(--color-primary)" : undefined,
                        backgroundColor: isCorrect ? "rgba(37, 99, 235, 0.02)" : undefined,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setCorrectOption(letter)}
                      className="btn btn-sm"
                      style={{
                        fontSize: "0.75rem",
                        padding: "4px 10px",
                        whiteSpace: "nowrap",
                        borderRadius: "9999px",
                        backgroundColor: isCorrect ? "rgba(16, 185, 129, 0.15)" : "#F8FAFC",
                        color: isCorrect ? "#065F46" : "#64748B",
                        border: isCorrect ? "1px solid #10B981" : "1px solid var(--color-border)",
                        fontWeight: isCorrect ? 700 : 500,
                      }}
                      title={`Mark Option ${letter} as the correct answer`}
                    >
                      {isCorrect ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Correct
                        </span>
                      ) : (
                        <span>Mark Correct</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Correct Answer Key & Solution */}
          <div
            style={{
              marginBottom: "1.75rem",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <span className="badge badge-primary mb-2">3. Correct Answer Key & Verified Solution</span>

            <div className="form-group mt-2">
              <label className="form-label">Correct Option Selection</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                {(["A", "B", "C", "D"] as const).map((opt) => (
                  <label
                    key={opt}
                    className={`card card-compact flex items-center justify-center gap-2 cursor-pointer ${
                      correctOption === opt ? "border-primary bg-primary-subtle" : ""
                    }`}
                    style={{
                      border: correctOption === opt ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      padding: "0.75rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="correctOption"
                      value={opt}
                      checked={correctOption === opt}
                      onChange={() => setCorrectOption(opt)}
                    />
                    <strong style={{ fontSize: "1.1rem" }}>Option {opt}</strong>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group mt-4">
              <label className="form-label">
                Official Explanation & Legislative Reference (व्याख्या तथा स्रोत)
              </label>
              <textarea
                rows={3}
                placeholder="Cite official constitution article, section number, official gazette, or academic derivation..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="form-textarea"
              />
            </div>
          </div>

          {/* Section 4: Reference Attribution & Access */}
          <div
            style={{
              marginBottom: "1.75rem",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <span className="badge badge-muted mb-2">4. Reference Attribution & Access</span>

            <div className="grid-2-cols" style={{ gap: "1rem", marginTop: "0.75rem" }}>
              <div className="form-group">
                <label className="form-label">Source Reference / Citation</label>
                <input
                  type="text"
                  placeholder="e.g. Nepal Gazette / Section Officer 2080"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="form-input"
                />
              </div>

              {(questionType === "PREVIOUS_YEAR" || isCustomType) && (
                <div className="form-group">
                  <label className="form-label">Exam Year (BS / AD)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2080"
                    value={examYear}
                    onChange={(e) => setExamYear(e.target.value)}
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Access Level</label>
                <select
                  className="form-select"
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                >
                  <option value="FREE">Free Tier Question</option>
                  <option value="PREMIUM">Premium Package Question</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Publication Actions */}
          <div className="flex justify-between items-center gap-3 pt-2">
            <Link href="/admin/questions" className="btn btn-secondary">
              <ArrowLeft className="w-4 h-4" />
              <span>Cancel</span>
            </Link>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSave("DRAFT", false)}
                disabled={loading}
                className="btn btn-secondary"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSave("DRAFT", true)}
                disabled={loading}
                className="btn btn-secondary"
              >
                Save Draft & Add Next
              </button>
              <button
                type="button"
                onClick={() => handleSave("PUBLISHED", false)}
                disabled={loading}
                className="btn btn-primary"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Publish</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* COURSE EDITOR MODAL (Mounted outside form to avoid HTML nested form violation) */}
      <CourseEditorModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onCourseSaved={(savedCourse) => {
          setExamList((prev) => {
            const exists = prev.some((e) => e.id === savedCourse.id);
            if (exists) {
              return prev.map((e) => (e.id === savedCourse.id ? { ...e, name: savedCourse.name } : e));
            }
            return [...prev, savedCourse];
          });
          setSelectedExamIds((prev) => Array.from(new Set([...prev, savedCourse.id])));
        }}
      />

      {/* Live Student Preview Drawer / Column */}
      {showPreview && (
        <div className="card" style={{ border: "2px dashed var(--color-primary)", backgroundColor: "#FAFAFC" }}>
          <div
            className="flex justify-between items-center pb-2 mb-4"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <span className="badge badge-accent">Live Student View Preview</span>
            <span className="text-xs text-muted">Real-time appearance</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge badge-intermediate">{difficulty}</span>
            <span className="badge badge-primary">{effectiveLanguageDisplay}</span>
            <span className="badge badge-basic">{effectiveTypeDisplay}</span>
          </div>

          <div className="text-xs text-muted mb-3 font-semibold">
            {effectiveSubjectDisplay} &gt; {effectiveTopicDisplay}
          </div>

          <h3 style={{ fontSize: "1.15rem", marginBottom: "1.25rem", lineHeight: "1.5" }}>
            {questionText || "Question text will appear here..."}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { l: "A", text: optionA },
              { l: "B", text: optionB },
              { l: "C", text: optionC },
              { l: "D", text: optionD },
            ].map((o) => (
              <div
                key={o.l}
                className={`option-row ${correctOption === o.l ? "correct" : ""}`}
                style={{ cursor: "default" }}
              >
                <span className="option-letter">{o.l}</span>
                <span>{o.text || `Option ${o.l} text...`}</span>
                {correctOption === o.l && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
              </div>
            ))}
          </div>

          {explanation && (
            <div className="alert alert-info mt-4" style={{ fontSize: "0.85rem" }}>
              <strong>Verified Explanation: </strong>
              {explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
