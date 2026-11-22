import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useHotkeys } from "react-hotkeys-hook";
import confetti from "canvas-confetti";
import * as Popover from "@radix-ui/react-popover";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  Bookmark,
  Copy,
  Check,
  HelpCircle,
  Lock,
  Eye,
  Volume2,
  Flag,
  ShoppingBasket,
  LayoutGrid,
  Clock,
  Zap,
  BookOpen,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type {
  CefrLevel,
  DictationAttempt,
  DictationMode,
  GradingResult,
  ListeningQuestion,
  ReviewQueueItem,
  UserProfile,
  VocabEntry,
  VocabHighlight,
  WordBlankToken,
} from "../types/toeic";
import {
  computeXpForAttempt,
  getNextWordHint,
  gradeDictation,
  isBlankTokenMatch,
  tokenizeSentenceForCheck,
} from "../lib/dictationEngine";
import {
  getOfflineWordBadge,
  playWordPronunciation,
} from "../lib/dictionaryService";
import {
  db,
  recordDictationAttempt,
  saveVocabToNotebook,
  toggleReviewQueueItem,
} from "../lib/db";
import { DauWaveformPlayer } from "./DauWaveformPlayer";
import { TranscriptAnnotator } from "./TranscriptAnnotator";
import { LottieCelebration } from "./LottieCelebration";
import { WordDetailDrawer } from "./WordDetailDrawer";
import { cn, TOPIC_LABELS } from "../lib/utils";

interface DictationStudioProps {
  title: string;
  cefrLevel?: CefrLevel;
  questions: ListeningQuestion[];
  initialQuestionIndex?: number;
  initialMode?: DictationMode;
  attempts: DictationAttempt[];
  reviewQueue: ReviewQueueItem[];
  vocabList: VocabEntry[];
  profile: UserProfile;
  onUpdateProfile: (values: Partial<UserProfile>) => void;
  onDataChanged: () => void;
  onExit: () => void;
}

const STUDIO_MODES: { id: DictationMode; label: string }[] = [
  { id: "dictation", label: "Nghe chép" },
  { id: "check", label: "Nghe check" },
  { id: "full", label: "Nghe full" },
];

const DENSITY_OPTIONS: (30 | 50 | 100)[] = [30, 50, 100];

