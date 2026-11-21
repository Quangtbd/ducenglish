import { Component, type ReactNode, useEffect, useState } from "react";
import { DotLottieReact, setWasmUrl } from "@lottiefiles/dotlottie-react";
import { motion } from "motion/react";
import { CheckCircle, Fire } from "@phosphor-icons/react";

// Self-contained minimal Lottie JSON burst/ring animation (no external CDN dependency)
const SUCCESS_BURST_LOTTIE = JSON.stringify({
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 60,
  w: 80,
  h: 80,
  nm: "SuccessBurst",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Ring",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [100] },
            { t: 45, s: [0] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [40, 40, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [40, 40, 100] },
            { t: 45, s: [135, 135, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [52, 52] },
          nm: "Circle",
        },
        {
          ty: "st",
          c: { a: 0, k: [0.06, 0.72, 0.5, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 4 },
          nm: "Stroke",
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
  ],
});

let wasmConfigured = false;

class LottieBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

interface LottieCelebrationProps {
  comboStreak: number;
}

export function LottieCelebration({ comboStreak }: LottieCelebrationProps) {
  const [canRenderLottie, setCanRenderLottie] = useState(false);

  useEffect(() => {
    try {
      if (!wasmConfigured) {
        setWasmUrl("/api/dotlottie-wasm");
        wasmConfigured = true;
      }
      setCanRenderLottie(true);
    } catch {
      setCanRenderLottie(false);
    }
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.75, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      data-testid="lottie-celebration"
      className="relative inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/90 px-3 py-1.5 shadow-xs dark:border-emerald-800 dark:bg-slate-900"
    >
      <div className="relative flex h-8 w-8 items-center justify-center">
        {canRenderLottie && (
          <LottieBoundary>
            <div className="pointer-events-none absolute inset-0">
              <DotLottieReact
                data={SUCCESS_BURST_LOTTIE}
                autoplay
                loop={false}
                className="h-8 w-8"
              />
            </div>
          </LottieBoundary>
        )}
        <CheckCircle
          size={22}
          weight="duotone"
          className="relative z-10 text-emerald-600"
        />
      </div>
      <div className="text-xs leading-tight">
        <p className="font-bold text-emerald-700 dark:text-emerald-300">
          Chuẩn xác!
        </p>
        {comboStreak > 1 && (
          <p className="flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-600 tabular-nums">
            <Fire size={12} weight="fill" />
            <span>Combo x{comboStreak}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
}
