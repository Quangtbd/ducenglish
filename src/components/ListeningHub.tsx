import { useMemo, useState } from "react";
import { motion } from "motion/react";
import NumberFlow from "@number-flow/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  Headphones,
  Fire,
  UploadSimple,
  Trash,
  Play,
  SquaresFour,
  Table as TableIcon,
  Lightning,
  CheckCircle,
} from "@phosphor-icons/react";
import type {
  DictationAttempt,
  DictationMode,
  ListeningQuestion,
  ReviewQueueItem,
  TestCollectionId,
  TestSet,
  ThematicListeningSet,
  ToeicPart,
  TopicId,
  UserProfile,
} from "../types/toeic";
import { THEMATIC_LISTENING_SETS } from "../data/thematicListeningSets";
import { COLLECTION_TABS, TOPIC_LABELS, cn } from "../lib/utils";
import { toggleReviewQueueItem } from "../lib/db";
import { TestMatrixTable } from "./TestMatrixTable";
import { TestCardGrid } from "./TestCardGrid";
import { ThematicCardGrid } from "./ThematicCardGrid";
import { DictationStudio } from "./DictationStudio";
import { CustomAudioModal } from "./CustomAudioModal";
import { TipsDrawerTrigger } from "./ui/UiPrimitives";

interface ListeningHubProps {
  tests: TestSet[];
  questions: ListeningQuestion[];
  attempts: DictationAttempt[];
  reviewQueue: ReviewQueueItem[];
  profile: UserProfile;
  activeStudioSession: {
    title: string;
    questions: ListeningQuestion[];
    initialIndex: number;
    defaultMode?: DictationMode;
  } | null;
  onStartStudio: (
    title: string,
    sessionQuestions: ListeningQuestion[],
    initialIndex?: number,
    defaultMode?: DictationMode
  ) => void;
  onExitStudio: () => void;
  onUpdateProfile: (values: Partial<UserProfile>) => void;
  onDataChanged: () => void;
  viewMode: "matrix" | "review";
  onChangeViewMode: (mode: "matrix" | "review") => void;
}

const HUB_MODE_OPTIONS: { id: DictationMode; label: string }[] = [
  { id: "dictation", label: "Nghe chép chính tả" },
  { id: "check", label: "Nghe check" },
  { id: "cloze", label: "Điền từ" },
  { id: "full", label: "Nghe full" },
];

const PART_PILL_FILTERS: {
  id: ToeicPart | "all";
  label: string;
}[] = [
  { id: "all", label: "Nghe chép" },
  { id: 1, label: "Part 1" },
  { id: 2, label: "Part 2" },
  { id: 3, label: "Part 3" },
  { id: 4, label: "Part 4" },
];

const LEVEL_CHIPS: { id: number | "all"; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: 1, label: "<300" },
  { id: 2, label: "300+" },
  { id: 3, label: "400+" },
  { id: 4, label: "500+" },
  { id: 5, label: "600+" },
  { id: 6, label: "700+" },
  { id: 7, label: "800+" },
  { id: 8, label: "900+" },
];

