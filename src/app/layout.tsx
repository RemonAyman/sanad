import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "سند - Sanad | منصة آمنة للأطفال ضد التنمر والعنف والدعم النفسي",
  description: "سند منصة آمنة وموثوقة للأطفال للتحدث بحرية والتعبير عن مشاعرهم والحصول على دعم نفسي واجتماعي. مساحة أمان ضد التنمر والعنف والإساءة",
  keywords: [
    "سند",
    "Sanad",
    "منصة آمنة للأطفال",
    "مساحة أمان",
    "دعم الأطفال",
    "مواجهة التنمر",
    "مكافحة التنمر",
    "anti-bullying",
    "صديق الطفل",
    "دعم نفسي للأطفال",
    "حماية الأطفال من العنف",
    "موقع يساعد الأطفال",
    "منصة أطفال",
    "سلامة الأطفال",
    "كلام الأطفال",
    "chat kids safe",
    "safe space for children",
  ],
  authors: [{ name: "فريق سند" }],
  creator: "Sanad Team",
  publisher: "Sanad",
  robots: "index, follow",
  alternates: {
    canonical: "https://sanad.serveirc.com",
    languages: {
      "ar": "https://sanad.serveirc.com",
      "en": "https://sanad.serveirc.com",
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: "https://sanad.serveirc.com",
    title: "سند - منصة آمنة للأطفال ضد التنمر والعنف",
    description: "سند منصة تفاعلية آمنة توفر مساحة أمان للأطفال للتحدث بحرية والحصول على دعم نفسي واجتماعي وحماية من التنمر والعنف",
    siteName: "سند - Sanad",
    images: [
      {
        url: "https://sanad.serveirc.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "سند - منصة آمنة للأطفال",
        type: "image/png",
      },
      {
        url: "https://sanad.serveirc.com/og-image-square.png",
        width: 800,
        height: 800,
        alt: "سند - Sanad",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "سند - منصة آمنة للأطفال",
    description: "مساحة أمان للأطفال للتحدث بحرية والحصول على دعم ضد التنمر والعنف",
    images: ["https://sanad.serveirc.com/twitter-image.png"],
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#4F46E5",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": "https://sanad.serveirc.com",
    name: "سند - Sanad",
    description: "منصة آمنة للأطفال للتحدث بحرية والحصول على دعم ضد التنمر والعنف",
    url: "https://sanad.serveirc.com",
    applicationCategory: "EducationalApplication",
    inLanguage: ["ar", "en"],
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "EGP",
      price: "0",
    },
    creator: {
      "@type": "Organization",
      name: "فريق سند",
      url: "https://sanad.serveirc.com",
    },
    provider: {
      "@type": "Organization",
      name: "سند",
      url: "https://sanad.serveirc.com",
      logo: "https://sanad.serveirc.com/logo.png",
    },
    potentialAction: [
      {
        "@type": "CommunicateAction",
        name: "دردشة آمنة",
        target: "https://sanad.serveirc.com/chat",
      },
      {
        "@type": "ReserveAction",
        name: "احجز جلسة",
        target: "https://sanad.serveirc.com/booking",
      },
    ],
  };

  return (
    <html lang="ar" dir="rtl" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        
        {/* Alternative Language Links */}
        <link rel="alternate" hrefLang="ar-SA" href="https://sanad.serveirc.com" />
        <link rel="alternate" hrefLang="en" href="https://sanad.serveirc.com" />
        <link rel="alternate" hrefLang="x-default" href="https://sanad.serveirc.com" />
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
