import { describe, expect, it } from "vitest";
import {
  computeXpForAttempt,
  generateClozePrompt,
  getNextWordHint,
  gradeClozeAnswers,
  gradeDictation,
  normalizeDictationText,
} from "../../src/lib/dictationEngine";
import { computeTestProgress } from "../../src/lib/db";
import {
  TOEIC_LISTENING_QUESTIONS,
  TOEIC_TEST_SETS,
} from "../../src/data/toeicDataset";

describe("Duc English — Dictation Normalization & Grading Engine", () => {
  it("normalizes case, whitespace, punctuation, and contractions in flexible mode", () => {
    const normalized = normalizeDictationText("  Didn't   they schedule the meeting?! ", {
      strictPunctuation: false,
    });
    expect(normalized).toBe("did not they schedule the meeting");
  });

  it("preserves case and punctuation when strictPunctuation is enabled", () => {
    const normalized = normalizeDictationText("The meeting starts at 9:00.", {
      strictPunctuation: true,
      expandContractions: false,
    });
    expect(normalized).toBe("The meeting starts at 9:00.");
  });

  it("scores an exact match as 100% mastered without auto-review flag", () => {
    const target = "The man is pointing at a chart on the conference table.";
    const res = gradeDictation(
      "the man is pointing at a chart on the conference table",
      target
    );
    expect(res.accuracy).toBe(100);
    expect(res.status).toBe("mastered");
    expect(res.shouldAutoReview).toBe(false);
    expect(res.levenshteinDistance).toBe(0);
  });

  it("allows minor 1-character typo with high accuracy and mastered status", () => {
    const target = "The man is pointing at a chart on the conference table.";
    const res = gradeDictation(
      "the man is pointing at a chart on the conferance table",
      target
    );
    expect(res.levenshteinDistance).toBe(1);
    expect(res.accuracy).toBeGreaterThanOrEqual(95);
    expect(res.status).toBe("mastered");
  });

  it("detects missing and extra words via diffTokens and flags weak attempts for review", () => {
    const target = "Attention all staff members. Starting next Monday, new security badges will be required.";
    const res = gradeDictation("Attention staff new badges required", target);
    expect(res.accuracy).toBeLessThan(75);
    expect(res.status).toBe("weak");
    expect(res.shouldAutoReview).toBe(true);
    expect(res.diffTokens.some((t) => t.type === "removed")).toBe(true);
  });

  it("provides accurate next-word hint and computes XP with combo streak", () => {
    const target = "The man is pointing at a chart.";
    expect(getNextWordHint("The man", target)).toBe("The man is ");
    expect(getNextWordHint("The man x", target)).toBe("The man is ");
    expect(computeXpForAttempt(100, 3)).toBe(21);
    expect(computeXpForAttempt(40, 2)).toBe(2);
  });
});

describe("Duc English — NLP Cloze Generator & Scorer", () => {
  it("generates targeted keyword blanks without hiding the entire sentence", () => {
    const transcript = "A warehouse worker is inspecting boxes on a metal shelf.";
    const segments = generateClozePrompt(transcript);
    const blanks = segments.filter((s) => s.isBlank);
    expect(segments.length).toBeGreaterThan(5);
    expect(blanks.length).toBeGreaterThanOrEqual(1);
    expect(blanks.length).toBeLessThan(segments.length);
  });

  it("grades cloze answers accurately", () => {
    const transcript = "A warehouse worker is inspecting boxes on a metal shelf.";
    const segments = generateClozePrompt(transcript);
    const answers: Record<string, string> = {};
    for (const seg of segments) {
      if (seg.isBlank) answers[seg.id] = seg.text;
    }
    const graded = gradeClozeAnswers(segments, answers);
    expect(graded.accuracy).toBe(100);
    expect(graded.correctCount).toBe(graded.totalBlanks);
  });
});

describe("Duc English — Test Matrix Progress Calculation", () => {
  it("aggregates part completion and overall percentage for Test 1", () => {
    const test1 = TOEIC_TEST_SETS[0];
    const progress = computeTestProgress(test1, TOEIC_LISTENING_QUESTIONS, [
      {
        questionId: "t1-p1-q1",
        testId: test1.id,
        part: 1,
        mode: "dictation",
        userText: "The man is pointing at a chart on the conference table.",
        accuracy: 100,
        status: "mastered",
        timestamp: Date.now(),
      },
      {
        questionId: "t1-p2-q1",
        testId: test1.id,
        part: 2,
        mode: "dictation",
        userText: "When is the quarterly budget meeting scheduled to start",
        accuracy: 92,
        status: "near",
        timestamp: Date.now(),
      },
    ]);

    expect(progress.partProgress[1].completed).toBe(1);
    expect(progress.partProgress[2].completed).toBe(1);
    expect(progress.totalCompleted).toBe(2);
    expect(progress.percent).toBe(25);
    expect(progress.averageAccuracy).toBe(96);
  });
});
