import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, UsersThree, Info, PaperPlaneRight, BookOpen } from "@phosphor-icons/react";
import { toast } from "sonner";

export type InfoModalTopic =
  | null
  | "find-buddies"
  | "founder"
  | "materials"
  | "feedback";

interface InfoModalProps {
  topic: InfoModalTopic;
  onClose: () => void;
}

const STUDY_BUDDIES = [
  { name: "Ngọc Trâm", target: "750+", focus: "Nghe chép Part 2 & 3 · 20:00 mỗi tối" },
  { name: "Hoàng Minh", target: "850+", focus: "Luyện đề ETS 2024–2026 cuối tuần" },
  { name: "Thanh Thảo", target: "600+", focus: "Từ vựng TOEIC 600 & Part 5 ngữ pháp" },
];

export function InfoModal({ topic, onClose }: InfoModalProps) {
  const [feedbackText, setFeedbackText] = useState("");

  if (!topic) return null;

  const isCommunity = topic === "find-buddies";
  const title =
    topic === "find-buddies"
      ? "Cộng đồng · Tìm bạn học TOEIC"
      : topic === "materials"
      ? "Tài liệu & Mẹo luyện thi TOEIC"
      : topic === "feedback"
      ? "Góp ý & Đề xuất tính năng"
      : "Giới thiệu Duc English";

  return (
    <Dialog.Root open={Boolean(topic)} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e1e7ef] bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <Dialog.Title className="flex items-center gap-2 font-display text-base font-bold text-slate-900 dark:text-slate-50">
              {isCommunity ? (
                <UsersThree size={20} weight="duotone" className="text-[#2463eb]" />
              ) : topic === "materials" ? (
                <BookOpen size={20} weight="duotone" className="text-[#2463eb]" />
              ) : (
                <Info size={20} weight="duotone" className="text-[#2463eb]" />
              )}
              <span>{title}</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Đóng"
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {topic === "find-buddies" && (
              <div className="space-y-2.5">
                <p className="text-xs text-slate-500">
                  Kết nối nhanh với học viên cùng mục tiêu điểm để duy trì thói quen nghe chép mỗi ngày:
                </p>
                {STUDY_BUDDIES.map((b) => (
                  <div
                    key={b.name}
                    className="flex items-center justify-between rounded-xl border border-[#e1e7ef] p-3 dark:border-slate-800"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {b.name} · Mục tiêu {b.target}
                      </p>
                      <p className="text-xs text-slate-500">{b.focus}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success(`Đã gửi lời mời học nhóm tới ${b.name}`)}
                      className="rounded-lg bg-[#2463eb] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
                    >
                      Kết bạn
                    </button>
                  </div>
                ))}
              </div>
            )}

            {topic === "founder" && (
              <div className="space-y-2 leading-relaxed">
                <p>
                  <strong>Duc English</strong> là nền tảng luyện thi TOEIC toàn diện tập trung vào phương pháp
                  <strong> Nghe chép chính tả (Dictation)</strong>, so sánh lỗi từng từ theo thời gian thực và
                  ôn luyện trọn bộ 4 kỹ năng Nghe – Đọc – Nói – Viết.
                </p>
                <p className="text-xs text-slate-500">
                  Mọi tiến độ luyện tập, câu cần ôn lại và giỏ từ vựng được lưu trữ cục bộ an toàn ngay trên trình duyệt.
                </p>
              </div>
            )}

            {topic === "materials" && (
              <ul className="space-y-2 text-xs leading-relaxed">
                <li>• <strong>Lộ trình 8 Level:</strong> Từ &lt;300 đến 900+ chia theo từng Part 1–4.</li>
                <li>• <strong>Kỹ thuật nối âm &amp; nuốt âm:</strong> Có sẵn ghi chú mẹo nghe dưới mỗi bài transcript.</li>
                <li>• <strong>Tài liệu tự nạp:</strong> Hỗ trợ tải file MP3 cá nhân vào Studio để tự luyện chép chính tả.</li>
              </ul>
            )}

            {topic === "feedback" && (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Nhập góp ý hoặc đề xuất bộ đề TOEIC mới cho Duc English..."
                  className="w-full rounded-xl border border-[#e1e7ef] p-3 text-sm outline-none focus:border-[#2463eb] dark:border-slate-700 dark:bg-slate-950"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!feedbackText.trim()) return;
                    toast.success("Cảm ơn góp ý của bạn cho Duc English!");
                    setFeedbackText("");
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2463eb] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
                >
                  <PaperPlaneRight size={14} weight="fill" />
                  <span>Gửi đề xuất</span>
                </button>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
