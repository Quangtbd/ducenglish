import { useState, useMemo, useEffect } from "react";
import { Headphones, Crown, ShoppingBag, Copy, ArrowClockwise, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";
import { ModuleHeroBanner } from "./ui/ModuleHeroBanner";
import { LISTENING_PART_EXAM_SETS, type ListeningExamSet } from "../data/listeningPartsDataset";
import { ListeningExamPracticeStudio } from "./ListeningExamPracticeStudio";
import { cn } from "../lib/utils";

type ListeningTab = "listen-check" | 1 | 2 | 3 | 4;

const LISTENING_TABS: { id: ListeningTab; label: string }[] = [
  { id: "listen-check", label: "Nghe chép" },
  { id: 1, label: "Part 1" },
  { id: 2, label: "Part 2" },
  { id: 3, label: "Part 3" },
  { id: 4, label: "Part 4" },
];

interface PartListeningHubProps {
  initialPart?: 1 | 2 | 3 | 4;
  onStartLegacyStudio: () => void;
  onOpenVocabDrawer?: (word: string) => void;
  onOpenBasket?: () => void;
}

export function PartListeningHub({
  initialPart = 1,
  onStartLegacyStudio,
  onOpenVocabDrawer,
  onOpenBasket,
}: PartListeningHubProps) {
  const [activeTab, setActiveTab] = useState<ListeningTab>(initialPart);
  const [activeExamSet, setActiveExamSet] = useState<ListeningExamSet | null>(null);

  useEffect(() => {
    setActiveTab(initialPart);
    setActiveExamSet(null);
  }, [initialPart]);

  const currentPartSets = useMemo(() => {
    if (activeTab === "listen-check" || typeof activeTab !== "number") return [];
    return LISTENING_PART_EXAM_SETS.filter((s) => s.part === activeTab);
  }, [activeTab]);

  const etsSets = useMemo(() => {
    return currentPartSets.filter((s) => s.id.startsWith("ets2026-"));
  }, [currentPartSets]);

  const levelSets = useMemo(() => {
    return currentPartSets.filter((s) => !s.id.startsWith("ets2026-"));
  }, [currentPartSets]);

  if (activeExamSet) {
    return (
      <ListeningExamPracticeStudio
        examSet={activeExamSet}
        onExit={() => setActiveExamSet(null)}
        onOpenVocabDrawer={onOpenVocabDrawer}
        onOpenBasket={onOpenBasket}
      />
    );
  }

  return (
    <div data-testid="part-listening-hub" className="space-y-6">
      {/* 1. Unified Hero Banner matching Screenshot 1-4 */}
      <ModuleHeroBanner
        kicker="Lộ trình Nghe TOEIC A1 → C2"
        titleLeading="Chinh phục"
        titleHighlight="TOEIC Listening"
        titleTrailing="từ dễ đến khó"
        description="Luyện nghe theo Part 1–3–4 (Mô tả tranh, Hỏi đáp, Hội thoại & Bài nói) với 8 Level phân cấp và hàng nghìn câu hỏi chuẩn đề thi thật IIG."
        icon={Headphones}
        pills={LISTENING_TABS.map((t) => ({ id: String(t.id), label: t.label }))}
        activePill={String(activeTab)}
        onSelectPill={(id) => {
          if (id === "listen-check") {
            setActiveTab("listen-check");
            onStartLegacyStudio();
          } else {
            setActiveTab(Number(id) as 1 | 2 | 3 | 4);
          }
        }}
        searchPlaceholder="Gõ từ khóa bộ đề nghe hoặc chủ đề đàm thoại..."
      />

      {/* 2. Top Tabs Switcher matching Screenshots 1-4 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3 dark:border-slate-800">
        <div
          role="tablist"
          aria-label="Chọn phần nghe"
          className="inline-flex items-center gap-1 rounded-full border border-[#2463eb]/10 bg-[#2463eb]/5 p-1"
        >
          {LISTENING_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={String(tab.id)}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  if (tab.id === "listen-check") {
                    setActiveTab("listen-check");
                    onStartLegacyStudio();
                  } else {
                    setActiveTab(tab.id as 1 | 2 | 3 | 4);
                  }
                }}
                data-testid={`listening-tab-${tab.id}`}
                className={cn(
                  "cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-[#2463eb] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab !== "listen-check" && (
        <div className="space-y-6">
          {/* Tip Banner matching Screenshots 1-4 */}
          <div className="text-xs font-semibold text-[#2463eb] dark:text-blue-400">
            <span>Mẹo: Mẹo làm Part {activeTab} bẫy hay gặp ➔</span>
          </div>

          {/* ETS 2026 Official Test Sets Showcase */}
          {etsSets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      MỚI NHẤT · ETS 2026
                    </span>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
                      Bộ đề ETS TOEIC 2026 Chuẩn Thi Thật
                    </h2>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Kho âm thanh gốc 540 MP3 từ ETS kèm Transcript song ngữ & Phân tích bẫy đề thi
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {etsSets.map((set) => (
                  <div
                    key={set.id}
                    className="group flex flex-col justify-between rounded-2xl border border-blue-200/80 bg-linear-to-b from-blue-50/40 to-white p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-[#2463eb] hover:shadow-md dark:border-blue-900/50 dark:from-blue-950/20 dark:to-slate-900"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-[#2463eb] px-2 py-0.5 text-xs font-bold text-white">
                          Part {set.part}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Audio ETS Gốc
                        </span>
                      </div>
                      <h3 className="mt-2 font-display text-base font-bold text-slate-900 group-hover:text-[#2463eb] dark:text-slate-50">
                        {set.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {set.subtitle}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {set.totalQuestions} câu hỏi
                        </span>
                        <span>•</span>
                        <span>{set.category}</span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-medium text-slate-400">
                        Level {set.level} (Mục tiêu 600–900+)
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveExamSet(set)}
                        className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#2463eb] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
                      >
                        Luyện đề ngay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Level 1 to 8 Cards Grid matching Screenshots 1-4 */}
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
              Luyện theo Level (1 → 8)
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, idx) => {
                const lvl = idx + 1;
                const matchedSet =
                  levelSets.find((s) => s.level === lvl) || levelSets[0] || currentPartSets[0];

                return (
                  <div
                    key={lvl}
                    data-testid={`level-card-${lvl}`}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:-translate-y-1 hover:border-[#2463eb]/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-[#2463eb] dark:text-slate-100">
                          Level {lvl}
                        </h3>
                        {lvl % 2 === 0 && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <Crown size={12} weight="fill" />
                            <span>PRO</span>
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {lvl === 1
                          ? "Dưới 300/990 TOEIC"
                          : lvl === 2
                          ? "300–400/990 TOEIC"
                          : lvl === 3
                          ? "400–500/990 TOEIC"
                          : lvl === 4
                          ? "500–600/990 TOEIC"
                          : lvl === 5
                          ? "600–700/990 TOEIC"
                          : lvl === 6
                          ? "700–800/990 TOEIC"
                          : lvl === 7
                          ? "800–900/990 TOEIC"
                          : "Trên 900/990 TOEIC"}
                      </p>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                        Chưa luyện tập · 25 câu
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          type="button"
                          onClick={() => toast.info("Đã thêm bộ đề vào giỏ.")}
                          aria-label="Thêm vào giỏ"
                          className="rounded p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <ShoppingBag size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.success("Đã sao chép liên kết bộ đề.")}
                          aria-label="Sao chép"
                          className="rounded p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.info("Đã đặt lại tiến độ.")}
                          aria-label="Đặt lại"
                          className="rounded p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <ArrowClockwise size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.info("Đã xóa khỏi danh sách.")}
                          aria-label="Xóa"
                          className="rounded p-1 transition-colors hover:bg-slate-100 dark:hover:text-rose-500 dark:hover:bg-slate-800"
                        >
                          <Trash size={15} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => matchedSet && setActiveExamSet(matchedSet)}
                        data-testid={`study-level-${lvl}`}
                        className="inline-flex cursor-pointer items-center justify-center rounded-full border border-emerald-500 bg-white px-4 py-1.5 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white dark:bg-slate-900 dark:hover:bg-emerald-600"
                      >
                        Học ngay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
