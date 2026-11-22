export type MainSection =
  | "listen"
  | "read"
  | "speak"
  | "write"
  | "vocab"
  | "test"
  | "course"
  | "game"
  | "cafe";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type TestCollectionId = "all" | "thematic";

export type ToeicPart = 1 | 2 | 3 | 4;

export type DictationMode = "dictation" | "check" | "cloze" | "full";

export type TopicId =
  | "all"
  | "office"
  | "logistics"
  | "finance"
  | "hr"
  | "travel"
  | "marketing"
  | "airport"
  | "hotel"
  | "restaurant"
  | "tech"
  | "health"
  | "shopping";

export interface DialogueLine {
  speaker: string;
  text: string;
  voiceName?: "Puck" | "Charon" | "Kore" | "Fenrir" | "Zephyr";
  style?: string;
}

export interface VocabHighlight {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaningVi: string;
  exampleSentence: string;
  cefr?: CefrLevel;
  definitionEn?: string;
  collocations?: { phrase: string; meaningVi: string }[];
  synonyms?: { word: string; meaningVi: string }[];
}

export interface WordBlankToken {
  id: string;
  raw: string;
  cleanWord: string;
  leadingPunctuation: string;
  trailingPunctuation: string;
  isWord: boolean;
  isBlank: boolean;
  revealed: boolean;
  userInput: string;
  status: "idle" | "correct" | "revealed" | "wrong";
}

export interface ListeningQuestion {
  id: string;
  testId: string;
  part: ToeicPart;
  order: number;
  level: number; // 1 (<300) .. 8 (900+)
  topic: Exclude<TopicId, "all">;
  title: string;
  transcript: string;
  transcriptVi: string;
  linkedSpeechTip: string;
  grammarNote: string;
  imageUrl?: string;
  choices?: string[];
  correctChoiceIndex?: number;
  dialogue?: DialogueLine[];
  keyVocab: VocabHighlight[];
  customAudioKey?: string;
  audioUrl?: string;
}

export interface TestSet {
  id: string;
  testNumber: number; // 1..10
  title: string;
  collection: string;
  collectionLabel: string;
  levelRange: string;
  minLevel: number;
  maxLevel: number;
  topic: Exclude<TopicId, "all">;
  totalQuestions: number;
  partCounts: Record<ToeicPart, number>;
}

export interface ThematicListeningSet {
  id: string;
  title: string;
  titleVi: string;
  cefrLevel: CefrLevel;
  part: ToeicPart;
  topic: Exclude<TopicId, "all">;
  descriptionVi: string;
  questions: ListeningQuestion[];
}

export interface DiffToken {
  value: string;
  type: "matched" | "added" | "removed";
}

export type GradingStatus = "mastered" | "near" | "weak";

export interface GradingResult {
  accuracy: number;
  wordAccuracy: number;
  levenshteinDistance: number;
  status: GradingStatus;
  shouldAutoReview: boolean;
  diffTokens: DiffToken[];
  feedbackMessage: string;
  normalizedUser: string;
  normalizedTarget: string;
}

export interface ClozeSegment {
  id: string;
  text: string;
  isBlank: boolean;
  posTag?: string;
  leadingPunctuation?: string;
  trailingPunctuation?: string;
}

export interface DictationAttempt {
  id?: number;
  questionId: string;
  testId: string;
  part: ToeicPart;
  mode: DictationMode;
  userText: string;
  accuracy: number;
  status: GradingStatus;
  timestamp: number;
}

export interface ReviewQueueItem {
  questionId: string;
  addedReason: "auto_low_score" | "manual";
  lastAccuracy: number;
  retryCount: number;
  updatedAt: number;
}

export interface VocabEntry {
  id?: number;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaningVi: string;
  exampleSentence: string;
  topic: string;
  sourceQuestionId?: string;
  masteryLevel: 0 | 1 | 2 | 3;
  createdAt: number;
}

export interface AudioCacheEntry {
  cacheKey: string;
  mimeType: string;
  audioBlob: Blob;
  createdAt: number;
}

export interface DraftEntry {
  questionId: string;
  draftText: string;
  updatedAt: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  targetScore: number;
  dailyGoalQuestions: number;
  streakDays: number;
  xp: number;
  lastActiveDate: string;
  strictPunctuation: boolean;
  autoAdvanceOnMastered: boolean;
  playbackRate: number;
  theme: "light" | "dark";
}

export interface ReadingQuestion {
  id: string;
  part: 5 | 6 | 7;
  level: number;
  topic: string;
  passageTitle?: string;
  passageText?: string;
  evidenceSnippet?: string;
  questionText: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanationVi: string;
  grammarPoint: string;
}

export interface VocabTopicPack {
  id: string;
  title: string;
  subtitleVi: string;
  bandRange: string;
  imageUrl: string;
  words: Omit<VocabEntry, "id" | "createdAt">[];
}

export interface SpeakingPrompt {
  id: string;
  part: 1 | 2 | 3 | 4 | 5;
  title: string;
  instructionVi: string;
  targetText: string;
  sampleAnswer: string;
  imageUrl?: string;
  tipsVi: string;
}

export interface WritingPrompt {
  id: string;
  part: 1 | 2 | 3;
  title: string;
  instructionVi: string;
  promptText: string;
  keywords?: string[];
  imageUrl?: string;
  sampleAnswer: string;
}

export interface MockTestExam {
  id: string;
  title: string;
  type: "Mini Test" | "Full Format";
  durationMinutes: number;
  questionsCount: number;
  targetBand: string;
  items: {
    id: string;
    section: "Listening" | "Reading";
    part: number;
    prompt: string;
    spokenText?: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanationVi: string;
  }[];
}

export interface CourseModule {
  id: string;
  title: string;
  targetBand: string;
  durationWeeks: number;
  lessonsCount: number;
  imageUrl: string;
  summaryVi: string;
  steps: {
    stepNumber: number;
    title: string;
    descriptionVi: string;
    linkedSection: MainSection;
  }[];
}
