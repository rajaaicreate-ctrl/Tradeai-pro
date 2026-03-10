import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeAI Pro - AI-Powered Trading Intelligence Platform",
  description: "Professional AI-powered trading platform with real-time market analysis, intelligent alerts, and comprehensive portfolio management. Trade smarter with AI insights.",
  keywords: ["TradeAI", "Trading", "AI", "Stock Market", "Forex", "Crypto", "Portfolio Management", "Market Analysis", "Trading Signals"],
  authors: [{ name: "TradeAI Pro Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "TradeAI Pro - AI-Powered Trading Intelligence",
    description: "Professional AI-powered trading platform with real-time market analysis",
    url: "https://tradeai-live.vercel.app",
    siteName: "TradeAI Pro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeAI Pro",
    description: "AI-powered trading intelligence platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
