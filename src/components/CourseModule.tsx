import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import {
  GraduationCap,
  ArrowRight,
  CaretDown,
  CheckCircle,
} from "@phosphor-icons/react";
import { COURSE_ROADMAPS } from "../data/toeicDataset";
import type { MainSection } from "../types/toeic";
import { cn } from "../lib/utils";
import { ModuleHeroBanner } from "./ui/ModuleHeroBanner";

interface CourseModuleProps {
  onNavigateSection: (section: MainSection) => void;
}

export function CourseModule({ onNavigateSection }: CourseModuleProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("duc_english_course_steps");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const toggleStep = (courseId: string, stepNumber: number) => {
    const key = `${courseId}:${stepNumber}`;
    setCompletedSteps((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("duc_english_course_steps", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <ModuleHeroBanner
        kicker="Khóa học TOEIC bài bản"
        titleLeading="Chinh phục mục tiêu"
        titleHighlight="theo lộ trình cá nhân hóa"
        titleTrailing="hiệu quả"
        description="Lộ trình tự luyện 4 kỹ năng từ cơ bản đến nâng cao, bám sát các chặng bài học và phương pháp luyện phản xạ hiệu quả."
        icon={GraduationCap}
        pills={[
          { id: "all", label: "Tất cả khóa học" },
          { id: "express", label: "Khóa cấp tốc" },
          { id: "advanced", label: "Chuyên sâu 4 kỹ năng" },
        ]}
        activePill="all"
        searchPlaceholder="Tìm kiếm chặng bài giảng hoặc tài liệu hướng dẫn..."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {COURSE_ROADMAPS.map((course) => {
          const doneCount = course.steps.filter(
            (s) => completedSteps[`${course.id}:${s.stepNumber}`]
          ).length;
          const pct = Math.round((doneCount / course.steps.length) * 100);

          return (
            <article
              key={course.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <img
                src={course.imageUrl}
                alt={course.title}
                referrerPolicy="no-referrer"
                className="h-48 w-full object-cover"
              />
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      Mục tiêu {course.targetBand}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {course.durationWeeks} tuần
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {course.lessonsCount} bài học
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 tabular-nums dark:text-slate-200">
                    {pct}%
                  </span>
                </div>

                {/* Course Completion Bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
                  {course.title}
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {course.summaryVi}
                </p>

                <Accordion.Root
                  type="single"
                  collapsible
                  defaultValue="chapters"
                  className="border-t border-slate-100 pt-3 dark:border-slate-800"
                >
                  <Accordion.Item value="chapters">
                    <Accordion.Header>
                      <Accordion.Trigger className="flex w-full items-center justify-between py-2 text-left text-xs font-semibold text-slate-800 hover:text-blue-600 dark:text-slate-200">
                        <span>
                          Danh sách chặng học ({doneCount}/{course.steps.length} đã hoàn thành)
                        </span>
                        <CaretDown size={14} />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="space-y-2.5 pt-2">
                      {course.steps.map((step) => {
                        const isDone = Boolean(
                          completedSteps[`${course.id}:${step.stepNumber}`]
                        );
                        return (
                          <div
                            key={step.stepNumber}
                            className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-950"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                toggleStep(course.id, step.stepNumber)
                              }
                              aria-label={`Đánh dấu hoàn thành ${step.title}`}
                              className={cn(
                                "mt-0.5 shrink-0 transition-colors",
                                isDone
                                  ? "text-emerald-600"
                                  : "text-slate-300 hover:text-slate-500"
                              )}
                            >
                              <CheckCircle size={18} weight="fill" />
                            </button>
                            <div className="min-w-0 flex-1">
                              <p
                                className={cn(
                                  "text-xs font-semibold",
                                  isDone
                                    ? "text-slate-400 line-through"
                                    : "text-slate-900 dark:text-slate-100"
                                )}
                              >
                                {step.title}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {step.descriptionVi}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onNavigateSection(step.linkedSection)}
                              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400"
                            >
                              <span>Mở</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
