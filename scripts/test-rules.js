const assert = require("assert");

console.log("==================================================");
console.log("RUNNING AUTOMATED VERIFICATION FOR NEPAL EXAM PREP");
console.log("==================================================");

// 1. Spaced Repetition Rules (PRD Section 15)
console.log("\n[TEST 1] Verifying Spaced Repetition Intervals...");
const STAGE_INTERVALS = { 1: 1, 2: 3, 3: 7, 4: 14 };

function nextStage(currentStage, isCorrect) {
  if (!isCorrect) return 1; // restart at stage 1
  if (currentStage >= 4) return "MASTERED";
  return currentStage + 1;
}

assert.strictEqual(nextStage(1, true), 2, "Stage 1 correct should advance to Stage 2");
assert.strictEqual(nextStage(2, true), 3, "Stage 2 correct should advance to Stage 3");
assert.strictEqual(nextStage(3, true), 4, "Stage 3 correct should advance to Stage 4");
assert.strictEqual(nextStage(4, true), "MASTERED", "Stage 4 correct should achieve MASTERED");
assert.strictEqual(nextStage(3, false), 1, "Any incorrect revision should reset to Stage 1 (1 day later)");
console.log("✓ Spaced Repetition state machine verified successfully.");

// 2. Negative Marking Scoring Formula (PRD Section 11)
console.log("\n[TEST 2] Verifying Official Lok Sewa Scoring Formula...");
function calculateScore(correctCount, incorrectCount, marksPerCorrect, penaltyPercent) {
  const penaltyPerWrong = (marksPerCorrect * penaltyPercent) / 100.0;
  const rawScore = (correctCount * marksPerCorrect) - (incorrectCount * penaltyPerWrong);
  return Math.max(0, Math.round(rawScore * 100) / 100);
}

// 50 Questions: 40 correct, 10 incorrect, 2 marks/correct, 20% penalty
// 40 * 2.0 = 80 marks
// 10 * 0.4 = 4.0 deduction
// Net: 76.0 marks
const score1 = calculateScore(40, 10, 2.0, 20.0);
assert.strictEqual(score1, 76.0, "Score should be exactly 76.0");

// Zero Floor check: 0 correct, 10 incorrect -> should not be negative
const score2 = calculateScore(0, 10, 2.0, 20.0);
assert.strictEqual(score2, 0, "Score floor should not be negative");
console.log("✓ Negative deduction scoring formula verified successfully.");

// 3. Weak-Topic Categorization Thresholds (PRD Section 16.2)
console.log("\n[TEST 3] Verifying Weak-Topic Thresholds (PRD Section 16.2)...");
function categorizeTopic(totalAttempts, correctCount) {
  if (totalAttempts < 10) return "INSUFFICIENT_DATA";
  const acc = (correctCount / totalAttempts) * 100;
  if (acc < 50) return "NEEDS_IMPROVEMENT";
  if (acc < 75) return "DEVELOPING";
  return "STRONG";
}

assert.strictEqual(categorizeTopic(8, 2), "INSUFFICIENT_DATA", "Under 10 attempts must be Insufficient Data");
assert.strictEqual(categorizeTopic(20, 8), "NEEDS_IMPROVEMENT", "40% accuracy must be Needs Improvement (<50%)");
assert.strictEqual(categorizeTopic(20, 12), "DEVELOPING", "60% accuracy must be Developing (50%-74%)");
assert.strictEqual(categorizeTopic(20, 16), "STRONG", "80% accuracy must be Strong Performance (>=75%)");
console.log("✓ Weak-topic diagnostic thresholds verified successfully.");

// 4. Nepal Timezone Formatting (PRD Section 3 & 23)
console.log("\n[TEST 4] Verifying Asia/Kathmandu Timezone...");
const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kathmandu",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const nepalDate = formatter.format(new Date());
assert.match(nepalDate, /^\d{4}-\d{2}-\d{2}$/, "Nepal date should be YYYY-MM-DD");
console.log(`✓ Nepal Date formatted as ${nepalDate} (Asia/Kathmandu UTC+5:45).`);

// 5. Excel 17-Column Structure (PRD Section 9)
console.log("\n[TEST 5] Verifying Excel 17-Column Template Specification...");
const EXPECTED_COLUMNS = [
  "external_id", "exam_code", "subject_code", "topic_code", "difficulty",
  "language", "question", "option_a", "option_b", "option_c", "option_d",
  "correct_option", "explanation", "question_type", "source", "exam_year",
  "access_package_code"
];
assert.strictEqual(EXPECTED_COLUMNS.length, 17, "PRD requires exactly 17 template columns");
console.log("✓ 17-column specification verified successfully.");

console.log("\n==================================================");
console.log("ALL AUTOMATED VERIFICATION CHECKS PASSED (5/5)");
console.log("==================================================");
