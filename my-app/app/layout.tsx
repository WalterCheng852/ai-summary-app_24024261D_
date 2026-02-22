import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { RootClientProviders } from "./providers";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-source-serif-4",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Summary - Minimalist Document Summarization",
  description: "Transform your documents with AI-powered summaries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK" style={{
      ["--font-display" as any]: playfairDisplay.style.fontFamily,
      ["--font-body" as any]: sourceSerif4.style.fontFamily,
      ["--font-mono" as any]: jetbrainsMono.style.fontFamily,
    }}>
      <body
        suppressHydrationWarning
        className={`${playfairDisplay.variable} ${sourceSerif4.variable} ${jetbrainsMono.variable}`}
      >
        <RootClientProviders>{children}</RootClientProviders>
      </body>
    </html>
  );
}
