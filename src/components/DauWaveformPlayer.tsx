import { useEffect, useMemo, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { ListeningQuestion } from "../types/toeic";
import {
  resolveQuestionAudio,
  speakWithBrowserFallback,
  stopBrowserSpeech,
} from "../lib/audioService";
import { cn } from "../lib/utils";

interface DauWaveformPlayerProps {
  question: ListeningQuestion;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
  registerReplayTrigger?: (fn: () => void) => void;
  onAudioReplayCounted?: (count: number) => void;
}

const SPEED_OPTIONS = [0.75, 0.85, 1.0, 1.15, 1.25];
const BAR_COUNT = 64;

/** Generates speech-like bar envelope (flat dashes on pauses, tall pills on words) */
function buildSyntheticPeaks(transcript: string, count = BAR_COUNT): number[] {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const seedBase = words.reduce((acc, w) => acc + w.length * 7, 17);
  const bars: number[] = [];

  for (let i = 0; i < count; i += 1) {
    // Lead-in and lead-out silence dashes matching DauEnglish screenshot
    if (i < 6 || i > count - 9) {
      bars.push(0.05);
      continue;
    }
    const wordIdx = Math.floor(((i - 6) / (count - 15)) * Math.max(words.length, 1));
    const word = words[wordIdx] ?? "word";
    const isPauseGap = i % 11 === 0 || (i === 18 && words.length > 5);
    if (isPauseGap) {
      bars.push(0.06);
      continue;
    }
    const wave =
      Math.abs(Math.sin((i + seedBase) * 0.63)) * 0.45 +
      Math.min(0.52, word.length * 0.065);
    bars.push(Math.min(0.98, Math.max(0.22, wave)));
  }
  return bars;
}

export function DauWaveformPlayer({
  question,
  playbackRate,
  onChangePlaybackRate,
  registerReplayTrigger,
  onAudioReplayCounted,
}: DauWaveformPlayerProps) {
  const hiddenContainerRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<ReturnType<typeof RegionsPlugin.create> | null>(null);
  const activeUrlRef = useRef<string | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioStatus, setAudioStatus] = useState<"loading" | "ready-ws" | "ready-speech">(
    "loading"
  );
  const [peaks, setPeaks] = useState<number[]>(() => buildSyntheticPeaks(question.transcript));
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayCount, setReplayCount] = useState(1);
  const [isAutoLoop, setIsAutoLoop] = useState(false);

  const speechTimerRef = useRef<number | null>(null);
  const isAutoLoopRef = useRef(isAutoLoop);
  isAutoLoopRef.current = isAutoLoop;

  const estimatedSpeechDuration = useMemo(() => {
    const words = question.transcript.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(2.6, (words / 2.35) / playbackRate);
  }, [question.transcript, playbackRate]);

  const stopSpeechInterval = () => {
    if (speechTimerRef.current !== null) {
      window.clearInterval(speechTimerRef.current);
      speechTimerRef.current = null;
    }
  };

  // Resolve audio (cached/TTS WAV or browser speech fallback)
  useEffect(() => {
    let cancelled = false;
    stopBrowserSpeech();
    stopSpeechInterval();
    setIsPlaying(false);
    setCurrentTime(0);
    setReplayCount(1);
    setAudioStatus("loading");
    setPeaks(buildSyntheticPeaks(question.transcript));

    if (activeUrlRef.current) {
      if (activeUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(activeUrlRef.current);
      }
      activeUrlRef.current = null;
    }
    setAudioUrl(null);

    resolveQuestionAudio(question).then((res) => {
      if (cancelled) {
        if (res.objectUrl && res.objectUrl.startsWith("blob:")) {
          URL.revokeObjectURL(res.objectUrl);
        }
        return;
      }
      if (res.objectUrl) {
        activeUrlRef.current = res.objectUrl;
        setAudioUrl(res.objectUrl);
      } else {
        setDuration(estimatedSpeechDuration);
        setAudioStatus("ready-speech");
      }
    });

    return () => {
      cancelled = true;
      stopBrowserSpeech();
      stopSpeechInterval();
      if (activeUrlRef.current) {
        if (activeUrlRef.current.startsWith("blob:")) {
          URL.revokeObjectURL(activeUrlRef.current);
        }
        activeUrlRef.current = null;
      }
    };
  }, [question.id, question.customAudioKey, question.audioUrl]);

  // Mount headless wavesurfer.js + RegionsPlugin whenever real audioUrl exists
  useEffect(() => {
    if (!audioUrl || !hiddenContainerRef.current) return;

    const regions = RegionsPlugin.create();
    regionsRef.current = regions;

    const ws = WaveSurfer.create({
      container: hiddenContainerRef.current,
      url: audioUrl,
      height: 16,
      plugins: [regions],
    });
    wavesurferRef.current = ws;

    ws.on("ready", (d) => {
      setDuration(d);
      setAudioStatus("ready-ws");
      ws.setPlaybackRate(playbackRate, true);
      try {
        const exported = ws.exportPeaks({ channels: 1, maxLength: BAR_COUNT });
        if (exported[0]?.length) {
          const normalized = Array.from(exported[0]).map((v) =>
            Math.min(1, Math.max(0.05, Math.abs(v)))
          );
          setPeaks(normalized);
        }
      } catch {
        // Keep synthetic speech-envelope peaks
      }
    });

    ws.on("timeupdate", (t) => setCurrentTime(t));
    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => {
      if (isAutoLoopRef.current) {
        ws.setTime(0);
        ws.play();
      } else {
        setIsPlaying(false);
      }
    });

    regions.on("region-out", (region) => {
      if (isAutoLoopRef.current) {
        region.play();
      }
    });

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
      regionsRef.current = null;
    };
  }, [audioUrl]);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(playbackRate, true);
    }
  }, [playbackRate]);

  const startSpeechSimulation = (startOffset = 0) => {
    stopSpeechInterval();
    const total = estimatedSpeechDuration;
    setDuration(total);
    setCurrentTime(startOffset);
    setIsPlaying(true);

    const startedAt = performance.now() - startOffset * 1000;
    speechTimerRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - startedAt) / 1000;
      if (elapsed >= total) {
        setCurrentTime(total);
        stopSpeechInterval();
        if (isAutoLoopRef.current) {
          startSpeechSimulation(0);
        } else {
          setIsPlaying(false);
        }
      } else {
        setCurrentTime(elapsed);
      }
    }, 60);

    speakWithBrowserFallback(question.transcript, playbackRate, () => {
      // Speech API ended
      if (!isAutoLoopRef.current) {
        stopSpeechInterval();
        setCurrentTime(total);
        setIsPlaying(false);
      }
    });
  };

  const handleTogglePlay = () => {
    if (audioStatus === "loading") return;
    if (wavesurferRef.current && audioUrl) {
      wavesurferRef.current.playPause();
      return;
    }
    if (isPlaying) {
      stopBrowserSpeech();
      stopSpeechInterval();
      setIsPlaying(false);
    } else {
      const offset = currentTime >= duration - 0.15 ? 0 : currentTime;
      startSpeechSimulation(offset);
    }
  };

  const handleReplay = () => {
    if (audioStatus === "loading") return;
    setReplayCount((prev) => {
      const next = prev + 1;
      onAudioReplayCounted?.(next);
      return next;
    });

    if (wavesurferRef.current && audioUrl) {
      wavesurferRef.current.setTime(0);
      wavesurferRef.current.play();
      return;
    }
    startSpeechSimulation(0);
  };

  const handleSeekRatio = (ratio: number) => {
    const clamped = Math.min(1, Math.max(0, ratio));
    const targetSec = clamped * (duration || estimatedSpeechDuration);
    setCurrentTime(targetSec);

    if (wavesurferRef.current && audioUrl) {
      wavesurferRef.current.seekTo(clamped);
    } else if (isPlaying) {
      startSpeechSimulation(targetSec);
    }
  };

  const handleJumpSeconds = (deltaSeconds: number) => {
    const total = duration || estimatedSpeechDuration;
    const nextSec = Math.min(total, Math.max(0, currentTime + deltaSeconds));
    setCurrentTime(nextSec);

    if (wavesurferRef.current && audioUrl) {
      wavesurferRef.current.setTime(nextSec);
    } else if (isPlaying) {
      startSpeechSimulation(nextSec);
    }
  };

  const handleCycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(playbackRate);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    onChangePlaybackRate(next);
  };

  const handleToggleAutoLoop = () => {
    const next = !isAutoLoop;
    setIsAutoLoop(next);
    if (regionsRef.current && wavesurferRef.current && duration > 0) {
      regionsRef.current.clearRegions();
      if (next) {
        regionsRef.current.addRegion({
          start: 0,
          end: duration,
          color: "rgba(36, 99, 235, 0.08)",
          drag: false,
          resize: false,
        });
      }
    }
  };

  useEffect(() => {
    registerReplayTrigger?.(handleReplay);
  });

  const totalDur = duration || estimatedSpeechDuration;
  const progressRatio = totalDur > 0 ? Math.min(1, currentTime / totalDur) : 0;

  return (
    <div
      data-testid="dau-waveform-player"
      className="rounded-2xl border border-[#e1e7ef] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Hidden WaveSurfer mount for audio decoding & RegionsPlugin */}
      <div ref={hiddenContainerRef} className="sr-only" aria-hidden="true" />

      {/* Segmented Dotted Pill Waveform matching Đậu English */}
      <div
        role="slider"
        tabIndex={0}
        aria-label="Thanh sóng âm phát audio"
        aria-valuemin={0}
        aria-valuemax={Math.round(totalDur)}
        aria-valuenow={Math.round(currentTime)}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          handleSeekRatio((e.clientX - rect.left) / rect.width);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") handleJumpSeconds(-2.5);
          if (e.key === "ArrowRight") handleJumpSeconds(2.5);
        }}
        className="flex h-16 w-full cursor-pointer items-center justify-between gap-[3px] rounded-xl bg-slate-50/75 px-4 py-2 select-none dark:bg-slate-950/70"
      >
        {peaks.map((amp, idx) => {
          const barRatio = idx / Math.max(peaks.length - 1, 1);
          const isPlayed = barRatio <= progressRatio;
          const isSilenceDash = amp < 0.14;
          const heightPx = isSilenceDash ? 3 : Math.round(10 + amp * 36);

          return (
            <span
              key={idx}
              style={{ height: `${heightPx}px` }}
              className={cn(
                "rounded-full transition-colors duration-150",
                isSilenceDash ? "w-1.5" : "w-1",
                isPlayed
                  ? "bg-[#2463eb]"
                  : "bg-slate-300 dark:bg-slate-700"
              )}
            />
          );
        })}
      </div>

      {/* Controls Strip: Phát lại [N] | < Play > | Speed + Tự lặp */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Replay Counter Pill */}
        <button
          type="button"
          onClick={handleReplay}
          disabled={audioStatus === "loading"}
          data-testid="replay-audio-button"
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#e1e7ef] bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <span>Phát lại</span>
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-slate-100 px-1.5 font-mono text-xs font-semibold text-slate-700 tabular-nums dark:bg-slate-800 dark:text-slate-200">
            {replayCount}
          </span>
        </button>

        {/* Center: Seek Back, Primary Blue Circle Play/Pause, Seek Forward */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleJumpSeconds(-2.5)}
            aria-label="Tua lùi 2.5 giây"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#e1e7ef] bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={audioStatus === "loading"}
            data-testid="audio-play-button"
            aria-label={isPlaying ? "Tạm dừng âm thanh" : "Phát âm thanh"}
            className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#2463eb] text-white shadow-md shadow-[#2463eb]/25 transition-all hover:bg-[#1d4ed8] active:scale-95 disabled:opacity-60"
          >
            {audioStatus === "loading" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleJumpSeconds(2.5)}
            aria-label="Tua tới 2.5 giây"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#e1e7ef] bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Speed Cycle (1x) + Tự lặp toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCycleSpeed}
            data-testid="speed-cycle-button"
            className="inline-flex h-9 min-w-11 cursor-pointer items-center justify-center rounded-xl border border-[#e1e7ef] bg-white px-3 font-mono text-sm font-medium text-slate-700 tabular-nums transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            title="Bấm để đổi tốc độ phát"
          >
            {playbackRate}x
          </button>

          <button
            type="button"
            onClick={handleToggleAutoLoop}
            data-testid="auto-loop-button"
            className={cn(
              "inline-flex h-9 cursor-pointer items-center rounded-xl border px-3.5 text-sm font-medium transition-colors",
              isAutoLoop
                ? "border-[#2463eb] bg-[#eff6ff] font-semibold text-[#2463eb] dark:bg-blue-950/60 dark:text-blue-300"
                : "border-[#e1e7ef] bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            )}
          >
            Tự lặp
          </button>
        </div>
      </div>
    </div>
  );
}
