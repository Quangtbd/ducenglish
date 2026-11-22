import { useMemo, useState } from "react";
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
  CefrLevel,
  DictationAttempt,
  ReviewQueueItem,
  ThematicListeningSet,
  ToeicPart,
  TopicId,
} from "../types/toeic";
import { toggleReviewQueueItem } from "../lib/db";
import { CEFR_LEVEL_META, TOPIC_LABELS, cn } from "../lib/utils";
import {
  AppTooltip,
  PartHoverPreview,
  ctaButtonVariants,
  partBadgeVariants,
  type CefrBadgeTone,
} from "./ui/UiPrimitives";

interface ThematicCardGridProps {
  sets: ThematicListeningSet[];
  attempts: DictationAttempt[];
  reviewQueue: ReviewQueueItem[];
  selectedPart: ToeicPart | "all";
  selectedTopic: TopicId;
  onStartThematicSet: (set: ThematicListeningSet) => void;
  onDataChanged: () => void;
}

const CEFR_OPTIONS: (CefrLevel | "all")[] = [
  "all",
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

const CEFR_TONES: Record<CefrLevel, CefrBadgeTone> = {
  A1: "emerald",
  A2: "blue",
  B1: "blue",
  B2: "indigo",
  C1: "violet",
  C2: "amber",
};

const PART_ICONS: Record<ToeicPart, typeof ImageSquare> = {
  1: ImageSquare,
  2: ChatsCircle,
  3: UsersThree,
  4: MegaphoneSimple,
};

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.035 },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function ThematicCardGrid({
  sets,
  attempts,
  reviewQueue,
  selectedPart,
  selectedTopic,
  onStartThematicSet,
  onDataChanged,
}: ThematicCardGridProps) {
  const [selectedCefr, setSelectedCefr] = useState<CefrLevel | "all">("all");

  const masteredQuestionIds = useMemo(() => {
    return new Set(
      attempts.filter((a) => a.accuracy >= 80).map((a) => a.questionId)
    );
  }, [attempts]);

  const reviewSet = useMemo(
    () => new Set(reviewQueue.map((r) => r.questionId)),
    [reviewQueue]
  );

  const filteredSets = useMemo(() => {
    return sets.filter((s) => {
      if (selectedCefr !== "all" && s.cefrLevel !== selectedCefr) return false;
      if (selectedPart !== "all" && s.part !== selectedPart) return false;
      if (selectedTopic !== "all" && s.topic !== selectedTopic) return false;
      return true;
    });
  }, [sets, selectedCefr, selectedPart, selectedTopic]);

  // Group sets by "CEFR · Part N" preserving A1 -> C2 progression order
  const groupedSections = useMemo(() => {
    const map = new Map<string, { label: string; cefr: CefrLevel; part: ToeicPart; items: ThematicListeningSet[] }>();
    for (const s of filteredSets) {
      const key = `${s.cefrLevel}-part${s.part}`;
      const existing = map.get(key);
      if (existing) {
        existing.items.push(s);
      } else {
        map.set(key, {
          label: `${s.cefrLevel} · Part ${s.part}`,
          cefr: s.cefrLevel,
          part: s.part,
          items: [s],
        });
      }
    }
    return Array.from(map.entries());
  }, [filteredSets]);

  return (
    <div data-testid="thematic-card-grid" className="space-y-6">
      {/* A1 -> C2 CEFR Filter Strip matching Đậu English progression */}
      <div className="rounded-xl border border-[#e1e7ef] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Trình độ (A1 → C2):
            </span>
            {CEFR_OPTIONS.map((lv) => {
              const active = selectedCefr === lv;
              return (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setSelectedCefr(lv)}
                  data-testid={`cefr-filter-${lv}`}
                  className={cn(
                    "relative rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap",
                    active
                      ? "text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="cefrActivePill"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-[#2463eb] shadow-xs"
                    />
                  )}
                  <span className="relative z-10">
                    {lv === "all" ? "Tất cả A1–C2" : lv}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-sm font-medium text-slate-500 tabular-nums">
            {filteredSets.length} bộ chủ đề
          </span>
        </div>

        {selectedCefr !== "all" && (
          <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400">
            <strong>{CEFR_LEVEL_META[selectedCefr].label}:</strong>{" "}
            {CEFR_LEVEL_META[selectedCefr].desc}
          </p>
        )}
      </div>

      {groupedSections.length === 0 ? (
        <div className="rounded-xl border border-[#e1e7ef] bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-base font-medium text-slate-700 dark:text-slate-300">
            Không có bộ chủ đề nào khớp với bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        groupedSections.map(([sectionKey, group]) => (
          <section key={sectionKey} data-testid={`thematic-section-${sectionKey}`}>
            <div className="mb-3.5 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1f2937] dark:text-slate-50">
                <span
                  aria-hidden="true"
                  className="h-5 w-1 rounded-full bg-[#2463eb]"
                />
                <span>{group.label}</span>
              </h3>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {CEFR_LEVEL_META[group.cefr].desc}
              </span>
            </div>

            <motion.div
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {group.items.map((item) => {
                const Icon = PART_ICONS[item.part];
                const totalCount = item.questions.length;
                const completedCount = item.questions.filter((q) =>
                  masteredQuestionIds.has(q.id)
                ).length;
                const done = totalCount > 0 && completedCount >= totalCount;
                const bookmarkedCount = item.questions.filter((q) =>
                  reviewSet.has(q.id)
                ).length;
                const vocabPreview = item.questions.flatMap((q) => q.keyVocab);

                const handleToggleBookmark = async (e: React.MouseEvent) => {
                  e.stopPropagation();
                  const firstQ = item.questions[0];
                  if (!firstQ) return;
                  const added = await toggleReviewQueueItem(firstQ.id, 0);
                  onDataChanged();
                  toast.success(
                    added
                      ? `Đã lưu chủ đề ${item.title} vào danh sách ôn`
                      : `Đã bỏ đánh dấu ${item.title}`
                  );
                };

                return (
                  <PartHoverPreview
                    key={item.id}
                    title={`${item.cefrLevel} · ${item.title}`}
                    subtitle={`${item.titleVi} — ${item.descriptionVi}`}
                    vocabPreview={vocabPreview}
                  >
                    <motion.article
                      variants={cardItemVariants}
                      whileHover={{ y: -5, scale: 1.015 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ type: "spring", stiffness: 360, damping: 24 }}
                      onClick={() => onStartThematicSet(item)}
                      data-testid={`thematic-card-${item.id}`}
                      className={cn(
                        "hover-shine-card group relative flex h-full min-h-[188px] cursor-pointer flex-col overflow-hidden rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:border-[#2463eb]/40 hover:shadow-lg dark:bg-slate-900",
                        done
                          ? "border-emerald-200 dark:border-emerald-900"
                          : "border-[#e1e7ef] dark:border-slate-800"
                      )}
                    >
                      {/* Top-right Vocab & Bookmark icons with Radix Tooltip */}
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                        <span
                          title={`${vocabPreview.length} từ vựng trọng tâm`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors group-hover:bg-[#eff6ff] group-hover:text-[#1d4ed8]"
                        >
                          <BookOpenText size={16} weight="duotone" />
                        </span>

                        <AppTooltip content="Đánh dấu vào Câu cần luyện lại">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 1.25 }}
                            onClick={handleToggleBookmark}
                            aria-label={`Đánh dấu chủ đề ${item.title}`}
                            className={cn(
                              "flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-semibold tabular-nums transition-colors",
                              bookmarkedCount > 0
                                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800"
                            )}
                          >
                            <BookmarkSimple
                              size={12}
                              weight={bookmarkedCount > 0 ? "fill" : "regular"}
                            />
                            <span>{bookmarkedCount}</span>
                          </motion.button>
                        </AppTooltip>
                      </div>

                      {/* Top-left CEFR + Topic badge */}
                      <div className="mb-3 flex flex-wrap items-center gap-1.5 pr-16">
                        <span
                          className={partBadgeVariants({
                            tone: CEFR_TONES[item.cefrLevel],
                            size: "sm",
                          })}
                        >
                          {item.cefrLevel} · Part {item.part}
                        </span>
                      </div>

                      {/* Topic Title & Vietnamese subtitle */}
                      <div className="mb-4 flex items-start gap-2.5">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[#1d4ed8] transition-transform duration-200 group-hover:scale-110 dark:bg-blue-950/60 dark:text-blue-400">
                          <Icon size={19} weight="duotone" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="line-clamp-2 text-[15px] leading-snug font-semibold text-[#1f2937] transition-colors group-hover:text-[#2463eb] dark:text-slate-100">
                            {item.title}
                          </h4>
                          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                            {item.titleVi} · {TOPIC_LABELS[item.topic]}
                          </p>
                        </div>
                      </div>

                      {/* Footer: Question Count & Status left + CTA right */}
                      <div className="mt-auto flex items-center justify-between border-t border-slate-200/70 pt-3 dark:border-slate-800">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-slate-900 tabular-nums dark:text-slate-100">
                            {totalCount}{" "}
                            <span className="text-sm font-normal text-slate-500">
                              câu
                            </span>
                          </span>
                          <span
                            className={cn(
                              "text-xs font-medium tabular-nums",
                              done
                                ? "text-emerald-600"
                                : completedCount > 0
                                ? "text-[#2463eb]"
                                : "text-slate-400"
                            )}
                          >
                            {done
                              ? "· Hoàn thành"
                              : completedCount > 0
                              ? `· ${completedCount}/${totalCount}`
                              : ""}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartThematicSet(item);
                          }}
                          className={ctaButtonVariants({
                            intent: done ? "completed" : "primary",
                          })}
                        >
                          <span>{done ? "Ôn lại" : "Luyện tập"}</span>
                          <ArrowRight
                            size={14}
                            weight="bold"
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                          />
                        </button>
                      </div>
                    </motion.article>
                  </PartHoverPreview>
                );
              })}
            </motion.div>
          </section>
        ))
      )}
    </div>
  );
}
