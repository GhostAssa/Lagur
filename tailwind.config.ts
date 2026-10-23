import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101010", vivid: "#00A651", link: "#007A3D", neon: "#19E57A", "neon-deep": "#00C95F", glow: "#3DFF9A",
        "mint-0": "#F0FFF6", "mint-1": "#CFF9E0", "mint-2": "#9BF0BF", deep: "#04301C", "deep-2": "#06452A",
        card: "#EEEEEE", chip: "#E3E3E3", "chip-border": "#CECECE", white: "#FFFFFF",
      },
      fontFamily: {
        heading: ["var(--font-heading-stack)", "system-ui", "sans-serif"],
        sans: ["var(--font-plus-jakarta)", "Arial", "sans-serif"],
        accent: ["var(--font-comic-neue)", "cursive"],
        logo: ["var(--font-outfit)", "sans-serif"],
      },
      borderRadius: { hero: "40px", card: "32px", media: "28px" },
      boxShadow: { nav: "0 8px 30px rgba(16,16,16,0.08)" },
    },
  },
} satisfies Config;