export function ListeningHub({
  tests,
  questions,
  attempts,
  reviewQueue,
  profile,
  activeStudioSession,
  onStartStudio,
  onExitStudio,
  onUpdateProfile,
  onDataChanged,
  viewMode,
  onChangeViewMode,
}: ListeningHubProps) {
  const [selectedMode, setSelectedMode] = useState<DictationMode>("dictation");
  const [selectedCollection, setSelectedCollection] =
    useState<TestCollectionId>("all");
  const [selectedPart, setSelectedPart] = useState<ToeicPart | "all">("all");
  const [selectedLevel, setSelectedLevel] = useState<number | "all">("all");
  const [selectedTopic, setSelectedTopic] = useState<TopicId>("all");
  const [layoutView, setLayoutView] = useState<"cards" | "table">("cards");
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [reviewListRef] = useAutoAnimate();

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      if (
        selectedCollection !== "all" &&
        selectedCollection !== "thematic" &&
        t.collection !== selectedCollection
      ) {
        return false;
      }
      if (
        selectedLevel !== "all" &&
        (selectedLevel < t.minLevel || selectedLevel > t.maxLevel)
      ) {
        return false;
      }
      if (selectedTopic !== "all" && t.topic !== selectedTopic) {
        return false;
      }
      return true;
    });
  }, [tests, selectedCollection, selectedLevel, selectedTopic]);

  const customQuestions = useMemo(
    () => questions.filter((q) => q.testId === "custom-user-set"),
    [questions]
  );

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

  const handleStartTestPart = (testId: string, part: ToeicPart) => {
    const test = tests.find((t) => t.id === testId);
    const partQuestions = questions
      .filter((q) => q.testId === testId && q.part === part)
      .sort((a, b) => a.order - b.order);
    const fallbackAll = questions
      .filter((q) => q.testId === testId)
      .sort((a, b) => a.order - b.order);
    const targetList = partQuestions.length > 0 ? partQuestions : fallbackAll;
    onStartStudio(
      `${test?.title ?? "Bài luyện"} · Part ${part}`,
      targetList,
      0,
      selectedMode
    );
  };

  const handleStartThematicSet = (set: ThematicListeningSet) => {
    onStartStudio(
      `${set.cefrLevel} · ${set.title}`,
      set.questions,
      0,
      selectedMode
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
          questions={activeStudioSession.questions}
          initialQuestionIndex={activeStudioSession.initialIndex}
          initialMode={activeStudioSession.defaultMode ?? selectedMode}
          attempts={attempts}
          reviewQueue={reviewQueue}
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
      {/* Hero Banner matching dauenglish.com/listen/nghe-chep (Headphones icon, NO Gemini Sparkle) */}
      <section
        data-testid="hero-banner"
        className="relative overflow-hidden rounded-2xl border border-[#2463eb]/10 bg-[#2463eb]/5 px-6 py-6 md:px-8 md:py-7 dark:border-blue-900/50 dark:bg-blue-950/30"
      >
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2463eb]/15 bg-white/90 px-3 py-1 text-sm font-medium text-[#2463eb] dark:border-blue-800 dark:bg-slate-900 dark:text-blue-400">
              <Headphones size={16} weight="duotone" />
              <span>Luyện nghe TOEIC</span>
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#1f2937] sm:text-4xl dark:text-slate-50">
              Chinh phục{" "}
              <span className="bg-gradient-to-r from-[#2463eb] to-blue-500 bg-clip-text text-transparent">
                TOEIC Listening
              </span>{" "}
              từ dễ đến khó
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
              Nghe chép chính tả và luyện Part 1–4 theo 8 level cùng kho chủ đề A1–C2 chuẩn quốc tế.
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

      {/* Part Pill Container + Listening Mode + Upload MP3 */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* dauenglish.com rounded-full Part Tab Bar (14px text-sm) */}
          <div
            role="tablist"
            aria-label="Chọn phần nghe"
            data-testid="part-tablist"
            className="inline-flex flex-wrap items-center gap-1 rounded-full border border-[#2463eb]/10 bg-[#2463eb]/5 p-1"
          >
            {PART_PILL_FILTERS.map((item) => {
              const active = selectedPart === item.id;
              return (
                <button
                  key={String(item.id)}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedPart(item.id)}
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

          {/* Listening Mode Switcher + Upload MP3 (14px) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex flex-wrap gap-1 rounded-full border border-[#e1e7ef] bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
              {HUB_MODE_OPTIONS.map((m) => {
                const active = selectedMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMode(m.id)}
                    data-testid={`hub-mode-${m.id}`}
                    className="relative cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
                  >
                    {active && (
                      <motion.span
                        layoutId="hubModePill"
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-[#2463eb]/10 dark:bg-blue-950/60"
                      />
                    )}
                    <span
                      className={cn(
                        "relative z-10",
                        active
                          ? "font-semibold text-[#2463eb] dark:text-blue-400"
                          : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                      )}
                    >
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCustomModalOpen(true)}
              data-testid="upload-custom-mp3-button"
              className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-[#2463eb]/20 bg-[#eff6ff] px-4 py-2 text-sm font-semibold text-[#2463eb] transition-all hover:bg-[#dbeafe] active:scale-[0.98] dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300"
            >
              <UploadSimple size={16} weight="duotone" />
              <span>Thêm MP3</span>
            </button>
          </div>
        </div>

        {/* Vaul Drawer Mẹo link + Inline Streak / XP / Progress summary (14px) */}
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

      {/* Collection Pill Tabs + Level & Matrix Controls */}
      <div className="space-y-3">
        <div className="w-full overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max flex-nowrap items-center gap-2">
            {COLLECTION_TABS.map((tab) => {
              const isActive =
                viewMode === "matrix" && selectedCollection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedCollection(tab.id);
                    onChangeViewMode("matrix");
                  }}
                  data-testid={`collection-${tab.id}`}
                  className={cn(
                    "shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5",
                    isActive
                      ? "border-[#2463eb] bg-[#2463eb] font-semibold text-white shadow-sm"
                      : "border-[#e1e7ef] bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() =>
                onChangeViewMode(viewMode === "review" ? "matrix" : "review")
              }
              data-testid="review-queue-tab"
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5",
                viewMode === "review"
                  ? "border-rose-600 bg-rose-600 font-semibold text-white shadow-sm"
                  : "border-[#e1e7ef] bg-slate-100/80 text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              )}
            >
              <Fire size={15} weight={viewMode === "review" ? "fill" : "duotone"} />
              <span>Câu cần luyện lại ({reviewQueue.length})</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Bar: Level Chips (shown when not in thematic A1-C2 tab) + Topic + Layout Switch */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e1e7ef] bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          {selectedCollection !== "thematic" ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Cấp độ:
              </span>
              {LEVEL_CHIPS.map((lv) => {
                const active = selectedLevel === lv.id;
                return (
                  <button
                    key={String(lv.id)}
                    type="button"
                    onClick={() => setSelectedLevel(lv.id)}
                    data-testid={`level-chip-${lv.id}`}
                    className={cn(
                      "cursor-pointer rounded-full border px-3 py-1 font-mono text-sm font-medium transition-all tabular-nums",
                      active
                        ? "border-[#2463eb] bg-[#eff6ff] font-semibold text-[#2463eb] dark:bg-blue-950/60 dark:text-blue-300"
                        : "border-[#e1e7ef] bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    )}
                  >
                    {lv.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Bộ đề <strong className="text-[#2463eb]">Theo chủ đề (A1 → C2)</strong> — chọn trình độ CEFR bên dưới để lọc bài nghe.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Lọc theo chủ đề"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value as TopicId)}
              className="rounded-lg border border-[#e1e7ef] bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-[#2463eb] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              {Object.entries(TOPIC_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>

            {selectedCollection !== "thematic" && (
              <div className="inline-flex rounded-lg border border-[#e1e7ef] bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => setLayoutView("cards")}
                  data-testid="view-cards-button"
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    layoutView === "cards"
                      ? "bg-white font-semibold text-[#2463eb] shadow-xs dark:bg-slate-800 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <SquaresFour size={15} weight="duotone" />
                  <span>Thẻ Part</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutView("table")}
                  data-testid="view-table-button"
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    layoutView === "table"
                      ? "bg-white font-semibold text-[#2463eb] shadow-xs dark:bg-slate-800 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <TableIcon size={15} weight="duotone" />
                  <span>Bảng Ma trận</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
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
                    selectedMode
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                <Play size={15} weight="fill" />
                <span>Luyện tất cả ({reviewQuestions.length} câu)</span>
              </button>
            )}
          </div>

          <div ref={reviewListRef} className="space-y-2.5">
            {reviewQuestions.length === 0 ? (
              <div className="py-10 text-center text-base text-slate-500">
                Chưa có câu nào cần ôn lại. Hãy bắt đầu luyện tập một bài Test bên ngoài!
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
                          selectedMode
                        )
                      }
                      className="rounded-lg bg-[#2463eb] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
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
                      className="rounded-lg border border-[#e1e7ef] p-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600 dark:border-slate-700"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : selectedCollection === "thematic" ? (
        <ThematicCardGrid
          sets={THEMATIC_LISTENING_SETS}
          attempts={attempts}
          reviewQueue={reviewQueue}
          selectedPart={selectedPart}
          selectedTopic={selectedTopic}
          onStartThematicSet={handleStartThematicSet}
          onDataChanged={onDataChanged}
        />
      ) : selectedCollection === "custom" ? (
        <div className="space-y-3 rounded-xl border border-[#e1e7ef] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Kho bài nghe MP3 &amp; Script bạn đã thêm
            </h2>
            <button
              type="button"
              onClick={() => setCustomModalOpen(true)}
              className="rounded-lg bg-[#2463eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              + Thêm bài mới
            </button>
          </div>
          {customQuestions.length === 0 ? (
            <p className="py-8 text-center text-base text-slate-500">
              Bạn chưa tải lên bài nghe riêng nào. Bấm &ldquo;Thêm MP3&rdquo; để luyện ngay với file cá nhân.
            </p>
          ) : (
            <div className="space-y-2.5">
              {customQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between rounded-xl border border-[#e1e7ef] p-4 dark:border-slate-800"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {q.title}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Part {q.part} · {q.customAudioKey ? "File MP3 tải lên" : "Giọng đọc TOEIC chuẩn"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onStartStudio("Bài nghe tự thêm", customQuestions, idx, selectedMode)
                    }
                    className="rounded-lg bg-[#2463eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
                  >
                    Luyện tập
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : layoutView === "cards" ? (
        <TestCardGrid
          tests={filteredTests}
          questions={questions}
          attempts={attempts}
          reviewQueue={reviewQueue}
          selectedPart={selectedPart}
          onStartPractice={handleStartTestPart}
          onDataChanged={onDataChanged}
        />
      ) : (
        <TestMatrixTable
          tests={filteredTests}
          questions={questions}
          attempts={attempts}
          selectedPart={selectedPart}
          onStartPractice={handleStartTestPart}
        />
      )}

      <CustomAudioModal
        open={customModalOpen}
        onOpenChange={setCustomModalOpen}
        onCreated={(newQ) => {
          onDataChanged();
          onStartStudio("Bài nghe tự thêm", [newQ], 0, selectedMode);
        }}
      />
    </div>
  );
}
