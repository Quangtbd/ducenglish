import { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  X,
  DownloadSimple,
  UploadSimple,
  Flame,
  Target,
  CheckCircle,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type { DictationAttempt, UserProfile } from "../types/toeic";
import { exportBackupJson, importBackupJson } from "../lib/db";

const profileFormSchema = z.object({
  displayName: z.string().min(2, "Tên hiển thị tối thiểu 2 ký tự").max(40),
  email: z.string().email("Email không đúng định dạng"),
  targetScore: z.number().int().min(300).max(990),
  dailyGoalQuestions: z.number().int().min(5).max(100),
  strictPunctuation: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  attempts: DictationAttempt[];
  reviewCount: number;
  vocabCount: number;
  onSaveProfile: (values: Partial<UserProfile>) => void;
  onImported: () => void;
}

export function AccountModal({
  open,
  onOpenChange,
  profile,
  attempts,
  reviewCount,
  vocabCount,
  onSaveProfile,
  onImported,
}: AccountModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      displayName: profile.displayName,
      email: profile.email,
      targetScore: profile.targetScore,
      dailyGoalQuestions: profile.dailyGoalQuestions,
      strictPunctuation: profile.strictPunctuation,
    },
  });

  const partStats = [1, 2, 3, 4].map((part) => {
    const partAttempts = attempts.filter((a) => a.part === part);
    const avg =
      partAttempts.length > 0
        ? Math.round(
            partAttempts.reduce((sum, a) => sum + a.accuracy, 0) / partAttempts.length
          )
        : 0;
    return {
      name: `Part ${part}`,
      accuracy: avg,
      count: partAttempts.length,
    };
  });

  const onSubmit = (values: ProfileFormValues) => {
    onSaveProfile(values);
    toast.success("Đã cập nhật hồ sơ học viên Duc English.");
    onOpenChange(false);
  };

  const handleExport = async () => {
    const json = await exportBackupJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `duc-english-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã tải xuống file sao lưu tiến độ JSON.");
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importBackupJson(text);
      onImported();
      toast.success("Khôi phục dữ liệu học tập thành công!");
    } catch {
      toast.error("File sao lưu không hợp lệ.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <Dialog.Title className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
                Tài khoản &amp; Thống kê Duc English
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Tiến độ được lưu cục bộ trên trình duyệt (IndexedDB) và có thể sao lưu bất kỳ lúc nào.
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100">
              <X size={18} />
            </Dialog.Close>
          </div>

          {/* Summary KPI Row */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle size={14} className="text-emerald-600" />
                <span>Lượt đã chép</span>
              </div>
              <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
                {attempts.length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Flame size={14} className="text-amber-600" />
                <span>Chuỗi ngày</span>
              </div>
              <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
                {profile.streakDays} ngày
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Target size={14} className="text-blue-600" />
                <span>Cần luyện lại</span>
              </div>
              <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
                {reviewCount} câu
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="text-xs text-slate-500">Từ vựng đã lưu</div>
              <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
                {vocabCount} từ
              </p>
            </div>
          </div>

          {/* Accuracy by Part Chart */}
          <div className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Độ chính xác trung bình theo Part 1–4 (%)
            </h3>
            <div className="mt-3 h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partStats} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="accuracy" name="Chính xác (%)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Profile Settings Form (react-hook-form + zod) */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Tên học viên
                </label>
                <input
                  {...register("displayName")}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950"
                />
                {errors.displayName && (
                  <p className="mt-1 text-xs text-rose-600">{errors.displayName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Email đồng bộ hồ sơ
                </label>
                <input
                  {...register("email")}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Mục tiêu điểm TOEIC (300–990)
                </label>
                <input
                  type="number"
                  {...register("targetScore", { valueAsNumber: true })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm tabular-nums outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Chỉ tiêu câu nghe mỗi ngày
                </label>
                <input
                  type="number"
                  {...register("dailyGoalQuestions", { valueAsNumber: true })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm tabular-nums outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                {...register("strictPunctuation")}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              <span>Chấm chặt chữ hoa &amp; dấu câu (Strict TOEIC Dictation)</span>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <DownloadSimple size={15} />
                  Xuất JSON sao lưu
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <UploadSimple size={15} />
                  Nhập JSON
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Lưu thiết lập
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
