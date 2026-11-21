import { useMemo, useState } from "react";
import { motion } from "motion/react";
import * as Accordion from "@radix-ui/react-accordion";
import NumberFlow from "@number-flow/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  Headphones,
  Fire,
  UploadSimple,
  Trash,
  Play,
  Sparkle,
  SquaresFour,
  Table as TableIcon,
  Lightning,
  ArrowRight,
  CheckCircle,
} from "@phosphor-icons/react";
import type {
  DictationAttempt,
  DictationMode,
  ListeningQuestion,
  ReviewQueueItem,
  TestCollectionId,
  TestSet,
  ToeicPart,
  TopicId,
  UserProfile,
} from "../types/toeic";
import { COLLECTION_TABS, TOPIC_LABELS, cn } from "../lib/utils";
import { toggleReviewQueueItem } from "../lib/db";
import { TestMatrixTable } from "./TestMatrixTable";
import { TestCardGrid } from "./TestCardGrid";
import { DictationStudio } from "./DictationStudio";
import { CustomAudioModal } from "./CustomAudioModal";

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
      if (selectedCollection !== "all" && t.collection !== selectedCollection) {
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
      {/* Hero Banner matching exact dauenglish.com/listen/nghe-chep structure */}
      <section
        data-testid="hero-banner"
        className="relative overflow-hidden rounded-2xl border border-[#2463eb]/10 bg-[#2463eb]/5 px-6 py-6 md:px-8 md:py-7 dark:border-blue-900/50 dark:bg-blue-950/30"
      >
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2463eb]/15 bg-white/85 px-2.5 py-1 text-xs font-medium text-[#2463eb] dark:border-blue-800 dark:bg-slate-900 dark:text-blue-400">
              <Sparkle size={14} weight="duotone" />
              <span>Luyện nghe TOEIC</span>
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#1f2937] sm:text-4xl dark:text-slate-50">
              Chinh phục{" "}
              <span className="bg-gradient-to-r from-[#2463eb] to-blue-500 bg-clip-text text-transparent">
                TOEIC Listening
              </span>{" "}
              từ dễ đến khó
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
              Nghe chép chính tả và luyện Part 1–4 theo 8 level, từ dưới 300 tới trên 900 điểm.
            </p>
          </div>

          <div
            data-testid="hero-headphones-badge"
            className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2463eb] to-blue-500 text-white shadow-lg shadow-[#2463eb]/25 md:flex lg:h-24 lg:w-24"
          >
            <Headphones size={46} weight="regular" />
          </div>
        </div>
      </section>

      {/* Part Pill Container + Listening Mode + Upload MP3 + Slim Stats */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* dauenglish.com rounded-full Part Tab Bar */}
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
                    "relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors md:px-5",
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

          {/* Listening Mode Switcher + Upload MP3 */}
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
                    className="relative whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
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
                          ? "text-[#2463eb] dark:text-blue-400"
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
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#2463eb]/20 bg-[#eff6ff] px-3.5 py-2 text-xs font-semibold text-[#2463eb] transition-colors hover:bg-[#dbeafe] dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300"
            >
              <UploadSimple size={15} weight="duotone" />
              <span>Thêm MP3</span>
            </button>
          </div>
        </div>

        {/* Mẹo link + Inline Streak / XP / Progress summary */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Accordion.Root type="single" collapsible className="flex-1">
            <Accordion.Item value="tips" className="w-full">
              <Accordion.Header>
                <Accordion.Trigger
                  data-testid="tips-trigger"
                  className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400"
                >
                  <span>Mẹo:</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[#2463eb] hover:underline dark:text-blue-400">
                    Nghe chép chính tả đúng cách
                    <ArrowRight size={13} weight="bold" />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="mt-2.5 rounded-xl border border-[#e1e7ef] bg-white p-4 text-xs leading-relaxed text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <div className="grid gap-3 sm:grid-cols-4">
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">
                      1. Nghe nắm ý:
                    </strong>{" "}
                    Nghe 1 lượt ở tốc độ 1.0x không nhìn chữ để bắt từ khóa chính.
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">
                      2. Chép &amp; Lặp đoạn:
                    </strong>{" "}
                    Bấm <kbd className="font-mono">Ctrl+Space</kbd> nghe lại hoặc khoanh vùng sóng âm đoạn nối âm.
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">
                      3. Soát lỗi Diff:
                    </strong>{" "}
                    Xem ngay từ thiếu/đuôi -s/-ed bị nuốt và đọc mẹo nối âm bên phải.
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">
                      4. Lưu từ &amp; Ôn lại:
                    </strong>{" "}
                    Bấm trực tiếp vào từ mới trong transcript để lưu vào Giỏ từ vựng.
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>

          {/* Compact unboxed metrics matching zero-pill discipline */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 tabular-nums dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Fire size={14} weight="duotone" className="text-amber-600" />
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                <NumberFlow value={profile.streakDays} />
              </strong>{" "}
              ngày
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Lightning size={14} weight="duotone" className="text-[#2463eb]" />
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                <NumberFlow value={profile.xp} />
              </strong>{" "}
              XP
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle size={14} weight="duotone" className="text-emerald-600" />
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                <NumberFlow value={uniqueCompletedCount} />/{questions.length}
              </strong>{" "}
              câu
            </span>
          </div>
        </div>
      </div>

      {/* Collection Pill Tabs (exact dauenglish.com pill style) + Level & Matrix Controls */}
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
                    "shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                    isActive
                      ? "border-[#2463eb] bg-[#2463eb] font-semibold text-white shadow-sm"
                      : "border-[#e1e7ef] bg-slate-100/70 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
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
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                viewMode === "review"
                  ? "border-rose-600 bg-rose-600 font-semibold text-white shadow-sm"
                  : "border-[#e1e7ef] bg-slate-100/70 text-slate-600 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              )}
            >
              <Fire size={14} weight={viewMode === "review" ? "fill" : "duotone"} />
              <span>Câu cần luyện lại ({reviewQueue.length})</span>
            </button>
          </div>
        </div>

        {/* Level Chips + Topic + View Switch */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e1e7ef] bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold text-slate-500">
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
                    "rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold transition-colors tabular-nums",
                    active
                      ? "border-[#2463eb] bg-[#eff6ff] text-[#2463eb] dark:bg-blue-950/60 dark:text-blue-300"
                      : "border-[#e1e7ef] bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                  )}
                >
                  {lv.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Lọc theo chủ đề"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value as TopicId)}
              className="rounded-lg border border-[#e1e7ef] bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 outline-none focus:border-[#2463eb] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              {Object.entries(TOPIC_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>

            <div className="inline-flex rounded-lg border border-[#e1e7ef] bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setLayoutView("cards")}
                data-testid="view-cards-button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                  layoutView === "cards"
                    ? "bg-white text-[#2463eb] shadow-xs dark:bg-slate-800 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                <SquaresFour size={14} weight="duotone" />
                <span>Thẻ Part</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutView("table")}
                data-testid="view-table-button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                  layoutView === "table"
                    ? "bg-white text-[#2463eb] shadow-xs dark:bg-slate-800 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                <TableIcon size={14} weight="duotone" />
                <span>Bảng Ma trận</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "review" ? (
        <div className="space-y-3 rounded-xl border border-[#e1e7ef] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Danh sách Câu cần luyện lại
              </h2>
              <p className="text-xs text-slate-500">
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
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                <Play size={14} weight="fill" />
                <span>Luyện tất cả ({reviewQuestions.length} câu)</span>
              </button>
            )}
          </div>

          <div ref={reviewListRef} className="space-y-2.5">
            {reviewQuestions.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Chưa có câu nào cần ôn lại. Hãy bắt đầu luyện tập một bài Test bên ngoài!
              </div>
            ) : (
              reviewQuestions.map(({ item, question }, idx) => (
                <div
                  key={question.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e1e7ef] p-3.5 dark:border-slate-800"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Part {question.part}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-rose-600 tabular-nums">
                        Gần nhất: {item.lastAccuracy}%
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
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
                      className="rounded-lg bg-[#2463eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
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
                      className="rounded-lg border border-[#e1e7ef] p-1.5 text-slate-500 hover:bg-slate-100 hover:text-rose-600 dark:border-slate-700"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : selectedCollection === "custom" ? (
        <div className="space-y-3 rounded-xl border border-[#e1e7ef] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
              Kho bài nghe MP3 &amp; Script bạn đã thêm
            </h2>
            <button
              type="button"
              onClick={() => setCustomModalOpen(true)}
              className="rounded-lg bg-[#2463eb] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
            >
              + Thêm bài mới
            </button>
          </div>
          {customQuestions.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Bạn chưa tải lên bài nghe riêng nào. Bấm &ldquo;Thêm MP3&rdquo; để luyện ngay với file cá nhân.
            </p>
          ) : (
            <div className="space-y-2.5">
              {customQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between rounded-xl border border-[#e1e7ef] p-3.5 dark:border-slate-800"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {q.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Part {q.part} · {q.customAudioKey ? "File MP3 tải lên" : "Giọng AI TTS"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onStartStudio("Bài nghe tự thêm", customQuestions, idx, selectedMode)
                    }
                    className="rounded-lg bg-[#2463eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
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
