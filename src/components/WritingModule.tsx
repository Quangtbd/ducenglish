import { useEffect, useState } from "react";
import {
  PencilSimpleLine,
  Eye,
  Timer,
  CheckCircle,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { WRITING_PROMPTS } from "../data/toeicDataset";
import { cn, formatDuration } from "../lib/utils";
import { ModuleHeroBanner } from "./ui/ModuleHeroBanner";

interface WritingEval {
  score: number;
  bandLabel: string;
  strengths: string[];
  corrections: { original: string; fixed: string; reasonVi: string }[];
  improvedAnswer: string;
  overallAdviceVi: string;
}

export function WritingModule() {
  const [activeId, setActiveId] = useState(WRITING_PROMPTS[0].id);
  const [answer, setAnswer] = useState("");
  const [showSample, setShowSample] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<WritingEval | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(480);

  const prompt =
    WRITING_PROMPTS.find((w) => w.id === activeId) ?? WRITING_PROMPTS[0];
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  useEffect(() => {
    if (!timerRunning) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [timerRunning]);

  const keywordChecks = (prompt.keywords ?? []).map((kw) => ({
    kw,
    used: answer.toLowerCase().includes(kw.toLowerCase()),
  }));

  const handleEvaluate = async () => {
    if (!answer.trim()) {
      toast.error("Vui lòng nhập bài viết trước khi gửi chấm điểm.");
      return;
    }
    setEvaluating(true);
    setTimerRunning(false);
    try {
      const res = await fetch("/api/evaluate-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part: prompt.part,
          prompt: prompt.promptText,
          keywords: prompt.keywords,
          answer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Không thể chấm bài viết.");
        return;
      }
      setEvalResult(data);
    } catch {
      toast.error("Lỗi kết nối khi chấm bài viết.");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      <ModuleHeroBanner
        kicker="Luyện viết tiếng Anh"
        titleLeading="Diễn đạt câu từ"
        titleHighlight="chuẩn văn phong công sở"
        titleTrailing="tự tin"
        description="Thực hành viết câu miêu tả tranh, phản hồi email và viết luận ngắn chuẩn thang điểm TOEIC Writing kèm chấm điểm tự động."
        icon={PencilSimpleLine}
        pills={[
          { id: "part-1", label: "Part 1 Viết câu" },
          { id: "part-2", label: "Part 2 Phản hồi Email" },
          { id: "part-3", label: "Part 3 Viết luận" },
        ]}
        activePill={`part-${prompt.part}`}
        onSelectPill={(id) => toast.info(`Đang lọc: ${id}`)}
        searchPlaceholder="Gõ từ khóa đề bài viết hoặc chủ đề email..."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {WRITING_PROMPTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveId(item.id);
                setEvalResult(null);
                setShowSample(false);
                setTimerRunning(false);
                setSecondsLeft(item.part === 1 ? 480 : 600);
              }}
              className={cn(
                "rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors",
                activeId === item.id
                  ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              )}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-xs font-bold text-slate-900 tabular-nums dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
            <Timer size={15} className="text-blue-600" />
            <span>{formatDuration(secondsLeft)}</span>
          </div>
          <button
            type="button"
            onClick={() => setTimerRunning((r) => !r)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            {timerRunning ? "Tạm dừng" : "Bắt đầu tính giờ"}
          </button>
          <button
            type="button"
            onClick={() => {
              setTimerRunning(false);
              setSecondsLeft(prompt.part === 1 ? 480 : 600);
            }}
            aria-label="Đặt lại đồng hồ"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          >
            <ArrowCounterClockwise size={14} />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-500">
            {prompt.instructionVi}
          </p>
          {prompt.imageUrl && (
            <img
              src={prompt.imageUrl}
              alt={prompt.title}
              referrerPolicy="no-referrer"
              className="h-52 w-full rounded-lg object-cover"
            />
          )}
          <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 dark:bg-slate-950 dark:text-slate-200">
            {prompt.promptText}
          </div>

          {prompt.keywords && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                Từ khóa bắt buộc:
              </span>
              {keywordChecks.map(({ kw, used }) => (
                <span
                  key={kw}
                  className={cn(
                    "inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono font-semibold",
                    used
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "border-slate-200 bg-slate-50 text-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-blue-400"
                  )}
                >
                  {used && <CheckCircle size={12} weight="fill" />}
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* Rubric Criteria Checklist */}
          <div className="rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-800">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Tiêu chí chấm điểm chuẩn ETS Rubric:
            </p>
            <ul className="mt-1.5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>1. Đúng ngữ pháp, chia thì chuẩn với ngữ cảnh câu/email.</li>
              <li>2. Sử dụng đầy đủ từ khóa bắt buộc hoặc trả lời đủ 2–3 yêu cầu đề.</li>
              <li>3. Văn phong công sở lịch sự, mạch lạc, độ dài phù hợp.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setShowSample((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            <Eye size={14} />
            <span>{showSample ? "Ẩn bài mẫu" : "Xem bài mẫu tham khảo"}</span>
          </button>

          {showSample && (
            <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 font-sans text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              {prompt.sampleAnswer}
            </pre>
          )}
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Bài viết của bạn
            </span>
            <span className="font-mono tabular-nums">{wordCount} từ</span>
          </div>

          <textarea
            rows={7}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Viết câu trả lời tiếng Anh của bạn tại đây..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm leading-relaxed outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950"
          />

          <button
            type="button"
            onClick={handleEvaluate}
            disabled={evaluating}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <CheckCircle size={17} weight="duotone" />
            <span>
              {evaluating ? "Đang chấm bài..." : "Chấm điểm & Sửa lỗi chi tiết"}
            </span>
          </button>

          {evalResult && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <span className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                  {evalResult.bandLabel}
                </span>
                <span className="font-mono text-lg font-bold text-blue-600 tabular-nums">
                  {evalResult.score}/200
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-lg bg-white p-2 dark:bg-slate-900">
                  <p className="text-slate-400">Ngữ pháp</p>
                  <p className="font-mono font-bold text-slate-900 tabular-nums dark:text-slate-100">
                    {Math.min(100, Math.round((evalResult.score / 200) * 100))}%
                  </p>
                </div>
                <div className="rounded-lg bg-white p-2 dark:bg-slate-900">
                  <p className="text-slate-400">Trọng tâm</p>
                  <p className="font-mono font-bold text-slate-900 tabular-nums dark:text-slate-100">
                    {prompt.keywords
                      ? `${keywordChecks.filter((k) => k.used).length}/${keywordChecks.length}`
                      : "Đạt"}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-2 dark:bg-slate-900">
                  <p className="text-slate-400">Độ dài</p>
                  <p className="font-mono font-bold text-slate-900 tabular-nums dark:text-slate-100">
                    {wordCount} từ
                  </p>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {evalResult.overallAdviceVi}
              </p>

              {evalResult.corrections?.length > 0 && (
                <div className="space-y-2 border-t border-slate-200 pt-2 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Lỗi cần sửa:
                  </p>
                  {evalResult.corrections.map((c, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-white p-2.5 text-xs dark:bg-slate-900"
                    >
                      <p className="text-rose-600 line-through">{c.original}</p>
                      <p className="font-medium text-emerald-700 dark:text-emerald-300">
                        → {c.fixed}
                      </p>
                      <p className="mt-1 text-slate-500">{c.reasonVi}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-lg bg-white p-3 text-xs dark:bg-slate-900">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Phiên bản gợi ý nâng điểm:
                </p>
                <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">
                  {evalResult.improvedAnswer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
