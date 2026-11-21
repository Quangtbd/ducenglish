import { useMemo, useState } from "react";
import { motion } from "motion/react";
import NumberFlow from "@number-flow/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  Headphones,
  Fire,
  Trash,
  Play,
  Lightning,
  CheckCircle,
} from "@phosphor-icons/react";
import type {
  CefrLevel,
  DictationAttempt,
  DictationMode,
  ListeningQuestion,
  ReviewQueueItem,
  ThematicListeningSet,
  ToeicPart,
  TopicId,
  UserProfile,
  VocabEntry,
} from "../types/toeic";
import { THEMATIC_LISTENING_SETS } from "../data/thematicListeningSets";
import { TOPIC_LABELS, cn } from "../lib/utils";
import { toggleReviewQueueItem } from "../lib/db";
import { ThematicCardGrid } from "./ThematicCardGrid";
import { DictationStudio } from "./DictationStudio";
import { TipsDrawerTrigger } from "./ui/UiPrimitives";

interface ListeningHubProps {
  questions: ListeningQuestion[];
  attempts: DictationAttempt[];
  reviewQueue: ReviewQueueItem[];
  vocabList: VocabEntry[];
  profile: UserProfile;
  activeStudioSession: {
    title: string;
    cefrLevel?: CefrLevel;
    questions: ListeningQuestion[];
    initialIndex: number;
    defaultMode?: DictationMode;
  } | null;
  onStartStudio: (
    title: string,
    sessionQuestions: ListeningQuestion[],
    initialIndex?: number,
    defaultMode?: DictationMode,
    cefrLevel?: CefrLevel
  ) => void;
  onExitStudio: () => void;
  onUpdateProfile: (values: Partial<UserProfile>) => void;
  onDataChanged: () => void;
  viewMode: "matrix" | "review";
  onChangeViewMode: (mode: "matrix" | "review") => void;
}

const PART_PILL_FILTERS: {
  id: ToeicPart | "all";
  label: string;
}[] = [
  { id: "all", label: "Tất cả Part" },
  { id: 1, label: "Part 1" },
  { id: 2, label: "Part 2" },
  { id: 3, label: "Part 3" },
  { id: 4, label: "Part 4" },
];

