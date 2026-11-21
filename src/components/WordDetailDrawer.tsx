import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "motion/react";
import {
  Volume2,
  X,
  Plus,
  Check,
  FolderPlus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { CefrLevel, ListeningQuestion } from "../types/toeic";
import {
  lookupWordDetails,
  playWordPronunciation,
  type EnrichedWordEntry,
} from "../lib/dictionaryService";
import { saveVocabToNotebook } from "../lib/db";
import { cn } from "../lib/utils";

interface WordDetailDrawerProps {
  word: string | null;
  question: ListeningQuestion;
  contextTitle: string;
  fallbackCefr?: CefrLevel;
  savedWordsSet: Set<string>;
  onSelectWord: (nextWord: string) => void;
  onClose: () => void;
  onSavedVocab: () => void;
}

export function WordDetailDrawer({
  word,
  question,
  contextTitle,
  fallbackCefr = "B1",
  savedWordsSet,
  onSelectWord,
  onClose,
  onSavedVocab,
}: WordDetailDrawerProps) {
  const [entry, setEntry] = useState<EnrichedWordEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardTab, setCardTab] = useState<"word" | "phrase" | "sentence">("word");
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (!word) {
      setEntry(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setCardTab("word");
    setIsFlipped(false);

    lookupWordDetails(word, question, fallbackCefr).then((data) => {
      if (cancelled) return;
      setEntry(data);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [word, question.id, fallbackCefr]);

  const isAlreadySaved = entry
    ? savedWordsSet.has(entry.word.toLowerCase()) ||
      savedWordsSet.has(entry.lemma.toLowerCase())
    : false;

  const handleAddToBasket = async () => {
    if (!entry) return;
    const res = await saveVocabToNotebook({
      word: entry.lemma || entry.word,
      phonetic: entry.phoneticUs,
      partOfSpeech: entry.partOfSpeech,
      meaningVi: entry.meaningVi,
      exampleSentence: entry.exampleSentence,
      topic: question.topic,
      sourceQuestionId: question.id,
    });
    onSavedVocab();
    toast.success(
      res.created
        ? `Đã thêm "${entry.lemma || entry.word}" vào Giỏ từ`
        : `"${entry.lemma || entry.word}" đã có sẵn trong Giỏ từ`
    );
  };

  const primaryCollocation = entry?.collocations[0];

  const cardFrontPrimary =
    cardTab === "word"
      ? entry?.word ?? ""
      : cardTab === "phrase"
      ? primaryCollocation?.phrase ?? `${entry?.word ?? ""} in context`
      : question.transcript;

  const cardFrontSub =
    cardTab === "word"
      ? `${entry?.posShort ?? "n"} · ${entry?.phoneticUs ?? ""}`
      : cardTab === "phrase"
      ? "Cụm từ thường gặp trong ngữ cảnh"
      : "Câu luyện nghe hiện tại";

  const cardBackPrimary =
    cardTab === "word"
      ? entry?.meaningVi ?? ""
      : cardTab === "phrase"
      ? primaryCollocation?.meaningVi ?? entry?.meaningVi ?? ""
      : question.transcriptVi;

  const cardBackSub =
    cardTab === "word"
      ? entry?.definitionEn ?? ""
      : cardTab === "phrase"
      ? entry?.exampleSentence ?? question.transcript
      : question.linkedSpeechTip;

  return (
    <Dialog.Root open={Boolean(word)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-[1px]" />
        <Dialog.Content
          data-testid="word-detail-drawer"
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[430px] flex-col border-l border-[#e1e7ef] bg-white shadow-2xl outline-none dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Drawer Header: Word + Từ điển badge + Close */}
          <div className="border-b border-slate-100 px-5 pt-4 pb-3 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Dialog.Title className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {word}
                </Dialog.Title>
                <span className="rounded-md bg-[#eff6ff] px-2 py-0.5 text-xs font-semibold text-[#2463eb] dark:bg-blue-950/70 dark:text-blue-300">
                  Từ điển
                </span>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Đóng khung chi tiết từ"
                  className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* US / UK Pronunciation Strip */}
            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() =>
                  word && playWordPronunciation(word, "US", entry?.audioUsUrl)
                }
                data-testid="pronounce-us-button"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-1.5 py-0.5 transition-colors hover:bg-[#eff6ff] hover:text-[#2463eb]"
              >
                <Volume2 className="h-4 w-4 text-[#2463eb]" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  US
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {entry?.phoneticUs ?? "/.../"}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  word && playWordPronunciation(word, "UK", entry?.audioUkUrl)
                }
                data-testid="pronounce-uk-button"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-1.5 py-0.5 transition-colors hover:bg-[#eff6ff] hover:text-[#2463eb]"
              >
                <Volume2 className="h-4 w-4 text-[#2463eb]" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  UK
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {entry?.phoneticUk ?? "/.../"}
                </span>
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {loading || !entry ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-[#2463eb]" />
                <span>Đang tra từ điển...</span>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#2463eb] dark:text-blue-400">
                  Nghĩa trong câu này · {entry.partOfSpeech}
                </p>

                {/* Interactive Flashcard Box with Từ / Cụm / Câu tabs + 3D flip */}
                <div className="overflow-hidden rounded-2xl border border-[#e1e7ef] bg-white shadow-xs dark:border-slate-800 dark:bg-slate-950">
                  <Tabs.Root
                    value={cardTab}
                    onValueChange={(v) => {
                      setCardTab(v as "word" | "phrase" | "sentence");
                      setIsFlipped(false);
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                      <Tabs.List className="inline-flex items-center gap-1">
                        {[
                          { id: "word", label: "Từ" },
                          { id: "phrase", label: "Cụm" },
                          { id: "sentence", label: "Câu" },
                        ].map((t) => (
                          <Tabs.Trigger
                            key={t.id}
                            value={t.id}
                            className={cn(
                              "cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                              cardTab === t.id
                                ? "bg-[#2463eb] text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                            )}
                          >
                            {t.label}
                          </Tabs.Trigger>
                        ))}
                      </Tabs.List>
                      <span className="text-xs text-slate-400">
                        Bấm thẻ để lật
                      </span>
                    </div>

                    {/* 3D Flip Surface */}
                    <div
                      onClick={() => setIsFlipped((f) => !f)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          setIsFlipped((f) => !f);
                        }
                      }}
                      data-testid="drawer-flip-card"
                      style={{ perspective: "1000px" }}
                      className="cursor-pointer px-4 py-5 select-none"
                    >
                      <motion.div
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="relative min-h-[112px]"
                      >
                        {/* Front Face */}
                        <div
                          style={{ backfaceVisibility: "hidden" }}
                          className="flex min-h-[112px] flex-col items-center justify-center text-center"
                        >
                          <p
                            className={cn(
                              "font-display font-bold text-slate-900 dark:text-slate-50",
                              cardTab === "sentence" ? "text-base leading-relaxed" : "text-2xl"
                            )}
                          >
                            {cardFrontPrimary}
                          </p>
                          <p className="mt-1.5 font-mono text-xs text-slate-500">
                            {cardFrontSub}
                          </p>
                        </div>

                        {/* Back Face */}
                        <div
                          style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                          }}
                          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-[#eff6ff]/70 p-3 text-center dark:bg-blue-950/40"
                        >
                          <p className="font-display text-lg font-bold text-[#1d4ed8] dark:text-blue-300">
                            {cardBackPrimary}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                            {cardBackSub}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </Tabs.Root>

                  {/* Card Footer: Nghe + Thêm thẻ vào giỏ */}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3.5 py-2.5 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() =>
                        playWordPronunciation(cardFrontPrimary, "US", entry.audioUsUrl)
                      }
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Volume2 className="h-4 w-4 text-[#2463eb]" />
                      <span>Nghe</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddToBasket}
                      data-testid="drawer-add-vocab-button"
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                        isAlreadySaved
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-[#2463eb] text-white hover:bg-[#1d4ed8]"
                      )}
                    >
                      {isAlreadySaved ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Đã trong giỏ</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span>Thêm thẻ vào giỏ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* English Definition */}
                <p className="border-b border-slate-100 pb-3 text-[15px] leading-relaxed text-slate-700 dark:border-slate-800 dark:text-slate-300">
                  {entry.definitionEn}
                </p>

                {/* Collocations: Cụm từ */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500">
                    Cụm từ
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {entry.collocations.map((col) => (
                      <li key={col.phrase} className="text-slate-700 dark:text-slate-300">
                        <strong className="font-semibold text-slate-900 dark:text-slate-100">
                          {col.phrase}
                        </strong>{" "}
                        <span className="text-slate-400">–</span>{" "}
                        <span>{col.meaningVi}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Synonyms: Đồng nghĩa */}
                {entry.synonyms.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500">
                      Đồng nghĩa
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {entry.synonyms.map((syn) => (
                        <button
                          key={syn.word}
                          type="button"
                          onClick={() => onSelectWord(syn.word)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#e1e7ef] bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-[#2463eb]/40 hover:bg-[#eff6ff] hover:text-[#1d4ed8] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {syn.word}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span>{syn.meaningVi}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sticky Bottom Context Footer */}
          <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            <FolderPlus className="h-4 w-4 shrink-0 text-[#2463eb]" />
            <span className="truncate">
              Thêm vào <strong className="font-semibold text-slate-800 dark:text-slate-200">{contextTitle}</strong>
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