export function DictationStudio({
  title,
  cefrLevel = "B1",
  questions,
  initialQuestionIndex = 0,
  initialMode = "check",
  attempts,
  reviewQueue,
  vocabList,
  profile,
  onUpdateProfile,
  onDataChanged,
  onExit,
}: DictationStudioProps) {
  const [currentIndex, setCurrentIndex] = useState(initialQuestionIndex);
  const [mode, setMode] = useState<DictationMode>(
    initialMode === "cloze" ? "check" : initialMode
  );
  const [blankDensity, setBlankDensity] = useState<30 | 50 | 100>(50);
  const [tokens, setTokens] = useState<WordBlankToken[]>([]);
  const [activeBlankIdx, setActiveBlankIdx] = useState<number | null>(null);
  const [checkCompletedIds, setCheckCompletedIds] = useState<Set<string>>(
    () => new Set()
  );

  // Full dictation state (for "Nghe chép" tab)
  const [userInput, setUserInput] = useState("");
  const [grading, setGrading] = useState<GradingResult | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);

  // Timer & session XP pill state ("3s • +5 XP")
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [rewardedQuestionIds, setRewardedQuestionIds] = useState<Set<string>>(
    () => new Set()
  );

  // Drawers & Popovers
  const [drawerWord, setDrawerWord] = useState<string | null>(null);
  const [basketOpen, setBasketOpen] = useState(false);
  const [reportPopoverOpen, setReportPopoverOpen] = useState(false);
  const [reportNote, setReportNote] = useState("");
  const [copiedSentence, setCopiedSentence] = useState(false);

  const replayTriggerRef = useRef<() => void>(() => {});
  const blankInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [feedbackRef] = useAutoAnimate();

  const question = questions[currentIndex];
  const isInReviewQueue = useMemo(
    () =>
      Boolean(question && reviewQueue.some((r) => r.questionId === question.id)),
    [question, reviewQueue]
  );

  const savedWordsSet = useMemo(() => {
    const set = new Set<string>();
    for (const v of vocabList) {
      set.add(v.word.toLowerCase().trim());
    }
    return set;
  }, [vocabList]);

  const bestAccuracyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of attempts) {
      const prev = map.get(a.questionId) ?? -1;
      if (a.accuracy > prev) map.set(a.questionId, a.accuracy);
    }
    return map;
  }, [attempts]);

  // Live per-question timer (seconds)
  useEffect(() => {
    setElapsedSeconds(0);
    const id = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [question?.id]);

  // Initialize blank tokens & reset states when question or density changes
  useEffect(() => {
    if (!question) return;
    let cancelled = false;

    const vocabWords = question.keyVocab.map((v) => v.word);
    const generated = tokenizeSentenceForCheck(
      question.transcript,
      blankDensity,
      vocabWords
    );
    setTokens(generated);
    const firstBlank = generated.findIndex((t) => t.isBlank);
    setActiveBlankIdx(firstBlank >= 0 ? firstBlank : null);

    setGrading(null);

    db.drafts.get(question.id).then((draft) => {
      if (cancelled) return;
      setUserInput(draft?.draftText ?? "");
    });

    return () => {
      cancelled = true;
    };
  }, [question?.id, blankDensity]);

  // Auto-save dictation draft
  useEffect(() => {
    if (!question) return;
    const timer = setTimeout(() => {
      db.drafts.put({
        questionId: question.id,
        draftText: userInput,
        updatedAt: Date.now(),
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [userInput, question?.id]);

  // Check whether current sentence is completed in the active mode
  const isCheckAllSolved = useMemo(() => {
    const blanks = tokens.filter((t) => t.isBlank);
    if (blanks.length === 0) return false;
    return blanks.every(
      (t) => t.status === "correct" || t.status === "revealed"
    );
  }, [tokens]);

  const isSentenceCompleted =
    mode === "full" ||
    (mode === "check" &&
      (isCheckAllSolved || (question ? checkCompletedIds.has(question.id) : false))) ||
    (mode === "dictation" && grading?.status === "mastered");

  // Award +5 XP & persist attempt when Nghe check completes a sentence
  const finalizeCheckCompletion = async (targetQuestion: ListeningQuestion) => {
    setCheckCompletedIds((prev) => new Set(prev).add(targetQuestion.id));

    if (!rewardedQuestionIds.has(targetQuestion.id)) {
      const deltaXp = 5;
      setRewardedQuestionIds((prev) => new Set(prev).add(targetQuestion.id));
      setSessionXp((xp) => xp + deltaXp);
      onUpdateProfile({ xp: profile.xp + deltaXp });
      toast.success(`Hoàn thành câu! +${deltaXp} XP`);
    }

    await recordDictationAttempt({
      questionId: targetQuestion.id,
      testId: targetQuestion.testId,
      part: targetQuestion.part,
      mode: "check",
      userText: targetQuestion.transcript,
      accuracy: 100,
      status: "mastered",
      timestamp: Date.now(),
    });
    onDataChanged();
  };

  const handleBlankChange = (idx: number, rawVal: string) => {
    if (!question) return;
    const cleanTyped = rawVal.replace(/\s+/g, "");
    const targetToken = tokens[idx];
    if (!targetToken || !targetToken.isBlank) return;

    const matched = isBlankTokenMatch(cleanTyped, targetToken.cleanWord);

    const nextTokens = tokens.map((tok, i) => {
      if (i !== idx) return tok;
      if (matched) {
        return {
          ...tok,
          userInput: tok.cleanWord,
          status: "correct" as const,
          revealed: true,
        };
      }
      return {
        ...tok,
        userInput: cleanTyped,
        status: "idle" as const,
      };
    });

    setTokens(nextTokens);

    if (matched) {
      const nextBlankIdx = nextTokens.findIndex(
        (t, i) => i > idx && t.isBlank && t.status !== "correct" && t.status !== "revealed"
      );
      const anyRemaining = nextTokens.findIndex(
        (t) => t.isBlank && t.status !== "correct" && t.status !== "revealed"
      );
      const focusIdx = nextBlankIdx >= 0 ? nextBlankIdx : anyRemaining;
      if (focusIdx >= 0) {
        setActiveBlankIdx(focusIdx);
        requestAnimationFrame(() => {
          blankInputRefs.current[focusIdx]?.focus();
        });
      } else {
        finalizeCheckCompletion(question);
      }
    }
  };

  const handleRevealWords = (count: number | "all") => {
    if (!question || isSentenceCompleted) return;
    let remainingToReveal = count === "all" ? Infinity : count;
    const nextTokens = tokens.map((tok) => {
      if (
        tok.isBlank &&
        tok.status !== "correct" &&
        tok.status !== "revealed" &&
        remainingToReveal > 0
      ) {
        remainingToReveal -= 1;
        return {
          ...tok,
          userInput: tok.cleanWord,
          revealed: true,
          status: "revealed" as const,
        };
      }
      return tok;
    });
    setTokens(nextTokens);

    const nextUnfilled = nextTokens.findIndex(
      (t) => t.isBlank && t.status !== "correct" && t.status !== "revealed"
    );
    if (nextUnfilled >= 0) {
      setActiveBlankIdx(nextUnfilled);
      requestAnimationFrame(() => {
        blankInputRefs.current[nextUnfilled]?.focus();
      });
    } else {
      finalizeCheckCompletion(question);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.65 } });
      toast.success("Chúc mừng! Bạn đã hoàn thành toàn bộ câu trong bài này.");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  // Handler for "Nghe chép" full-sentence check
  const handleCheckDictation = async () => {
    if (!question) return;

    if (grading?.status === "mastered") {
      handleNext();
      return;
    }

    const result = gradeDictation(userInput, question.transcript, {
      strictPunctuation: profile.strictPunctuation,
    });
    setGrading(result);

    const earnedXp = computeXpForAttempt(result.accuracy, comboStreak);
    setSessionXp((xp) => xp + earnedXp);
    onUpdateProfile({ xp: profile.xp + earnedXp });

    if (result.status === "mastered") {
      setComboStreak((c) => c + 1);
      confetti({ particleCount: 45, spread: 55, origin: { y: 0.72 } });
    } else {
      setComboStreak(0);
      setShakeKey((k) => k + 1);
    }

    await recordDictationAttempt({
      questionId: question.id,
      testId: question.testId,
      part: question.part,
      mode: "dictation",
      userText: userInput,
      accuracy: result.accuracy,
      status: result.status,
      timestamp: Date.now(),
    });

    onDataChanged();
  };

  const handleAddSingleVocab = async (v: VocabHighlight) => {
    if (!question) return;
    const res = await saveVocabToNotebook({
      word: v.word,
      phonetic: v.phonetic,
      partOfSpeech: v.partOfSpeech,
      meaningVi: v.meaningVi,
      exampleSentence: v.exampleSentence,
      topic: question.topic,
      sourceQuestionId: question.id,
    });
    onDataChanged();
    toast.success(
      res.created
        ? `Đã thêm "${v.word}" vào Giỏ từ`
        : `"${v.word}" đã có trong Giỏ từ`
    );
  };

  const handleAddAllVocab = async () => {
    if (!question) return;
    let addedCount = 0;
    for (const v of question.keyVocab) {
      const res = await saveVocabToNotebook({
        word: v.word,
        phonetic: v.phonetic,
        partOfSpeech: v.partOfSpeech,
        meaningVi: v.meaningVi,
        exampleSentence: v.exampleSentence,
        topic: question.topic,
        sourceQuestionId: question.id,
      });
      if (res.created) addedCount += 1;
    }
    onDataChanged();
    toast.success(
      addedCount > 0
        ? `Đã thêm ${addedCount} từ vào Giỏ từ`
        : "Tất cả từ vựng của câu đã có trong Giỏ từ"
    );
  };

  // Global keyboard shortcuts matching bottom bar:
  // "Ctrl: phát lại · Tab: lật từ · Enter: câu tiếp theo · ←/→: chuyển câu"
  useEffect(() => {
    let ctrlComboUsed = false;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Control" && e.ctrlKey) {
        ctrlComboUsed = true;
      }
      if (e.key === "Control") {
        ctrlComboUsed = false;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control" && !ctrlComboUsed) {
        replayTriggerRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useHotkeys(
    "ctrl+space",
    (e) => {
      e.preventDefault();
      replayTriggerRef.current();
    },
    { enableOnFormTags: true }
  );

  useHotkeys(
    "tab",
    (e) => {
      if (mode === "check" && !isSentenceCompleted && !drawerWord) {
        e.preventDefault();
        handleRevealWords(1);
      }
    },
    { enableOnFormTags: true },
    [mode, isSentenceCompleted, tokens, drawerWord]
  );

  useHotkeys(
    "enter",
    (e) => {
      if (drawerWord || basketOpen) return;
      if (mode === "check") {
        e.preventDefault();
        if (isSentenceCompleted) {
          handleNext();
        } else if (activeBlankIdx !== null) {
          const cur = tokens[activeBlankIdx];
          if (cur && !isBlankTokenMatch(cur.userInput, cur.cleanWord)) {
            setShakeKey((k) => k + 1);
            toast.info("Từ chưa khớp, thử nghe lại hoặc bấm Tab để lật 1 từ nhé.");
          }
        }
      }
    },
    { enableOnFormTags: true },
    [mode, isSentenceCompleted, currentIndex, activeBlankIdx, tokens, drawerWord, basketOpen]
  );

  useHotkeys(
    "left",
    (e) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      handlePrev();
    },
    {},
    [currentIndex]
  );

  useHotkeys(
    "right",
    (e) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      handleNext();
    },
    {},
    [currentIndex, questions.length]
  );

  if (!question) {
    return (
      <div className="rounded-xl border border-[#e1e7ef] bg-white p-8 text-center">
        <p className="text-slate-600">Không có câu hỏi nào trong phần này.</p>
        <button
          type="button"
          onClick={onExit}
          className="mt-4 rounded-lg bg-[#2463eb] px-4 py-2 text-sm font-semibold text-white"
        >
          Quay lại lộ trình A1–C2
        </button>
      </div>
    );
  }

  return (
    <div
      data-testid="dictation-studio"
      className="flex min-h-[calc(100vh-140px)] flex-col justify-between gap-5 pb-16"
    >
      {/* 1. Top Studio Bar matching Screenshots 1 & 2 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExit}
            data-testid="exit-studio-button"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Thoát</span>
          </button>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-blue-100 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <img
              src="/assets/aistudio/0f777f68-388b-4e0b-a765-466be82c8642_6c463418.jfif"
              alt="Owl Avatar"
              className="h-full w-full object-contain p-0.5"
            />
          </span>
        </div>

        {/* Center Segmented Mode Tabs: Nghe chép | Nghe check | Nghe full */}
        <div
          role="tablist"
          aria-label="Chế độ luyện nghe"
          className="inline-flex items-center gap-1 rounded-full border border-[#e1e7ef] bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
          {STUDIO_MODES.map((m) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(m.id)}
                data-testid={`studio-mode-${m.id}`}
                className={cn(
                  "cursor-pointer whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
                  active
                    ? "bg-[#2463eb] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                )}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Right Amber Pill: 3s • +5 XP */}
        <div
          data-testid="studio-timer-xp"
          className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-3.5 py-1.5 text-sm font-semibold text-amber-700 tabular-nums dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300"
        >
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono">{elapsedSeconds}s</span>
          </span>
          <span aria-hidden="true">•</span>
          <span className="inline-flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span className="font-mono">+{sessionXp} XP</span>
          </span>
        </div>
      </div>

      {/* 2. Main 2-Column Workspace */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)] lg:items-start">
        {/* LEFT COLUMN: Audio Waveform + Interactive Blank / Dictation Card */}
        <div className="space-y-4">
          <DauWaveformPlayer
            question={question}
            playbackRate={profile.playbackRate}
            onChangePlaybackRate={(rate) => onUpdateProfile({ playbackRate: rate })}
            registerReplayTrigger={(fn) => {
              replayTriggerRef.current = fn;
            }}
          />

          {/* Main Exercise Card */}
          <div className="rounded-2xl border border-[#e1e7ef] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {/* Card Toolbar: Density 30% | 50% | 100% (or mode label) + Bookmark / Copy / Hỏi bài */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {mode === "check" ? (
                <div className="inline-flex items-center gap-1 rounded-xl border border-[#e1e7ef] bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
                  {DENSITY_OPTIONS.map((pct) => {
                    const active = blankDensity === pct;
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setBlankDensity(pct)}
                        data-testid={`density-${pct}`}
                        className={cn(
                          "cursor-pointer rounded-lg px-3 py-1 font-mono text-xs font-semibold tabular-nums transition-all",
                          active
                            ? "bg-[#2463eb] text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                        )}
                      >
                        {pct}%
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {title} · Câu {currentIndex + 1}/{questions.length}
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const added = await toggleReviewQueueItem(question.id, 0);
                    onDataChanged();
                    toast.success(
                      added
                        ? "Đã lưu vào Câu cần luyện lại"
                        : "Đã bỏ lưu khỏi Câu cần luyện lại"
                    );
                  }}
                  title="Lưu câu cần luyện lại"
                  aria-label="Lưu câu cần luyện lại"
                  className={cn(
                    "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-colors",
                    isInReviewQueue
                      ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/60"
                      : "border-[#e1e7ef] bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  )}
                >
                  <Bookmark
                    className={cn("h-4 w-4", isInReviewQueue && "fill-current")}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(question.transcript);
                    setCopiedSentence(true);
                    toast.success("Đã sao chép câu tiếng Anh");
                    setTimeout(() => setCopiedSentence(false), 1500);
                  }}
                  title="Sao chép câu"
                  aria-label="Sao chép câu"
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#e1e7ef] bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  {copiedSentence ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>

                {/* Hỏi bài Popover: Linked Speech & Grammar breakdown */}
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button
                      type="button"
                      data-testid="ask-lesson-button"
                      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-[#e1e7ef] bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <HelpCircle className="h-4 w-4 text-[#2463eb]" />
                      <span>Hỏi bài</span>
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      sideOffset={8}
                      align="end"
                      className="z-50 w-80 rounded-xl border border-[#e1e7ef] bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                    >
                      <p className="font-display text-sm font-bold text-slate-900 dark:text-slate-50">
                        Giải thích câu nghe
                      </p>
                      <div className="mt-3 space-y-2.5 text-xs leading-relaxed">
                        <div className="rounded-lg bg-[#eff6ff] p-2.5 text-slate-700 dark:bg-blue-950/50 dark:text-slate-200">
                          <span className="font-semibold text-[#1d4ed8] dark:text-blue-300">
                            Nối âm &amp; phát âm:{" "}
                          </span>
                          {question.linkedSpeechTip}
                        </div>
                        <div className="rounded-lg bg-slate-50 p-2.5 text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            Ngữ pháp trọng tâm:{" "}
                          </span>
                          {question.grammarNote}
                        </div>
                      </div>
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </div>
            </div>

            {/* MODE 1 (DEFAULT): NGHE CHECK — Inline Fill-in-the-Blank Slots */}
            {mode === "check" && (
              <div className="mt-4 space-y-4">
                {question.dialogue && question.dialogue.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-[#eff6ff]/60 px-3.5 py-2 text-xs dark:border-blue-900/40 dark:bg-blue-950/40">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      Hội thoại đối đáp:
                    </span>
                    {Array.from(
                      new Set(question.dialogue.map((d) => d.speaker))
                    ).map((spk) => (
                      <span
                        key={spk}
                        className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white/80 px-2.5 py-0.5 text-xs font-semibold text-[#1d4ed8] shadow-xs dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300"
                      >
                        <Users className="h-3 w-3 text-[#2463eb]" />
                        <span>{spk}</span>
                      </span>
                    ))}
                  </div>
                )}
                <motion.div
                  key={shakeKey}
                  animate={shakeKey > 0 ? { x: [0, -5, 5, -3, 3, 0] } : undefined}
                  transition={{ duration: 0.25 }}
                  data-testid="check-sentence-box"
                  className="flex flex-wrap items-center gap-x-2 gap-y-3 rounded-xl bg-slate-50/85 p-4 text-base leading-relaxed dark:bg-slate-950/80"
                >
                  {tokens.map((tok, idx) => {
                    if (!tok.isWord) {
                      return (
                        <span key={tok.id} className="text-slate-600">
                          {tok.raw}
                        </span>
                      );
                    }

                    const isSolvedBlank =
                      tok.isBlank &&
                      (tok.status === "correct" || tok.status === "revealed");

                    // Non-blank word or already solved/revealed blank
                    if (!tok.isBlank || isSolvedBlank) {
                      const clickable = isSentenceCompleted || isSolvedBlank;
                      return (
                        <span key={tok.id} className="inline-flex items-center">
                          {tok.leadingPunctuation && (
                            <span className="text-slate-500">
                              {tok.leadingPunctuation}
                            </span>
                          )}
                          {clickable ? (
                            <button
                              type="button"
                              onClick={() => setDrawerWord(tok.cleanWord)}
                              data-testid={`word-chip-${tok.cleanWord.toLowerCase()}`}
                              className={cn(
                                "cursor-pointer rounded-md px-2 py-0.5 text-[15px] font-medium transition-colors",
                                isSolvedBlank
                                  ? "bg-emerald-100/90 font-semibold text-emerald-800 hover:bg-emerald-200/80 dark:bg-emerald-950/70 dark:text-emerald-300"
                                  : "text-slate-800 hover:bg-[#eff6ff] hover:text-[#2463eb] dark:text-slate-100"
                              )}
                            >
                              {tok.cleanWord}
                            </button>
                          ) : (
                            <span className="text-[15px] font-medium text-slate-700 dark:text-slate-200">
                              {tok.cleanWord}
                            </span>
                          )}
                          {tok.trailingPunctuation && (
                            <span className="ml-0.5 text-slate-600">
                              {tok.trailingPunctuation}
                            </span>
                          )}
                        </span>
                      );
                    }

                    // Active blank input slot matching Screenshot 1
                    const inputWidth = Math.max(
                      64,
                      tok.cleanWord.length * 10 + 22
                    );
                    return (
                      <span key={tok.id} className="inline-flex items-center">
                        {tok.leadingPunctuation && (
                          <span className="mr-0.5 text-slate-500">
                            {tok.leadingPunctuation}
                          </span>
                        )}
                        <input
                          ref={(el) => {
                            blankInputRefs.current[idx] = el;
                          }}
                          type="text"
                          value={tok.userInput}
                          onFocus={() => setActiveBlankIdx(idx)}
                          onChange={(e) => handleBlankChange(idx, e.target.value)}
                          data-testid={`blank-input-${idx}`}
                          aria-label={`Ô điền từ thứ ${idx + 1}`}
                          autoComplete="off"
                          spellCheck={false}
                          style={{ width: `${inputWidth}px` }}
                          className="h-9 rounded-lg border border-slate-200 bg-slate-200/75 px-2.5 text-center text-[15px] font-medium text-slate-900 transition-colors outline-none focus:border-[#2463eb] focus:bg-white focus:ring-2 focus:ring-[#2463eb]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
                        />
                        {tok.trailingPunctuation && (
                          <span className="ml-1 text-slate-600">
                            {tok.trailingPunctuation}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </motion.div>

                {/* Completed Translation Box matching Screenshot 2 */}
                {isSentenceCompleted && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    data-testid="translation-box"
                    className="rounded-xl border border-[#2463eb]/25 bg-[#eff6ff]/70 px-4 py-3 text-sm dark:border-blue-900 dark:bg-blue-950/40"
                  >
                    <p className="font-semibold text-[#1d4ed8] dark:text-blue-300">
                      Dịch nghĩa:
                    </p>
                    <p className="mt-0.5 text-[#1d4ed8] dark:text-blue-200">
                      {question.transcriptVi}
                    </p>
                  </motion.div>
                )}

                {/* LẬT TỪ Controls matching Screenshots 1 & 2 */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="mr-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                    LẬT TỪ
                  </span>
                  {(
                    [
                      { label: "1 từ", count: 1, testId: "reveal-1" },
                      { label: "2 từ", count: 2, testId: "reveal-2" },
                      { label: "3 từ", count: 3, testId: "reveal-3" },
                      { label: "Tất cả", count: "all" as const, testId: "reveal-all" },
                    ] as const
                  ).map((btn) => (
                    <button
                      key={btn.testId}
                      type="button"
                      disabled={isSentenceCompleted}
                      onClick={() => handleRevealWords(btn.count)}
                      data-testid={btn.testId}
                      className={cn(
                        "rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        isSentenceCompleted
                          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600"
                          : "cursor-pointer border-[#e1e7ef] bg-white text-slate-700 hover:border-[#2463eb]/40 hover:bg-[#eff6ff] hover:text-[#2463eb] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      )}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MODE 2: NGHE CHÉP — Full Sentence Free Dictation */}
            {mode === "dictation" && (
              <div className="mt-4 space-y-3">
                <motion.div
                  key={shakeKey}
                  animate={shakeKey > 0 ? { x: [0, -6, 6, -4, 4, 0] } : undefined}
                  transition={{ duration: 0.25 }}
                >
                  <textarea
                    rows={3}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    data-testid="dictation-input"
                    placeholder="Gõ lại toàn bộ câu bạn nghe được..."
                    className="w-full rounded-xl border border-[#e1e7ef] bg-slate-50/70 p-4 text-base leading-relaxed text-slate-900 outline-none focus:border-[#2463eb] focus:bg-white focus:ring-2 focus:ring-[#2463eb]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </motion.div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextText = getNextWordHint(
                        userInput,
                        question.transcript
                      );
                      setUserInput(nextText);
                    }}
                    data-testid="hint-next-word-button"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#e1e7ef] bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Gợi ý từ tiếp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCheckDictation}
                    data-testid="check-dictation-button"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#2463eb] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8]"
                  >
                    <Check className="h-4 w-4" />
                    <span>
                      {grading?.status === "mastered"
                        ? "Câu tiếp theo"
                        : "Kiểm tra đáp án"}
                    </span>
                  </button>
                </div>

                <div ref={feedbackRef}>
                  {grading && (
                    <div
                      data-testid="dictation-feedback"
                      className={cn(
                        "rounded-xl border p-4 text-sm",
                        grading.status === "mastered"
                          ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30"
                          : grading.status === "near"
                          ? "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30"
                          : "border-rose-200 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/30"
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                          {grading.status === "mastered" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-rose-600" />
                          )}
                          {grading.status === "mastered"
                            ? "Chính xác tuyệt đối!"
                            : "Đối chiếu từng từ:"}
                        </span>
                        <span className="font-mono font-bold text-[#2463eb] tabular-nums">
                          {grading.accuracy}%
                        </span>
                      </div>

                      {grading.status === "mastered" && (
                        <div className="mt-2">
                          <LottieCelebration comboStreak={comboStreak} />
                        </div>
                      )}

                      <p className="mt-2 leading-relaxed">
                        {grading.diffTokens.map((tok, i) => (
                          <span
                            key={i}
                            className={cn(
                              tok.type === "matched" &&
                                "text-emerald-700 dark:text-emerald-300",
                              tok.type === "added" &&
                                "rounded bg-rose-100 px-1 text-rose-700 line-through",
                              tok.type === "removed" &&
                                "rounded bg-amber-100 px-1 font-semibold text-amber-800"
                            )}
                          >
                            {tok.value}
                          </span>
                        ))}
                      </p>
                    </div>
                  )}
                </div>

                {isSentenceCompleted && (
                  <div
                    data-testid="transcript-box"
                    className="space-y-2 rounded-xl border border-[#2463eb]/20 bg-[#eff6ff]/60 p-4"
                  >
                    <TranscriptAnnotator
                      text={question.transcript}
                      question={question}
                      onSavedVocab={onDataChanged}
                    />
                    <p className="text-sm text-[#1d4ed8]">
                      <strong>Dịch nghĩa:</strong> {question.transcriptVi}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* MODE 3: NGHE FULL — Full Transcript & Clickable Words */}
            {mode === "full" && (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-slate-50/85 p-4 dark:bg-slate-950/80">
                  <div className="flex flex-wrap gap-1.5 text-base leading-relaxed">
                    {question.transcript.split(/\s+/).map((raw, i) => {
                      const clean = raw.replace(/^[^a-zA-Z0-9'-]+|[^a-zA-Z0-9'-]+$/g, "");
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => clean && setDrawerWord(clean)}
                          className="cursor-pointer rounded-md px-1 py-0.5 font-medium text-slate-800 transition-colors hover:bg-[#eff6ff] hover:text-[#2463eb] dark:text-slate-100"
                        >
                          {raw}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {question.dialogue && question.dialogue.length > 0 && (
                  <div className="space-y-1.5 rounded-xl border border-[#e1e7ef] bg-white p-3.5 text-sm dark:border-slate-800 dark:bg-slate-950">
                    {question.dialogue.map((d, i) => (
                      <p key={i} className="text-slate-700 dark:text-slate-300">
                        <strong className="text-[#2463eb]">{d.speaker}: </strong>
                        {d.text}
                      </p>
                    ))}
                  </div>
                )}

                <div className="rounded-xl border border-[#2463eb]/25 bg-[#eff6ff]/70 px-4 py-3 text-sm text-[#1d4ed8] dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                  <p className="font-semibold">Dịch nghĩa:</p>
                  <p className="mt-0.5">{question.transcriptVi}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: "Từ vựng nên học" Card matching Screenshots 1 & 2 */}
        <aside
          data-testid="vocab-to-learn-panel"
          className="rounded-2xl border border-[#e1e7ef] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <BookOpen className="h-4 w-4 text-[#2463eb]" />
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
              Từ vựng nên học
            </h3>
          </div>

          {!isSentenceCompleted ? (
            <div
              data-testid="vocab-locked-state"
              className="flex min-h-[260px] flex-col items-center justify-center px-4 py-10 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-900 dark:text-slate-100">
                Chép xong câu để xem {question.keyVocab.length} từ nên học
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                Từ vựng nằm ngay trong câu, hiện sớm sẽ lộ đáp án.
              </p>
            </div>
          ) : (
            <div data-testid="vocab-unlocked-state" className="mt-4 space-y-3">
              {/* Sub-header: "N từ | Chi tiết | + Thêm tất cả (N)" */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-sm font-semibold text-slate-600 tabular-nums">
                  {question.keyVocab.length} từ
                </span>

                <div className="flex items-center gap-2">
                  {question.keyVocab[0] && (
                    <button
                      type="button"
                      onClick={() => setDrawerWord(question.keyVocab[0].word)}
                      data-testid="vocab-details-button"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200/70 dark:text-slate-200"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Chi tiết</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleAddAllVocab}
                    data-testid="add-all-vocab-button"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#2463eb] px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1d4ed8]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Thêm tất cả ({question.keyVocab.length})</span>
                  </button>
                </div>
              </div>

              {/* Vocabulary Cards List */}
              <div className="space-y-2.5">
                {question.keyVocab.map((v) => {
                  const meta = getOfflineWordBadge(v, cefrLevel);
                  const saved = savedWordsSet.has(v.word.toLowerCase());
                  return (
                    <div
                      key={v.word}
                      className="rounded-xl border border-[#e1e7ef] bg-white p-3.5 transition-colors hover:border-[#2463eb]/35 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDrawerWord(v.word)}
                              className="cursor-pointer font-display text-base font-bold text-slate-900 hover:text-[#2463eb] dark:text-slate-50"
                            >
                              {v.word}
                            </button>
                            <span className="text-xs italic text-slate-500">
                              {meta.posShort}
                            </span>
                            <span className="rounded bg-[#eff6ff] px-1.5 py-0.5 text-[11px] font-bold text-[#2463eb] dark:bg-blue-950/70 dark:text-blue-300">
                              {meta.cefr}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="font-mono">{v.phonetic}</span>
                            <button
                              type="button"
                              onClick={() => playWordPronunciation(v.word, "US")}
                              aria-label={`Nghe phát âm ${v.word}`}
                              className="cursor-pointer rounded p-0.5 text-[#2463eb] hover:bg-[#eff6ff]"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300">
                            {v.meaningVi}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDrawerWord(v.word)}
                            title="Mở chi tiết & Flashcard từ này"
                            aria-label={`Xem chi tiết ${v.word}`}
                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                          >
                            <Flag className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddSingleVocab(v)}
                            className={cn(
                              "inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                              saved
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-[#eff6ff] text-[#2463eb] hover:bg-[#dbeafe] dark:bg-blue-950/60 dark:text-blue-300"
                            )}
                          >
                            {saved ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Đã thêm</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" />
                                <span>Thêm</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* 3. Persistent Bottom Bar matching Screenshots 1 & 2 */}
      <div
        data-testid="studio-bottom-bar"
        className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#e1e7ef] bg-white/95 px-4 py-3 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95"
      >
        {/* Left: Báo lỗi + Giỏ từ */}
        <div className="flex items-center gap-2">
          <Popover.Root open={reportPopoverOpen} onOpenChange={setReportPopoverOpen}>
            <Popover.Trigger asChild>
              <button
                type="button"
                data-testid="report-error-button"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#e1e7ef] bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Flag className="h-4 w-4 text-slate-500" />
                <span>Báo lỗi</span>
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="top"
                align="start"
                sideOffset={8}
                className="z-50 w-72 rounded-xl border border-[#e1e7ef] bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Báo lỗi câu nghe #{currentIndex + 1}
                </p>
                <textarea
                  rows={2}
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Mô tả lỗi audio, chính tả hoặc nghĩa..."
                  className="mt-2 w-full rounded-lg border border-[#e1e7ef] p-2 text-xs outline-none focus:border-[#2463eb] dark:border-slate-700 dark:bg-slate-950"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const prev = JSON.parse(
                        localStorage.getItem("duc_english_reports") || "[]"
                      );
                      prev.push({
                        questionId: question.id,
                        note: reportNote.trim() || "Cần rà soát lại nội dung câu",
                        createdAt: Date.now(),
                      });
                      localStorage.setItem(
                        "duc_english_reports",
                        JSON.stringify(prev)
                      );
                      setReportNote("");
                      setReportPopoverOpen(false);
                      toast.success("Cảm ơn bạn! Đã ghi nhận phản hồi câu này.");
                    }}
                    className="cursor-pointer rounded-lg bg-[#2463eb] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Gửi báo lỗi
                  </button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <button
            type="button"
            onClick={() => setBasketOpen(true)}
            data-testid="vocab-basket-button"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#e1e7ef] bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <ShoppingBasket className="h-4 w-4 text-[#2463eb]" />
            <span>Giỏ từ</span>
            {vocabList.length > 0 && (
              <span className="rounded-full bg-[#eff6ff] px-1.5 py-0.5 font-mono text-xs font-semibold text-[#2463eb] tabular-nums">
                {vocabList.length}
              </span>
            )}
          </button>
        </div>

        {/* Center: Shortcut Hints */}
        <p className="hidden text-xs font-medium text-slate-500 md:block">
          Ctrl: phát lại · Tab: lật từ · Enter: câu tiếp theo · ←/→: chuyển câu
        </p>

        {/* Right: Question Switcher 1/N */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              data-testid="question-switcher-button"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#2463eb] px-3.5 py-1.5 font-mono text-sm font-semibold text-white tabular-nums shadow-xs hover:bg-[#1d4ed8]"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>
                {currentIndex + 1}/{questions.length}
              </span>
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="top"
              align="end"
              sideOffset={8}
              className="z-50 w-64 rounded-xl border border-[#e1e7ef] bg-white p-3.5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Chọn nhanh câu ({questions.length} câu · {TOPIC_LABELS[question.topic]})
              </p>
              <div className="mt-2.5 grid grid-cols-4 gap-1.5">
                {questions.map((q, idx) => {
                  const active = idx === currentIndex;
                  const mastered =
                    checkCompletedIds.has(q.id) ||
                    (bestAccuracyMap.get(q.id) ?? 0) >= 80;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        "h-9 cursor-pointer rounded-lg font-mono text-xs font-semibold transition-colors",
                        active
                          ? "bg-[#2463eb] text-white"
                          : mastered
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {/* Right-Side Word Definition & 3D Flip Flashcard Drawer (Screenshot 3) */}
      <WordDetailDrawer
        word={drawerWord}
        question={question}
        contextTitle={title}
        fallbackCefr={cefrLevel}
        savedWordsSet={savedWordsSet}
        onSelectWord={(nextW) => setDrawerWord(nextW)}
        onClose={() => setDrawerWord(null)}
        onSavedVocab={onDataChanged}
      />

      {/* Giỏ từ (Saved Vocab Basket) Slide-over Modal */}
      <Dialog.Root open={basketOpen} onOpenChange={setBasketOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-[1px]" />
          <Dialog.Content
            data-testid="vocab-basket-drawer"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[#e1e7ef] bg-white p-5 shadow-2xl outline-none dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <Dialog.Title className="flex items-center gap-2 font-display text-lg font-bold text-slate-900 dark:text-slate-50">
                <ShoppingBasket className="h-5 w-5 text-[#2463eb]" />
                <span>Giỏ từ vựng ({vocabList.length})</span>
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Đóng giỏ từ"
                  className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto">
              {vocabList.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-500">
                  Giỏ từ chưa có từ nào. Hoàn thành câu nghe rồi bấm + Thêm để lưu nhé!
                </p>
              ) : (
                vocabList.map((item) => (
                  <div
                    key={item.id ?? item.word}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#e1e7ef] p-3 dark:border-slate-800"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-slate-900 dark:text-slate-100">
                          {item.word}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {item.phonetic}
                        </span>
                      </div>
                      <p className="truncate text-xs text-slate-600 dark:text-slate-400">
                        {item.meaningVi}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => playWordPronunciation(item.word, "US")}
                        aria-label={`Phát âm ${item.word}`}
                        className="cursor-pointer rounded-lg p-1.5 text-[#2463eb] hover:bg-[#eff6ff]"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                      {item.id && (
                        <button
                          type="button"
                          onClick={async () => {
                            await db.vocab.delete(item.id!);
                            onDataChanged();
                          }}
                          aria-label={`Xóa ${item.word}`}
                          className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
