import dotenv from "dotenv";
import express from "express";
import type { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const ttsRequestSchema = z.object({
  text: z.string().min(1).max(4000),
  part: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(1),
  voiceName: z.enum(["Puck", "Charon", "Kore", "Fenrir", "Zephyr"]).optional(),
  style: z.string().max(200).optional(),
  dialogue: z
    .array(
      z.object({
        speaker: z.string().min(1).max(60),
        text: z.string().min(1).max(2000),
        voiceName: z.enum(["Puck", "Charon", "Kore", "Fenrir", "Zephyr"]).optional(),
        style: z.string().max(150).optional(),
      })
    )
    .optional(),
});

const transcribeRequestSchema = z.object({
  audioBase64: z.string().min(10),
  mimeType: z.string().default("audio/mp3"),
});

const evaluateWritingSchema = z.object({
  part: z.number().int().min(1).max(3),
  prompt: z.string().min(1),
  keywords: z.array(z.string()).optional(),
  answer: z.string().min(1).max(5000),
});

const evaluateSpeakingSchema = z.object({
  part: z.number().int().min(1).max(5),
  targetText: z.string().min(1),
  spokenTranscript: z.string().optional(),
  audioBase64: z.string().optional(),
  mimeType: z.string().optional(),
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "25mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      app: "Duc English",
      aiEnabled: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.get("/api/dotlottie-wasm", (_req: Request, res: Response) => {
    const wasmPath = path.resolve(
      __dirname,
      "node_modules/@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm"
    );
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.type("application/wasm").sendFile(wasmPath);
  });

  app.post("/api/tts", async (req: Request, res: Response) => {
    const parsed = ttsRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Dữ liệu tạo giọng đọc không hợp lệ.",
        details: parsed.error.flatten(),
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: "Chưa cấu hình GEMINI_API_KEY ở máy chủ. Hệ thống sẽ dùng giọng đọc trình duyệt dự phòng.",
      });
      return;
    }

    const { text, part, voiceName, style, dialogue } = parsed.data;

    try {
      const isDualSpeaker = part === 3 && dialogue && dialogue.length >= 2;

      if (isDualSpeaker) {
        const distinctSpeakers = Array.from(new Set(dialogue.map((d) => d.speaker))).slice(0, 2);
        const speakerA = distinctSpeakers[0] || "Speaker A";
        const speakerB = distinctSpeakers[1] || "Speaker B";
        const voiceA = dialogue.find((d) => d.speaker === speakerA)?.voiceName || "Puck";
        const voiceB = dialogue.find((d) => d.speaker === speakerB)?.voiceName || "Kore";

        const parts = dialogue.map((line) => ({
          text: `${line.speaker}: ${line.text}`,
          speechMetadata: {
            speaker: line.speaker === speakerA ? speakerA : speakerB,
            style:
              line.style ||
              "Natural, fluent American conversational style with authentic connected speech, appropriate pitch variations, and realistic conversational pacing",
          },
        }));

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash-tts",
          contents: [{ role: "user", parts }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                  {
                    speaker: speakerA,
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceA } },
                  },
                  {
                    speaker: speakerB,
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceB } },
                  },
                ],
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
          res.status(502).json({ error: "Không nhận được dữ liệu âm thanh từ Gemini TTS." });
          return;
        }
        res.json({ mimeType: "audio/wav", audioBase64: base64Audio, model: "gemini-3.8-flash-tts" });
        return;
      }

      const defaultVoice = part === 2 ? "Fenrir" : part === 4 ? "Charon" : "Kore";
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text,
                speechMetadata: {
                  style: style || "Clear, articulate standard TOEIC Listening exam narrator",
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || defaultVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        res.status(502).json({ error: "Không nhận được dữ liệu âm thanh từ Gemini TTS." });
        return;
      }
      res.json({ mimeType: "audio/wav", audioBase64: base64Audio, model: "gemini-3.8-flash-lite-tts" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi tạo giọng đọc AI";
      res.status(500).json({ error: `Không thể tạo giọng đọc AI: ${message}` });
    }
  });

  app.post("/api/transcribe", async (req: Request, res: Response) => {
    const parsed = transcribeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "File âm thanh không hợp lệ." });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: "Chưa cấu hình GEMINI_API_KEY để gỡ băng tự động. Bạn vẫn có thể nhập transcript thủ công.",
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-transcribe",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: parsed.data.mimeType,
                data: parsed.data.audioBase64,
              },
            },
            {
              text: "Transcribe this English TOEIC listening audio verbatim with accurate punctuation.",
            },
          ],
        },
      });
      res.json({ transcript: (response.text ?? "").trim() });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi nhận dạng âm thanh";
      res.status(500).json({ error: `Không thể gỡ băng audio: ${message}` });
    }
  });

  app.post("/api/evaluate-writing", async (req: Request, res: Response) => {
    const parsed = evaluateWritingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Bài viết gửi lên không hợp lệ." });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: "Chưa cấu hình GEMINI_API_KEY để AI chấm bài viết.",
      });
      return;
    }

    const { part, prompt, keywords, answer } = parsed.data;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Evaluate this TOEIC Writing Part ${part} response.
