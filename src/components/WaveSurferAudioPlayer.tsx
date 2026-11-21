import { useEffect, useMemo, useRef, useState } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import {
  Play,
  Pause,
  ArrowCounterClockwise,
  Repeat,
  SpeakerHigh,
  Waveform,
  SpinnerGap,
} from "@phosphor-icons/react";
import type { ListeningQuestion } from "../types/toeic";
import {
  resolveQuestionAudio,
  speakWithBrowserFallback,
  stopBrowserSpeech,
} from "../lib/audioService";
import { cn, formatDuration } from "../lib/utils";

interface WaveSurferAudioPlayerProps {
  question: ListeningQuestion;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
  registerReplayTrigger?: (fn: () => void) => void;
}

const SPEED_OPTIONS = [0.75, 0.85, 1.0, 1.15, 1.25];

export function WaveSurferAudioPlayer({
  question,
  playbackRate,
  onChangePlaybackRate,
  registerReplayTrigger,
}: WaveSurferAudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<
    "loading" | "cache" | "gemini-tts" | "custom-upload" | "speech-fallback"
  >("loading");
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isLoopingRegion, setIsLoopingRegion] = useState(false);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
  const activeUrlRef = useRef<string | null>(null);
  const regionsPlugin = useMemo(() => RegionsPlugin.create(), []);

  useEffect(() => {
    let cancelled = false;
    stopBrowserSpeech();
    setIsSpeechPlaying(false);
    setAudioSource("loading");
    setFallbackNotice(null);
    setDuration(0);

    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }
    setAudioUrl(null);

    resolveQuestionAudio(question).then((res) => {
      if (cancelled) {
        if (res.objectUrl) URL.revokeObjectURL(res.objectUrl);
        return;
      }
      if (res.objectUrl) {
        activeUrlRef.current = res.objectUrl;
        setAudioUrl(res.objectUrl);
      }
      setAudioSource(res.source);
      if (res.errorMessage) {
        setFallbackNotice(res.errorMessage);
      }
    });

    return () => {
      cancelled = true;
      stopBrowserSpeech();
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
        activeUrlRef.current = null;
      }
    };
  }, [question.id, question.customAudioKey]);

  const plugins = useMemo(() => [regionsPlugin], [regionsPlugin]);

  const { wavesurfer, isReady, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    url: audioUrl ?? undefined,
    height: 62,
    waveColor: "#cbd5e1",
    progressColor: "#2563eb",
    cursorColor: "#1d4ed8",
    barWidth: 2,
    barGap: 2,
    barRadius: 2,
    normalize: true,
    plugins,
  });

  useEffect(() => {
    if (!wavesurfer) return;
    wavesurfer.setPlaybackRate(playbackRate);
  }, [wavesurfer, playbackRate, isReady]);

  useEffect(() => {
    if (!wavesurfer) return;
    const onDecode = (d: number) => setDuration(d);
    const onRegionOut = (region: { play: () => void }) => {
      if (isLoopingRegion) {
        region.play();
      }
    };
    wavesurfer.on("decode", onDecode);
    regionsPlugin.on("region-out", onRegionOut);
    return () => {
      wavesurfer.un("decode", onDecode);
      regionsPlugin.un("region-out", onRegionOut);
    };
  }, [wavesurfer, regionsPlugin, isLoopingRegion]);

  const handleTogglePlay = () => {
    if (audioUrl && wavesurfer) {
      wavesurfer.playPause();
      return;
    }
    if (isSpeechPlaying) {
      stopBrowserSpeech();
      setIsSpeechPlaying(false);
    } else {
      setIsSpeechPlaying(true);
      const started = speakWithBrowserFallback(question.transcript, playbackRate, () =>
        setIsSpeechPlaying(false)
      );
      if (!started) setIsSpeechPlaying(false);
    }
  };

  const handleReplay = () => {
    if (audioUrl && wavesurfer) {
      wavesurfer.setTime(0);
      wavesurfer.play();
      return;
    }
    setIsSpeechPlaying(true);
    speakWithBrowserFallback(question.transcript, playbackRate, () =>
      setIsSpeechPlaying(false)
    );
  };

  useEffect(() => {
    registerReplayTrigger?.(handleReplay);
  });

  const handleToggleLoopRegion = () => {
    if (!wavesurfer || !duration) return;
    regionsPlugin.clearRegions();
    if (isLoopingRegion) {
      setIsLoopingRegion(false);
      return;
    }
    const start = Math.max(0, Math.min(currentTime, Math.max(0, duration - 2.5)));
    const end = Math.min(duration, start + Math.min(3.5, duration * 0.45));
    regionsPlugin.addRegion({
      start,
      end,
      color: "rgba(37, 99, 235, 0.16)",
      drag: true,
      resize: true,
    });
    setIsLoopingRegion(true);
    wavesurfer.setTime(start);
    wavesurfer.play();
  };

  const playingNow = audioUrl ? isPlaying : isSpeechPlaying;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={audioSource === "loading"}
            data-testid="audio-play-button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            aria-label={playingNow ? "Tạm dừng âm thanh" : "Phát âm thanh"}
          >
            {audioSource === "loading" ? (
              <SpinnerGap size={18} className="animate-spin" />
            ) : playingNow ? (
              <Pause size={18} weight="fill" />
            ) : (
              <Play size={18} weight="fill" />
            )}
          </button>

          <button
            type="button"
            onClick={handleReplay}
            disabled={audioSource === "loading"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowCounterClockwise size={15} weight="bold" />
            <span>Nghe lại</span>
            <kbd className="hidden font-mono text-[10px] text-slate-400 sm:inline">
              Ctrl+Space
            </kbd>
          </button>

          {audioUrl && (
            <button
              type="button"
              onClick={() => {
                if (!wavesurfer) return;
                wavesurfer.setTime(Math.max(0, currentTime - 3));
                wavesurfer.play();
              }}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-mono text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 tabular-nums dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Tua lại 3 giây"
            >
              -3s
            </button>
          )}

          {audioUrl && (
            <button
              type="button"
              onClick={handleToggleLoopRegion}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                isLoopingRegion
                  ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              )}
            >
              <Repeat size={15} weight={isLoopingRegion ? "bold" : "regular"} />
              <span>{isLoopingRegion ? "Đang lặp đoạn A-B" : "Lặp đoạn khó"}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900">
            {SPEED_OPTIONS.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => onChangePlaybackRate(rate)}
                className={cn(
                  "rounded-md px-2 py-1 font-mono text-xs tabular-nums transition-colors",
                  playbackRate === rate
                    ? "bg-blue-600 font-semibold text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                )}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Waveform Canvas or Speech Fallback Strip */}
      <div className="mt-3">
        {audioUrl ? (
          <div>
            <div
              ref={containerRef}
              className="w-full cursor-pointer overflow-hidden rounded-lg bg-white px-2 py-1.5 dark:bg-slate-900"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Waveform size={14} className="text-blue-600" />
                <span>
                  {audioSource === "custom-upload"
                    ? "File MP3 của bạn"
                    : audioSource === "cache"
                    ? "Âm thanh AI đã lưu cache"
                    : "Giọng đọc AI Gemini 3.8 TTS"}
                </span>
              </span>
              <span className="font-mono tabular-nums">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <SpeakerHigh
                size={18}
                weight="duotone"
                className={cn("text-blue-600", isSpeechPlaying && "animate-pulse")}
              />
              <span>
                {audioSource === "loading"
                  ? "Đang chuẩn bị giọng đọc AI chuẩn TOEIC..."
                  : fallbackNotice || "Đang sử dụng giọng đọc trình duyệt (Web Speech API)."}
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              {isSpeechPlaying ? "Đang phát..." : "Sẵn sàng"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
