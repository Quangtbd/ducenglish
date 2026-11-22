import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  Headphones,
  Fire,
} from "@phosphor-icons/react";
import type {
  CefrLevel,
  DictationAttempt,
  DictationMode,
  ListeningQuestion,
  ReviewQueueItem,
  ThematicListeningSet,
  ToeicPart,
  TopicId,
  UserProfile,
  VocabEntry,
} from "../types/toeic";
import { TOPIC_LABELS, cn } from "../lib/utils";
import { toggleReviewQueueItem } from "../lib/db";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { ThematicCardGrid } from "./ThematicCardGrid";
import { DictationStudio } from "./DictationStudio";
import { PartListeningHub } from "./PartListeningHub";
import { ModuleHeroBanner } from "./ui/ModuleHeroBanner";
import { THEMATIC_LISTENING_SETS } from "../data/thematicListeningSets";

interface ListeningHubProps {
  questions: ListeningQuestion[];
  attempts: DictationAttempt[];
  reviewQueue: ReviewQueueItem[];
  vocabList: VocabEntry[];
  profile: UserProfile;
  activeStudioSession: {
    title: string;
    cefrLevel?: CefrLevel;
    questions: ListeningQuestion[];
    initialIndex: number;
    defaultMode?: DictationMode;
  } | null;
  onStartStudio: (
    title: string,
    sessionQuestions: ListeningQuestion[],
    initialIndex?: number,
    defaultMode?: DictationMode,
    cefrLevel?: CefrLevel
  ) => void;
  onExitStudio: () => void;
  onUpdateProfile: (values: Partial<UserProfile>) => void;
  onDataChanged: () => void;
  viewMode: "matrix" | "review";
  onChangeViewMode: (mode: "matrix" | "review") => void;
}

export function ListeningHub({
  questions,
  attempts,
  reviewQueue,
  vocabList,
  profile,
  activeStudioSession,
  onStartStudio,
  onExitStudio,
  onUpdateProfile,
  onDataChanged,
  viewMode,
  onChangeViewMode,
}: ListeningHubProps) {
  const [activeListeningSubTab, setActiveListeningSubTab] = useState<"listen-check" | 1 | 2 | 3 | 4>("listen-check");
  const [selectedTopic, setSelectedTopic] = useState<TopicId>("all");
  const [reviewListRef] = useAutoAnimate();

  const handleStartThematicSet = (set: ThematicListeningSet) => {
    onStartStudio(
      `${set.cefrLevel} · ${set.title}`,
      set.questions,
      0,
      "check",
      set.cefrLevel
    );
  };

  if (activeStudioSession) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        <DictationStudio
          title={activeStudioSession.title}
          cefrLevel={activeStudioSession.cefrLevel}
          questions={activeStudioSession.questions}
          initialQuestionIndex={activeStudioSession.initialIndex}
          initialMode={activeStudioSession.defaultMode ?? "check"}
          attempts={attempts}
          reviewQueue={reviewQueue}
          vocabList={vocabList}
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          onDataChanged={onDataChanged}
          onExit={onExitStudio}
        />
      </motion.div>
    );
  }

  if (activeListeningSubTab !== "listen-check") {
    return (
      <PartListeningHub
        initialPart={activeListeningSubTab}
        onStartLegacyStudio={() => setActiveListeningSubTab("listen-check")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Unified Hero Banner matching Screenshot 1 */}
      <ModuleHeroBanner
        kicker="Lộ trình Nghe TOEIC A1 → C2"
        titleLeading="Chinh phục"
        titleHighlight="TOEIC Listening"
        titleTrailing="từ dễ đến khó"
        description="Luyện Nghe check, Nghe chép chính tả và mở rộng vốn từ theo 6 cấp độ chuẩn quốc tế A1 → C2 hoặc chuyển sang Part 1–4."
        icon={Headphones}
        pills={[
          { id: "listen-check", label: "Nghe chép" },
          { id: "1", label: "Part 1" },
          { id: "2", label: "Part 2" },
          { id: "3", label: "Part 3" },
          { id: "4", label: "Part 4" },
        ]}
        activePill="listen-check"
        onSelectPill={(id) => {
          if (id !== "listen-check") {
            setActiveListeningSubTab(Number(id) as 1 | 2 | 3 | 4);
          }
        }}
        searchPlaceholder="Gõ từ khóa bộ đề nghe hoặc chủ đề đàm thoại..."
      />

      {/* Filter Bar: Topic Filter + Review Queue */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {(["listen-check", 1, 2, 3, 4] as const).map((tab) => {
              const active = activeListeningSubTab === tab;
              return (
                <button
                  key={String(tab)}
                  type="button"
                  onClick={() => {
                    if (tab === "listen-check") {
                      setActiveListeningSubTab("listen-check");
                    } else {
                      setActiveListeningSubTab(tab);
                    }
                  }}
                  className={cn(
                    "cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-[#2463eb] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  )}
                >
                  {tab === "listen-check" ? "Nghe chép" : `Part ${tab}`}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Lọc theo chủ đề"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value as TopicId)}
              className="rounded-full border border-[#e1e7ef] bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-[#2463eb] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {Object.entries(TOPIC_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() =>
                onChangeViewMode(viewMode === "review" ? "matrix" : "review")
              }
              data-testid="review-queue-tab"
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5",
                viewMode === "review"
                  ? "border-rose-600 bg-rose-600 font-semibold text-white shadow-sm"
                  : "border-[#e1e7ef] bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              )}
            >
              <Fire size={15} weight={viewMode === "review" ? "fill" : "duotone"} />
              <span>Câu cần luyện lại ({reviewQueue.length})</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === "matrix" ? (
        <ThematicCardGrid
          sets={THEMATIC_LISTENING_SETS}
          attempts={attempts}
          reviewQueue={reviewQueue}
          selectedPart={"all"}
          selectedTopic={selectedTopic}
          onStartThematicSet={handleStartThematicSet}
          onDataChanged={onDataChanged}
        />
      ) : (
        <div className="space-y-4" ref={reviewListRef}>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
              Danh sách câu cần luyện lại ({reviewQueue.length})
            </h3>
            <button
              type="button"
              onClick={() => onChangeViewMode("matrix")}
              className="text-sm font-medium text-[#2463eb] hover:underline dark:text-blue-400"
            >
              ← Quay lại lộ trình A1–C2
            </button>
          </div>

          {reviewQueue.length === 0 ? (
            <div className="rounded-xl border border-[#e1e7ef] bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500">
                Chưa có câu nào trong danh sách cần luyện lại. Tuyệt vời!
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {reviewQueue.map((item) => {
                const q = questions.find((x) => x.id === item.questionId);
                if (!q) return null;
                return (
                  <div
                    key={item.questionId}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          Part {q.part}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          Luyện lại lần {item.retryCount + 1}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-900 truncate dark:text-slate-100">
                        {q.transcript}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onStartStudio(
                            `Ôn tập · Part ${q.part}`,
                            [q],
                            0,
                            "check"
                          )
                        }
                        className="rounded-lg bg-[#2463eb] px-4 py-2 text-xs font-bold text-white transition-transform hover:scale-105"
                      >
                        Luyện ngay
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await toggleReviewQueueItem(q.id);
                          onDataChanged();
                          toast.success("Đã xóa khỏi danh sách cần luyện lại");
                        }}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
