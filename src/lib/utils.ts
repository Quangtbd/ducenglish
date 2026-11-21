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

export const CEFR_LEVEL_META: Record<
  "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  { label: string; scoreBand: string; desc: string }
> = {
  A1: { label: "A1 · Nhập môn", scoreBand: "<300", desc: "Câu ngắn, từ vựng văn phòng cơ bản" },
  A2: { label: "A2 · Sơ cấp", scoreBand: "300–450", desc: "Tình huống giao tiếp & thông báo quen thuộc" },
  B1: { label: "B1 · Trung cấp", scoreBand: "450–650", desc: "Hội thoại công sở & dịch vụ nhiều lượt" },
  B2: { label: "B2 · Trên trung cấp", scoreBand: "650–780", desc: "Thảo luận quy trình, báo cáo & phản hồi" },
  C1: { label: "C1 · Nâng cao", scoreBand: "780–880", desc: "Đàm phán chuyên sâu, kiểm toán & hàng không" },
  C2: { label: "C2 · Thành thạo", scoreBand: "880–990", desc: "Tốc độ bản ngữ, thuật ngữ tài chính & điều hành" },
};

export const COLLECTION_TABS = [
  { id: "thematic", label: "Lộ trình A1–C2" },
] as const;
