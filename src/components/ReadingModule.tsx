import { useMemo, useState } from "react";
import {
  BookOpenText,
  ShoppingBag,
  Copy,
  ArrowClockwise,
  Trash,
  Shuffle,
  LightbulbFilament,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { ModuleHeroBanner } from "./ui/ModuleHeroBanner";
import { GRAMMAR_TOPICS, type GrammarTopic } from "../data/readingGrammarDataset";
import { ReadingPracticeStudio } from "./ReadingPracticeStudio";
import { READING_QUESTIONS } from "../data/toeicDataset";
import { WordDetailDrawer } from "./WordDetailDrawer";
import { cn } from "../lib/utils";

type ReadingTab = "grammar" | 5 | 6 | 7;
type GrammarCategoryFilter = "all" | "Từ loại" | "Động từ" | "Ngữ pháp khác";

const READING_TABS: { id: ReadingTab; label: string }[] = [
  { id: "grammar", label: "Ngữ pháp" },
  { id: 5, label: "Part 5" },
  { id: 6, label: "Part 6" },
  { id: 7, label: "Part 7" },
];

const GRAMMAR_CATEGORY_FILTERS: { id: GrammarCategoryFilter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "Từ loại", label: "Từ loại" },
  { id: "Động từ", label: "Động từ" },
  { id: "Ngữ pháp khác", label: "Ngữ pháp khác" },
];

