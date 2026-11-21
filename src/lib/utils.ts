import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TopicId } from "../types/toeic";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export const LEVEL_LABELS: Record<number, string> = {
  1: "Level 1 · Dưới 300",
  2: "Level 2 · 300–400",
  3: "Level 3 · 400–500",
  4: "Level 4 · 500–600",
  5: "Level 5 · 600–700",
  6: "Level 6 · 700–800",
  7: "Level 7 · 800–900",
  8: "Level 8 · Trên 900",
};

export const TOPIC_LABELS: Record<TopicId, string> = {
  all: "Tất cả chủ đề",
  office: "Văn phòng & Họp hành",
  logistics: "Kho vận & Sản xuất",
  finance: "Tài chính & Ngân hàng",
  hr: "Nhân sự & Tuyển dụng",
  travel: "Công tác & Dịch vụ",
  marketing: "Kinh doanh & Tiếp thị",
};

export const COLLECTION_TABS = [
  { id: "all", label: "Tất cả bộ đề" },
  { id: "crack-vol-1", label: "Crack Vol 1" },
  { id: "crack-vol-2", label: "Crack Vol 2" },
  { id: "2026", label: "2026" },
  { id: "2025", label: "2025" },
  { id: "2024", label: "2024" },
  { id: "2023", label: "2023" },
  { id: "2022", label: "2022" },
  { id: "2021", label: "2021" },
  { id: "2020", label: "2020" },
  { id: "2019", label: "2019" },
  { id: "custom", label: "Bài nghe tự thêm" },
] as const;
