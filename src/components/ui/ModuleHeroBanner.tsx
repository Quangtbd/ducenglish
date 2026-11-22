import { motion } from "motion/react";
import { Sparkle, MagnifyingGlass, Microphone } from "@phosphor-icons/react";
import type { ElementType } from "react";
import { cn } from "../../lib/utils";

export interface BannerPill {
  id: string;
  label: string;
}

export interface ModuleHeroBannerProps {
  kicker: string;
  titleLeading: string;
  titleHighlight: string;
  titleTrailing?: string;
  description: string;
  icon: ElementType;
  pills?: BannerPill[];
  activePill?: string;
  onSelectPill?: (id: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: () => void;
  children?: React.ReactNode;
}

export function ModuleHeroBanner({
  kicker,
  titleLeading,
  titleHighlight,
  titleTrailing,
  description,
  icon: Icon,
  pills,
  activePill,
  onSelectPill,
  searchPlaceholder,
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  children,
}: ModuleHeroBannerProps) {
  return (
    <div className="space-y-4">
      {/* 1. Large Rounded Hero Card matching Screenshot 1 */}
      <section
        data-testid="module-hero-banner"
        className="relative overflow-hidden rounded-2xl border border-[#2463eb]/15 bg-[#eff6ff]/70 px-6 py-6 md:px-8 md:py-7 dark:border-blue-900/50 dark:bg-blue-950/30"
      >
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0 flex-1">
            {/* Sparkle Kicker Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2463eb]/20 bg-white/95 px-3 py-1 text-xs font-semibold text-[#2463eb] shadow-2xs dark:border-blue-800 dark:bg-slate-900 dark:text-blue-400">
              <Sparkle size={14} weight="duotone" className="text-[#2463eb]" />
              <span>{kicker}</span>
            </span>

            {/* Big Headline with Highlighted Gradient Text */}
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#1f2937] sm:text-3xl lg:text-4xl dark:text-slate-50">
              {titleLeading}{" "}
              <span className="bg-gradient-to-r from-[#2463eb] to-blue-500 bg-clip-text text-transparent">
                {titleHighlight}
              </span>{" "}
              {titleTrailing}
            </h1>

            {/* Description */}
            <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
              {description}
            </p>
          </div>

          {/* Right Sized Squircle Icon Container matching Screenshot 1 */}
          <div
            data-testid="banner-icon-badge"
            className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#2463eb] text-white shadow-lg shadow-[#2463eb]/25 transition-transform duration-300 hover:scale-105 md:flex lg:h-24 lg:w-24"
          >
            <Icon size={46} weight="duotone" />
          </div>
        </div>
      </section>

      {/* 2. Sub-Category Pill Navigation Bar */}
      {pills && pills.length > 0 && onSelectPill && (
        <div className="flex flex-wrap items-center gap-1.5">
          <div
            role="tablist"
            className="inline-flex flex-wrap items-center gap-1 rounded-full border border-[#2463eb]/10 bg-[#2463eb]/5 p-1"
          >
            {pills.map((pill) => {
              const active = activePill === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectPill(pill.id)}
                  data-testid={`banner-pill-${pill.id}`}
                  className={cn(
                    "relative shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                    active
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="bannerActivePillIndicator"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-[#2463eb] shadow-2xs"
                    />
                  )}
                  <span className="relative z-10">{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Search / Action Bar matching Screenshot 1 */}
      {searchPlaceholder && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearchSubmit?.()}
              placeholder={searchPlaceholder}
              data-testid="banner-search-input"
              className="h-11 w-full rounded-full border border-slate-200 bg-white px-5 pr-20 text-sm text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition-colors focus:border-[#2463eb] focus:ring-2 focus:ring-[#2463eb]/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            />
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
              <button
                type="button"
                onClick={onSearchSubmit}
                aria-label="Tìm kiếm"
                className="cursor-pointer text-slate-400 transition-colors hover:text-[#2463eb] dark:hover:text-blue-400"
              >
                <MagnifyingGlass size={18} weight="bold" />
              </button>
              <button
                type="button"
                aria-label="Tìm bằng giọng nói"
                className="cursor-pointer text-slate-400 transition-colors hover:text-[#2463eb] dark:hover:text-blue-400"
              >
                <Microphone size={18} weight="duotone" />
              </button>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
