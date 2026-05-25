import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "منصة سند | مساحة أمان للأطفال 🌟",
  description: "منصة آمنة وسعيدة للأطفال للتحدث بحرية والتعبير عن مشاعرهم والحصول على دعم نفسي واجتماعي.",
  keywords: ["سند", "مساحة أمان", "دعم الأطفال", "مواجهة التنمر", "صديق الطفل"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-[#FCFAFF] text-[#2D3748] antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