export function ReadingModule() {
  const [activeTab, setActiveTab] = useState<ReadingTab>("grammar");
  const [grammarCategory, setGrammarCategory] = useState<GrammarCategoryFilter>("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [activePracticeTopic, setActivePracticeTopic] = useState<GrammarTopic | null>(null);
  const [drawerWord, setDrawerWord] = useState<string | null>(null);

  // Filtered grammar topics
  const filteredGrammarTopics = useMemo(() => {
    return GRAMMAR_TOPICS.filter((t) => {
      if (grammarCategory !== "all" && t.category !== grammarCategory) return false;
      if (
        searchKeyword.trim() &&
        !t.title.toLowerCase().includes(searchKeyword.toLowerCase().trim())
      ) {
        return false;
      }
      return true;
    });
  }, [grammarCategory, searchKeyword]);

  // Group topics by category
  const groupedCategories = useMemo(() => {
    const categories: ("Từ loại" | "Động từ" | "Ngữ pháp khác")[] = [
      "Từ loại",
      "Động từ",
      "Ngữ pháp khác",
    ];
    return categories
      .map((cat) => ({
        category: cat,
        topics: filteredGrammarTopics.filter((t) => t.category === cat),
      }))
      .filter((g) => g.topics.length > 0);
  }, [filteredGrammarTopics]);

  // Part 5-7 questions state
  const [partSelectedMap, setPartSelectedMap] = useState<Record<string, number>>({});
  const [partCheckedMap, setPartCheckedMap] = useState<Record<string, boolean>>({});

  const partQuestions = useMemo(() => {
    if (activeTab === "grammar") return [];
    return READING_QUESTIONS.filter((q) => q.part === activeTab);
  }, [activeTab]);

  const handleStartRandom = () => {
    const randomIndex = Math.floor(Math.random() * GRAMMAR_TOPICS.length);
    setActivePracticeTopic(GRAMMAR_TOPICS[randomIndex]);
    toast.success(`Đang mở ngẫu nhiên chủ điểm: ${GRAMMAR_TOPICS[randomIndex].title}`);
  };

  if (activePracticeTopic) {
    return (
      <>
        <ReadingPracticeStudio
          topic={activePracticeTopic}
          onExit={() => setActivePracticeTopic(null)}
          onOpenVocabDrawer={(w) => setDrawerWord(w)}
          onOpenBasket={() => toast.info("Giỏ từ vựng lưu trữ trong mục Từ vựng.")}
        />
        {drawerWord && (
          <WordDetailDrawer
            word={drawerWord}
            open={Boolean(drawerWord)}
            onOpenChange={(open) => !open && setDrawerWord(null)}
          />
        )}
      </>
    );
  }

  return (
    <div data-testid="reading-module" className="space-y-6">
      {/* 1. Unified Hero Banner matching Screenshot 1 */}
      <ModuleHeroBanner
        kicker="Luyện đọc tiếng Anh"
        titleLeading="Nắm chắc"
        titleHighlight="ngữ pháp & kỹ năng đọc"
        titleTrailing="mọi Part"
        description="Luyện tập ngữ pháp trọng điểm TOEIC, phân tích từ loại, động từ và thực chiến giải đề Part 5, 6, 7 theo chuẩn giao diện Đậu English."
        icon={BookOpenText}
        searchPlaceholder="Gõ chủ điểm ngữ pháp (Danh từ, Thì, Bị động...) hoặc từ khóa"
        searchValue={searchKeyword}
        onSearchChange={setSearchKeyword}
      />

      {/* 2. Top Tabs: Ngữ pháp · Part 5 · Part 6 · Part 7 matching Screenshot 3 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3 dark:border-slate-800">
        <div
          role="tablist"
          aria-label="Chọn phần đọc"
          className="inline-flex items-center gap-1 rounded-full border border-[#2463eb]/10 bg-[#2463eb]/5 p-1"
        >
          {READING_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={String(tab.id)}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`reading-tab-${tab.id}`}
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

      {/* 3. GRAMMAR VIEW matching Screenshot 3 */}
      {activeTab === "grammar" ? (
        <div className="space-y-6">
          {/* Tip Banner matching Screenshot 3 */}
          <div className="flex items-center gap-1.5 text-sm font-medium text-[#2463eb] dark:text-blue-400">
            <LightbulbFilament size={18} weight="duotone" className="shrink-0" />
            <span>Mẹo:</span>
            <button
              type="button"
              onClick={() =>
                toast.info(
                  "Thứ tự ưu tiên học: 1. Từ loại (Danh, Tính, Trạng) -> 2. Thì & S-V -> 3. Bị động & Mệnh đề quan hệ."
                )
              }
              className="cursor-pointer font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Ngữ pháp TOEIC hay ra nhất và thứ tự học →
            </button>
          </div>

          {/* Filter Pills + Luyện ngẫu nhiên Button matching Screenshot 3 */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {GRAMMAR_CATEGORY_FILTERS.map((f) => {
                const active = grammarCategory === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setGrammarCategory(f.id)}
                    data-testid={`grammar-filter-${f.id}`}
                    className={cn(
                      "cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                      active
                        ? "bg-[#2463eb] text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleStartRandom}
              data-testid="grammar-random-button"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#2463eb] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-blue-600"
            >
              <Shuffle size={16} weight="bold" />
              <span>Luyện ngẫu nhiên</span>
            </button>
          </div>

          {/* Grouped Catalog Cards matching Screenshot 3 */}
          <div className="space-y-8">
            {groupedCategories.map((group) => {
              const totalItemsCount = group.topics.reduce((acc, t) => acc + t.totalCount, 0);
              return (
                <section key={group.category} className="space-y-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
                      {group.category}
                    </h2>
                    <p className="text-xs text-slate-500 tabular-nums">
                      {group.topics.length} chủ điểm · {totalItemsCount} câu
                    </p>
                  </div>

                  {/* 3-Column Grid matching Screenshot 3 */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.topics.map((topic) => (
                      <div
                        key={topic.id}
                        data-testid={`grammar-card-${topic.id}`}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:-translate-y-1 hover:border-[#2463eb]/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div>
                          <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-[#2463eb] dark:text-slate-100 dark:group-hover:text-blue-400">
                            {topic.title}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500 tabular-nums">
                            Chưa luyện tập · {topic.totalCount} câu
                          </p>
                        </div>

                        {/* Bottom Action Row: 4 Icons + "Học ngay" button */}
                        <div className="mt-5 flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1 text-slate-400">
                            <button
                              type="button"
                              onClick={() => toast.info(`Đã thêm chuyên đề ${topic.title} vào giỏ.`)}
                              aria-label="Thêm vào giỏ"
                              className="rounded p-1 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                            >
                              <ShoppingBag size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(topic.title);
                                toast.success(`Đã sao chép tên chuyên đề ${topic.title}`);
                              }}
                              aria-label="Sao chép"
                              className="rounded p-1 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => toast.info("Đã đặt lại tiến độ chủ điểm.")}
                              aria-label="Đặt lại tiến độ"
                              className="rounded p-1 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                            >
                              <ArrowClockwise size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => toast.info("Đã ẩn chủ điểm khỏi danh sách.")}
                              aria-label="Xóa"
                              className="rounded p-1 transition-colors hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800"
                            >
                              <Trash size={16} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActivePracticeTopic(topic)}
                            data-testid={`study-button-${topic.id}`}
                            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-emerald-500 bg-white px-4 py-1.5 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white dark:bg-slate-900 dark:hover:bg-emerald-600"
                          >
                            Học ngay
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        /* PART 5, 6, 7 TOEIC EXAM PRACTICE VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Luyện đề Part {activeTab} ({partQuestions.length} câu)
            </h2>
          </div>

          <div className="space-y-4">
            {partQuestions.map((q, idx) => {
              const selectedIdx = partSelectedMap[q.id];
              const isChecked = partCheckedMap[q.id];
              const isCorrect = isChecked && selectedIdx === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                >
                  {q.passage && (
                    <div className="mb-4 rounded-xl border border-blue-100 bg-[#eff6ff]/60 p-4 text-sm leading-relaxed text-slate-800 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-slate-200">
                      <p className="font-semibold text-[#1d4ed8] dark:text-blue-300">Đoạn văn đọc:</p>
                      <p className="mt-1 whitespace-pre-line">{q.passage}</p>
                    </div>
                  )}

                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Câu {idx + 1}: {q.question}
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {q.options.map((opt, oIdx) => {
                      const isOptSelected = selectedIdx === oIdx;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            if (!isChecked) {
                              setPartSelectedMap((prev) => ({ ...prev, [q.id]: oIdx }));
                            }
                          }}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-left text-xs font-medium transition-colors",
                            isOptSelected
                              ? "border-[#2463eb] bg-blue-50/70 text-[#2463eb] dark:border-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                              : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                          )}
                        >
                          <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    {!isChecked ? (
                      <button
                        type="button"
                        disabled={selectedIdx === undefined}
                        onClick={() => {
                          setPartCheckedMap((prev) => ({ ...prev, [q.id]: true }));
                          if (selectedIdx === q.correctIndex) {
                            toast.success("Chính xác! +5 XP");
                          } else {
                            toast.error("Chưa chính xác!");
                          }
                        }}
                        className="rounded-lg bg-[#2463eb] px-4 py-1.5 text-xs font-bold text-white transition-opacity disabled:opacity-40"
                      >
                        Kiểm tra đáp án
                      </button>
                    ) : (
                      <div className="text-xs">
                        {isCorrect ? (
                          <span className="font-bold text-emerald-600">✓ Chính xác!</span>
                        ) : (
                          <span className="font-bold text-rose-600">
                            ✗ Đáp án đúng: {String.fromCharCode(65 + q.correctIndex)}
                          </span>
                        )}
                        <p className="mt-1 text-slate-600 dark:text-slate-400">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {drawerWord && (
        <WordDetailDrawer
          word={drawerWord}
          open={Boolean(drawerWord)}
          onOpenChange={(open) => !open && setDrawerWord(null)}
        />
      )}
    </div>
  );
}
