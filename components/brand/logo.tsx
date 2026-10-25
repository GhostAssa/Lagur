import { Outfit } from "next/font/google";

// Exported so the loading screen uses the same font instance.
export const logoFont = Outfit({ subsets: ["latin"], weight: ["800"], display: "swap" });

/** Four-point sparkle. Pass a colour with a text-* class on the parent. */
export function Sparkle({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 0C12.8 7.2 16.8 11.2 24 12C16.8 12.8 12.8 16.8 12 24C11.2 16.8 7.2 12.8 0 12C7.2 11.2 11.2 7.2 12 0Z" />
    </svg>
  );
}

/**
 * Lagur wordmark. variant="dark" is for light backgrounds (ink text, green sparkle).
 * variant="light" is for dark backgrounds (white text, neon sparkle).
 * Size it with a font-size class, for example className="text-3xl".
 */
export function Logo({ variant = "dark", className = "" }: { variant?: "dark" | "light"; className?: string }) {
  const light = variant === "light";
  return (
    <span className={`relative inline-flex leading-none ${logoFont.className} ${className}`} aria-label="Lagur">
      <span aria-hidden="true" className={`font-extrabold lowercase tracking-tight ${light ? "text-white" : "text-[#101010]"}`}>lagur</span>
      <span aria-hidden="true" className={`absolute -right-[0.5em] -top-[0.2em] flex ${light ? "text-[#3EE08F]" : "text-[#00A651]"}`}>
        <Sparkle size={14} className="size-[0.55em]" />
        <Sparkle size={8} className="-ml-[0.1em] -mt-[0.25em] size-[0.28em]" />
      </span>
    </span>
  );
}

export default Logo;
