import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { BookmarkSimple, SpeakerHigh, SpinnerGap } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { ListeningQuestion, VocabHighlight } from "../types/toeic";
import { INITIAL_VOCAB_DECK } from "../data/toeicDataset";
import { speakWithBrowserFallback } from "../lib/audioService";
import { saveVocabToNotebook } from "../lib/db";
import { TOPIC_LABELS } from "../lib/utils";

interface TranscriptAnnotatorProps {
  text: string;
  question: ListeningQuestion;
  onSavedVocab: () => void;
}

interface LookupResult {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaningVi: string;
  exampleSentence: string;
}

export function TranscriptAnnotator({
  text,
  question,
  onSavedVocab,
}: TranscriptAnnotatorProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [lookupData, setLookupData] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);

  const tokens = text.split(/(\s+)/);

  const handleInspectWord = async (rawToken: string) => {
    const clean = rawToken.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9'-]+$/g, "");
    if (!clean) return;
    setSelectedWord(clean);

    // Check local question keyVocab or initial deck first
    const localMatch: VocabHighlight | undefined =
      question.keyVocab.find((v) =>
        v.word.toLowerCase().includes(clean.toLowerCase())
      ) ||
      INITIAL_VOCAB_DECK.find(
        (v) => v.word.toLowerCase() === clean.toLowerCase()
      );

    if (localMatch) {
      setLookupData(localMatch);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLookupData(null);
    try {
      const { lookupWordDetails } = await import("../lib/dictionaryService");
      const data = await lookupWordDetails(clean, question);
      setLookupData({
        word: data.word,
        phonetic: data.phoneticUs,
        partOfSpeech: data.partOfSpeech,
        meaningVi: data.meaningVi,
        exampleSentence: data.exampleSentence,
      });
    } catch {
      setLookupData({
        word: clean,
        phonetic: "/.../",
        partOfSpeech: "word",
        meaningVi: "Từ xuất hiện trong bài nghe TOEIC.",
        exampleSentence: question.transcript,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!lookupData) return;
    const { created } = await saveVocabToNotebook({
      word: lookupData.word,
      phonetic: lookupData.phonetic || "/.../",
      partOfSpeech: lookupData.partOfSpeech || "vocabulary",
      meaningVi: lookupData.meaningVi,
      exampleSentence: lookupData.exampleSentence || question.transcript,
      topic: TOPIC_LABELS[question.topic],
      sourceQuestionId: question.id,
    });
    onSavedVocab();
    if (created) {
      toast.success(`Đã lưu "${lookupData.word}" vào Giỏ từ vựng!`);
    } else {
      toast.info(`"${lookupData.word}" đã có trong Giỏ từ vựng.`);
    }
    setSelectedWord(null);
  };

  return (
    <span className="leading-relaxed">
      {tokens.map((tok, idx) => {
        if (/^\s+$/.test(tok)) {
          return <span key={idx}>{tok}</span>;
        }
        const clean = tok.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9'-]+$/g, "");
        if (!clean) return <span key={idx}>{tok}</span>;

        const isOpen = selectedWord === clean;

        return (
          <Popover.Root
            key={`${idx}-${clean}`}
            open={isOpen}
            onOpenChange={(open) => {
              if (!open) setSelectedWord(null);
            }}
          >
            <Popover.Trigger asChild>
              <button
                type="button"
                onClick={() => handleInspectWord(tok)}
                className="inline rounded px-0.5 transition-colors hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
              >
                {tok}
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                sideOffset={6}
                className="z-50 w-72 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg animate-in fade-in zoom-in-95 dark:border-slate-700 dark:bg-slate-900"
              >
                {loading ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
                    <SpinnerGap size={15} className="animate-spin text-blue-600" />
                    <span>Đang tra nghĩa từ &ldquo;{clean}&rdquo;...</span>
                  </div>
                ) : lookupData ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                          {lookupData.word}
                        </span>
                        <p className="font-mono text-[11px] text-slate-400">
                          {lookupData.phonetic} · {lookupData.partOfSpeech}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakWithBrowserFallback(lookupData.word, 0.9)}
                        className="rounded-md border border-slate-200 p-1.5 text-blue-600 hover:bg-blue-50 dark:border-slate-700"
                        aria-label="Nghe phát âm"
                      >
                        <SpeakerHigh size={14} />
                      </button>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      {lookupData.meaningVi}
                    </p>
                    <button
                      type="button"
                      onClick={handleSave}
                      data-testid="popover-save-vocab"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      <BookmarkSimple size={14} weight="fill" />
                      <span>Lưu vào Giỏ từ vựng</span>
                    </button>
                  </div>
                ) : null}
                <Popover.Arrow className="fill-white dark:fill-slate-900" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        );
      })}
    </span>
  );
}
