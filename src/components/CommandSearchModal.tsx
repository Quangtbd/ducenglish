import { useEffect } from "react";
import { Command } from "cmdk";
import {
  Headphones,
  BookOpenText,
  Microphone,
  PencilSimpleLine,
  Cards,
  Exam,
  GraduationCap,
  Fire,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import type { MainSection, ThematicListeningSet } from "../types/toeic";

interface CommandSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thematicSets: ThematicListeningSet[];
  onJumpToSet: (set: ThematicListeningSet) => void;
  onSelectSection: (section: MainSection) => void;
  onOpenReviewQueue: () => void;
}

export function CommandSearchModal({
  open,
  onOpenChange,
  thematicSets,
  onJumpToSet,
  onSelectSection,
  onOpenReviewQueue,
}: CommandSearchModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 px-4 pt-24 backdrop-blur-xs"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Tìm nhanh bộ đề A1–C2 và phân mục">
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <MagnifyingGlass size={18} className="text-slate-400" />
            <Command.Input
              autoFocus
              placeholder="Tìm nhanh: A1, B2, C1, Part 3, Office, Câu cần luyện lại..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[11px] text-slate-500 dark:border-slate-700"
            >
              ESC
            </button>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 text-sm">
            <Command.Empty className="py-8 text-center text-sm text-slate-500">
              Không tìm thấy nội dung phù hợp.
            </Command.Empty>

            <Command.Group
              heading="Lối tắt luyện nghe"
              className="px-2 py-1.5 text-xs font-semibold text-slate-500"
            >
              <Command.Item
                value="Câu cần luyện lại review queue"
                onSelect={() => {
                  onOpenReviewQueue();
                  onOpenChange(false);
                }}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-slate-800 aria-selected:bg-blue-50 aria-selected:text-blue-700 dark:text-slate-200 dark:aria-selected:bg-blue-950/60 dark:aria-selected:text-blue-300"
              >
                <Fire size={16} weight="duotone" className="text-rose-600" />
                <span>Mở danh sách Câu cần luyện lại</span>
              </Command.Item>
            </Command.Group>

            <Command.Group
              heading="Bộ đề Nghe A1 → C2 theo chủ đề"
              className="px-2 py-1.5 text-xs font-semibold text-slate-500"
            >
              {thematicSets.map((set) => (
                <Command.Item
                  key={set.id}
                  value={`${set.cefrLevel} ${set.title} ${set.titleVi} Part ${set.part}`}
                  onSelect={() => {
                    onJumpToSet(set);
                    onOpenChange(false);
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-slate-800 aria-selected:bg-blue-50 aria-selected:text-blue-700 dark:text-slate-200 dark:aria-selected:bg-blue-950/60 dark:aria-selected:text-blue-300"
                >
                  <span className="flex items-center gap-2.5">
                    <Headphones size={16} weight="duotone" className="text-blue-600" />
                    <span className="font-medium">
                      {set.cefrLevel} · {set.title}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-slate-400 tabular-nums">
                    Part {set.part}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group
              heading="Phân mục kỹ năng"
              className="px-2 py-1.5 text-xs font-semibold text-slate-500"
            >
              {[
                { id: "listen" as const, label: "Nghe · Lộ trình A1–C2", icon: Headphones },
                { id: "read" as const, label: "Đọc · Reading Part 5–7", icon: BookOpenText },
                { id: "speak" as const, label: "Nói · Shadowing & Speaking", icon: Microphone },
                { id: "write" as const, label: "Viết · Chấm bài Writing", icon: PencilSimpleLine },
                { id: "vocab" as const, label: "Từ vựng · Flashcard TOEIC", icon: Cards },
                { id: "test" as const, label: "Test · Đề thi thử", icon: Exam },
                { id: "course" as const, label: "Course · Lộ trình 5 bước", icon: GraduationCap },
              ].map((sec) => {
                const Icon = sec.icon;
                return (
                  <Command.Item
                    key={sec.id}
                    value={sec.label}
                    onSelect={() => {
                      onSelectSection(sec.id);
                      onOpenChange(false);
                    }}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-slate-800 aria-selected:bg-blue-50 aria-selected:text-blue-700 dark:text-slate-200 dark:aria-selected:bg-blue-950/60 dark:aria-selected:text-blue-300"
                  >
                    <Icon size={16} weight="duotone" />
                    <span>{sec.label}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
