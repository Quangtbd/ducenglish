import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import {
  Exam,
  Timer,
  SpeakerHigh,
  CheckCircle,
  ArrowCounterClockwise,
  Flag,
} from "@phosphor-icons/react";
import { MOCK_TEST_EXAMS } from "../data/toeicDataset";
import { speakWithBrowserFallback } from "../lib/audioService";
import { cn, formatDuration } from "../lib/utils";
import { ModuleHeroBanner } from "./ui/ModuleHeroBanner";

export function MockTestModule() {
  const [examId, setExamId] = useState(MOCK_TEST_EXAMS[0].id);
  const exam =
    MOCK_TEST_EXAMS.find((e) => e.id === examId) ?? MOCK_TEST_EXAMS[0];

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(exam.durationMinutes * 60);

  useEffect(() => {
    setAnswers({});
    setFlagged({});
    setSubmitted(false);
    setSecondsLeft(exam.durationMinutes * 60);
  }, [exam.id, exam.durationMinutes]);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const correctCount = exam.items.filter(
    (item) => answers[item.id] === item.correctIndex
  ).length;

  const partBreakdown = useMemo(() => {
    const map = new Map<number, { part: number; correct: number; total: number }>();
    for (const item of exam.items) {
      const curr = map.get(item.part) ?? { part: item.part, correct: 0, total: 0 };
      curr.total += 1;
      if (answers[item.id] === item.correctIndex) curr.correct += 1;
      map.set(item.part, curr);
    }
    return Array.from(map.values()).sort((a, b) => a.part - b.part);
  }, [exam.items, answers]);

  const handleSubmit = () => {
    setSubmitted(true);
    if (correctCount >= Math.ceil(exam.items.length * 0.7)) {
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.65 } });
    }
  };

  const handleReset = () => {
    setAnswers({});
    setFlagged({});
    setSubmitted(false);
    setSecondsLeft(exam.durationMinutes * 60);
  };

  const toggleFlag = (itemId: string) => {
    setFlagged((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  return (
    <div className="space-y-6">
      <ModuleHeroBanner
        kicker="Thi thử TOEIC Online"
        titleLeading="Đo lường năng lực"
        titleHighlight="chuẩn xác như thi thật"
        titleTrailing="tại IIG"
        description="Đầy đủ các định dạng Mini Test, Full Test và bài thi rút gọn, bấm giờ thời gian thực và phân tích điểm số từng Part."
        icon={Exam}
        pills={MOCK_TEST_EXAMS.map((ex) => ({
          id: ex.id,
          label: `${ex.type} (${ex.questionsCount} câu)`,
        }))}
        activePill={examId}
        onSelectPill={(id) => setExamId(id)}
        searchPlaceholder="Tìm kiếm mã đề thi thử hoặc năm xuất bản..."
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
            {exam.title}
          </h2>
          <p className="text-xs text-slate-500">
            Thời lượng: {exam.durationMinutes} phút · Số câu: {exam.questionsCount}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-sm font-bold text-slate-900 tabular-nums dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
            <Timer size={16} className="text-blue-600" />
            <span>{formatDuration(secondsLeft)}</span>
          </div>

          {!submitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Nộp bài thi
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
            >
              <ArrowCounterClockwise size={14} />
              <span>Làm lại</span>
            </button>
          )}
        </div>
      </div>

      {submitted && (
        <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={26} weight="fill" className="text-emerald-600" />
              <div>
                <p className="font-display text-base font-bold">
                  Kết quả bài thi thử: {correctCount}/{exam.items.length} câu đúng
                </p>
                <p className="text-xs opacity-80">
                  Điểm quy đổi ước lượng:{" "}
                  <span className="font-mono font-bold tabular-nums">
                    {Math.round(350 + (correctCount / exam.items.length) * 600)}
                  </span>{" "}
                  / 990
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            {partBreakdown.map((pb) => {
              const pct = Math.round((pb.correct / pb.total) * 100);
              return (
                <div
                  key={pb.part}
                  className="rounded-lg bg-white/90 p-3 text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>Part {pb.part}</span>
                    <span className="font-mono tabular-nums">
                      {pb.correct}/{pb.total}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full bg-emerald-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {exam.items.map((item, idx) => {
            const picked = answers[item.id];
            const isFlagged = Boolean(flagged[item.id]);
            return (
              <div
                key={item.id}
                id={`exam-q-${idx + 1}`}
                className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Câu {idx + 1} · {item.section} Part {item.part}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFlag(item.id)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors",
                        isFlagged
                          ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700"
                      )}
                    >
                      <Flag size={12} weight={isFlagged ? "fill" : "regular"} />
                      <span>{isFlagged ? "Đã gắn cờ" : "Phân vân"}</span>
                    </button>
                    {item.spokenText && (
                      <button
                        type="button"
                        onClick={() =>
                          speakWithBrowserFallback(item.spokenText!, 0.95)
                        }
                        className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                      >
                        <SpeakerHigh size={14} weight="fill" />
                        <span>Nghe audio</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-2.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {item.prompt}
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {item.options.map((opt, optIdx) => {
                    const isPicked = picked === optIdx;
                    const isRight = optIdx === item.correctIndex;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => {
                          if (!submitted) {
                            setAnswers((prev) => ({
                              ...prev,
                              [item.id]: optIdx,
                            }));
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                          submitted && isRight
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                            : submitted && isPicked && !isRight
                            ? "border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
                            : isPicked
                            ? "border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100"
                            : "border-slate-200 hover:bg-slate-50 dark:border-slate-800"
                        )}
                      >
                        <span className="font-mono font-bold">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                    <strong>Giải thích:</strong> {item.explanationVi}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Answer Sheet Sidebar */}
        <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
              Phiếu trả lời (Answer Sheet)
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Ô vàng là câu đang gắn cờ phân vân.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {exam.items.map((item, idx) => {
              const answered = answers[item.id] !== undefined;
              const isFlagged = Boolean(flagged[item.id]);
              const right = submitted && answers[item.id] === item.correctIndex;
              return (
                <a
                  key={item.id}
                  href={`#exam-q-${idx + 1}`}
                  className={cn(
                    "rounded-lg border py-2 text-center font-mono text-xs font-semibold tabular-nums transition-colors",
                    submitted
                      ? right
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-rose-400 bg-rose-50 text-rose-700"
                      : isFlagged
                      ? "border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                      : answered
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 dark:border-slate-700"
                  )}
                >
                  #{idx + 1}
                </a>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
