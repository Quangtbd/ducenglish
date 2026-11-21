import { useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import {
  INITIAL_VOCAB_DECK,
  TOEIC_LISTENING_QUESTIONS,
  TOEIC_TEST_SETS,
} from "./data/toeicDataset";
import { THEMATIC_LISTENING_SETS } from "./data/thematicListeningSets";
import {
  db,
  getUserProfile,
  saveUserProfile,
} from "./lib/db";
import type {
  DictationMode,
  ListeningQuestion,
  MainSection,
  ToeicPart,
  UserProfile,
} from "./types/toeic";
import { TopNav } from "./components/TopNav";
import { CommandSearchModal } from "./components/CommandSearchModal";
import { AccountModal } from "./components/AccountModal";
import { InfoModal, type InfoModalTopic } from "./components/InfoModal";
import { ListeningHub } from "./components/ListeningHub";
import { ReadingModule } from "./components/ReadingModule";
import { SpeakingModule } from "./components/SpeakingModule";
import { WritingModule } from "./components/WritingModule";
import { VocabModule } from "./components/VocabModule";
import { MockTestModule } from "./components/MockTestModule";
import { CourseModule } from "./components/CourseModule";
import { GameModule } from "./components/GameModule";
import { CafeModule } from "./components/CafeModule";

const queryClient = new QueryClient();

function DucEnglishShell() {
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState<MainSection>("listen");
  const [profile, setProfile] = useState<UserProfile>(() => getUserProfile());
  const [commandOpen, setCommandOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [infoTopic, setInfoTopic] = useState<InfoModalTopic>(null);
  const [listenViewMode, setListenViewMode] = useState<"matrix" | "review">("matrix");
  const [activeStudioSession, setActiveStudioSession] = useState<{
    title: string;
    questions: ListeningQuestion[];
    initialIndex: number;
    defaultMode?: DictationMode;
  } | null>(null);

  // Apply light/dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (profile.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [profile.theme]);

  // Seed initial vocab deck once into Dexie
  useEffect(() => {
    db.vocab.count().then((count) => {
      if (count === 0) {
        const now = Date.now();
        db.vocab.bulkAdd(
          INITIAL_VOCAB_DECK.map((item, idx) => ({
            ...item,
            createdAt: now + idx,
          }))
        ).then(() => qc.invalidateQueries({ queryKey: ["duc-vocab"] }));
      }
    });
  }, [qc]);

  const { data: attempts = [] } = useQuery({
    queryKey: ["duc-attempts"],
    queryFn: () => db.attempts.toArray(),
  });

  const { data: reviewQueue = [] } = useQuery({
    queryKey: ["duc-review"],
    queryFn: () => db.reviewQueue.toArray(),
  });

  const { data: vocabList = [] } = useQuery({
    queryKey: ["duc-vocab"],
    queryFn: () => db.vocab.toArray(),
  });

  const { data: customQuestions = [] } = useQuery({
    queryKey: ["duc-custom-questions"],
    queryFn: () => db.customQuestions.toArray(),
  });

  const allListeningQuestions = [
    ...TOEIC_LISTENING_QUESTIONS,
    ...THEMATIC_LISTENING_SETS.flatMap((s) => s.questions),
    ...customQuestions,
  ];

  const refreshLocalStores = () => {
    qc.invalidateQueries({ queryKey: ["duc-attempts"] });
    qc.invalidateQueries({ queryKey: ["duc-review"] });
    qc.invalidateQueries({ queryKey: ["duc-vocab"] });
    qc.invalidateQueries({ queryKey: ["duc-custom-questions"] });
  };

  const handleUpdateProfile = (values: Partial<UserProfile>) => {
    const next = saveUserProfile(values);
    setProfile(next);
  };

  const handleJumpToTest = (testId: string, part: ToeicPart = 1) => {
    const test = TOEIC_TEST_SETS.find((t) => t.id === testId);
    const list = allListeningQuestions
      .filter((q) => q.testId === testId && q.part === part)
      .sort((a, b) => a.order - b.order);
    const fallback = allListeningQuestions
      .filter((q) => q.testId === testId)
      .sort((a, b) => a.order - b.order);
    setActiveSection("listen");
    setActiveStudioSession({
      title: `${test?.title ?? "Bài luyện"} · Part ${part}`,
      questions: list.length > 0 ? list : fallback,
      initialIndex: 0,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <TopNav
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          if (sec !== "listen") {
            setActiveStudioSession(null);
          }
        }}
        onOpenCommand={() => setCommandOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
        onOpenReviewQueue={() => {
          setActiveSection("listen");
          setActiveStudioSession(null);
          setListenViewMode("review");
        }}
        onOpenInfoTopic={(topic) => setInfoTopic(topic)}
        onToggleTheme={() =>
          handleUpdateProfile({
            theme: profile.theme === "dark" ? "light" : "dark",
          })
        }
        profile={profile}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {activeSection === "listen" && (
          <ListeningHub
            tests={TOEIC_TEST_SETS}
            questions={allListeningQuestions}
            attempts={attempts}
            reviewQueue={reviewQueue}
            profile={profile}
            activeStudioSession={activeStudioSession}
            onStartStudio={(title, questions, initialIndex = 0, defaultMode) =>
              setActiveStudioSession({ title, questions, initialIndex, defaultMode })
            }
            onExitStudio={() => setActiveStudioSession(null)}
            onUpdateProfile={handleUpdateProfile}
            onDataChanged={refreshLocalStores}
            viewMode={listenViewMode}
            onChangeViewMode={setListenViewMode}
          />
        )}

        {activeSection === "read" && <ReadingModule />}
        {activeSection === "speak" && <SpeakingModule />}
        {activeSection === "write" && <WritingModule />}
        {activeSection === "vocab" && (
          <VocabModule vocabList={vocabList} onDataChanged={refreshLocalStores} />
        )}
        {activeSection === "test" && <MockTestModule />}
        {activeSection === "course" && (
          <CourseModule
            onNavigateSection={(sec) => {
              setActiveSection(sec);
              setActiveStudioSession(null);
            }}
          />
        )}
        {activeSection === "game" && (
          <GameModule
            userXp={profile.xp}
            onAddXp={(delta) => handleUpdateProfile({ xp: profile.xp + delta })}
          />
        )}
        {activeSection === "cafe" && <CafeModule />}
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <span className="font-display font-semibold text-slate-700 dark:text-slate-300">
            Duc English · Hệ thống luyện thi TOEIC 4 kỹ năng
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveSection("listen")}
              className="hover:text-slate-900 dark:hover:text-slate-100"
            >
              Nghe chép chính tả
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("game")}
              className="hover:text-slate-900 dark:hover:text-slate-100"
            >
              Game
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("cafe")}
              className="hover:text-slate-900 dark:hover:text-slate-100"
            >
              Duc Café
            </button>
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-100"
            >
              Sao lưu tiến độ
            </button>
          </div>
        </div>
      </footer>

      <CommandSearchModal
        open={commandOpen}
        onOpenChange={setCommandOpen}
        tests={TOEIC_TEST_SETS}
        onJumpToTest={handleJumpToTest}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          setActiveStudioSession(null);
        }}
        onOpenReviewQueue={() => {
          setActiveSection("listen");
          setActiveStudioSession(null);
          setListenViewMode("review");
        }}
      />

      <AccountModal
        open={accountOpen}
        onOpenChange={setAccountOpen}
        profile={profile}
        attempts={attempts}
        reviewCount={reviewQueue.length}
        vocabCount={vocabList.length}
        onSaveProfile={handleUpdateProfile}
        onImported={() => {
          setProfile(getUserProfile());
          refreshLocalStores();
        }}
      />

      <InfoModal topic={infoTopic} onClose={() => setInfoTopic(null)} />

      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Tooltip.Provider delayDuration={180}>
        <QueryClientProvider client={queryClient}>
          <DucEnglishShell />
        </QueryClientProvider>
      </Tooltip.Provider>
    </MotionConfig>
  );
}
