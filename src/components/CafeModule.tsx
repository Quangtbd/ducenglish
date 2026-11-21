import { useEffect, useRef, useState } from "react";
import {
  Coffee,
  Play,
  Pause,
  ArrowCounterClockwise,
  SpeakerHigh,
  SpeakerSlash,
  CheckSquare,
  Square,
} from "@phosphor-icons/react";
import { cn } from "../lib/utils";

const INITIAL_GOALS = [
  { id: "g1", label: "Hoàn thành 10 câu Nghe chép Part 1–2", done: false },
  { id: "g2", label: "Ôn lại các câu trong mục Câu cần luyện lại", done: false },
  { id: "g3", label: "Lưu ít nhất 5 từ vựng mới vào Giỏ từ vựng", done: false },
];

export function CafeModule() {
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [ambientOn, setAmbientOn] = useState(false);
  const [goals, setGoals] = useState(INITIAL_GOALS);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const toggleAmbientSound = () => {
    if (ambientOn) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
        noiseNodeRef.current = null;
      }
      setAmbientOn(false);
      return;
    }

    try {
      const ctx = new window.AudioContext();
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 0.25;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 420;
      const gain = ctx.createGain();
      gain.gain.value = 0.25;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      audioCtxRef.current = ctx;
      noiseNodeRef.current = source;
      setAmbientOn(true);
    } catch {
      setAmbientOn(false);
    }
  };

  const selectDuration = (m: number) => {
    setRunning(false);
    setMinutes(m);
    setSecondsLeft(m * 60);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#2463eb]/10 bg-[#2463eb]/5 px-6 py-6 md:px-8 md:py-7 dark:border-blue-900/50 dark:bg-blue-950/30">
        <div className="flex items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2463eb]/15 bg-white/80 px-2.5 py-1 text-xs font-medium text-[#2463eb] dark:bg-slate-900 dark:text-blue-400">
              <Coffee size={14} weight="duotone" />
              Góc tự học tập trung
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
              <span className="bg-gradient-to-r from-[#2463eb] to-blue-500 bg-clip-text text-transparent">
                Duc Café
              </span>{" "}
              Focus Room
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Bật đồng hồ Pomodoro, âm thanh quán cà phê dịu nhẹ và hoàn thành mục tiêu TOEIC mỗi ngày.
            </p>
          </div>
          <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2463eb] to-blue-500 text-white shadow-lg shadow-[#2463eb]/25 md:flex lg:h-24 lg:w-24">
            <Coffee size={44} weight="duotone" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pomodoro Timer */}
        <div className="flex flex-col items-center justify-between rounded-2xl border border-[#e1e7ef] bg-white p-6 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            {[25, 50, 5].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => selectDuration(m)}
                className={cn(
                  "rounded-full px-3.5 py-1 text-xs font-semibold transition-colors",
                  minutes === m
                    ? "bg-[#2463eb] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                )}
              >
                {m === 5 ? "Nghỉ 5p" : `Tập trung ${m}p`}
              </button>
            ))}
          </div>

          <div className="my-8 font-mono text-6xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-slate-50">
            {mm}:{ss}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              data-testid="cafe-timer-toggle"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2463eb] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              {running ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
              <span>{running ? "Tạm dừng" : "Bắt đầu phiên học"}</span>
            </button>
            <button
              type="button"
              onClick={() => selectDuration(minutes)}
              aria-label="Đặt lại đồng hồ"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e1e7ef] px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
            >
              <ArrowCounterClockwise size={15} />
              <span>Đặt lại</span>
            </button>
            <button
              type="button"
              onClick={toggleAmbientSound}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-colors",
                ambientOn
                  ? "border-[#2463eb] bg-[#eff6ff] text-[#2463eb]"
                  : "border-[#e1e7ef] text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              )}
            >
              {ambientOn ? <SpeakerHigh size={15} weight="duotone" /> : <SpeakerSlash size={15} />}
              <span>{ambientOn ? "Đang bật nhạc nền" : "Tiếng mưa dịu"}</span>
            </button>
          </div>
        </div>

        {/* Daily Study Checklist */}
        <div className="rounded-2xl border border-[#e1e7ef] bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
            Mục tiêu phiên học hôm nay
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Đánh dấu từng bước để giữ nhịp luyện TOEIC đều đặn mỗi ngày.
          </p>
          <div className="mt-4 space-y-2.5">
            {goals.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() =>
                  setGoals((prev) =>
                    prev.map((item) =>
                      item.id === g.id ? { ...item, done: !item.done } : item
                    )
                  )
                }
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors",
                  g.done
                    ? "border-emerald-200 bg-emerald-50/70 text-emerald-800 line-through dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-[#e1e7ef] bg-slate-50/70 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                )}
              >
                {g.done ? (
                  <CheckSquare size={18} weight="fill" className="shrink-0 text-emerald-600" />
                ) : (
                  <Square size={18} className="shrink-0 text-slate-400" />
                )}
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
