import { useState } from "react";
import { motion } from "motion/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Headphones,
  BookOpenText,
  Microphone,
  PencilSimpleLine,
  Cards,
  Exam,
  GraduationCap,
  GameController,
  Coffee,
  UsersThree,
  Info,
  MagnifyingGlass,
  UserCircle,
  List,
  X,
  Moon,
  Sun,
  CaretDown,
  ChartBar,
  Fire,
  Trophy,
  BookOpen,
  ChatCenteredText,
} from "@phosphor-icons/react";
import type { MainSection, UserProfile } from "../types/toeic";
import type { InfoModalTopic } from "./InfoModal";
import { cn } from "../lib/utils";

interface TopNavProps {
  activeSection: MainSection;
  onSelectSection: (section: MainSection) => void;
  onOpenCommand: () => void;
  onOpenAccount: () => void;
  onOpenReviewQueue: () => void;
  onOpenInfoTopic: (topic: InfoModalTopic) => void;
  onToggleTheme: () => void;
  profile: UserProfile;
}

const NAV_ITEMS: {
  id: MainSection;
  label: string;
  icon: typeof Headphones;
}[] = [
  { id: "listen", label: "Nghe", icon: Headphones },
  { id: "read", label: "Đọc", icon: BookOpenText },
  { id: "speak", label: "Nói", icon: Microphone },
  { id: "write", label: "Viết", icon: PencilSimpleLine },
  { id: "vocab", label: "Từ vựng", icon: Cards },
  { id: "test", label: "Test", icon: Exam },
  { id: "course", label: "Course", icon: GraduationCap },
  { id: "game", label: "Game", icon: GameController },
  { id: "cafe", label: "Café", icon: Coffee },
];

