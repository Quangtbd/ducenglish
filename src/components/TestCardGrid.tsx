import { useMemo } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ImageSquare,
  ChatsCircle,
  UsersThree,
  MegaphoneSimple,
  BookmarkSimple,
  BookOpenText,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type {
  DictationAttempt,
  ListeningQuestion,
  ReviewQueueItem,
  TestSet,
  ToeicPart,
} from "../types/toeic";
import { computeTestProgress, toggleReviewQueueItem } from "../lib/db";
import { cn } from "../lib/utils";

interface TestCardGridProps {
  tests: TestSet[];
  questions: ListeningQuestion[];
  attempts: DictationAttempt[];
  reviewQueue: ReviewQueueItem[];
  selectedPart: ToeicPart | "all";
  onStartPractice: (testId: string, part: ToeicPart) => void;
  onDataChanged: () => void;
}

const PART_META: Record<
  ToeicPart,
  {
    title: string;
    icon: typeof ImageSquare;
  }
> = {
  1: { title: "Part 1", icon: ImageSquare },
  2: { title: "Part 2", icon: ChatsCircle },
  3: { title: "Part 3", icon: UsersThree },
  4: { title: "Part 4", icon: MegaphoneSimple },
};

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function TestCardGrid({
  tests,
  questions,
  attempts,
  reviewQueue,
  selectedPart,
  onStartPractice,
  onDataChanged,
}: TestCardGridProps) {
  const rows = useMemo(
    () =>
      tests.map((test) => ({
        test,
        progress: computeTestProgress(test, questions, attempts),
      })),
    [tests, questions, attempts]
  );

  const reviewSet = useMemo(
    () => new Set(reviewQueue.map((r) => r.questionId)),
    [reviewQueue]
  );

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-[#e1e7ef] bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Không có bộ đề nào khớp với bộ lọc hiện tại.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Hãy thử chọn lại &ldquo;Tất cả bộ đề&rdquo; hoặc cấp độ khác.
        </p>
      </div>
    );
  }

  const visibleParts: ToeicPart[] =
    selectedPart === "all" ? [1, 2, 3, 4] : [selectedPart];

  return (
    <div data-testid="test-card-grid" className="space-y-8">
      {rows.map(({ test, progress }) => (
        <section key={test.id} data-testid={`test-section-${test.id}`}>
          {/* Test Section Heading matching exact dauenglish.com `<h3><span class="h-4 w-1 rounded-full bg-primary"></span>Test N</h3>` */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#1f2937] dark:text-slate-50">
              <span
                aria-hidden="true"
                className="h-4 w-1 rounded-full bg-[#2463eb]"
              />
              <span>{test.title}</span>
            </h3>
            <span className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
              {test.levelRange} · {progress.totalCompleted}/{progress.totalQuestions} câu
            </span>
          </div>

          {/* 4-Column Horizontal Part Cards Grid matching exact dauenglish.com card layout */}
          <motion.div
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
            data-testid={`test-part-grid-${test.id}`}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {visibleParts.map((part) => {
              const meta = PART_META[part];
              const Icon = meta.icon;
              const stats = progress.partProgress[part];
              const done = stats.total > 0 && stats.completed >= stats.total;

              const partQuestions = questions.filter(
                (q) => q.testId === test.id && q.part === part
              );
              const vocabCount = partQuestions.reduce(
                (acc, q) => acc + q.keyVocab.length,
                0
              );
              const bookmarkedCount = partQuestions.filter((q) =>
                reviewSet.has(q.id)
              ).length;

              const handleTogglePartBookmark = async (e: React.MouseEvent) => {
                e.stopPropagation();
                const targetQ = partQuestions[0];
                if (!targetQ) return;
                const added = await toggleReviewQueueItem(targetQ.id, 0);
                onDataChanged();
                toast.success(
                  added
                    ? `Đã đánh dấu luyện lại ${test.title} · ${meta.title}`
                    : `Đã bỏ đánh dấu ${test.title} · ${meta.title}`
                );
              };

              return (
                <motion.article
                  key={part}
                  variants={cardItemVariants}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 360, damping: 24 }}
                  onClick={() => onStartPractice(test.id, part)}
                  data-testid={`part-card-${test.id}-part${part}`}
                  className={cn(
                    "group relative flex h-full min-h-[170px] cursor-pointer flex-col overflow-hidden rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:border-[#1d4ed8]/30 hover:shadow-lg dark:bg-slate-900",
                    done
                      ? "border-emerald-200 dark:border-emerald-900"
                      : "border-[#e1e7ef] dark:border-slate-800"
                  )}
                >
                  {/* Top-right Vocab Count & Bookmark Pill matching dauenglish.com */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartPractice(test.id, part);
                    }}
                    title={`${vocabCount} từ vựng trọng tâm trong ${meta.title}`}
                    aria-label={`${vocabCount} từ vựng trong ${meta.title}`}
                    className="absolute top-2.5 right-12 z-10 inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-[#eff6ff] hover:text-[#1d4ed8]"
                  >
                    <BookOpenText size={15} weight="duotone" />
                  </button>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 1.25 }}
                    onClick={handleTogglePartBookmark}
                    aria-label={`Đánh dấu câu cần luyện lại ${meta.title}`}
                    data-testid={`bookmark-${test.id}-part${part}`}
                    className={cn(
                      "absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-semibold tabular-nums transition-colors",
                      bookmarkedCount > 0
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:bg-slate-800"
                    )}
                  >
                    <BookmarkSimple
                      size={12}
                      weight={bookmarkedCount > 0 ? "fill" : "regular"}
                    />
                    <span>{bookmarkedCount}</span>
                  </motion.button>

                  {/* Top-left Soft Blue Part Badge matching dauenglish.com */}
                  <div className="mb-5 flex flex-wrap items-center gap-2 pr-14">
                    <span className="inline-flex items-center rounded-full border border-[#1d4ed8]/20 bg-[#eff6ff] px-2.5 py-1 text-xs font-semibold text-[#1d4ed8] shadow-xs dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                      {meta.title}
                    </span>
                  </div>

                  {/* Middle Row: 36x36 Circle Soft-Blue Icon + Question Count */}
                  <div className="mb-5 flex items-center gap-2 text-lg font-semibold text-[#1f2937] dark:text-slate-100">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[#1d4ed8] dark:bg-blue-950/60 dark:text-blue-400">
                      <Icon size={19} weight="duotone" />
                    </div>
                    <span className="tabular-nums">{stats.total}</span>
                    <span className="text-base font-normal text-slate-500">
                      câu
                    </span>
                  </div>

                  {/* Bottom Footer: Status left + Compact CTA right matching dauenglish.com */}
                  <div className="mt-auto flex items-center justify-between border-t border-slate-200/70 pt-3 dark:border-slate-800">
                    <span
                      className={cn(
                        "text-sm tabular-nums",
                        done
                          ? "font-medium text-emerald-600 dark:text-emerald-400"
                          : stats.completed > 0
                          ? "font-medium text-[#2463eb] dark:text-blue-400"
                          : "text-slate-500"
                      )}
                    >
                      {done
                        ? "Hoàn thành"
                        : stats.completed > 0
                        ? `${stats.completed}/${stats.total} câu`
                        : "Chưa bắt đầu"}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartPractice(test.id, part);
                      }}
                      data-testid={`start-${test.id}-part${part}`}
                      className={cn(
                        "inline-flex h-8 items-center justify-center gap-1 rounded-md px-3 text-xs font-semibold shadow-sm transition-colors",
                        done
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-[#2463eb] text-white hover:bg-[#1d4ed8]"
                      )}
                    >
                      <span>{done ? "Ôn lại" : "Luyện tập"}</span>
                      <ArrowRight size={13} weight="bold" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </section>
      ))}
    </div>
  );
}
