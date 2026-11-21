import { useEffect, useMemo, useRef, useState } from "react";
import {
  Microphone,
  Stop,
  SpeakerHigh,
  Waveform,
  Play,
  Timer,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { SPEAKING_PROMPTS } from "../data/toeicDataset";
import { speakWithBrowserFallback, stopBrowserSpeech } from "../lib/audioService";
import { cn, formatDuration } from "../lib/utils";

interface SpeakingEval {
  score: number;
  fluencyScore: number;
  pronunciationTipVi: string;
  intonationTipVi: string;
  sampleSuggestion: string;
}

export function SpeakingModule() {
  const [activeId, setActiveId] = useState(SPEAKING_PROMPTS[0].id);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedBase64, setRecordedBase64] = useState<string | null>(null);
  const [spokenDraft, setSpokenDraft] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<SpeakingEval | null>(null);

  // TOEIC Prep & Response Timer + Shadowing Highlight
  const [phase, setPhase] = useState<"idle" | "prep" | "speak">("idle");
  const [countdown, setCountdown] = useState(45);
  const [isShadowing, setIsShadowing] = useState(false);
  const [shadowWordIndex, setShadowWordIndex] = useState(-1);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const activePrompt =
    SPEAKING_PROMPTS.find((p) => p.id === activeId) ?? SPEAKING_PROMPTS[0];

  const targetWords = useMemo(
    () => activePrompt.targetText.split(/\s+/).filter(Boolean),
    [activePrompt.targetText]
  );

  // Countdown timer for Prep (15s) -> Speak (45s)
  useEffect(() => {
    if (phase === "idle") return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;
        if (phase === "prep") {
          setPhase("speak");
          return 45;
        }
        setPhase("idle");
        return 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Live Shadowing word-highlight stepper
  useEffect(() => {
    if (!isShadowing) {
      setShadowWordIndex(-1);
      return;
    }
    setShadowWordIndex(0);
    const interval = setInterval(() => {
      setShadowWordIndex((idx) => {
        if (idx + 1 >= targetWords.length) {
          setIsShadowing(false);
          return -1;
        }
        return idx + 1;
      });
    }, 340);
    return () => clearInterval(interval);
  }, [isShadowing, targetWords.length]);

  const handleShadowPlay = () => {
    stopBrowserSpeech();
    setIsShadowing(true);
    speakWithBrowserFallback(activePrompt.targetText, 0.95, () => {
      setIsShadowing(false);
    });
  };

  const handleStartPrepTimer = () => {
    setPhase("prep");
    setCountdown(15);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = String(reader.result || "").split(",")[1] || null;
          setRecordedBase64(base64);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setPhase("speak");
      setCountdown(45);
      setEvalResult(null);
    } catch {
      toast.error(
        "Không thể truy cập micro trình duyệt. Bạn vẫn có thể gõ câu trả lời để AI góp ý."
      );
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setPhase("idle");
  };

  const handleEvaluate = async () => {
    if (!recordedBase64 && !spokenDraft.trim()) {
      toast.error("Hãy ghi âm giọng nói hoặc nhập nội dung câu trả lời trước.");
      return;
    }
    setEvaluating(true);
    try {
      const res = await fetch("/api/evaluate-speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part: activePrompt.part,
          targetText: activePrompt.targetText,
          spokenTranscript: spokenDraft.trim() || undefined,
          audioBase64: recordedBase64 || undefined,
          mimeType: recordedBase64 ? "audio/webm" : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Không thể chấm bài nói.");
        return;
      }
      setEvalResult(data);
    } catch {
      toast.error("Lỗi kết nối khi phân tích bài nói.");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Microphone size={16} weight="duotone" />
              <span>Luyện Nói TOEIC · Shadowing &amp; Speaking Part 1–5</span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
              Shadowing Theo Giọng Chuẩn &amp; Ghi Âm Đối Chiếu
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-xs font-bold text-slate-900 tabular-nums dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
              <Timer size={15} className="text-blue-600" />
              <span>
                {phase === "prep"
                  ? "Chuẩn bị: "
                  : phase === "speak"
                  ? "Trả lời: "
                  : "Chuẩn TOEIC: "}
                {formatDuration(countdown)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleStartPrepTimer}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <ArrowCounterClockwise size={14} />
              <span>Bấm giờ 15s/45s</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SPEAKING_PROMPTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveId(item.id);
                setEvalResult(null);
                setRecordedUrl(null);
                setRecordedBase64(null);
                setIsShadowing(false);
                stopBrowserSpeech();
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
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-500">
            {activePrompt.instructionVi}
          </p>

          {activePrompt.imageUrl && (
            <img
              src={activePrompt.imageUrl}
              alt={activePrompt.title}
              referrerPolicy="no-referrer"
              className="h-52 w-full rounded-lg object-cover"
            />
          )}

          {/* Live Shadowing Word Highlight Strip */}
          <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Văn bản Shadowing (Chạy chữ theo nhịp đọc)
            </p>
            <p className="font-medium leading-7">
              {targetWords.map((word, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "mr-1 inline-block rounded px-1 transition-colors",
                    shadowWordIndex === idx
                      ? "bg-blue-600 font-semibold text-white"
                      : idx < shadowWordIndex
                      ? "text-blue-700 dark:text-blue-300"
                      : ""
                  )}
                >
                  {word}
                </span>
              ))}
            </p>
            <p className="mt-3 border-t border-slate-200 pt-2 text-xs text-slate-500 dark:border-slate-800">
              Nhịp ngắt chuẩn: {activePrompt.sampleAnswer}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Mẹo ngắt nhịp: {activePrompt.tipsVi}
            </p>
          </div>

          <button
            type="button"
            onClick={handleShadowPlay}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <SpeakerHigh
              size={16}
              weight="duotone"
              className={cn("text-blue-600", isShadowing && "animate-pulse")}
            />
            <span>
              {isShadowing
                ? "Đang đọc mẫu (Shadowing theo)..."
                : "Nghe giọng mẫu để Shadowing"}
            </span>
          </button>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
            Phòng thu cá nhân &amp; Đánh giá AI
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={handleStartRecording}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700"
              >
                <Microphone size={16} weight="fill" />
                <span>Bắt đầu ghi âm</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopRecording}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <Stop size={16} weight="fill" />
                <span>Dừng ghi âm</span>
              </button>
            )}

            {recordedUrl && (
              <audio controls src={recordedUrl} className="h-9 max-w-full" />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Hoặc gõ lại câu bạn vừa nói (nếu chưa bật micro):
            </label>
            <textarea
              rows={3}
              value={spokenDraft}
              onChange={(e) => setSpokenDraft(e.target.value)}
              placeholder="Nhập câu trả lời của bạn để AI góp ý ngữ pháp & cách diễn đạt..."
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <button
            type="button"
            onClick={handleEvaluate}
            disabled={evaluating}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Waveform size={17} weight="duotone" />
            <span>
              {evaluating ? "Đang phân tích bài nói..." : "Chấm điểm & Góp ý Speaking"}
            </span>
          </button>

          {evalResult && (
            <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-center justify-between font-mono font-bold text-emerald-800 tabular-nums dark:text-emerald-200">
                <span>Điểm ước lượng: {evalResult.score}/200</span>
                <span>Trôi chảy: {evalResult.fluencyScore}%</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                <strong>Phát âm:</strong> {evalResult.pronunciationTipVi}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                <strong>Ngữ điệu:</strong> {evalResult.intonationTipVi}
              </p>
              <div className="rounded bg-white p-2.5 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                <Play size={12} className="mr-1 inline text-blue-600" />
                <strong>Gợi ý tự nhiên hơn:</strong> {evalResult.sampleSuggestion}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
