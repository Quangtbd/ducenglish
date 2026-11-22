import { Howl } from "howler";
import type { ListeningQuestion } from "../types/toeic";
import { db } from "./db";

export interface ResolvedAudio {
  objectUrl: string | null;
  source: "cache" | "gemini-tts" | "custom-upload" | "speech-fallback";
  errorMessage?: string;
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

export function createHowlAudio(
  srcUrl: string,
  format: string,
  rate = 1.0,
  onEnd?: () => void
): Howl {
  return new Howl({
    src: [srcUrl],
    format: [format],
    html5: false,
    rate,
    onend: onEnd,
  });
}

export async function resolveQuestionAudio(
  question: ListeningQuestion
): Promise<ResolvedAudio> {
  // 1. Direct audio file URL (authentic ETS 2026 MP3 or CDN)
  if (question.audioUrl) {
    try {
      const baseUrl = (import.meta as any).env?.VITE_AUDIO_BASE_URL || "";
      const fullUrl = question.audioUrl.startsWith("http")
        ? question.audioUrl
        : `${baseUrl}${question.audioUrl}`;

      const res = await fetch(fullUrl, { method: "HEAD" });
      if (res.ok) {
        return {
          objectUrl: fullUrl,
          source: "cache",
        };
      }
    } catch {
      // Fallback if unreachable
    }
  }

  if (question.customAudioKey) {
    const customEntry = await db.audioCache.get(question.customAudioKey);
    if (customEntry) {
      return {
        objectUrl: URL.createObjectURL(customEntry.audioBlob),
        source: "custom-upload",
      };
    }
  }

  const cacheKey = `tts-v1-${question.id}`;
  const cached = await db.audioCache.get(cacheKey);
  if (cached) {
    return {
      objectUrl: URL.createObjectURL(cached.audioBlob),
      source: "cache",
    };
  }

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: question.transcript,
        part: question.part,
        dialogue: question.dialogue,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      return {
        objectUrl: null,
        source: "speech-fallback",
        errorMessage:
          errBody.error ||
          "Không thể kết nối máy chủ tạo giọng đọc AI. Đang dùng giọng đọc trình duyệt dự phòng.",
      };
    }

    const data = (await response.json()) as {
      audioBase64: string;
      mimeType: string;
    };
    const blob = base64ToBlob(data.audioBase64, data.mimeType || "audio/wav");

    await db.audioCache.put({
      cacheKey,
      mimeType: data.mimeType || "audio/wav",
      audioBlob: blob,
      createdAt: Date.now(),
    });

    return {
      objectUrl: URL.createObjectURL(blob),
      source: "gemini-tts",
    };
  } catch (err) {
    return {
      objectUrl: null,
      source: "speech-fallback",
      errorMessage:
        err instanceof Error
          ? err.message
          : "Lỗi mạng khi tải audio AI. Chuyển sang giọng đọc trình duyệt.",
    };
  }
}

export function speakWithBrowserFallback(
  text: string,
  rate = 1.0,
  onEnd?: () => void
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find(
      (v) =>
        v.lang.startsWith("en-US") &&
        (v.name.includes("Natural") ||
          v.name.includes("Neural") ||
          v.name.includes("Guy") ||
          v.name.includes("Jenny") ||
          v.name.includes("Christopher") ||
          v.name.includes("Aria") ||
          v.name.includes("Google") ||
          v.name.includes("Samantha") ||
          v.name.includes("Daniel"))
    ) ||
    voices.find((v) => v.lang.startsWith("en-US") && !v.name.includes("Desktop")) ||
    voices.find((v) => v.lang.startsWith("en-US")) ||
    voices.find((v) => v.lang.startsWith("en"));
  if (preferred) {
    utterance.voice = preferred;
  }
  utterance.pitch = 1.0;
  if (onEnd) {
    utterance.onend = onEnd;
  }
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopBrowserSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
