import { useMemo, useState } from "react";
import {
  BookOpenText,
  CheckCircle,
  Fire,
  Highlighter,
  WarningCircle,
} from "@phosphor-icons/react";
import { READING_QUESTIONS } from "../data/toeicDataset";
import { cn } from "../lib/utils";

function renderPassageWithEvidence(
  text: string,
  evidenceSnippet?: string,
  highlight?: boolean
) {
  if (!highlight || !evidenceSnippet) return text;
  const idx = text.indexOf(evidenceSnippet);
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const after = text.slice(idx + evidenceSnippet.length);
  return (
    <>
      {before}
      <mark className="rounded bg-amber-200/80 px-1 py-0.5 text-slate-900 dark:bg-amber-500/30 dark:text-amber-100">
        {evidenceSnippet}
      </mark>
      {after}
    </>
  );
}

export function ReadingModule() {
  const [partFilter, setPartFilter] = useState<"all" | 5 | 6 | 7>("all");
  const [onlyWrongFilter, setOnlyWrongFilter] = useState(false);
  const [selectedMap, setSelectedMap] = useState<Record<string, number>>({});
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [wrongIds, setWrongIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("duc_english_reading_wrong");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const items = useMemo(
    () =>
      READING_QUESTIONS.filter((q) => {
        if (partFilter !== "all" && q.part !== partFilter) return false;
        if (onlyWrongFilter && !wrongIds.includes(q.id)) return false;
        return true;
      }),
    [partFilter, onlyWrongFilter, wrongIds]
  );

  const correctTotal = READING_QUESTIONS.filter(
    (q) => checkedMap[q.id] && selectedMap[q.id] === q.correctIndex
  ).length;

  const handleCheckQuestion = (questionId: string, isRight: boolean) => {
    setCheckedMap((prev) => ({ ...prev, [questionId]: true }));
    setWrongIds((prev) => {
      const next = isRight
        ? prev.filter((id) => id !== questionId)
        : Array.from(new Set([...prev, questionId]));
      localStorage.setItem("duc_english_reading_wrong", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <BookOpenText size={16} weight="duotone" />
            <span>Luyện Đọc TOEIC · Part 5, 6, 7</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
            Ngữ Pháp Trọng Tâm &amp; Đọc Hiểu Chi Tiết
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Bố cục 2 cột cho Part 6–7, tự động tô sáng dẫn chứng trong bài đọc và gom câu đọc sai để ôn lại.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
            {(["all", 5, 6, 7] as const).map((p) => (
              <button
                key={String(p)}
                type="button"
                onClick={() => setPartFilter(p)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  partFilter === p
                    ? "bg-white text-blue-600 shadow-xs dark:bg-slate-800 dark:text-blue-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                )}
              >
                {p === "all" ? "Tất cả" : `Part ${p}`}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOnlyWrongFilter((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
              onlyWrongFilter
                ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            )}
          >
            <Fire size={14} weight={onlyWrongFilter ? "fill" : "duotone"} />
            <span>Câu đọc cần luyện lại ({wrongIds.length})</span>
          </button>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-xs font-semibold tabular-nums dark:border-slate-800 dark:bg-slate-950">
            Đúng: {correctTotal}/{READING_QUESTIONS.length}
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Không có câu đọc nào trong bộ lọc này. Hãy tắt bộ lọc &ldquo;Câu đọc cần luyện lại&rdquo; để xem toàn bộ bài tập.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((q, idx) => {
            const picked = selectedMap[q.id];
            const isChecked = checkedMap[q.id];
            const isCorrect = picked === q.correctIndex;
            const hasPassage = Boolean(q.passageText);

            return (
              <article
                key={q.id}
                className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs text-slate-500 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Câu {idx + 1} · Part {q.part} · {q.topic}
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {q.grammarPoint}
                  </span>
                </div>

                <div
                  className={cn(
                    "mt-4 gap-5",
                    hasPassage ? "grid lg:grid-cols-2" : "block"
                  )}
                >
                  {q.passageText && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                      <div className="mb-2 flex items-center justify-between">
                        {q.passageTitle && (
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {q.passageTitle}
                          </p>
                        )}
                        {isChecked && q.evidenceSnippet && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            <Highlighter size={13} weight="duotone" />
                            Đã tô dẫn chứng
                          </span>
                        )}
                      </div>
                      <p>
                        {renderPassageWithEvidence(
                          q.passageText,
                          q.evidenceSnippet,
                          Boolean(isChecked)
                        )}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                      {q.questionText}
                    </p>

                    <div
                      className={cn(
                        "grid gap-2",
                        hasPassage ? "grid-cols-1" : "sm:grid-cols-2"
                      )}
                    >
                      {q.options.map((opt, optIdx) => {
                        const chosen = picked === optIdx;
                        const rightOption = optIdx === q.correctIndex;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => {
                              if (!isChecked) {
                                setSelectedMap((prev) => ({
                                  ...prev,
                                  [q.id]: optIdx,
                                }));
                              }
                            }}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors",
                              isChecked && rightOption
                                ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                                : isChecked && chosen && !rightOption
                                ? "border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
                                : chosen
                                ? "border-blue-600 bg-blue-50/70 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100"
                                : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                            )}
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-current font-mono text-xs font-semibold">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      {!isChecked ? (
                        <button
                          type="button"
                          disabled={picked === undefined}
                          onClick={() =>
                            handleCheckQuestion(q.id, picked === q.correctIndex)
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
                        >
                          Kiểm tra đáp án
                        </button>
                      ) : (
                        <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                          {isCorrect ? (
                            <CheckCircle
                              size={17}
                              weight="fill"
                              className="mt-0.5 shrink-0 text-emerald-600"
                            />
                          ) : (
                            <WarningCircle
                              size={17}
                              weight="fill"
                              className="mt-0.5 shrink-0 text-rose-600"
                            />
                          )}
                          <div>
                            <strong className="text-slate-900 dark:text-slate-100">
                              Giải thích:
                            </strong>{" "}
                            {q.explanationVi}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