export function ListeningHub({
  questions,
  attempts,
  reviewQueue,
  vocabList,
  profile,
  activeStudioSession,
  onStartStudio,
  onExitStudio,
  onUpdateProfile,
  onDataChanged,
  viewMode,
  onChangeViewMode,
}: ListeningHubProps) {
  const [selectedPart, setSelectedPart] = useState<ToeicPart | "all">("all");
  const [selectedTopic, setSelectedTopic] = useState<TopicId>("all");
  const [reviewListRef] = useAutoAnimate();

  const reviewQuestions = useMemo(() => {
    const qMap = new Map(questions.map((q) => [q.id, q]));
    return reviewQueue
      .map((item) => ({
        item,
        question: qMap.get(item.questionId),
      }))
      .filter(
        (pair): pair is { item: ReviewQueueItem; question: ListeningQuestion } =>
          Boolean(pair.question)
      );
  }, [questions, reviewQueue]);

  const uniqueCompletedCount = useMemo(() => {
    const masteredIds = new Set(
      attempts.filter((a) => a.accuracy >= 80).map((a) => a.questionId)
    );
    return masteredIds.size;
  }, [attempts]);

  const handleStartThematicSet = (set: ThematicListeningSet) => {
    onStartStudio(
      `${set.cefrLevel} · ${set.title}`,
      set.questions,
      0,
      "check",
      set.cefrLevel
    );
  };

  if (activeStudioSession) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        <DictationStudio
          title={activeStudioSession.title}
          cefrLevel={activeStudioSession.cefrLevel}
          questions={activeStudioSession.questions}
          initialQuestionIndex={activeStudioSession.initialIndex}
          initialMode={activeStudioSession.defaultMode ?? "check"}
          attempts={attempts}
          reviewQueue={reviewQueue}
          vocabList={vocabList}
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          onDataChanged={onDataChanged}
          onExit={onExitStudio}
        />
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner focused on A1 -> C2 curriculum */}
      <section
        data-testid="hero-banner"
        className="relative overflow-hidden rounded-2xl border border-[#2463eb]/10 bg-[#2463eb]/5 px-6 py-6 md:px-8 md:py-7 dark:border-blue-900/50 dark:bg-blue-950/30"
      >
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2463eb]/15 bg-white/90 px-3 py-1 text-sm font-medium text-[#2463eb] dark:border-blue-800 dark:bg-slate-900 dark:text-blue-400">
              <Headphones size={16} weight="duotone" />
              <span>Lộ trình Nghe TOEIC A1 → C2</span>
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#1f2937] sm:text-4xl dark:text-slate-50">
              Chinh phục{" "}
              <span className="bg-gradient-to-r from-[#2463eb] to-blue-500 bg-clip-text text-transparent">
                TOEIC Listening
              </span>{" "}
              từ dễ đến khó
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
              Luyện Nghe check, Nghe chép chính tả và mở rộng vốn từ theo 6 cấp độ chuẩn quốc tế A1 → C2.
            </p>
          </div>

          <div
            data-testid="hero-headphones-badge"
            className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2463eb] to-blue-500 text-white shadow-lg shadow-[#2463eb]/25 transition-transform duration-300 hover:scale-105 md:flex lg:h-24 lg:w-24"
          >
            <Headphones size={46} weight="duotone" />
          </div>
        </div>
      </section>

      {/* Filter Bar: Part 1-4 Pill Switcher + Topic Filter + Review Queue */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Rounded-full Part Tab Bar */}
          <div
            role="tablist"
            aria-label="Chọn phần nghe"
            data-testid="part-tablist"
            className="inline-flex flex-wrap items-center gap-1 rounded-full border border-[#2463eb]/10 bg-[#2463eb]/5 p-1"
          >
            {PART_PILL_FILTERS.map((item) => {
              const active = viewMode === "matrix" && selectedPart === item.id;
              return (
                <button
                  key={String(item.id)}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setSelectedPart(item.id);
                    onChangeViewMode("matrix");
                  }}
                  data-testid={`filter-part-${item.id}`}
                  className={cn(
                    "relative shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors md:px-5",
                    active
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="hubPartActivePill"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-[#2463eb] shadow-sm"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Lọc theo chủ đề"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value as TopicId)}
              className="rounded-full border border-[#e1e7ef] bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-[#2463eb] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {Object.entries(TOPIC_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() =>
                onChangeViewMode(viewMode === "review" ? "matrix" : "review")
              }
              data-testid="review-queue-tab"
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5",
                viewMode === "review"
                  ? "border-rose-600 bg-rose-600 font-semibold text-white shadow-sm"
                  : "border-[#e1e7ef] bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              )}
            >
              <Fire size={15} weight={viewMode === "review" ? "fill" : "duotone"} />
              <span>Câu cần luyện lại ({reviewQueue.length})</span>
            </button>
          </div>
        </div>

        {/* Vaul Drawer Mẹo link + Inline Streak / XP / Progress summary */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TipsDrawerTrigger />

          <div className="flex items-center gap-4 text-sm font-medium text-slate-500 tabular-nums dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Fire size={16} weight="duotone" className="text-amber-600" />
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                <NumberFlow value={profile.streakDays} />
              </strong>{" "}
              ngày
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Lightning size={16} weight="duotone" className="text-[#2463eb]" />
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                <NumberFlow value={profile.xp} />
              </strong>{" "}
              XP
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle size={16} weight="duotone" className="text-emerald-600" />
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                <NumberFlow value={uniqueCompletedCount} />/{questions.length}
              </strong>{" "}
              câu
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Either Review Queue or A1->C2 Thematic Curriculum */}
      {viewMode === "review" ? (
        <div className="space-y-3 rounded-xl border border-[#e1e7ef] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                Danh sách Câu cần luyện lại
              </h2>
              <p className="text-sm text-slate-500">
                Các câu đạt dưới 75% hoặc bạn đánh dấu lưu lại để ôn lặp lại ngắt quãng.
              </p>
            </div>
            {reviewQuestions.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  onStartStudio(
                    "Ôn tập Câu cần luyện lại",
                    reviewQuestions.map((r) => r.question),
                    0,
                    "check"
                  )
                }
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                <Play size={15} weight="fill" />
                <span>Luyện tất cả ({reviewQuestions.length} câu)</span>
              </button>
            )}
          </div>

          <div ref={reviewListRef} className="space-y-2.5">
            {reviewQuestions.length === 0 ? (
              <div className="py-10 text-center text-base text-slate-500">
                Chưa có câu nào cần ôn lại. Hãy chọn một chủ đề A1–C2 bên dưới để luyện tập!
              </div>
            ) : (
              reviewQuestions.map(({ item, question }, idx) => (
                <div
                  key={question.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e1e7ef] p-4 dark:border-slate-800"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>Part {question.part}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-rose-600 tabular-nums">
                        Gần nhất: {item.lastAccuracy}%
                      </span>
                    </div>
                    <p className="mt-1 truncate text-base font-medium text-slate-900 dark:text-slate-100">
                      {question.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onStartStudio(
                          "Ôn tập Câu cần luyện lại",
                          reviewQuestions.map((r) => r.question),
                          idx,
                          "check"
                        )
                      }
                      className="cursor-pointer rounded-lg bg-[#2463eb] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
                    >
                      Nghe lại
                    </button>
                    <button
                      type="button"
                      aria-label="Xóa khỏi danh sách luyện lại"
                      onClick={async () => {
                        await toggleReviewQueueItem(question.id);
                        onDataChanged();
                      }}
                      className="cursor-pointer rounded-lg border border-[#e1e7ef] p-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600 dark:border-slate-700"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <ThematicCardGrid
          sets={THEMATIC_LISTENING_SETS}
          attempts={attempts}
          reviewQueue={reviewQueue}
          selectedPart={selectedPart}
          selectedTopic={selectedTopic}
          onStartThematicSet={handleStartThematicSet}
          onDataChanged={onDataChanged}
        />
      )}
    </div>
  );
}