export function TopNav({
  activeSection,
  onSelectSection,
  onOpenCommand,
  onOpenAccount,
  onOpenReviewQueue,
  onOpenInfoTopic,
  onToggleTheme,
  profile,
}: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#e1e7ef] bg-white/95 shadow-xs backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-[65px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Emblem + Wordmark matching dauenglish.com */}
        <button
          type="button"
          onClick={() => onSelectSection("listen")}
          data-testid="brand-logo-button"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap font-display text-xl font-bold tracking-tight text-[#2463eb] transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2463eb] dark:text-blue-400"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2463eb] to-blue-500 text-white shadow-xs">
            <Headphones size={20} weight="duotone" />
          </span>
          <span className="hidden sm:inline">Duc English</span>
        </button>

        {/* Zone 2: Full Navigation matching dauenglish.com (9 sections + Cộng đồng + About us) */}
        <nav
          aria-label="Phân mục chính"
          className="hidden items-center gap-0.5 lg:flex"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                data-testid={`nav-${item.id}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-1.5 py-2 text-sm font-medium transition-colors xl:px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2463eb]",
                  isActive
                    ? "text-[#2463eb] dark:text-blue-400"
                    : "text-[#1f2937]/75 hover:bg-slate-100 hover:text-[#1f2937] dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="topNavActivePill"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-lg bg-[#2463eb]/10 dark:bg-blue-500/15"
                  />
                )}
                <Icon
                  size={16}
                  weight={isActive ? "duotone" : "regular"}
                  className="relative z-10 shrink-0"
                />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}

          {/* Cộng đồng Dropdown (matching dauenglish.com data-nav-menu="community") */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label="Cộng đồng"
                title="Cộng đồng"
                data-testid="nav-community"
                className="relative inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium text-[#1f2937]/75 transition-colors hover:bg-slate-100 hover:text-[#1f2937] xl:px-2.5 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                <UsersThree size={16} weight="duotone" />
                <CaretDown size={13} weight="bold" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={6}
                className="z-50 w-52 rounded-xl border border-[#e1e7ef] bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <DropdownMenu.Item
                  onSelect={() => onOpenInfoTopic("find-buddies")}
                  data-testid="menu-find-buddies"
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <UsersThree size={15} weight="duotone" className="text-[#2463eb]" />
                  <span>Tìm bạn học</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => onSelectSection("game")}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Trophy size={15} weight="duotone" className="text-amber-500" />
                  <span>Bảng xếp hạng tuần</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* About us Dropdown (matching dauenglish.com data-nav-menu="about") */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label="About us"
                title="About us"
                data-testid="nav-about"
                className="relative inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium text-[#1f2937]/75 transition-colors hover:bg-slate-100 hover:text-[#1f2937] xl:px-2.5 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                <Info size={16} weight="duotone" />
                <CaretDown size={13} weight="bold" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={6}
                className="z-50 w-52 rounded-xl border border-[#e1e7ef] bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <DropdownMenu.Item
                  onSelect={() => onOpenInfoTopic("founder")}
                  data-testid="menu-about-founder"
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Info size={15} weight="duotone" className="text-[#2463eb]" />
                  <span>Giới thiệu Duc English</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => onOpenInfoTopic("materials")}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <BookOpen size={15} weight="duotone" className="text-emerald-600" />
                  <span>Tài liệu TOEIC</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => onOpenInfoTopic("feedback")}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <ChatCenteredText size={15} weight="duotone" className="text-amber-600" />
                  <span>Góp ý &amp; Đề xuất</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </nav>

        {/* Zone 3: Theme Toggle + Search + Account Button */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenCommand}
            aria-label="Tìm nhanh bộ đề (Ctrl+K)"
            title="Tìm nhanh bộ đề (Ctrl+K)"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-[#eff6ff] hover:text-[#2463eb] dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <MagnifyingGlass size={17} weight="duotone" />
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Chọn chế độ giao diện"
            title={profile.theme === "dark" ? "Chuyển giao diện Sáng" : "Chuyển giao diện Tối"}
            data-testid="theme-toggle-button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-[#eff6ff] hover:text-[#2463eb] dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {profile.theme === "dark" ? (
              <Sun size={18} weight="duotone" className="text-amber-500" />
            ) : (
              <Moon size={18} weight="duotone" />
            )}
          </button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                data-testid="account-button"
                className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-gradient-to-r from-[#2463eb] to-blue-500 px-3 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2463eb]"
              >
                <UserCircle size={17} weight="duotone" className="shrink-0" />
                <span className="hidden max-w-[112px] truncate sm:inline">
                  {profile.displayName}
                </span>
                <span className="sm:hidden">Tài khoản</span>
                <CaretDown size={12} weight="bold" className="shrink-0" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 w-56 rounded-xl border border-[#e1e7ef] bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="border-b border-slate-100 px-3 py-2 text-xs dark:border-slate-800">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {profile.displayName}
                  </p>
                  <p className="mt-0.5 font-mono text-slate-500 tabular-nums">
                    Mục tiêu {profile.targetScore} · {profile.xp} XP
                  </p>
                </div>

                <DropdownMenu.Item
                  onSelect={onOpenAccount}
                  data-testid="menu-open-account"
                  className="mt-1 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <ChartBar size={15} weight="duotone" className="text-[#2463eb]" />
                  <span>Hồ sơ &amp; Thống kê tiến độ</span>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onSelect={() => onSelectSection("vocab")}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Cards size={15} weight="duotone" className="text-emerald-600" />
                  <span>Giỏ từ vựng cá nhân</span>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onSelect={onOpenReviewQueue}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Fire size={15} weight="duotone" className="text-rose-600" />
                  <span>Câu cần luyện lại</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Mở menu điều hướng"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#e1e7ef] text-slate-700 lg:hidden dark:border-slate-800 dark:text-slate-200"
          >
            {mobileMenuOpen ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#e1e7ef] bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="grid grid-cols-3 gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-center text-xs font-semibold transition-colors",
                    activeSection === item.id
                      ? "bg-[#2463eb]/10 text-[#2463eb] dark:bg-blue-950/60 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                  )}
                >
                  <Icon
                    size={17}
                    weight={activeSection === item.id ? "duotone" : "regular"}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 flex items-center gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                onOpenInfoTopic("find-buddies");
                setMobileMenuOpen(false);
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <UsersThree size={14} weight="duotone" />
              <span>Cộng đồng</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenInfoTopic("founder");
                setMobileMenuOpen(false);
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <Info size={14} weight="duotone" />
              <span>About us</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
