import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Volume2,
  HelpCircle,
  Star,
  Flag,
  ShoppingBasket,
  BookOpen,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Pencil,
  FileText,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import type { ListeningExamSet, ExamQuestion } from "../data/listeningPartsDataset";
import { playWordPronunciation } from "../lib/dictionaryService";
import { saveVocabToNotebook } from "../lib/db";
import { DauWaveformPlayer } from "./DauWaveformPlayer";
import { cn } from "../lib/utils";

interface ListeningExamPracticeStudioProps {
  examSet: ListeningExamSet;
  onExit: () => void;
  onOpenVocabDrawer?: (word: string) => void;
  onOpenBasket?: () => void;
}

export function ListeningExamPracticeStudio({
  examSet,
  onExit,
  onOpenVocabDrawer,
  onOpenBasket,
}: ListeningExamPracticeStudioProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [savedFavorites, setSavedFavorites] = useState<Set<string>>(new Set());
  const [addedVocabWords, setAddedVocabWords] = useState<Set<string>>(new Set());
  const [showInstantAnswer, setShowInstantAnswer] = useState<boolean>(true);
  const [showAskHelp, setShowAskHelp] = useState(false);

  // Group questions into groups of 3 or individual
  const questions = examSet.questions;
  const currentQ = questions[currentIndex] || questions[0];
  const selectedOpt = currentQ ? selectedAnswers[currentQ.id] : undefined;
  const isAnswered = selectedOpt !== undefined;
  const isCorrect = isAnswered && selectedOpt === currentQ.correctAnswer;

  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    for (const q of questions) {
      const ans = selectedAnswers[q.id];
      if (ans !== undefined) {
        if (ans === q.correctAnswer) correct++;
        else wrong++;
      }
    }
    return { correct, wrong };
  }, [questions, selectedAnswers]);

  const handleSelectOption = (qId: string, optLabel: "A" | "B" | "C" | "D", correctAns: string) => {
    if (selectedAnswers[qId] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optLabel }));
    if (optLabel === correctAns) {
      confetti({ particleCount: 25, spread: 55, origin: { y: 0.6 } });
      toast.success("Chính xác! +5 XP");
    } else {
      toast.error("Chưa chính xác!");
    }
  };

  const handleToggleFavorite = () => {
    if (!currentQ) return;
    setSavedFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) {
        next.delete(currentQ.id);
        toast.info("Đã bỏ lưu câu hỏi");
      } else {
        next.add(currentQ.id);
        toast.success("Đã lưu câu hỏi");
      }
      return next;
    });
  };

  return (
    <div
      data-testid="listening-exam-studio"
      className="flex min-h-[calc(100vh-140px)] flex-col justify-between gap-4 pb-16"
    >
      {/* 1. TOP HEADER matching Screenshot 5 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-4 py-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            data-testid="exit-exam-studio-button"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
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
          <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-[#2463eb] dark:bg-blue-950 dark:text-blue-300">
            Part {examSet.part} · Level {examSet.level}
          </span>
        </div>

        <div className="text-center font-display text-sm font-bold text-slate-900 sm:text-base dark:text-slate-50">
          {examSet.title}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <Pencil className="h-3 w-3" />
            <span>Annotator</span>
            <span className="rounded bg-amber-200/80 px-1 text-[10px] uppercase">PRO</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <FileText className="h-3 w-3" />
            <span>Song ngữ</span>
            <span className="rounded bg-amber-200/80 px-1 text-[10px] uppercase">PRO</span>
          </span>

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium dark:border-slate-700 dark:bg-slate-950">
            <span className="text-slate-600 dark:text-slate-300">Hiện đáp án ngay</span>
            <button
              type="button"
              role="switch"
              aria-checked={showInstantAnswer}
              onClick={() => setShowInstantAnswer(!showInstantAnswer)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                showInstantAnswer ? "bg-[#2463eb]" : "bg-slate-300 dark:bg-slate-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                  showInstantAnswer ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAskHelp(!showAskHelp)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#2463eb] hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Hỏi bài</span>
          </button>
        </div>
      </div>

      {/* 2. 2-COLUMN WORKSPACE matching Screenshot 5 */}
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        {/* COL 1: AUDIO WAVEFORM & CONTROLS (Left side of Screenshot 5) */}
        <div className="sticky top-20 space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Select the best response to each question.
          </p>

          <DauWaveformPlayer
            question={{
              id: examSet.id,
              testId: "exam",
              part: examSet.part,
              order: 1,
              level: examSet.level,
              topic: "office",
              title: examSet.title,
              transcript: examSet.audioScript,
              transcriptVi: examSet.subtitle,
              linkedSpeechTip: "Chú ý ngữ điệu và phát âm chuẩn bản xứ.",
              grammarNote: "Luyện tập kỹ năng nghe hiểu Part theo chuẩn đề thi TOEIC.",
              choices: [currentQ?.options[0]?.text || "", currentQ?.options[1]?.text || "", currentQ?.options[2]?.text || "", currentQ?.options[3]?.text || ""],
              correctChoiceIndex: 0,
              keyVocab: [],
            }}
            playbackRate={1.0}
            onChangePlaybackRate={() => {}}
          />

          <div className="rounded-xl border border-blue-100 bg-[#eff6ff]/60 p-4 text-xs leading-relaxed text-slate-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-slate-300">
            <p className="font-semibold text-[#1d4ed8] dark:text-blue-300">Script audio luyện nghe:</p>
            <p className="mt-1 font-mono">{examSet.audioScript}</p>
          </div>
        </div>

        {/* COL 2: QUESTION LIST (Right side of Screenshot 5) */}
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#2463eb] px-2.5 py-0.5 text-xs font-bold text-white">
                Level {examSet.level}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Nhóm câu {currentIndex + 1} ({questions.length} câu tổng)
              </span>
            </div>

            <span className="text-xs font-medium text-slate-500 tabular-nums">
              Đã làm: {Object.keys(selectedAnswers).length}/{questions.length}
            </span>
          </div>

          {/* Render Current Question */}
          {currentQ && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
                  {currentQ.questionNumber}. {currentQ.questionText}
                </h3>
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  aria-label="Lưu câu hỏi"
                  className="cursor-pointer text-slate-400 hover:text-amber-500"
                >
                  <Star className={cn("h-4 w-4", savedFavorites.has(currentQ.id) && "fill-amber-400 text-amber-400")} />
                </button>
              </div>

              <div className="mt-4 space-y-2.5">
                {currentQ.options.map((opt) => {
                  const userAns = selectedAnswers[currentQ.id];
                  const isSelected = userAns === opt.label;
                  const isCorrectOpt = opt.label === currentQ.correctAnswer;

                  let optStyle =
                    "border-slate-200 bg-white hover:border-[#2463eb]/50 hover:bg-blue-50/20 dark:border-slate-800 dark:bg-slate-900";

                  if (selectedOpt !== undefined && showInstantAnswer) {
                    if (isCorrectOpt) {
                      optStyle =
                        "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200";
                    } else if (isSelected && !isCorrectOpt) {
                      optStyle =
                        "border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200";
                    }
                  } else if (isSelected) {
                    optStyle =
                      "border-[#2463eb] bg-blue-50/70 text-[#2463eb] dark:border-blue-700 dark:bg-blue-950/60 dark:text-blue-300";
                  }

                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.label, currentQ.correctAnswer)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-left text-xs font-medium transition-all",
                        optStyle
                      )}
                    >
                      <span className="font-bold">({opt.label})</span>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {selectedOpt !== undefined && showInstantAnswer && (
                <div className="mt-4 rounded-xl border border-blue-100 bg-[#eff6ff]/70 p-3.5 text-xs leading-relaxed text-slate-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-slate-200">
                  <p className="font-semibold text-[#1d4ed8] dark:text-blue-300">Giải thích chi tiết:</p>
                  <p className="mt-1">{currentQ.explanationVi}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM BAR matching Screenshot 5 */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-slate-200 bg-white/95 px-4 py-2.5 shadow-md backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast.info("Đã báo lỗi câu hỏi.")}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>Báo lỗi</span>
          </button>
          <button
            type="button"
            onClick={onOpenBasket}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <ShoppingBasket className="h-3.5 w-3.5" />
            <span>Giỏ từ</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            aria-label="Câu trước"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="rounded-lg bg-[#2463eb] px-3 py-1 text-xs font-bold text-white tabular-nums">
            Câu {currentIndex + 1}/{questions.length}
          </span>
          <button
            type="button"
            disabled={currentIndex >= questions.length - 1}
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            aria-label="Câu tiếp theo"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
