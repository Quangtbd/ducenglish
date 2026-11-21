import { useMemo, useState } from "react";
import { flexRender, type SortingState } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getSortedRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import * as Progress from "@radix-ui/react-progress";
import { ArrowsDownUp, Play, CheckCircle } from "@phosphor-icons/react";
import type {
  DictationAttempt,
  ListeningQuestion,
  TestSet,
  ToeicPart,
} from "../types/toeic";
import { computeTestProgress, type TestMatrixProgress } from "../lib/db";
import { cn, TOPIC_LABELS } from "../lib/utils";

interface TestMatrixRow {
  test: TestSet;
  progress: TestMatrixProgress;
}

interface TestMatrixTableProps {
  tests: TestSet[];
  questions: ListeningQuestion[];
  attempts: DictationAttempt[];
  selectedPart: ToeicPart | "all";
  onStartPractice: (testId: string, part: ToeicPart) => void;
}

export function TestMatrixTable({
  tests,
  questions,
  attempts,
  selectedPart,
  onStartPractice,
}: TestMatrixTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const data = useMemo<TestMatrixRow[]>(
    () =>
      tests.map((test) => ({
        test,
        progress: computeTestProgress(test, questions, attempts),
      })),
    [tests, questions, attempts]
  );

  const columns = useMemo<LegacyColumnDef<TestMatrixRow>[]>(() => {
    const partColumns: ToeicPart[] =
      selectedPart === "all" ? [1, 2, 3, 4] : [selectedPart];

    return [
      {
        id: "title",
        accessorFn: (row) => row.test.testNumber,
        header: "Bộ đề luyện tập",
        cell: ({ row }) => {
          const { test, progress } = row.original;
          const isDone = progress.percent === 100 && progress.totalQuestions > 0;
          return (
            <div className="min-w-[200px]">
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-slate-900 dark:text-slate-100">
                  {test.title}
                </span>
                {isDone && (
                  <CheckCircle
                    size={16}
                    weight="fill"
                    className="text-emerald-600"
                    aria-label="Đã hoàn thành"
                  />
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{test.collectionLabel}</span>
                <span aria-hidden="true">·</span>
                <span>Mục tiêu {test.levelRange}</span>
                <span aria-hidden="true">·</span>
                <span>{TOPIC_LABELS[test.topic]}</span>
              </div>
            </div>
          );
        },
      },
      ...partColumns.map(
        (part): LegacyColumnDef<TestMatrixRow> => ({
          id: `part-${part}`,
          header: `Part ${part}`,
          cell: ({ row }) => {
            const { test, progress } = row.original;
            const stats = progress.partProgress[part];
            const isPartComplete =
              stats.total > 0 && stats.completed >= stats.total;
            return (
              <button
                type="button"
                onClick={() => onStartPractice(test.id, part)}
                data-testid={`start-${test.id}-part${part}`}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                  isPartComplete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-blue-950/60"
                )}
              >
                <span className="font-mono tabular-nums">
                  {stats.completed}/{stats.total} câu
                </span>
                <Play
                  size={12}
                  weight="fill"
                  className="text-slate-400 transition-colors group-hover:text-blue-600"
                />
              </button>
            );
          },
        })
      ),
      {
        id: "progress",
        accessorFn: (row) => row.progress.percent,
        header: "Tiến độ",
        cell: ({ row }) => {
          const { progress } = row.original;
          return (
            <div className="min-w-[140px]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-slate-800 tabular-nums dark:text-slate-200">
                  {progress.percent}%
                </span>
                <span className="font-mono text-slate-500 tabular-nums">
                  {progress.totalCompleted}/{progress.totalQuestions}
                </span>
              </div>
              <Progress.Root
                value={progress.percent}
                className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
              >
                <Progress.Indicator
                  className={cn(
                    "h-full transition-transform duration-300",
                    progress.percent === 100 ? "bg-emerald-600" : "bg-blue-600"
                  )}
                  style={{ transform: `translateX(-${100 - progress.percent}%)` }}
                />
              </Progress.Root>
            </div>
          );
        },
      },
      {
        id: "action",
        header: "",
        cell: ({ row }) => {
          const { test } = row.original;
          const targetPart: ToeicPart = selectedPart === "all" ? 1 : selectedPart;
          return (
            <button
              type="button"
              onClick={() => onStartPractice(test.id, targetPart)}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <span>Luyện tập</span>
            </button>
          );
        },
      },
    ];
  }, [selectedPart, onStartPractice]);

  const table = useLegacyTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (tests.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Không có bộ đề nào khớp với bộ lọc hiện tại.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Thử chọn lại &ldquo;Tất cả bộ đề&rdquo; hoặc nới rộng mức điểm mục tiêu.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <th key={header.id} className="px-4 py-3 whitespace-nowrap">
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <ArrowsDownUp size={13} />
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3.5 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
