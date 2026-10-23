import type { Metadata } from "next";
import "./globals.css";
import ClientMotion from "./client-motion";
import { accent, anybody, body, heading, logoFont } from "./fonts";

export const metadata: Metadata = {
  title: "Lagur — Find your next home without the walking",
  description: "Search verified property listings across Nigeria and arrange an inspection in one conversation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${heading.variable} ${anybody.variable} ${body.variable} ${accent.variable} ${logoFont.variable}`}><body><ClientMotion />{children}</body></html>;
}
