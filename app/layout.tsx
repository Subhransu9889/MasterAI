import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MasterAI — Intelligence, tailored to your trajectory.",
  description:
    "MasterAI learns your work, ambitions, interests, and voice to turn context into clear, personalized guidance.",
  applicationName: "MasterAI",
  keywords: [
    "personal AI assistant",
    "personalized guidance",
    "AI career roadmap",
    "AI learning assistant",
    "personal intelligence",
  ],
  authors: [{ name: "MasterAI" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "MasterAI — Intelligence, tailored to your trajectory.",
    description:
      "A personal intelligence system for clearer decisions, stronger skills, and forward motion.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} min-h-full antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