Prompt: ${prompt}
${keywords?.length ? `Required keywords: ${keywords.join(", ")}` : ""}
Student Answer: ${answer}`,
        config: {
          systemInstruction:
            "You are a senior TOEIC Writing examiner for Duc English. Return concise, practical Vietnamese explanations alongside corrected natural English.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "Score from 0 to 200 on TOEIC Writing scale" },
              bandLabel: { type: Type.STRING, description: "Short proficiency label in Vietnamese" },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              corrections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING },
                    fixed: { type: Type.STRING },
                    reasonVi: { type: Type.STRING },
                  },
                },
              },
              improvedAnswer: { type: Type.STRING },
              overallAdviceVi: { type: Type.STRING },
            },
          },
        },
      });

      const raw = (response.text ?? "{}").trim();
      res.json(JSON.parse(raw));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi chấm bài viết";
      res.status(500).json({ error: `Không thể chấm bài viết: ${message}` });
    }
  });

  app.post("/api/evaluate-speaking", async (req: Request, res: Response) => {
    const parsed = evaluateSpeakingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dữ liệu luyện nói không hợp lệ." });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: "Chưa cấu hình GEMINI_API_KEY để phân tích bài nói.",
      });
      return;
    }

    const { part, targetText, spokenTranscript, audioBase64, mimeType } = parsed.data;

    try {
      const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
      if (audioBase64 && mimeType) {
        contentParts.push({ inlineData: { mimeType, data: audioBase64 } });
      }
      contentParts.push({
        text: `Evaluate TOEIC Speaking Part ${part}.
Reference prompt/text: "${targetText}"
${spokenTranscript ? `Recognized speech: "${spokenTranscript}"` : "Analyze the attached student audio recording."}
Give constructive feedback in Vietnamese for pronunciation, intonation, and completeness.`,
      });

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: { parts: contentParts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "Estimated TOEIC Speaking score 0-200" },
              fluencyScore: { type: Type.INTEGER, description: "0-100" },
              pronunciationTipVi: { type: Type.STRING },
              intonationTipVi: { type: Type.STRING },
              sampleSuggestion: { type: Type.STRING },
            },
          },
        },
      });

      const raw = (response.text ?? "{}").trim();
      res.json(JSON.parse(raw));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi đánh giá bài nói";
      res.status(500).json({ error: `Không thể đánh giá bài nói: ${message}` });
    }
  });

  app.post("/api/word-lookup", async (req: Request, res: Response) => {
    const schema = z.object({
      word: z.string().min(1).max(80),
      contextSentence: z.string().max(600).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Từ cần tra không hợp lệ." });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: "Chưa cấu hình GEMINI_API_KEY để tra từ tự động.",
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Explain the English word "${parsed.data.word}" in a TOEIC context${
          parsed.data.contextSentence ? ` from the sentence: "${parsed.data.contextSentence}"` : ""
        }.`,
        config: {
          systemInstruction:
            "Return concise, accurate Vietnamese TOEIC dictionary data.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              phonetic: { type: Type.STRING },
              partOfSpeech: { type: Type.STRING },
              meaningVi: { type: Type.STRING },
              exampleSentence: { type: Type.STRING },
            },
          },
        },
      });
      const raw = (response.text ?? "{}").trim();
      res.json(JSON.parse(raw));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi tra từ";
      res.status(500).json({ error: `Không thể tra từ: ${message}` });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Duc English server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
