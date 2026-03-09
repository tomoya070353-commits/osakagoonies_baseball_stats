import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "野球成績ダッシュボード",
  description: "草野球チームの打席データを分析・可視化するモバイル特化型BIアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${inter.variable} dark`}>
      <body className="min-h-dvh bg-[#080e14] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
