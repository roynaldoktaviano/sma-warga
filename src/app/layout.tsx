import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import Toaster from "@/components/Toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "SMP Warga Surakarta — Sistem Poin & Karakter Siswa",
  description: "Sistem poin & karakter siswa SMP Warga Surakarta.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${GeistMono.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
