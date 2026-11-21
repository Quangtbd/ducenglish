import { diffWords } from "diff";
import levenshtein from "fast-levenshtein";
import stringSimilarity from "string-similarity";
import nlp from "compromise";
import type { ClozeSegment, DiffToken, GradingResult, GradingStatus } from "../types/toeic";

export interface NormalizationOptions {
  strictPunctuation?: boolean;
  expandContractions?: boolean;
}

const CONTRACTION_MAP: Record<string, string> = {
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "isn't": "is not",
  "aren't": "are not",
  "wasn't": "was not",
  "weren't": "were not",
  "haven't": "have not",
  "hasn't": "has not",
  "hadn't": "had not",
  "won't": "will not",
  "wouldn't": "would not",
  "can't": "cannot",
  "couldn't": "could not",
  "shouldn't": "should not",
  "i'm": "i am",
  "you're": "you are",
  "we're": "we are",
  "they're": "they are",
  "he's": "he is",
  "she's": "she is",
  "it's": "it is",
  "that's": "that is",
  "there's": "there is",
  "i've": "i have",
  "we've": "we have",
  "they've": "they have",
  "i'll": "i will",
  "we'll": "we will",
  "they'll": "they will",
  "let's": "let us",
};

export function normalizeDictationText(
  text: string,
  options: NormalizationOptions = {}
): string {
  let result = text.trim().replace(/\s+/g, " ");

  if (!options.strictPunctuation) {
    result = result.toLowerCase();
  }

  if (options.expandContractions !== false) {
    result = result
      .split(" ")
      .map((token) => {
        const clean = token.toLowerCase().replace(/^[("'“]+|[)"'”.,!?;:]+$/g, "");
        if (CONTRACTION_MAP[clean]) {
          const leading = token.match(/^[("'“]+/)?.[0] ?? "";
          const trailing = token.match(/[)"'”.,!?;:]+$/)?.[0] ?? "";
          return `${leading}${CONTRACTION_MAP[clean]}${trailing}`;
        }
        return token;
      })
      .join(" ");
  }

  if (!options.strictPunctuation) {
    result = result
      .replace(/[.,!?;:"'()\[\]—–-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return result;
}

export function gradeDictation(
  userInput: string,
  targetText: string,
  options: NormalizationOptions = {}
): GradingResult {
  const normalizedUser = normalizeDictationText(userInput, options);
  const normalizedTarget = normalizeDictationText(targetText, options);

  if (!normalizedUser) {
    return {
      accuracy: 0,
      wordAccuracy: 0,
      levenshteinDistance: normalizedTarget.length,
      status: "weak",
      shouldAutoReview: true,
      diffTokens: [{ value: targetText, type: "removed" }],
      feedbackMessage: "Bạn chưa nhập nội dung câu nghe được.",
      normalizedUser,
      normalizedTarget,
    };
  }

  const distance = levenshtein.get(normalizedUser, normalizedTarget);
  const maxLen = Math.max(normalizedTarget.length, normalizedUser.length, 1);
  const charRatio = Math.max(0, 1 - distance / maxLen);
  const diceSimilarity = stringSimilarity.compareTwoStrings(normalizedUser, normalizedTarget);

  const rawDiff = diffWords(normalizedUser, normalizedTarget);
  const diffTokens: DiffToken[] = rawDiff.map((part) => ({
    value: part.value,
    type: part.added ? "removed" : part.removed ? "added" : "matched",
  }));

  const targetWords = normalizedTarget.split(" ").filter(Boolean);
  const matchedWordsCount = rawDiff
    .filter((p) => !p.added && !p.removed)
    .reduce((acc, p) => acc + p.value.trim().split(/\s+/).filter(Boolean).length, 0);
  const wordAccuracy = Math.min(
    100,
    Math.round((matchedWordsCount / Math.max(targetWords.length, 1)) * 100)
  );

  // Blend Levenshtein ratio, Dice similarity, and word match accuracy
  const blended = Math.round((charRatio * 0.4 + diceSimilarity * 0.35 + (wordAccuracy / 100) * 0.25) * 100);
  const accuracy = normalizedUser === normalizedTarget ? 100 : Math.min(99, Math.max(0, blended));

  let status: GradingStatus = "weak";
  let feedbackMessage =
    "Chưa khớp nhiều chỗ. Hãy tua lại đoạn nối âm hoặc bật chế độ Điền từ để làm quen nhé.";

  if (accuracy >= 95 || distance <= 1) {
    status = "mastered";
    feedbackMessage =
      accuracy === 100
        ? "Chính xác tuyệt đối! Nhấn Alt+N hoặc Enter lần nữa để sang câu tiếp theo."
        : "Gần như hoàn hảo (chỉ lệch rất nhẹ ký tự). Đã đạt chuẩn qua câu!";
  } else if (accuracy >= 70) {
    status = "near";
    feedbackMessage =
      "Khá tốt! Chỉ còn sót một vài từ nối hoặc đuôi số nhiều/quá khứ, hãy nghe lại vùng đánh dấu đỏ.";
  }

  return {
    accuracy: distance <= 1 && accuracy < 96 ? 96 : accuracy,
    wordAccuracy,
    levenshteinDistance: distance,
    status,
    shouldAutoReview: accuracy < 75,
    diffTokens,
    feedbackMessage,
    normalizedUser,
    normalizedTarget,
  };
}

export function generateClozePrompt(transcript: string, maxBlanksRatio = 0.35): ClozeSegment[] {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const doc = nlp(transcript);
  const candidateTerms = new Set<string>();

  doc.nouns().forEach((n: { text: () => string }) => {
    n.text()
      .toLowerCase()
      .split(/\s+/)
      .forEach((w) => candidateTerms.add(w.replace(/[^a-z0-9]/gi, "")));
  });
  doc.verbs().forEach((v: { text: () => string }) => {
    v.text()
      .toLowerCase()
      .split(/\s+/)
      .forEach((w) => candidateTerms.add(w.replace(/[^a-z0-9]/gi, "")));
  });
  doc.adjectives().forEach((a: { text: () => string }) => {
    a.text()
      .toLowerCase()
      .split(/\s+/)
      .forEach((w) => candidateTerms.add(w.replace(/[^a-z0-9]/gi, "")));
  });

  const maxBlanks = Math.max(1, Math.floor(words.length * maxBlanksRatio));
  let blanksCount = 0;

  return words.map((rawWord, idx) => {
    const leadingPunctuation = rawWord.match(/^[^a-zA-Z0-9]+/)?.[0] ?? "";
    const trailingPunctuation = rawWord.match(/[^a-zA-Z0-9]+$/)?.[0] ?? "";
    const core = rawWord
      .slice(leadingPunctuation.length, rawWord.length - trailingPunctuation.length)
      .trim();
    const cleanLower = core.toLowerCase().replace(/[^a-z0-9]/g, "");

    const isEligible =
      core.length >= 4 &&
      (candidateTerms.has(cleanLower) || idx % 4 === 2) &&
      blanksCount < maxBlanks;

    if (isEligible) {
      blanksCount += 1;
    }

    return {
      id: `cloze-${idx}`,
      text: core || rawWord,
      isBlank: Boolean(isEligible && core.length > 0),
      leadingPunctuation,
      trailingPunctuation,
    };
  });
}

export function gradeClozeAnswers(
  segments: ClozeSegment[],
  answers: Record<string, string>
): { accuracy: number; correctCount: number; totalBlanks: number; results: Record<string, boolean> } {
  const blanks = segments.filter((s) => s.isBlank);
  if (blanks.length === 0) {
    return { accuracy: 100, correctCount: 0, totalBlanks: 0, results: {} };
  }

  const results: Record<string, boolean> = {};
  let correctCount = 0;

  for (const blank of blanks) {
    const userVal = normalizeDictationText(answers[blank.id] ?? "", {
      strictPunctuation: false,
      expandContractions: false,
    });
    const targetVal = normalizeDictationText(blank.text, {
      strictPunctuation: false,
      expandContractions: false,
    });
    const isCorrect = userVal === targetVal || levenshtein.get(userVal, targetVal) <= (targetVal.length >= 7 ? 1 : 0);
    results[blank.id] = Boolean(userVal && isCorrect);
    if (results[blank.id]) correctCount += 1;
  }

  return {
    accuracy: Math.round((correctCount / blanks.length) * 100),
    correctCount,
    totalBlanks: blanks.length,
    results,
  };
}

export function getNextWordHint(userInput: string, targetText: string): string {
  const targetWords = targetText.trim().split(/\s+/).filter(Boolean);
  if (targetWords.length === 0) return "";

  const userWords = userInput.trim().split(/\s+/).filter(Boolean);
  for (let i = 0; i < targetWords.length; i += 1) {
    const uClean = normalizeDictationText(userWords[i] ?? "", {
      strictPunctuation: false,
      expandContractions: false,
    });
    const tClean = normalizeDictationText(targetWords[i], {
      strictPunctuation: false,
      expandContractions: false,
    });
    if (uClean !== tClean) {
      const prefix = targetWords.slice(0, i);
      return [...prefix, targetWords[i]].join(" ") + (i < targetWords.length - 1 ? " " : "");
    }
  }
  return targetText;
}

export function computeXpForAttempt(accuracy: number, comboStreak: number): number {
  if (accuracy < 50) return 2;
  const base = accuracy >= 95 ? 15 : accuracy >= 75 ? 10 : 5;
  const bonus = Math.min(15, comboStreak * 2);
  return base + bonus;
}

