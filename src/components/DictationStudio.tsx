import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { motion } from "motion/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import NumberFlow from "@number-flow/react";
import { useHotkeys } from "react-hotkeys-hook";
import confetti from "canvas-confetti";
import * as Accordion from "@radix-ui/react-accordion";
import * as Switch from "@radix-ui/react-switch";
import {
  ArrowLeft,
  CaretLeft,
  CaretRight,
  CheckCircle,
  WarningCircle,
  Fire,
  BookmarkSimple,
  Eye,
  EyeSlash,
  CaretDown,
  Lightbulb,
  MagicWand,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type {
  DictationAttempt,
  DictationMode,
  GradingResult,
  ListeningQuestion,
  ReviewQueueItem,
  UserProfile,
} from "../types/toeic";
import {
  computeXpForAttempt,
  generateClozePrompt,
  getNextWordHint,
  gradeClozeAnswers,
  gradeDictation,
} from "../lib/dictationEngine";
import {
  db,
  recordDictationAttempt,
  saveVocabToNotebook,
  toggleReviewQueueItem,
} from "../lib/db";
import { WaveSurferAudioPlayer } from "./WaveSurferAudioPlayer";
import { TranscriptAnnotator } from "./TranscriptAnnotator";
import { LottieCelebration } from "./LottieCelebration";
import { cn, LEVEL_LABELS, TOPIC_LABELS } from "../lib/utils";

interface DictationStudioProps {
  title: string;
  questions: ListeningQuestion[];
  initialQuestionIndex?: number;
  initialMode?: DictationMode;
  attempts: DictationAttempt[];
  reviewQueue: ReviewQueueItem[];
  profile: UserProfile;
  onUpdateProfile: (values: Partial<UserProfile>) => void;
  onDataChanged: () => void;
  onExit: () => void;
}

const MODE_TABS: { id: DictationMode; label: string }[] = [
  { id: "dictation", label: "Nghe chép chính tả" },
  { id: "check", label: "Nghe check" },
  { id: "cloze", label: "Điền từ" },
  { id: "full", label: "Nghe full" },
];

export function DictationStudio({
  title,
  questions,
  initialQuestionIndex = 0,
  initialMode = "dictation",
  attempts,
  reviewQueue,
  profile,
  onUpdateProfile,
  onDataChanged,
  onExit,
}: DictationStudioProps) {
  const [currentIndex, setCurrentIndex] = useState(initialQuestionIndex);
  const [mode, setMode] = useState<DictationMode>(initialMode);
  const [userInput, setUserInput] = useState("");
  const [grading, setGrading] = useState<GradingResult | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [showTranscript, setShowTranscript] = useState(initialMode === "full");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [choiceChecked, setChoiceChecked] = useState(false);
  const [clozeAnswers, setClozeAnswers] = useState<Record<string, string>>({});
  const [clozeResult, setClozeResult] = useState<ReturnType<typeof gradeClozeAnswers> | null>(
    null
  );
  const [questionHistory, setQuestionHistory] = useState<DictationAttempt[]>([]);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : true
  );
  const replayTriggerRef = useRef<() => void>(() => {});
  const [feedbackRef] = useAutoAnimate();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const question = questions[currentIndex];
  const isInReviewQueue = useMemo(
    () => Boolean(question && reviewQueue.some((r) => r.questionId === question.id)),
    [question, reviewQueue]
  );

  const clozeSegments = useMemo(
    () => (question ? generateClozePrompt(question.transcript) : []),
    [question]
  );

  // Best accuracy per question for the Pill Navigator
  const bestAccuracyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of attempts) {
      const prev = map.get(a.questionId) ?? -1;
      if (a.accuracy > prev) map.set(a.questionId, a.accuracy);
    }
    return map;
  }, [attempts]);

  useEffect(() => {
    if (!question) return;
    let cancelled = false;

    setGrading(null);
    setSelectedChoice(null);
    setChoiceChecked(false);
    setClozeAnswers({});
    setClozeResult(null);
    setShowTranscript(mode === "full");

    Promise.all([
      db.drafts.get(question.id),
      db.attempts
        .where("questionId")
        .equals(question.id)
        .reverse()
        .limit(5)
        .toArray(),
    ]).then(([draft, history]) => {
      if (cancelled) return;
      setUserInput(draft?.draftText ?? "");
      setQuestionHistory(history);
    });

    return () => {
      cancelled = true;
    };
  }, [question?.id]);

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

  useEffect(() => {
    if (mode === "full") {
      setShowTranscript(true);
    }
  }, [mode]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.65 } });
      toast.success("Chúc mừng! Bạn đã hoàn thành trọn vẹn phần luyện tập này.");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

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
    onUpdateProfile({ xp: profile.xp + earnedXp });

    if (result.status === "mastered") {
      setComboStreak((c) => c + 1);
      setShowTranscript(true);
      confetti({ particleCount: 45, spread: 55, origin: { y: 0.72 } });
      if (profile.autoAdvanceOnMastered && currentIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentIndex((i) => i + 1);
        }, 1200);
      }
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

    if (result.shouldAutoReview) {
      toast.info("Đã tự động lưu câu này vào 'Câu cần luyện lại'.");
    }

    const updatedHistory = await db.attempts
      .where("questionId")
      .equals(question.id)
      .reverse()
      .limit(5)
      .toArray();
    setQuestionHistory(updatedHistory);
    onDataChanged();
  };

  const handleHintNextWord = () => {
    if (!question) return;
    const hinted = getNextWordHint(userInput, question.transcript);
    setUserInput(hinted);
  };

  const handleCheckCloze = async () => {
    if (!question) return;
    const res = gradeClozeAnswers(clozeSegments, clozeAnswers);
    setClozeResult(res);
    if (res.accuracy >= 80) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
    await recordDictationAttempt({
      questionId: question.id,
      testId: question.testId,
      part: question.part,
      mode: "cloze",
      userText: Object.values(clozeAnswers).join(" "),
      accuracy: res.accuracy,
      status: res.accuracy >= 95 ? "mastered" : res.accuracy >= 70 ? "near" : "weak",
      timestamp: Date.now(),
    });
    onDataChanged();
  };

  const handleCheckMultipleChoice = async () => {
    if (!question || selectedChoice === null) return;
    setChoiceChecked(true);
    const isRight = selectedChoice === question.correctChoiceIndex;
    if (isRight) {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    }
    await recordDictationAttempt({
      questionId: question.id,
      testId: question.testId,
      part: question.part,
      mode: "check",
      userText: question.choices?.[selectedChoice] ?? "",
      accuracy: isRight ? 100 : 40,
      status: isRight ? "mastered" : "weak",
      timestamp: Date.now(),
    });
    onDataChanged();
  };

  const handleToggleReview = async () => {
    if (!question) return;
    const added = await toggleReviewQueueItem(question.id, grading?.accuracy ?? 0);
    onDataChanged();
    toast.success(
      added
        ? "Đã thêm vào danh sách Câu cần luyện lại."
        : "Đã bỏ khỏi danh sách Câu cần luyện lại."
    );
  };

  const handleSaveVocab = async (item: ListeningQuestion["keyVocab"][number]) => {
    if (!question) return;
    const { created } = await saveVocabToNotebook({
      word: item.word,
      phonetic: item.phonetic,
      partOfSpeech: item.partOfSpeech,
      meaningVi: item.meaningVi,
      exampleSentence: item.exampleSentence,
      topic: TOPIC_LABELS[question.topic],
      sourceQuestionId: question.id,
    });
    onDataChanged();
    if (created) {
      toast.success(`Đã lưu từ "${item.word}" vào Giỏ từ vựng!`);
    } else {
      toast.info(`Từ "${item.word}" đã có trong Giỏ từ vựng.`);
    }
  };

  useHotkeys(
    "ctrl+space",
    (e) => {
      e.preventDefault();
      replayTriggerRef.current();
    },
    { enableOnFormTags: ["INPUT", "TEXTAREA"] }
  );

  useHotkeys(
    "alt+n",
    (e) => {
      e.preventDefault();
      handleNext();
    },
    { enableOnFormTags: ["INPUT", "TEXTAREA"] }
  );

  useHotkeys(
    "alt+p",
    (e) => {
      e.preventDefault();
      handlePrev();
    },
    { enableOnFormTags: ["INPUT", "TEXTAREA"] }
  );

  if (!question) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center">
        <p className="text-slate-600">Không tìm thấy câu hỏi luyện tập.</p>
        <button
          type="button"
          onClick={onExit}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Studio Header + Question Navigator Pills */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              data-testid="exit-studio-button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft size={15} />
              <span>Danh sách</span>
            </button>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
                {title}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span>Part {question.part}</span>
                <span aria-hidden="true">·</span>
                <span>{LEVEL_LABELS[question.level]}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  Câu {currentIndex + 1}/{questions.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Chuỗi đúng:{" "}
              <span className="font-mono text-sm font-bold text-emerald-600 tabular-nums">
                <NumberFlow value={comboStreak} />
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleReview}
              data-testid="toggle-review-button"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                isInReviewQueue
                  ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              )}
            >
              <Fire size={15} weight={isInReviewQueue ? "fill" : "duotone"} />
              <span>{isInReviewQueue ? "Đã lưu luyện lại" : "Lưu luyện lại"}</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                aria-label="Câu trước"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                <CaretLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Câu tiếp theo"
                data-testid="next-question-button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                <CaretRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Question Number Pills Navigator */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2.5 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {questions.map((q, idx) => {
              const best = bestAccuracyMap.get(q.id);
              const isCurrent = idx === currentIndex;
              const isReview = reviewQueue.some((r) => r.questionId === q.id);

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  data-testid={`question-pill-${idx + 1}`}
                  className={cn(
                    "h-7 min-w-7 rounded-md border px-2 font-mono text-xs font-semibold tabular-nums transition-colors",
                    isCurrent
                      ? "border-blue-600 bg-blue-600 text-white"
                      : best !== undefined && best >= 80
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : isReview
                      ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <label className="flex items-center gap-2">
              <Switch.Root
                checked={profile.autoAdvanceOnMastered}
                onCheckedChange={(checked) =>
                  onUpdateProfile({ autoAdvanceOnMastered: checked })
                }
                className="relative h-5 w-9 cursor-pointer rounded-full bg-slate-200 transition-colors data-[state=checked]:bg-blue-600 dark:bg-slate-700"
              >
                <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-xs transition-transform data-[state=checked]:translate-x-4.5" />
              </Switch.Root>
              <span>Tự qua câu khi đạt</span>
            </label>

            <label className="flex items-center gap-2">
              <Switch.Root
                checked={profile.strictPunctuation}
                onCheckedChange={(checked) =>
                  onUpdateProfile({ strictPunctuation: checked })
                }
                className="relative h-5 w-9 cursor-pointer rounded-full bg-slate-200 transition-colors data-[state=checked]:bg-blue-600 dark:bg-slate-700"
              >
                <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-xs transition-transform data-[state=checked]:translate-x-4.5" />
              </Switch.Root>
              <span>Chấm chặt dấu câu</span>
            </label>
          </div>
        </div>
      </div>

      {/* Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800/80">
          {MODE_TABS.map((tab) => {
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id)}
                data-testid={`mode-${tab.id}`}
                className="relative rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
              >
                {isActive && (
                  <motion.span
                    layoutId="dictationModePill"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-lg bg-white shadow-xs dark:bg-slate-900"
                  />
                )}
                <span
                  className={cn(
                    "relative z-10",
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-500">
          Phím tắt: <kbd className="font-mono">Ctrl+Space</kbd> nghe lại ·{" "}
          <kbd className="font-mono">Enter</kbd> chấm bài ·{" "}
          <kbd className="font-mono">Alt+N</kbd> câu kế
        </span>
      </div>

      {/* Resizable Split Workspace (Desktop) or Stacked View (Mobile) */}
      {isDesktop ? (
        <Group orientation="horizontal" className="min-h-[540px] gap-2">
          <Panel defaultSize="58" minSize="40">
            <LeftPracticePane
              question={question}
              mode={mode}
              profile={profile}
              userInput={userInput}
              setUserInput={setUserInput}
              grading={grading}
              shakeKey={shakeKey}
              feedbackRef={feedbackRef}
              onCheckDictation={handleCheckDictation}
              onHintNextWord={handleHintNextWord}
              onUpdatePlaybackRate={(rate) =>
                onUpdateProfile({ playbackRate: rate })
              }
              registerReplayTrigger={(fn) => {
                replayTriggerRef.current = fn;
              }}
              selectedChoice={selectedChoice}
              setSelectedChoice={setSelectedChoice}
              choiceChecked={choiceChecked}
              onCheckMultipleChoice={handleCheckMultipleChoice}
              clozeSegments={clozeSegments}
              clozeAnswers={clozeAnswers}
              setClozeAnswers={setClozeAnswers}
              clozeResult={clozeResult}
              onCheckCloze={handleCheckCloze}
              comboStreak={comboStreak}
              onNext={handleNext}
            />
          </Panel>

          <Separator className="flex w-2 items-center justify-center rounded-full bg-slate-200/70 transition-colors hover:bg-blue-400 dark:bg-slate-800 dark:hover:bg-blue-600" />

          <Panel defaultSize="42" minSize="28">
            <RightInspectorPane
              question={question}
              showTranscript={showTranscript}
              onToggleTranscript={() => setShowTranscript((v) => !v)}
              questionHistory={questionHistory}
              onSaveVocab={handleSaveVocab}
              onDataChanged={onDataChanged}
            />
          </Panel>
        </Group>
      ) : (
        <div className="space-y-4">
          <LeftPracticePane
            question={question}
            mode={mode}
            profile={profile}
            userInput={userInput}
            setUserInput={setUserInput}
            grading={grading}
            shakeKey={shakeKey}
            feedbackRef={feedbackRef}
            onCheckDictation={handleCheckDictation}
            onHintNextWord={handleHintNextWord}
            onUpdatePlaybackRate={(rate) =>
              onUpdateProfile({ playbackRate: rate })
            }
            registerReplayTrigger={(fn) => {
              replayTriggerRef.current = fn;
            }}
            selectedChoice={selectedChoice}
            setSelectedChoice={setSelectedChoice}
            choiceChecked={choiceChecked}
            onCheckMultipleChoice={handleCheckMultipleChoice}
            clozeSegments={clozeSegments}
            clozeAnswers={clozeAnswers}
            setClozeAnswers={setClozeAnswers}
            clozeResult={clozeResult}
            onCheckCloze={handleCheckCloze}
            comboStreak={comboStreak}
            onNext={handleNext}
          />
          <RightInspectorPane
            question={question}
            showTranscript={showTranscript}
            onToggleTranscript={() => setShowTranscript((v) => !v)}
            questionHistory={questionHistory}
            onSaveVocab={handleSaveVocab}
            onDataChanged={onDataChanged}
          />
        </div>
      )}
    </div>
  );
}

