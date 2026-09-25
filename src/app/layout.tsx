
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export const metadata: Metadata = {
  title: "TechFitness | Treino Inteligente e Progressão de Carga",
  description: "Plataforma premium para personal trainers prescreverem treinos focados em progressão de carga e alunos evoluírem de forma acompanhada e gamificada.",
  appleWebApp: {
    title: "TechFitness",
    statusBarStyle: "default",
    capable: true,
  },
  applicationName: "TechFitness",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
