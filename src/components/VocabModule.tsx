import { useState } from "react";
import {
  Cards,
  SpeakerHigh,
  Plus,
  CheckCircle,
  ArrowsClockwise,
  FolderOpen,
  Basket,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type { VocabEntry, VocabTopicPack } from "../types/toeic";
import { VOCAB_TOPIC_PACKS } from "../data/toeicDataset";
import { speakWithBrowserFallback } from "../lib/audioService";
import { saveVocabToNotebook, updateVocabMastery } from "../lib/db";
import { cn } from "../lib/utils";

interface VocabModuleProps {
  vocabList: VocabEntry[];
  onDataChanged: () => void;
}

const MASTERY_LABELS: Record<0 | 1 | 2 | 3, string> = {
  0: "Mới lưu",
  1: "Đang nhớ",
  2: "Quen thuộc",
  3: "Thành thạo",
};

export function VocabModule({ vocabList, onDataChanged }: VocabModuleProps) {
  const [sectionTab, setSectionTab] = useState<"basket" | "packs">("basket");
  const [basketView, setBasketView] = useState<"flashcard" | "list">("flashcard");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newMeaning, setNewMeaning] = useState("");
  const [newExample, setNewExample] = useState("");

  const activeCard = vocabList[cardIndex] ?? vocabList[0];

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newMeaning.trim()) return;
    const { created } = await saveVocabToNotebook({
      word: newWord.trim(),
      phonetic: "/.../",
      partOfSpeech: "vocabulary",
      meaningVi: newMeaning.trim(),
      exampleSentence: newExample.trim() || `Example with ${newWord.trim()}.`,
      topic: "Cá nhân",
    });
    if (created) {
      toast.success(`Đã thêm từ "${newWord.trim()}" vào Giỏ từ vựng.`);
      setNewWord("");
      setNewMeaning("");
      setNewExample("");
      onDataChanged();
    } else {
      toast.info("Từ này đã có trong Giỏ từ vựng của bạn.");
    }
  };

  const handleImportPack = async (pack: VocabTopicPack) => {
    let addedCount = 0;
    for (const word of pack.words) {
      const { created } = await saveVocabToNotebook(word);
      if (created) addedCount += 1;
    }
    onDataChanged();
    if (addedCount > 0) {
      toast.success(
        `Đã lưu thêm ${addedCount} từ mới từ bộ "${pack.title}" vào Giỏ từ vựng.`
      );
    } else {
      toast.info(`Toàn bộ từ trong bộ "${pack.title}" đã có trong Giỏ từ vựng.`);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Cards size={16} weight="duotone" />
            <span>Từ Vựng TOEIC · Chủ Đề &amp; Giỏ Từ Vựng Cá Nhân</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
            Ôn Tập Từ Vựng Trọng Tâm &amp; Từ Đã Lưu
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Tách riêng Giỏ từ vựng cá nhân (đồng bộ từ bài nghe chép) và Bộ từ vựng theo chủ đề TOEIC.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setSectionTab("basket")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors",
                sectionTab === "basket"
                  ? "bg-white text-blue-600 shadow-xs dark:bg-slate-800 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              <Basket size={14} weight="duotone" />
              <span>Giỏ từ vựng cá nhân ({vocabList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSectionTab("packs")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors",
                sectionTab === "packs"
                  ? "bg-white text-blue-600 shadow-xs dark:bg-slate-800 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              <FolderOpen size={14} weight="duotone" />
              <span>Bộ từ vựng theo chủ đề ({VOCAB_TOPIC_PACKS.length})</span>
            </button>
          </div>
        </div>
      </section>

      {sectionTab === "packs" ? (
        <div className="grid gap-5 md:grid-cols-2">
          {VOCAB_TOPIC_PACKS.map((pack) => (
            <article
              key={pack.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <img
                src={pack.imageUrl}
                alt={pack.title}
                referrerPolicy="no-referrer"
                className="h-44 w-full object-cover"
              />
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    Band {pack.bandRange}
                  </span>
                  <span className="font-mono tabular-nums">
                    {pack.words.length} từ cốt lõi
                  </span>
                </div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                  {pack.title}
                </h2>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {pack.subtitleVi}
                </p>

                <div className="space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                  {pack.words.map((w) => (
                    <div
                      key={w.word}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-950"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {w.word}
                        </span>{" "}
                        <span className="font-mono text-slate-400">
                          {w.phonetic}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {" "}
                          — {w.meaningVi}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakWithBrowserFallback(w.word, 0.9)}
                        aria-label={`Phát âm ${w.word}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <SpeakerHigh size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleImportPack(pack)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={14} weight="bold" />
                  <span>Lưu toàn bộ vào Giỏ từ vựng</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setBasketView("flashcard")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  basketView === "flashcard"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                Thẻ Flashcard ({vocabList.length})
              </button>
              <button
                type="button"
                onClick={() => setBasketView("list")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  basketView === "list"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                Danh sách bảng
              </button>
            </div>
          </div>

          {basketView === "flashcard" && activeCard ? (
            <div className="mx-auto max-w-xl space-y-4">
              <div
                onClick={() => setFlipped((f) => !f)}
                data-testid="vocab-flashcard"
                className="cursor-pointer rounded-xl border border-slate-200 bg-white p-8 text-center transition-colors hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{activeCard.topic}</span>
                  <span className="font-mono tabular-nums">
                    {cardIndex + 1}/{vocabList.length}
                  </span>
                </div>

                {!flipped ? (
                  <div className="py-10">
                    <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50">
                      {activeCard.word}
                    </h2>
                    <p className="mt-2 font-mono text-sm text-slate-500">
                      {activeCard.phonetic} · {activeCard.partOfSpeech}
                    </p>
                    <p className="mt-6 text-xs text-blue-600 dark:text-blue-400">
                      Bấm vào thẻ để xem nghĩa tiếng Việt &amp; câu ví dụ
                    </p>
                  </div>
                ) : (
                  <div className="py-8">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {activeCard.meaningVi}
                    </p>
                    <p className="mt-4 rounded-lg bg-slate-50 p-3.5 text-sm italic text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                      &ldquo;{activeCard.exampleSentence}&rdquo;
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWithBrowserFallback(activeCard.word, 0.9);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
                  >
                    <SpeakerHigh size={15} className="text-blue-600" />
                    <span>Phát âm</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFlipped((f) => !f);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
                  >
                    <ArrowsClockwise size={15} />
                    <span>Lật thẻ</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFlipped(false);
                    setCardIndex(
                      (i) => (i - 1 + vocabList.length) % vocabList.length
                    );
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  Thẻ trước
                </button>

                {activeCard.id && (
                  <button
                    type="button"
                    onClick={async () => {
                      await updateVocabMastery(activeCard.id!, 3);
                      onDataChanged();
                      toast.success(`Đã đánh dấu thuộc từ "${activeCard.word}"`);
                      setFlipped(false);
                      setCardIndex((i) => (i + 1) % vocabList.length);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle size={15} weight="fill" />
                    <span>Đã thuộc từ này</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setFlipped(false);
                    setCardIndex((i) => (i + 1) % vocabList.length);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Thẻ tiếp theo
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2.5 lg:col-span-2">
                {vocabList.map((item) => (
                  <div
                    key={item.id ?? item.word}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-slate-900 dark:text-slate-100">
                          {item.word}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {item.phonetic}
                        </span>
                        <span className="text-xs text-slate-500">
                          · {MASTERY_LABELS[item.masteryLevel]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                        {item.meaningVi}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakWithBrowserFallback(item.word, 0.9)}
                      className="rounded-lg border border-slate-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-slate-700"
                    >
                      <SpeakerHigh size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleAddWord}
                className="h-fit space-y-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                  Thêm từ mới vào Giỏ từ vựng
                </h3>
                <input
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Từ vựng tiếng Anh..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950"
                />
                <input
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  placeholder="Nghĩa tiếng Việt..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950"
                />
                <input
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="Câu ví dụ (tùy chọn)..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950"
                />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={15} weight="bold" />
                  <span>Lưu vào giỏ từ vựng</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
