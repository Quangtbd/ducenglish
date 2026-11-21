import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { UploadSimple, Sparkle, X, FileAudio } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { ListeningQuestion, ToeicPart } from "../types/toeic";
import { db } from "../lib/db";

interface CustomAudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (question: ListeningQuestion) => void;
}

export function CustomAudioModal({
  open,
  onOpenChange,
  onCreated,
}: CustomAudioModalProps) {
  const [title, setTitle] = useState("");
  const [part, setPart] = useState<ToeicPart>(2);
  const [transcript, setTranscript] = useState("");
  const [transcriptVi, setTranscriptVi] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = String(reader.result || "");
        resolve(res.split(",")[1] || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAutoTranscribe = async () => {
    if (!audioFile) {
      toast.error("Hãy chọn file MP3/WAV trước khi gỡ băng tự động.");
      return;
    }
    setIsTranscribing(true);
    try {
      const audioBase64 = await fileToBase64(audioFile);
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64,
          mimeType: audioFile.type || "audio/mp3",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Không thể gỡ băng tự động.");
        return;
      }
      setTranscript(data.transcript || "");
      toast.success("AI đã gỡ băng transcript xong! Bạn có thể chỉnh sửa lại.");
    } catch {
      toast.error("Lỗi kết nối khi gỡ băng âm thanh.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) {
      toast.error("Vui lòng nhập đáp án transcript cho bài nghe.");
      return;
    }

    setIsSaving(true);
    try {
      const id = `custom-${Date.now()}`;
      let customAudioKey: string | undefined;

      if (audioFile) {
        customAudioKey = `upload-${id}`;
        await db.audioCache.put({
          cacheKey: customAudioKey,
          mimeType: audioFile.type || "audio/mp3",
          audioBlob: audioFile,
          createdAt: Date.now(),
        });
      }

      const newQuestion: ListeningQuestion = {
        id,
        testId: "custom-user-set",
        part,
        order: 1,
        level: 4,
        topic: "office",
        title: title.trim() || `Bài nghe cá nhân (${new Date().toLocaleDateString("vi-VN")})`,
        transcript: transcript.trim(),
        transcriptVi: transcriptVi.trim() || "Bài nghe do bạn tự tải lên trên Duc English.",
        linkedSpeechTip: "Tập trung nghe nối âm và trọng âm từ khóa chính.",
        grammarNote: "Bài luyện nghe tùy chỉnh của học viên.",
        keyVocab: [],
        customAudioKey,
      };

      await db.customQuestions.put(newQuestion);
      toast.success("Đã lưu bài nghe riêng vào kho luyện tập!");
      onCreated(newQuestion);
      setTitle("");
      setTranscript("");
      setTranscriptVi("");
      setAudioFile(null);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <Dialog.Title className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
                Thêm file MP3 &amp; Script luyện nghe riêng
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Tải lên file audio cá nhân (hoặc để trống để hệ thống tự đọc bằng AI Gemini TTS).
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X size={18} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Tiêu đề bài nghe
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: ETS 2026 · Câu 18 Part 2"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Thuộc Part
                </label>
                <select
                  value={part}
                  onChange={(e) => setPart(Number(e.target.value) as ToeicPart)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value={1}>Part 1</option>
                  <option value={2}>Part 2</option>
                  <option value={3}>Part 3</option>
                  <option value={4}>Part 4</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                File âm thanh (.mp3, .wav) — Không bắt buộc
              </label>
              <div className="mt-1 flex items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <UploadSimple size={16} className="text-blue-600" />
                  <span>{audioFile ? audioFile.name : "Chọn file MP3 / WAV từ máy"}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
                {audioFile && (
                  <button
                    type="button"
                    onClick={handleAutoTranscribe}
                    disabled={isTranscribing}
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-950 dark:text-blue-300"
                  >
                    <Sparkle size={14} weight="duotone" />
                    {isTranscribing ? "Đang gỡ băng..." : "AI gỡ băng"}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Transcript chuẩn (Đáp án tiếng Anh) *
              </label>
              <textarea
                rows={3}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Nhập câu tiếng Anh dùng làm đáp án đối chiếu..."
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Dịch nghĩa tiếng Việt (Tùy chọn)
              </label>
              <input
                value={transcriptVi}
                onChange={(e) => setTranscriptVi(e.target.value)}
                placeholder="Nghĩa tiếng Việt để xem khi mở giải thích..."
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Dialog.Close className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300">
                Hủy
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <FileAudio size={15} />
                {isSaving ? "Đang lưu..." : "Lưu & Luyện ngay"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
