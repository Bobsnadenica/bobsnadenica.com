import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"], // Crucial: Added Cyrillic subset for Bulgarian text
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

// PROFESSIONAL SEO METADATA
export const metadata: Metadata = {
  title: "Сравни Цените | Интелигентно пазаруване",
  description: "Намерете най-изгодните цени на хранителни стоки във вашия град. Сравнете супермаркетите и спестете пари от ежедневни покупки.",
  keywords: "цени, супермаркети, сравнение, калкулатор, България, пазаруване, Кауфланд, Лидл, Билла",
  authors: [{ name: "Bob Snadenica" }],
  openGraph: {
    title: "Сравни Цените | Интелигентно пазаруване",
    description: "Намерете най-изгодните цени на хранителни стоки във вашия град.",
    type: "website",
    locale: "bg_BG",
    siteName: "Сравни Цените",
  },
  appleWebApp: {
    title: "Сравни Цените",
    statusBarStyle: "default",
    capable: true,
  }
};

// VIEWPORT EXPORT (Required in Next.js 14+ for Production)
export const viewport: Viewport = {
  themeColor: "#f8fafc", // Tailwind slate-50 to match background perfectly
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents annoying UI zooming when tapping inputs on iOS
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-200 selection:text-blue-900 scroll-smooth`}
      >
        {children}
      </body>
    </html>
  );
}