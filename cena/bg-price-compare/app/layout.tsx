import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// PROFESSIONAL SEO METADATA
export const metadata: Metadata = {
  title: "Сравни Цените | Интелигентно пазаруване",
  description: "Намерете най-изгодните цени на хранителни стоки във вашия град. Сравнете супермаркетите и спестете пари от ежедневни покупки.",
  keywords: "цени, супермаркети, сравнение, калкулатор, България, пазаруване, Кауфланд, Лидл, Билла",
  openGraph: {
    title: "Сравни Цените | Интелигентно пазаруване",
    description: "Намерете най-изгодните цени на хранителни стоки във вашия град.",
    type: "website",
    locale: "bg_BG",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Updated language to Bulgarian for correct browser translation prompts
    <html lang="bg">
      <body
        // Added selection:bg-blue-100 to make highlighted text look branded
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-200 selection:text-blue-900`}
      >
        {children}
      </body>
    </html>
  );
}