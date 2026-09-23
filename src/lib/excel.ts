import * as XLSX from "xlsx";
import { db } from "./db";

export const EXPECTED_EXCEL_COLUMNS = [
  "external_id",
  "exam_code",
  "subject_code",
  "topic_code",
  "difficulty",
  "language",
  "question",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_option",
  "explanation",
  "question_type",
  "source",
  "exam_year",
  "access_package_code",
];

export interface ExcelRowValidationResult {
  rowNumber: number;
  raw: Record<string, any>;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExcelParseResult {
  filename: string;
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  rowResults: ExcelRowValidationResult[];
}

/**
 * Generates an Excel template buffer with instructions and sample rows.
 */
export async function generateExcelTemplate(): Promise<Buffer> {
  const wb = XLSX.utils.book_new();

  // Instructions Sheet
  const instructionsData = [
    ["Lok Sewa & Government Exam Question Bank - Bulk Upload Instructions"],
    [""],
    ["1. Do not rename or remove any of the column headers in the 'Questions' sheet."],
    ["2. Each question MUST have exactly four non-empty options (A, B, C, D) and one correct option (A, B, C, or D)."],
    ["3. Recognized Difficulties: Basic, Intermediate, Hard."],
    ["4. Recognized Question Types: Model, Previous-Year, Current-Affairs."],
    ["5. If question_type is Previous-Year, exam_year is required (e.g. 2080)."],
    ["6. Explanation is strictly required for every published question."],
    ["7. Valid Exam Codes: LOK_SEWA_SECTION_OFFICER, LOK_SEWA_NAYAB_SUBBA, LOK_SEWA_KHARIDAR, NRB_ASSISTANT."],
    ["8. Valid Subject Codes: GK, PUBLIC_ADMIN, IQ."],
    ["9. Valid Topic Codes: NEPAL_GEO, NEPAL_HIST, NEPAL_CONST, CIVIL_ACT, GOOD_GOV, IQ_SERIES."],
    ["10. Imported rows are staged as DRAFT until explicitly verified and published by an administrator."],
  ];
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);

  // Template Data Sheet
  const sampleRows = [
    {
      external_id: "LSO-GEO-001",
      exam_code: "LOK_SEWA_SECTION_OFFICER",
      subject_code: "GK",
      topic_code: "NEPAL_GEO",
      difficulty: "Basic",
      language: "NEPALI",
      question: "नेपालको कुल क्षेत्रफल कति वर्ग किलोमिटर छ?",
      option_a: "१,४७,१८१",
      option_b: "१,४७,५१६",
      option_c: "१,४८,०००",
      option_d: "१,४६,१८१",
      correct_option: "B",
      explanation: "लिम्पियाधुरा सहितको नयाँ नक्सा अनुसार १,४७,५१६ वर्ग कि.मि. कायम भएको छ।",
      question_type: "Model",
      source: "Government Survey 2080",
      exam_year: "",
      access_package_code: "FREE",
    },
    {
      external_id: "LSO-CONST-002",
      exam_code: "LOK_SEWA_SECTION_OFFICER",
      subject_code: "GK",
      topic_code: "NEPAL_CONST",
      difficulty: "Intermediate",
      language: "NEPALI",
      question: "नेपालको संविधानको कुन धारामा सूचनाको हक सम्बन्धी व्यवस्था छ?",
      option_a: "धारा २५",
      option_b: "धारा २७",
      option_c: "धारा २८",
      option_d: "धारा ३०",
      correct_option: "B",
      explanation: "धारा २७ मा सूचनाको हक सम्बन्धी मौलिक हकको व्यवस्था गरिएको छ।",
      question_type: "Previous-Year",
      source: "Lok Sewa 2080",
      exam_year: "2080",
      access_package_code: "FREE",
    },
  ];

  const wsQuestions = XLSX.utils.json_to_sheet(sampleRows, { header: EXPECTED_EXCEL_COLUMNS });
  
  XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");
  XLSX.utils.book_append_sheet(wb, wsQuestions, "Questions");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

/**
 * Validates and parses uploaded buffer adhering strictly to PRD Section 9.
 */
export async function validateExcelBuffer(buffer: Buffer, filename: string): Promise<ExcelParseResult> {
  const wb = XLSX.read(buffer, { type: "buffer", cellFormula: false }); // do not evaluate formulas
  const sheetName = wb.SheetNames.find((s) => s.toLowerCase().includes("question")) || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

  // Load existing exams, subjects, topics, and externalIds for validation
  const existingExams = await db.exam.findMany({ select: { code: true, id: true } });
  const existingSubjects = await db.subject.findMany({ select: { code: true, id: true } });
  const existingTopics = await db.topic.findMany({ select: { code: true, id: true } });
  const existingQuestions = await db.question.findMany({
    select: { externalId: true, versions: { select: { questionText: true } } },
  });

  const validExamCodes = new Set(existingExams.map((e) => e.code.toUpperCase()));
  const validSubjectCodes = new Set(existingSubjects.map((s) => s.code.toUpperCase()));
  const validTopicCodes = new Set(existingTopics.map((t) => t.code.toUpperCase()));
  const existingExtIds = new Set(existingQuestions.map((q) => q.externalId).filter(Boolean));
  const seenExtIdsInSheet = new Set<string>();

  const results: ExcelRowValidationResult[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const rowNumber = i + 2; // header is row 1
    const errors: string[] = [];
    const warnings: string[] = [];

    const extId = String(row.external_id || "").trim();
    const examCode = String(row.exam_code || "").trim().toUpperCase();
    const subjectCode = String(row.subject_code || "").trim().toUpperCase();
    const topicCode = String(row.topic_code || "").trim().toUpperCase();
    const diff = String(row.difficulty || "").trim();
    const qText = String(row.question || "").trim();
    const optA = String(row.option_a || "").trim();
    const optB = String(row.option_b || "").trim();
    const optC = String(row.option_c || "").trim();
    const optD = String(row.option_d || "").trim();
    const correct = String(row.correct_option || "").trim().toUpperCase();
    const explanation = String(row.explanation || "").trim();
    const qType = String(row.question_type || "").trim();
    const examYear = String(row.exam_year || "").trim();

    // Check required values
    if (!examCode) errors.push("Missing required field 'exam_code'");
    else if (!validExamCodes.has(examCode)) errors.push(`Unknown exam_code: '${examCode}'`);

    if (!subjectCode) errors.push("Missing required field 'subject_code'");
    else if (!validSubjectCodes.has(subjectCode)) errors.push(`Unknown subject_code: '${subjectCode}'`);

    if (!topicCode) errors.push("Missing required field 'topic_code'");
    else if (!validTopicCodes.has(topicCode)) errors.push(`Unknown topic_code: '${topicCode}'`);

    if (!qText) errors.push("Missing required field 'question'");
    if (!optA) errors.push("Missing required field 'option_a'");
    if (!optB) errors.push("Missing required field 'option_b'");
    if (!optC) errors.push("Missing required field 'option_c'");
    if (!optD) errors.push("Missing required field 'option_d'");

    if (!correct) {
      errors.push("Missing required field 'correct_option'");
    } else if (!["A", "B", "C", "D"].includes(correct)) {
      errors.push(`Correct option must be A, B, C, or D. Found: '${correct}'`);
    }

    if (!explanation) {
      errors.push("Explanation is required for published/verified questions");
    }

    const validDiffs = ["BASIC", "INTERMEDIATE", "HARD"];
    if (diff && !validDiffs.includes(diff.toUpperCase())) {
      errors.push(`Difficulty must be Basic, Intermediate, or Hard. Found: '${diff}'`);
    }

    if (qType.toUpperCase().includes("PREVIOUS") && !examYear) {
      errors.push("exam_year is required when question_type is Previous-Year");
    }

    // Check duplicate externalId
    if (extId) {
      if (existingExtIds.has(extId)) {
        errors.push(`Duplicate external_id '${extId}' already exists in database.`);
      }
      if (seenExtIdsInSheet.has(extId)) {
        errors.push(`Duplicate external_id '${extId}' repeated in this spreadsheet.`);
      }
      seenExtIdsInSheet.add(extId);
    }

    results.push({
      rowNumber,
      raw: row,
      isValid: errors.length === 0,
      errors,
      warnings,
    });
  }

  const validCount = results.filter((r) => r.isValid).length;
  const invalidCount = results.length - validCount;

  return {
    filename,
    totalRows: results.length,
    validRowsCount: validCount,
    invalidRowsCount: invalidCount,
    rowResults: results,
  };
}

/**
 * Commits valid rows into database as DRAFTS.
 */
export async function commitValidImportRows(
  jobId: string,
  userId: string,
  rowsToImport: ExcelRowValidationResult[]
) {
  const exams = await db.exam.findMany();
  const subjects = await db.subject.findMany();
  const topics = await db.topic.findMany();

  const examMap = new Map(exams.map((e) => [e.code.toUpperCase(), e.id]));
  const subjectMap = new Map(subjects.map((s) => [s.code.toUpperCase(), s.id]));
  const topicMap = new Map(topics.map((t) => [t.code.toUpperCase(), t.id]));

  let importedCount = 0;

  for (const item of rowsToImport) {
    if (!item.isValid) continue;
    const r = item.raw;

    const examId = examMap.get(String(r.exam_code).toUpperCase().trim())!;
    const subjectId = subjectMap.get(String(r.subject_code).toUpperCase().trim())!;
    const topicId = topicMap.get(String(r.topic_code).toUpperCase().trim())!;

    const diff = (String(r.difficulty || "INTERMEDIATE")).toUpperCase().trim();
    const difficulty = ["BASIC", "INTERMEDIATE", "HARD"].includes(diff) ? diff : "INTERMEDIATE";

    let qType = "MODEL";
    const rawType = String(r.question_type || "").toUpperCase();
    if (rawType.includes("PREVIOUS")) qType = "PREVIOUS_YEAR";
    else if (rawType.includes("CURRENT")) qType = "CURRENT_AFFAIRS";

    const question = await db.question.create({
      data: {
        externalId: r.external_id ? String(r.external_id).trim() : null,
        subjectId,
        topicId,
        difficulty,
        language: (String(r.language || "NEPALI")).toUpperCase().trim(),
        questionType: qType,
        examYear: r.exam_year ? parseInt(String(r.exam_year), 10) : null,
        source: r.source ? String(r.source).trim() : null,
        accessLevel: String(r.access_package_code || "FREE").toUpperCase() === "PREMIUM" ? "PREMIUM" : "FREE",
        status: "DRAFT", // strictly DRAFT as mandated by PRD
      },
    });

    await db.questionVersion.create({
      data: {
        questionId: question.id,
        versionNumber: 1,
        questionText: String(r.question).trim(),
        optionA: String(r.option_a).trim(),
        optionB: String(r.option_b).trim(),
        optionC: String(r.option_c).trim(),
        optionD: String(r.option_d).trim(),
        correctOption: String(r.correct_option).toUpperCase().trim(),
        explanation: String(r.explanation).trim(),
        authorId: userId,
      },
    });

    await db.questionExam.create({
      data: {
        questionId: question.id,
        examId,
      },
    });

    importedCount++;
  }

  await db.importJob.update({
    where: { id: jobId },
    data: { status: "COMMITTED" },
  });

  return importedCount;
}
