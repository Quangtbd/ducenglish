import { useEffect, useState } from "react";
import { motion } from "motion/react";
import NumberFlow from "@number-flow/react";
import {
  GameController,
  Timer,
  Trophy,
  Fire,
  CheckCircle,
  XCircle,
  Play,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "../lib/utils";

interface GameQuestion {
  id: string;
  category: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanationVi: string;
}

const GAME_QUESTIONS: GameQuestion[] = [
  {
    id: "g1",
    category: "Ngữ pháp · Word Form",
    prompt: "Please _______ the registration form before submitting it to HR.",
    options: ["completion", "complete", "completely", "completed"],
    correctIndex: 1,
    explanationVi: "Sau 'Please' ở câu mệnh lệnh cần động từ nguyên mẫu 'complete'.",
  },
  {
    id: "g2",
    category: "Từ vựng · Business",
    prompt: "The quarterly financial report will be _______ to all board members tomorrow.",
    options: ["distributed", "subscribed", "attended", "invested"],
    correctIndex: 0,
    explanationVi: "'distributed to' mang nghĩa được phân phát / gửi tới toàn bộ thành viên.",
  },
  {
    id: "g3",
    category: "Ngữ pháp · Giới từ",
    prompt: "Due to heavy traffic, the shuttle bus arrived 15 minutes _______ schedule.",
    options: ["behind", "across", "among", "between"],
    correctIndex: 0,
    explanationVi: "Cụm cố định 'behind schedule' nghĩa là trễ so với lịch trình.",
  },
  {
    id: "g4",
    category: "Từ vựng · Văn phòng",
    prompt: "Employees must display their security badges _______ entering the laboratory.",
    options: ["prior to", "in spite of", "because of", "instead of"],
    correctIndex: 0,
    explanationVi: "'prior to + V-ing' = trước khi bước vào phòng thí nghiệm.",
  },
  {
    id: "g5",
    category: "Ngữ pháp · Thì động từ",
    prompt: "Ms. Chen _______ as the regional marketing director since January 2023.",
    options: ["serves", "has served", "is serving", "will serve"],
    correctIndex: 1,
    explanationVi: "Có mốc 'since January 2023' nên chia thì hiện tại hoàn thành 'has served'.",
  },
  {
    id: "g6",
    category: "Từ vựng · Hợp đồng",
    prompt: "Both parties agreed to _______ the partnership contract for two more years.",
    options: ["renew", "hesitate", "depart", "resolve"],
    correctIndex: 0,
    explanationVi: "'renew a contract' = gia hạn hợp đồng.",
  },
];

const WEEKLY_LEADERBOARD = [
  { rank: 1, name: "Minh Anh · 850+", xp: 2480 },
  { rank: 2, name: "Tuấn Kiệt · 780+", xp: 2190 },
  { rank: 3, name: "Hải Yến · 700+", xp: 1940 },
  { rank: 4, name: "Đức Nguyễn (Bạn)", xp: 1620, isUser: true },
];

interface GameModuleProps {
  userXp: number;
  onAddXp: (delta: number) => void;
}

export function GameModule({ userXp, onAddXp }: GameModuleProps) {
  const [status, setStatus] = useState<"idle" | "playing" | "finished">("idle");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStatus("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const currentQ = GAME_QUESTIONS[qIndex % GAME_QUESTIONS.length];

  const handleStart = () => {
    setStatus("playing");
    setQIndex(0);
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setPicked(null);
  };

  const handleAnswer = (idx: number) => {
    if (picked !== null || status !== "playing") return;
    setPicked(idx);
    const isCorrect = idx === currentQ.correctIndex;

    if (isCorrect) {
      const nextCombo = combo + 1;
      const earned = 15 + nextCombo * 5;
      setCombo(nextCombo);
      setScore((s) => s + earned);
      onAddXp(earned);
    } else {
      setCombo(0);
    }

    window.setTimeout(() => {
      if (qIndex + 1 >= GAME_QUESTIONS.length) {
        setStatus("finished");
        toast.success("Hoàn thành vòng Game TOEIC!");
      } else {
        setQIndex((i) => i + 1);
        setPicked(null);
      }
    }, 950);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#2463eb]/10 bg-[#2463eb]/5 px-6 py-6 md:px-8 md:py-7 dark:border-blue-900/50 dark:bg-blue-950/30">
        <div className="flex items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2463eb]/15 bg-white/80 px-2.5 py-1 text-xs font-medium text-[#2463eb] dark:bg-slate-900 dark:text-blue-400">
              <GameController size={14} weight="duotone" />
              Chơi là ôn
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
              <span className="bg-gradient-to-r from-[#2463eb] to-blue-500 bg-clip-text text-transparent">
                Game
              </span>{" "}
              So tài TOEIC
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Trả lời nhanh ngữ pháp &amp; từ vựng Part 5 trong 60 giây để tích lũy combo và leo bảng xếp hạng tuần.
            </p>
          </div>
          <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2463eb] to-blue-500 text-white shadow-lg shadow-[#2463eb]/25 md:flex lg:h-24 lg:w-24">
            <GameController size={44} weight="duotone" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#e1e7ef] bg-white p-6 shadow-xs lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          {status === "idle" && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#2463eb] dark:bg-blue-950/60 dark:text-blue-400">
                <Play size={30} weight="duotone" />
              </div>
              <h2 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-slate-50">
                Sẵn sàng thử thách 60 giây?
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
                6 câu hỏi chọn đáp án A/B/C/D tốc độ cao. Trả lời liên tiếp đúng sẽ nhân điểm Combo XP.
              </p>
              <button
                type="button"
                onClick={handleStart}
                data-testid="game-start-button"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2463eb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1d4ed8]"
              >
                <Play size={16} weight="fill" />
                <span>So tài ngay</span>
              </button>
            </div>
          )}

          {status === "playing" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#1d4ed8] dark:bg-blue-950/60 dark:text-blue-300">
                  {currentQ.category} · Câu {qIndex + 1}/{GAME_QUESTIONS.length}
                </span>
                <div className="flex items-center gap-4 font-mono text-xs font-bold tabular-nums">
                  <span className="flex items-center gap-1 text-amber-600">
                    <Fire size={15} weight="fill" />
                    Combo x{combo}
                  </span>
                  <span className="flex items-center gap-1 text-[#2463eb]">
                    <Timer size={15} weight="duotone" />
                    {timeLeft}s
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold leading-relaxed text-slate-900 dark:text-slate-100">
                {currentQ.prompt}
              </h3>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {currentQ.options.map((opt, idx) => {
                  const isPicked = picked === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  const showState = picked !== null;

                  return (
                    <motion.button
                      key={opt}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(idx)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                        !showState &&
                          "border-[#e1e7ef] bg-slate-50/70 hover:border-[#2463eb] hover:bg-[#eff6ff] dark:border-slate-800 dark:bg-slate-950",
                        showState &&
                          isCorrect &&
                          "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
                        showState &&
                          isPicked &&
                          !isCorrect &&
                          "border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                      )}
                    >
                      <span>
                        <strong className="mr-2 font-mono text-xs">
                          {String.fromCharCode(65 + idx)}.
                        </strong>
                        {opt}
                      </span>
                      {showState && isCorrect && (
                        <CheckCircle size={18} weight="fill" className="text-emerald-600" />
                      )}
                      {showState && isPicked && !isCorrect && (
                        <XCircle size={18} weight="fill" className="text-rose-600" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {picked !== null && (
                <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  {currentQ.explanationVi}
                </p>
              )}
            </div>
          )}

          {status === "finished" && (
            <div className="flex flex-col items-center py-8 text-center">
              <Trophy size={44} weight="duotone" className="text-amber-500" />
              <h2 className="mt-3 font-display text-xl font-bold text-slate-900 dark:text-slate-50">
                Tổng điểm vòng đấu: <NumberFlow value={score} /> XP
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tổng XP tích lũy hiện tại của bạn: {userXp + score} XP
              </p>
              <button
                type="button"
                onClick={handleStart}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2463eb] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
              >
                <ArrowCounterClockwise size={16} weight="bold" />
                <span>Chơi lại vòng mới</span>
              </button>
            </div>
          )}
        </div>

        {/* Weekly Leaderboard */}
        <aside className="rounded-2xl border border-[#e1e7ef] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Trophy size={18} weight="duotone" className="text-amber-500" />
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
              Bảng xếp hạng tuần
            </h2>
          </div>
          <div className="mt-3 space-y-2">
            {WEEKLY_LEADERBOARD.map((row) => (
              <div
                key={row.rank}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-xs",
                  row.isUser
                    ? "border border-[#2463eb]/20 bg-[#eff6ff] font-semibold text-[#1d4ed8] dark:bg-blue-950/40 dark:text-blue-300"
                    : "bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300"
                )}
              >
                <span>
                  #{row.rank} {row.name}
                </span>
                <span className="font-mono tabular-nums">
                  {row.isUser ? userXp : row.xp} XP
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
