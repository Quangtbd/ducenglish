import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as HoverCard from "@radix-ui/react-hover-card";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Separator from "@radix-ui/react-separator";
import { Drawer } from "vaul";
import {
  BookOpenText,
  Lightbulb,
  Waveform,
  X,
  ArrowRight,
} from "@phosphor-icons/react";
import type { VocabHighlight } from "../../types/toeic";
import { cn } from "../../lib/utils";

export const partBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border font-semibold transition-colors",
  {
    variants: {
      tone: {
        blue: "border-[#1d4ed8]/20 bg-[#eff6ff] text-[#1d4ed8] dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
        emerald:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
        indigo:
          "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
        amber:
          "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
        violet:
          "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300",
      },
      size: {
        md: "px-3 py-1 text-sm",
        sm: "px-2.5 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      tone: "blue",
      size: "md",
    },
  }
);

export const ctaButtonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold shadow-sm transition-all cursor-pointer",
  {
    variants: {
      intent: {
        primary:
          "bg-[#2463eb] text-white hover:bg-[#1d4ed8] active:scale-[0.98]",
        completed:
          "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300",
      },
      size: {
        md: "h-9 px-3.5 text-sm",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);

export type CefrBadgeTone = NonNullable<
  VariantProps<typeof partBadgeVariants>["tone"]
>;

export function AppTooltip({
  content,
  children,
}: {
  content: string;
  children: ReactNode;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={6}
          className="z-50 rounded-lg border border-[#e1e7ef] bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-md animate-in fade-in zoom-in-95 dark:border-slate-700 dark:bg-slate-800"
        >
          {content}
          <Tooltip.Arrow className="fill-slate-900 dark:fill-slate-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

interface PartHoverPreviewProps {
  title: string;
  subtitle: string;
  vocabPreview: VocabHighlight[];
  children: ReactNode;
}

export function PartHoverPreview({
  title,
  subtitle,
  vocabPreview,
  children,
}: PartHoverPreviewProps) {
  return (
    <HoverCard.Root openDelay={260} closeDelay={120}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="end"
          sideOffset={8}
          className="z-50 w-72 rounded-xl border border-[#e1e7ef] bg-white p-4 shadow-xl animate-in fade-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display text-sm font-bold text-slate-900 dark:text-slate-50">
                {title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            </div>
            <BookOpenText size={18} weight="duotone" className="shrink-0 text-[#2463eb]" />
          </div>

          <Separator.Root className="my-2.5 h-px bg-slate-100 dark:bg-slate-800" />

          {vocabPreview.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500">
                Từ vựng trọng tâm trong bài:
              </p>
              {vocabPreview.slice(0, 3).map((v) => (
                <div
                  key={v.word}
                  className="flex items-baseline justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs dark:bg-slate-950"
                >
                  <span className="font-semibold text-[#1d4ed8] dark:text-blue-400">
                    {v.word}
                  </span>
                  <span className="truncate text-slate-600 dark:text-slate-300">
                    {v.meaningVi}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Bấm để mở trình nghe chép sóng âm kèm đối chiếu từng từ.
            </p>
          )}

          <HoverCard.Arrow className="fill-white dark:fill-slate-900" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

export function TipsDrawerTrigger() {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button
          type="button"
          data-testid="tips-trigger"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-[#2463eb] dark:text-slate-400"
        >
          <span>Mẹo:</span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#2463eb] hover:underline dark:text-blue-400">
            Nghe chép chính tả đúng cách
            <ArrowRight size={14} weight="bold" />
          </span>
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs" />
        <Drawer.Content className="fixed right-0 bottom-0 left-0 z-50 mx-auto max-w-4xl rounded-t-2xl border border-[#e1e7ef] bg-white p-6 shadow-2xl outline-none dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Drawer.Title className="flex items-center gap-2 font-display text-lg font-bold text-slate-900 dark:text-slate-50">
              <Lightbulb size={20} weight="duotone" className="text-amber-500" />
              <span>Phương pháp Nghe chép chính tả 4 bước chuẩn TOEIC</span>
            </Drawer.Title>
            <Drawer.Close asChild>
              <button
                type="button"
                aria-label="Đóng hướng dẫn"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </Drawer.Close>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#e1e7ef] bg-slate-50/70 p-4 text-sm leading-relaxed dark:border-slate-800 dark:bg-slate-950">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                1. Nghe nắm ý:
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Nghe 1 lượt ở tốc độ 1.0x không nhìn chữ để bắt ngữ cảnh và từ khóa chính.
              </p>
            </div>
            <div className="rounded-xl border border-[#e1e7ef] bg-slate-50/70 p-4 text-sm leading-relaxed dark:border-slate-800 dark:bg-slate-950">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                2. Chép &amp; Lặp đoạn:
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Bấm <kbd className="font-mono text-xs">Ctrl+Space</kbd> nghe lại hoặc khoanh vùng sóng âm đoạn nối âm.
              </p>
            </div>
            <div className="rounded-xl border border-[#e1e7ef] bg-slate-50/70 p-4 text-sm leading-relaxed dark:border-slate-800 dark:bg-slate-950">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                3. Soát lỗi Diff:
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Xem ngay từ thiếu/đuôi -s/-ed bị nuốt và đọc giải thích nối âm bên phải.
              </p>
            </div>
            <div className="rounded-xl border border-[#e1e7ef] bg-slate-50/70 p-4 text-sm leading-relaxed dark:border-slate-800 dark:bg-slate-950">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                4. Lưu từ &amp; Ôn lại:
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Bấm trực tiếp vào từ mới trong transcript để lưu vào Giỏ từ vựng.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#eff6ff] px-4 py-3 text-sm text-[#1d4ed8] dark:bg-blue-950/50 dark:text-blue-300">
            <span className="flex items-center gap-2 font-medium">
              <Waveform size={18} weight="duotone" />
              Mẹo nhỏ: Hãy luyện đều đặn 15 phút mỗi ngày ở tab Theo chủ đề (A1 → C2) để tăng phản xạ tự nhiên.
            </span>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
