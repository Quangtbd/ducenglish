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
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Pencil,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import type { GrammarTopic, GrammarQuestionItem } from "../data/readingGrammarDataset";
import { playWordPronunciation } from "../lib/dictionaryService";
import { saveVocabToNotebook } from "../lib/db";
import { cn } from "../lib/utils";

interface ReadingPracticeStudioProps {
  topic: GrammarTopic;
  onExit: () => void;
  onOpenVocabDrawer?: (word: string) => void;
  onOpenBasket?: () => void;
}

export function ReadingPracticeStudio({
  topic,
  onExit,
  onOpenVocabDrawer,
  onOpenBasket,
}: ReadingPracticeStudioProps) {
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>("mixed");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [savedFavorites, setSavedFavorites] = useState<Set<string>>(new Set());
  const [addedVocabWords, setAddedVocabWords] = useState<Set<string>>(new Set());
  const [showAskHelp, setShowAskHelp] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Filter questions by active subtopic
  const questions: GrammarQuestionItem[] = useMemo(() => {
    if (selectedSubtopicId === "mixed") {
      return topic.questions;
    }
    const filtered = topic.questions.filter((q) => q.subtopicId === selectedSubtopicId);
    return filtered.length > 0 ? filtered : topic.questions;
  }, [topic, selectedSubtopicId]);

  const currentQ = questions[currentIndex] || questions[0];
  const selectedOptionIdx = currentQ ? selectedAnswers[currentQ.id] : undefined;
  const isAnswered = selectedOptionIdx !== undefined;
  const isCorrect = isAnswered && selectedOptionIdx === currentQ.correctIndex;

  // Correct and wrong counts
  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    for (const q of topic.questions) {
      const ans = selectedAnswers[q.id];
      if (ans !== undefined) {
        if (ans === q.correctIndex) correct++;
        else wrong++;
      }
    }
    return { correct, wrong };
  }, [topic, selectedAnswers]);

  const handleSelectOption = (idx: number) => {
    if (!currentQ || selectedOptionIdx !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
    if (idx === currentQ.correctIndex) {
      confetti({
        particleCount: 28,
        spread: 60,
        origin: { y: 0.65 },
      });
      toast.success("Chính xác! +5 XP");
    } else {
      toast.error("Chưa chính xác! Xem giải thích bên phải");
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
        toast.success("Đã lưu câu hỏi vào mục yêu thích");
      }
      return next;
    });
  };

  const handleAddVocab = async (v: {
    word: string;
    pos: string;
    phonetic: string;
    meaningVi: string;
  }) => {
    try {
      await saveVocabToNotebook({
        word: v.word,
        partOfSpeech: v.pos,
        phonetic: v.phonetic,
        meaningVi: v.meaningVi,
        exampleSentence: currentQ?.questionText || "",
        topic: "Ngữ pháp",
      });
      setAddedVocabWords((prev) => new Set([...prev, v.word]));
      toast.success(`Đã thêm từ "${v.word}" vào sổ từ`);
    } catch {
      toast.error("Không thể lưu từ");
    }
  };

  const handleAddAllVocab = async () => {
    if (!currentQ || !currentQ.vocab) return;
    for (const v of currentQ.vocab) {
      await handleAddVocab(v);
    }
    toast.success("Đã thêm toàn bộ từ vựng vào sổ");
  };

  const handlePlayQuestionAudio = () => {
    if (!currentQ) return;
    playWordPronunciation(currentQ.questionText, "US");
  };

  return (
    <div
      data-testid="reading-practice-studio"
      className="flex min-h-[calc(100vh-140px)] flex-col justify-between gap-4 pb-16"
    >
      {/* 1. TOP HEADER matching Screenshot 4 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-4 py-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            data-testid="exit-reading-studio-button"
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
        </div>

        <div className="text-center font-display text-base font-bold text-slate-900 sm:text-lg dark:text-slate-50">
          Ngữ pháp · {topic.title}
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <Pencil className="h-3 w-3" />
            <span>Annotator</span>
            <span className="rounded bg-amber-200/80 px-1 text-[10px] uppercase dark:bg-amber-900">
              PRO
            </span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <FileText className="h-3 w-3" />
            <span>Ghi chú</span>
            <span className="rounded bg-amber-200/80 px-1 text-[10px] uppercase dark:bg-amber-900">
              PRO
            </span>
          </span>
          <button
            type="button"
            onClick={handlePlayQuestionAudio}
            aria-label="Phát âm câu hỏi"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#2463eb] dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. 3-COLUMN WORKSPACE matching Screenshot 4 */}
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1.3fr)_minmax(320px,1fr)]">
        {/* COL 1: LEFT SUBTOPIC EXPLORER */}
        <aside
          className={cn(
            "rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all dark:border-slate-800 dark:bg-slate-900",
            isSidebarCollapsed && "lg:hidden"
          )}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {topic.category}
              </p>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                {topic.title}
              </h2>
              <p className="mt-1 text-xs text-slate-500 tabular-nums">
                {Object.keys(selectedAnswers).length}/{topic.totalCount} câu{" "}
                <span className="font-semibold text-emerald-600">✓ {stats.correct}</span>{" "}
                <span className="font-semibold text-rose-500">x {stats.wrong}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(true)}
              aria-label="Thu gọn"
              className="hidden cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:inline-flex dark:hover:bg-slate-800"
            >
              «
            </button>
          </div>

          <nav className="mt-3 space-y-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
            {topic.subtopics.map((st) => {
              const active = selectedSubtopicId === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubtopicId(st.id);
                    setCurrentIndex(0);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
                    active
                      ? "bg-[#2463eb]/10 font-semibold text-[#2463eb] dark:bg-blue-950/60 dark:text-blue-400"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                  )}
                >
                  <span className="truncate">{st.title}</span>
                  <span className="ml-2 shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 tabular-nums dark:bg-slate-800 dark:text-slate-400">
                    {st.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* COL 2: CENTER QUESTION STAGE */}
        <main className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-md border border-blue-100 bg-blue-50/70 px-2.5 py-1 text-xs font-semibold text-[#2463eb] dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
              {currentQ?.subtopicName || "Hỗn hợp"}
            </span>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-600 tabular-nums dark:text-slate-300">
                Câu {currentIndex + 1}/{questions.length}
              </span>
              <button
                type="button"
                onClick={() => setShowAskHelp(!showAskHelp)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#2463eb] hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Hỏi bài</span>
              </button>
              <button
                type="button"
                onClick={handleToggleFavorite}
                aria-label="Lưu câu hỏi"
                className="cursor-pointer text-slate-400 transition-colors hover:text-amber-500"
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    currentQ && savedFavorites.has(currentQ.id) && "fill-amber-400 text-amber-400"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Ask Help Modal / Callout */}
          {showAskHelp && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-blue-200 bg-[#eff6ff] p-3 text-xs leading-relaxed text-blue-900 dark:border-blue-900 dark:bg-blue-950/70 dark:text-blue-200"
            >
              <p className="font-semibold">Mẹo học nhanh:</p>
              <p className="mt-1">
                Hãy chú ý các vị trí từ loại lân cận (trước và sau chỗ trống) để xác định xem cần
                danh từ, tính từ, trạng từ hay dạng chia động từ phù hợp.
              </p>
            </motion.div>
          )}

          {/* Question Card with Rounded Blue Border matching Screenshot 4 */}
          <div
            data-testid="reading-question-card"
            className="rounded-2xl border-2 border-[#2463eb]/25 bg-white p-6 shadow-sm dark:border-blue-900/60 dark:bg-slate-900"
          >
            <h3 className="font-display text-base font-semibold leading-relaxed text-slate-900 sm:text-lg dark:text-slate-50">
              {currentIndex + 1}. {currentQ?.questionText}
            </h3>

            {/* Radio Options List */}
            <div className="mt-6 space-y-3">
              {currentQ?.options.map((opt, oIdx) => {
                const isSelected = selectedOptionIdx === oIdx;
                const isCorrectOption = oIdx === currentQ.correctIndex;

                let optionStyle =
                  "border-slate-200/90 bg-white hover:border-[#2463eb]/50 hover:bg-blue-50/30 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60";

                if (isAnswered) {
                  if (isCorrectOption) {
                    optionStyle =
                      "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200";
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle =
                      "border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200";
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectOption(oIdx)}
                    disabled={isAnswered}
                    data-testid={`option-button-${oIdx}`}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 text-left text-sm font-medium transition-all",
                      optionStyle
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors",
                        isSelected
                          ? isCorrectOption
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-rose-500 bg-rose-500 text-white"
                          : "border-slate-300 dark:border-slate-600"
                      )}
                    >
                      {isSelected ? (
                        isCorrectOption ? (
                          <Check className="h-3 w-3 stroke-[3]" />
                        ) : (
                          "✕"
                        )
                      ) : null}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {/* COL 3: RIGHT INSTANT EXPLAINER PANEL matching Screenshot 4 */}
        <aside
          data-testid="reading-explainer-panel"
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
        >
          <AnimatePresence mode="wait">
            {!isAnswered ? (
              // Empty State matching Screenshot 4
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[260px] flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500"
              >
                <Sparkles className="h-10 w-10 text-blue-300 dark:text-blue-700" />
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                  Chọn đáp án để xem giải thích chi tiết, dịch nghĩa và từ vựng nên học.
                </p>
              </motion.div>
            ) : (
              // Full Explanation once answered
              <motion.div
                key="explained-state"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Result Status Banner */}
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl p-3 text-sm font-semibold",
                    isCorrect
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
                  )}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                  )}
                  <span>
                    {isCorrect
                      ? "Chính xác! (+5 XP)"
                      : `Chưa chính xác (Đáp án đúng là ${String.fromCharCode(
                          65 + (currentQ?.correctIndex || 0)
                        )})`}
                  </span>
                </div>

                {/* Grammar Rule Breakdown */}
                <div className="rounded-xl border border-blue-100 bg-[#eff6ff]/70 p-3.5 text-xs leading-relaxed text-slate-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-slate-200">
                  <p className="font-bold text-[#1d4ed8] dark:text-blue-300">
                    Giải thích chi tiết:
                  </p>
                  <p className="mt-1 text-slate-700 dark:text-slate-300">{currentQ?.explanation}</p>

                  <p className="mt-3 font-bold text-[#1d4ed8] dark:text-blue-300">
                    Quy tắc ngữ pháp:
                  </p>
                  <p className="mt-1 text-slate-700 dark:text-slate-300">{currentQ?.grammarRule}</p>
                </div>

                {/* Translation Box */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed dark:border-slate-800 dark:bg-slate-950">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Dịch nghĩa:</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">{currentQ?.translationVi}</p>
                </div>

                {/* Recommended Vocabulary List matching Screenshot 2/4 */}
                {currentQ?.vocab && currentQ.vocab.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Từ vựng nên học ({currentQ.vocab.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddAllVocab}
                        className="cursor-pointer text-xs font-semibold text-[#2463eb] hover:underline dark:text-blue-400"
                      >
                        + Thêm tất cả
                      </button>
                    </div>

                    <div className="space-y-2">
                      {currentQ.vocab.map((v) => {
                        const isAdded = addedVocabWords.has(v.word);
                        return (
                          <div
                            key={v.word}
                            className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-950"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => onOpenVocabDrawer?.(v.word)}
                                  className="font-semibold text-slate-900 hover:text-[#2463eb] hover:underline dark:text-slate-100 dark:hover:text-blue-400"
                                >
                                  {v.word}
                                </button>
                                <span className="rounded bg-slate-100 px-1 text-[10px] text-slate-500 italic dark:bg-slate-800">
                                  {v.pos}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {v.phonetic}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => playWordPronunciation(v.word, "US")}
                                  aria-label={`Nghe phát âm ${v.word}`}
                                  className="text-slate-400 hover:text-[#2463eb]"
                                >
                                  <Volume2 className="h-3 w-3" />
                                </button>
                              </div>
                              <p className="mt-0.5 text-slate-600 truncate dark:text-slate-400">
                                {v.meaningVi}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddVocab(v)}
                              disabled={isAdded}
                              className={cn(
                                "ml-2 shrink-0 rounded-lg px-2 py-1 text-xs font-semibold transition-colors",
                                isAdded
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                                  : "border border-blue-200 bg-[#eff6ff] text-[#2463eb] hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                              )}
                            >
                              {isAdded ? "✓ Đã thêm" : "+ Thêm"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>

      {/* 3. BOTTOM BAR matching Screenshot 4 */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-slate-200 bg-white/95 px-4 py-2.5 shadow-md backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast.info("Đã gửi phản hồi báo lỗi câu hỏi.")}
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
          <button
            type="button"
            onClick={() => currentQ && onOpenVocabDrawer?.(currentQ.vocab?.[0]?.word || "powerful")}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Tra từ</span>
          </button>
        </div>

        {/* Question Pagination */}
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
            {currentIndex + 1}/{questions.length}
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
