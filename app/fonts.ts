import localFont from "next/font/local";
import { Anybody, Comic_Neue, Outfit, Plus_Jakarta_Sans } from "next/font/google";

// If the local file is unavailable, swap this export for:
// export const heading = Anybody({ subsets: ["latin", "latin-ext", "vietnamese"], weight: "800", display: "swap", variable: "--font-anybody" });
export const heading = localFont({
  src: "../public/fonts/Maragsa-Display.otf",
  display: "swap",
  weight: "400",
  variable: "--font-maragsa",
  adjustFontFallback: false,
});

export const anybody = Anybody({ subsets: ["latin", "latin-ext", "vietnamese"], weight: "800", display: "swap", variable: "--font-anybody" });
export const body = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext", "vietnamese"], weight: ["400", "500", "600"], display: "swap", variable: "--font-plus-jakarta" });
export const accent = Comic_Neue({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-comic-neue" });
export const logoFont = Outfit({ subsets: ["latin"], weight: "800", display: "swap", variable: "--font-outfit" });
