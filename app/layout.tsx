import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LifeSync AI - Tu Asistente Personal Inteligente",
  description:
    "Gestiona tus finanzas, hábitos, salud y más con inteligencia artificial. Todo en un solo lugar.",
  keywords: [
    "finanzas personales",
    "tracker de hábitos",
    "diario personal",
    "IA",
    "productividad",
  ],
  authors: [{ name: "Agustín" }],
  openGraph: {
    title: "LifeSync AI",
    description: "Tu asistente personal inteligente",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
