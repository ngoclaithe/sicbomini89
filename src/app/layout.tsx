import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Game Tài Xỉu Online",
  description: "Trải nghiệm game tài xỉu trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {children}
        <Toaster />
        {/* Realtime chat across app */}
        {/* eslint-disable-next-line react/jsx-no-undef */}
        {/* We import dynamically below to avoid SSR issues */}
      </body>
    </html>
  );
}
