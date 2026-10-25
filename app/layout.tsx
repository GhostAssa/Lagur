import type { Metadata } from "next";
import "./globals.css";
import ClickSpark from "@/components/react-bits/ClickSpark";
import { LoadingProvider } from "@/components/loading/loading-provider";
import ClientMotion from "./client-motion";
import { accent, anybody, body, heading, logoFont } from "./fonts";

export const metadata: Metadata = {
  title: "Lagur — Find your next home without the walking",
  description: "Search verified property listings across Nigeria and arrange an inspection in one conversation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${heading.variable} ${anybody.variable} ${body.variable} ${accent.variable} ${logoFont.variable}`}>
      <body className="font-sans">
        <ClientMotion />
        <ClickSpark sparkColor={["#19E57A", "#00A651"]} sparkCount={10} sparkRadius={28} sparkSize={12} shape="star" duration={600} glow={0.4} className="min-h-dvh">
          <LoadingProvider>{children}</LoadingProvider>
        </ClickSpark>
      </body>
    </html>
  );
}
