import Dexie, { type EntityTable } from "dexie";
import type {
  AudioCacheEntry,
  DictationAttempt,
  DraftEntry,
  ListeningQuestion,
  ReviewQueueItem,
  TestSet,
  ToeicPart,
  UserProfile,
  VocabEntry,
} from "../types/toeic";

class DucEnglishDatabase extends Dexie {
  attempts!: EntityTable<DictationAttempt, "id">;
  reviewQueue!: EntityTable<ReviewQueueItem, "questionId">;
  vocab!: EntityTable<VocabEntry, "id">;
  audioCache!: EntityTable<AudioCacheEntry, "cacheKey">;
  drafts!: EntityTable<DraftEntry, "questionId">;
  customQuestions!: EntityTable<ListeningQuestion, "id">;

  constructor() {
    super("DucEnglishDB");
    this.version(1).stores({
      attempts: "++id, questionId, testId, part, status, timestamp",
      reviewQueue: "questionId, updatedAt, lastAccuracy",
      vocab: "++id, word, topic, masteryLevel, createdAt",
      audioCache: "cacheKey, createdAt",
      drafts: "questionId, updatedAt",
      customQuestions: "id, testId, part, order",
    });
  }
}

export const db = new DucEnglishDatabase();

const PROFILE_STORAGE_KEY = "duc_english_user_profile_v1";

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: "local-learner",
  displayName: "Học viên Duc English",
  email: "learner@ducenglish.local",
  targetScore: 750,
  dailyGoalQuestions: 15,
  streakDays: 3,
  xp: 120,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  strictPunctuation: false,
  autoAdvanceOnMastered: false,
  playbackRate: 1.0,
  theme: "light",
};

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;
    return { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: Partial<UserProfile>): UserProfile {
  const current = getUserProfile();
  const today = new Date().toISOString().slice(0, 10);
  const next: UserProfile = {
    ...current,
    ...profile,
    lastActiveDate: today,
  };
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function recordDictationAttempt(attempt: Omit<DictationAttempt, "id">) {
  await db.attempts.add(attempt);

  if (attempt.accuracy < 75) {
    const existing = await db.reviewQueue.get(attempt.questionId);
    await db.reviewQueue.put({
      questionId: attempt.questionId,
      addedReason: existing?.addedReason ?? "auto_low_score",
      lastAccuracy: attempt.accuracy,
      retryCount: (existing?.retryCount ?? 0) + 1,
      updatedAt: attempt.timestamp,
    });
  } else if (attempt.accuracy >= 95) {
    // If mastered, update lastAccuracy in reviewQueue or keep until user manually clears
    const existing = await db.reviewQueue.get(attempt.questionId);
    if (existing) {
      await db.reviewQueue.put({
        ...existing,
        lastAccuracy: attempt.accuracy,
        updatedAt: attempt.timestamp,
      });
    }
  }
}

export async function toggleReviewQueueItem(
  questionId: string,
  accuracy = 0
): Promise<boolean> {
  const existing = await db.reviewQueue.get(questionId);
  if (existing) {
    await db.reviewQueue.delete(questionId);
    return false;
  }
  await db.reviewQueue.put({
    questionId,
    addedReason: "manual",
    lastAccuracy: accuracy,
    retryCount: 1,
    updatedAt: Date.now(),
  });
  return true;
}

export async function saveVocabToNotebook(
  entry: Omit<VocabEntry, "id" | "createdAt" | "masteryLevel">
): Promise<{ created: boolean }> {
  const existing = await db.vocab
    .where("word")
    .equalsIgnoreCase(entry.word.trim())
    .first();
  if (existing) {
    return { created: false };
  }
  await db.vocab.add({
    ...entry,
    word: entry.word.trim(),
    masteryLevel: 0,
    createdAt: Date.now(),
  });
  return { created: true };
}

export async function updateVocabMastery(id: number, masteryLevel: 0 | 1 | 2 | 3) {
  await db.vocab.update(id, { masteryLevel });
}

export interface TestMatrixProgress {
  completedQuestionIds: Set<string>;
  partProgress: Record<ToeicPart, { completed: number; total: number }>;
  totalCompleted: number;
  totalQuestions: number;
  percent: number;
  averageAccuracy: number;
}

export function computeTestProgress(
  test: TestSet,
  questions: ListeningQuestion[],
  attempts: DictationAttempt[]
): TestMatrixProgress {
  const testQuestions = questions.filter((q) => q.testId === test.id);
  const bestByQuestion = new Map<string, number>();

  for (const att of attempts) {
    if (att.testId !== test.id) continue;
    const prev = bestByQuestion.get(att.questionId) ?? 0;
    if (att.accuracy > prev) {
      bestByQuestion.set(att.questionId, att.accuracy);
    }
  }

  const completedQuestionIds = new Set<string>();
  const partProgress: Record<ToeicPart, { completed: number; total: number }> = {
    1: { completed: 0, total: test.partCounts[1] },
    2: { completed: 0, total: test.partCounts[2] },
    3: { completed: 0, total: test.partCounts[3] },
    4: { completed: 0, total: test.partCounts[4] },
  };

  let accSum = 0;
  let accCount = 0;

  for (const q of testQuestions) {
    const best = bestByQuestion.get(q.id);
    if (best !== undefined) {
      accSum += best;
      accCount += 1;
      if (best >= 80) {
        completedQuestionIds.add(q.id);
        partProgress[q.part].completed += 1;
      }
    }
  }

  const totalQuestions = Math.max(testQuestions.length, test.totalQuestions);
  const totalCompleted = completedQuestionIds.size;
  const percent = totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0;

  return {
    completedQuestionIds,
    partProgress,
    totalCompleted,
    totalQuestions,
    percent,
    averageAccuracy: accCount > 0 ? Math.round(accSum / accCount) : 0,
  };
}

export async function exportBackupJson(): Promise<string> {
  const [attempts, reviewQueue, vocab, customQuestions] = await Promise.all([
    db.attempts.toArray(),
    db.reviewQueue.toArray(),
    db.vocab.toArray(),
    db.customQuestions.toArray(),
  ]);
  return JSON.stringify(
    {
      app: "Duc English",
      exportedAt: new Date().toISOString(),
      profile: getUserProfile(),
      attempts,
      reviewQueue,
      vocab,
      customQuestions,
    },
    null,
    2
  );
}

export async function importBackupJson(jsonText: string): Promise<void> {
  const parsed = JSON.parse(jsonText);
  if (parsed.profile) {
    saveUserProfile(parsed.profile);
  }
  if (Array.isArray(parsed.attempts)) {
    await db.attempts.bulkPut(parsed.attempts);
  }
  if (Array.isArray(parsed.reviewQueue)) {
    await db.reviewQueue.bulkPut(parsed.reviewQueue);
  }
  if (Array.isArray(parsed.vocab)) {
    await db.vocab.bulkPut(parsed.vocab);
  }
  if (Array.isArray(parsed.customQuestions)) {
    await db.customQuestions.bulkPut(parsed.customQuestions);
  }
}
