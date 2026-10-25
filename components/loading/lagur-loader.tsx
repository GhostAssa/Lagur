"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Ring2 } from "@/components/loaders/uiball";
import { Sparkle, logoFont } from "@/components/brand/logo";
import ShinyText from "@/components/react-bits/ShinyText";
import { EASE, EASE_IN_OUT } from "@/lib/motion";

const LETTERS = "lagur".split("");
const PANEL = "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#04301C] to-[#06452A]";
const DOTS = { backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "7px 7px" };

function Decor() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0" style={DOTS} aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-[#19E57A]/25 blur-[120px]" aria-hidden="true" />
    </>
  );
}

function LoaderContent({ label = "Finding your next home" }: { label?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
      {/* Logo: each letter slides up out of a mask, then the sparkle pops in and twinkles */}
      <div className={`relative flex text-[clamp(64px,18vw,120px)] font-extrabold leading-none tracking-tight text-white ${logoFont.className}`} aria-hidden="true">
        {LETTERS.map((ch, i) => (
          <span key={i} className="-my-[0.14em] inline-block overflow-hidden py-[0.14em]">
            <motion.span
              className="inline-block"
              initial={reduce ? { opacity: 0 } : { y: "115%" }}
              animate={reduce ? { opacity: 1 } : { y: 0 }}
              transition={{ delay: 0.25 + i * 0.07, duration: 0.65, ease: EASE }}
            >
              {ch}
            </motion.span>
          </span>
        ))}
        <motion.span
          className="absolute -right-[0.4em] -top-[0.05em] text-[#3EE08F]"
          initial={{ scale: 0, rotate: -45, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.5, ease: EASE }}
        >
          <motion.span
            className="block"
            animate={reduce ? undefined : { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkle size={36} />
          </motion.span>
        </motion.span>
      </div>

      {/* UI Ball loader (Ring2) and a shiny label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5, ease: EASE }}
        className="flex flex-col items-center gap-4"
      >
        <Ring2 size={34} stroke={4} color="#19E57A" speed={0.9} />
        <ShinyText text={label} color="#9fd8b7" shineColor="#ffffff" speed={2.2} className="text-sm uppercase tracking-[0.2em]" />
      </motion.div>
    </div>
  );
}

/** Animated overlay: slides up from the bottom, then slides away upward. */
export function LagurLoader({ open, label }: { open: boolean; label?: string }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lagur-loader"
          role="status"
          aria-live="polite"
          aria-label="Loading Lagur"
          className={PANEL}
          initial={reduce ? { opacity: 0 } : { y: "100%" }}
          animate={reduce ? { opacity: 1 } : { y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: 0.55, ease: EASE_IN_OUT }}
        >
          <Decor />
          <LoaderContent label={label} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Static version for Next.js loading.tsx files (route-level Suspense fallback). */
export function LagurLoaderScreen({ label }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-label="Loading Lagur" className={PANEL}>
      <Decor />
      <LoaderContent label={label} />
    </div>
  );
}