interface LeftPracticePaneProps {
  question: ListeningQuestion;
  mode: DictationMode;
  profile: UserProfile;
  userInput: string;
  setUserInput: (val: string) => void;
  grading: GradingResult | null;
  shakeKey: number;
  feedbackRef: React.Ref<HTMLDivElement>;
  onCheckDictation: () => void;
  onHintNextWord: () => void;
  onUpdatePlaybackRate: (rate: number) => void;
  registerReplayTrigger: (fn: () => void) => void;
  selectedChoice: number | null;
  setSelectedChoice: (idx: number) => void;
  choiceChecked: boolean;
  onCheckMultipleChoice: () => void;
  clozeSegments: ReturnType<typeof generateClozePrompt>;
  clozeAnswers: Record<string, string>;
  setClozeAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  clozeResult: ReturnType<typeof gradeClozeAnswers> | null;
  onCheckCloze: () => void;
  comboStreak: number;
  onNext: () => void;
}

function LeftPracticePane({
  question,
  mode,
  profile,
  userInput,
  setUserInput,
  grading,
  shakeKey,
  feedbackRef,
  onCheckDictation,
  onHintNextWord,
  onUpdatePlaybackRate,
  registerReplayTrigger,
  selectedChoice,
  setSelectedChoice,
  choiceChecked,
  onCheckMultipleChoice,
  clozeSegments,
  clozeAnswers,
  setClozeAnswers,
  clozeResult,
  onCheckCloze,
  comboStreak,
  onNext,
}: LeftPracticePaneProps) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      {question.imageUrl && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
          <img
            src={question.imageUrl}
            alt={question.title}
            referrerPolicy="no-referrer"
            className="h-52 w-full object-cover"
          />
        </div>
      )}

      <WaveSurferAudioPlayer
        question={question}
        playbackRate={profile.playbackRate}
        onChangePlaybackRate={onUpdatePlaybackRate}
        registerReplayTrigger={registerReplayTrigger}
      />

      {mode === "dictation" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <label
              htmlFor="dictation-input"
              className="font-semibold text-slate-700 dark:text-slate-300"
            >
              Gõ lại chính xác câu bạn nghe được:
            </label>
            {grading && (
              <span className="font-mono font-bold text-slate-900 tabular-nums dark:text-slate-100">
                Độ chính xác: <NumberFlow value={grading.accuracy} />%
              </span>
            )}
          </div>

          <motion.div
            key={shakeKey}
            animate={
              grading && grading.status !== "mastered"
                ? { x: [-8, 8, -5, 5, -2, 2, 0] }
                : { x: 0 }
            }
            transition={{ duration: 0.28 }}
          >
            <textarea
              id="dictation-input"
              data-testid="dictation-input"
              rows={3}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onCheckDictation();
                }
              }}
              placeholder="Nhấn Ctrl+Space để nghe, sau đó gõ tiếng Anh tại đây và nhấn Enter..."
              className={cn(
                "w-full rounded-xl border-2 px-4 py-3 text-base leading-relaxed outline-none transition-colors dark:bg-slate-950",
                grading?.status === "mastered"
                  ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
                  : grading
                  ? "border-rose-400 bg-rose-50/30 dark:bg-rose-950/20"
                  : "border-slate-200 focus:border-blue-600 dark:border-slate-700"
              )}
            />
          </motion.div>

          <div ref={feedbackRef} className="space-y-3">
            {grading && (
              <div
                data-testid="dictation-feedback"
                className={cn(
                  "rounded-xl border p-4 text-sm",
                  grading.status === "mastered"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                    : grading.status === "near"
                    ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                    : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-2.5">
                    {grading.status === "mastered" ? (
                      <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0" />
                    ) : (
                      <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0" />
                    )}
                    <div className="space-y-2">
                      <p className="font-medium">{grading.feedbackMessage}</p>
                      <div className="rounded-lg bg-white/80 p-3 font-sans text-sm leading-relaxed text-slate-900 dark:bg-slate-900/80 dark:text-slate-100">
                        <span className="mr-2 text-xs font-semibold text-slate-500">
                          Đối chiếu từng từ:
                        </span>
                        {grading.diffTokens.map((tok, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              tok.type === "matched" && "text-emerald-700 dark:text-emerald-300",
                              tok.type === "added" &&
                                "mx-0.5 rounded bg-rose-100 px-1 text-rose-700 line-through dark:bg-rose-950 dark:text-rose-300",
                              tok.type === "removed" &&
                                "mx-0.5 rounded bg-amber-100 px-1 font-semibold text-amber-800 underline decoration-amber-500 dark:bg-amber-950 dark:text-amber-200"
                            )}
                          >
                            {tok.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {grading.status === "mastered" && (
                    <LottieCelebration comboStreak={comboStreak} />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onCheckDictation}
              data-testid="check-dictation-button"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {grading?.status === "mastered" ? "Sang câu tiếp theo (Enter)" : "Kiểm tra đáp án"}
            </button>
            <button
              type="button"
              onClick={onHintNextWord}
              data-testid="hint-next-word-button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
            >
              <MagicWand size={15} weight="duotone" />
              <span>Gợi ý từ</span>
            </button>
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      )}

      {mode === "check" && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Nghe và chọn phương án đúng nhất:
          </p>
          <div className="space-y-2">
            {(question.choices ?? [question.transcript]).map((choice, idx) => {
              const isSelected = selectedChoice === idx;
              const isCorrect = idx === (question.correctChoiceIndex ?? 0);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (!choiceChecked) setSelectedChoice(idx);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                    choiceChecked && isCorrect
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                      : choiceChecked && isSelected && !isCorrect
                      ? "border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
                      : isSelected
                      ? "border-blue-600 bg-blue-50/70 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  )}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-current font-mono text-xs font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={choiceChecked ? onNext : onCheckMultipleChoice}
            disabled={selectedChoice === null}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {choiceChecked ? "Câu tiếp theo" : "Xác nhận đáp án"}
          </button>
        </div>
      )}

      {mode === "cloze" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Điền các từ khóa bị ẩn (phù hợp người mới bắt đầu):
            </p>
            {clozeResult && (
              <span className="font-mono text-sm font-bold text-blue-600 tabular-nums">
                {clozeResult.correctCount}/{clozeResult.totalBlanks} đúng ({clozeResult.accuracy}%)
              </span>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-base leading-loose dark:border-slate-800 dark:bg-slate-950/60">
            {clozeSegments.map((seg) =>
              seg.isBlank ? (
                <span key={seg.id} className="mx-1 inline-flex items-center">
                  {seg.leadingPunctuation}
                  <input
                    value={clozeAnswers[seg.id] ?? ""}
                    onChange={(e) =>
                      setClozeAnswers((prev) => ({ ...prev, [seg.id]: e.target.value }))
                    }
                    style={{ width: `${Math.max(seg.text.length + 2, 7)}ch` }}
                    placeholder={"_".repeat(Math.min(seg.text.length, 6))}
                    className={cn(
                      "rounded border-b-2 bg-white px-1.5 py-0.5 text-center font-mono text-sm outline-none dark:bg-slate-900",
                      clozeResult
                        ? clozeResult.results[seg.id]
                          ? "border-emerald-500 text-emerald-700"
                          : "border-rose-500 text-rose-700"
                        : "border-blue-400 focus:border-blue-600"
                    )}
                  />
                  {seg.trailingPunctuation}
                </span>
              ) : (
                <span key={seg.id} className="mx-0.5">
                  {seg.leadingPunctuation}
                  {seg.text}
                  {seg.trailingPunctuation}
                </span>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (clozeResult && clozeResult.accuracy >= 80) {
                onNext();
              } else {
                onCheckCloze();
              }
            }}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {clozeResult ? "Sang câu tiếp theo" : "Kiểm tra từ điền"}
          </button>
        </div>
      )}

      {mode === "full" && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            Chế độ Nghe Full + Nhại theo (Shadowing)
          </p>
          <p className="mt-1">
            Nghe liền mạch transcript ở cột bên phải, bấm trực tiếp vào bất kỳ từ nào trong câu để tra nghĩa và lưu vào Giỏ từ vựng.
          </p>
        </div>
      )}
    </div>
  );
}

interface RightInspectorPaneProps {
  question: ListeningQuestion;
  showTranscript: boolean;
  onToggleTranscript: () => void;
  questionHistory: DictationAttempt[];
  onSaveVocab: (item: ListeningQuestion["keyVocab"][number]) => void;
  onDataChanged: () => void;
}

function RightInspectorPane({
  question,
  showTranscript,
  onToggleTranscript,
  questionHistory,
  onSaveVocab,
  onDataChanged,
}: RightInspectorPaneProps) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
            Transcript &amp; Tra từ nhanh
          </h3>
          <p className="text-[11px] text-slate-400">
            Bấm trực tiếp vào bất kỳ từ nào để tra nghĩa &amp; lưu
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleTranscript}
          data-testid="toggle-transcript-button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {showTranscript ? <EyeSlash size={14} /> : <Eye size={14} />}
          <span>{showTranscript ? "Ẩn đáp án" : "Xem đáp án"}</span>
        </button>
      </div>

      {showTranscript ? (
        <div
          data-testid="transcript-box"
          className="space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-950"
        >
          {question.dialogue && question.dialogue.length > 0 ? (
            <div className="space-y-2 text-sm leading-relaxed">
              {question.dialogue.map((line, i) => (
                <p key={i} className="text-slate-900 dark:text-slate-100">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {line.speaker}:{" "}
                  </span>
                  <TranscriptAnnotator
                    text={line.text}
                    question={question}
                    onSavedVocab={onDataChanged}
                  />
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100">
              <TranscriptAnnotator
                text={question.transcript}
                question={question}
                onSavedVocab={onDataChanged}
              />
            </p>
          )}
          <p className="border-t border-slate-200 pt-2.5 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
            {question.transcriptVi}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500 dark:border-slate-800">
          Transcript đang được ẩn để bạn tự nghe chép. Sẽ tự mở khi gõ đạt hoặc bấm &ldquo;Xem đáp án&rdquo;.
        </div>
      )}

      <Accordion.Root type="multiple" defaultValue={["tip"]} className="space-y-2">
        <Accordion.Item
          value="tip"
          className="rounded-lg border border-slate-200 dark:border-slate-800"
        >
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/50">
              <span className="flex items-center gap-2">
                <Lightbulb size={15} weight="duotone" className="text-amber-600" />
                Mẹo nối âm &amp; Ngữ pháp trọng tâm
              </span>
              <CaretDown size={14} />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="space-y-2 border-t border-slate-100 px-3.5 py-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-400">
            <p>
              <strong className="text-slate-800 dark:text-slate-200">Nối âm:</strong>{" "}
              {question.linkedSpeechTip}
            </p>
            <p>
              <strong className="text-slate-800 dark:text-slate-200">Ngữ pháp:</strong>{" "}
              {question.grammarNote}
            </p>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>

      {question.keyVocab.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Từ vựng trong câu (Bấm lưu vào Giỏ từ vựng)
          </h4>
          <div className="space-y-2">
            {question.keyVocab.map((v, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-2.5 text-xs dark:border-slate-800"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {v.word}
                    </span>
                    <span className="font-mono text-slate-400">{v.phonetic}</span>
                  </div>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                    {v.meaningVi}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSaveVocab(v)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 dark:border-slate-700 dark:text-blue-400 dark:hover:bg-blue-950/60"
                >
                  <BookmarkSimple size={13} />
                  <span>Lưu từ</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {questionHistory.length > 0 && (
        <div className="mt-auto border-t border-slate-100 pt-3 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Lịch sử các lần gõ gần đây
          </h4>
          <div className="mt-2 space-y-1.5">
            {questionHistory.map((att, idx) => (
              <div
                key={att.id ?? idx}
                className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400"
              >
                <span className="max-w-[75%] truncate">{att.userText || "(Trống)"}</span>
                <span
                  className={cn(
                    "font-mono font-semibold tabular-nums",
                    att.accuracy >= 95
                      ? "text-emerald-600"
                      : att.accuracy >= 70
                      ? "text-amber-600"
                      : "text-rose-600"
                  )}
                >
                  {att.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
