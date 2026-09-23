import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Habituo — Finanzas, hábitos y diario en un solo lugar",
  description:
    "Gestioná tus finanzas, hábitos y diario personal con un coach de IA. Todo en un solo lugar.",
  keywords: [
    "finanzas personales",
    "tracker de hábitos",
    "diario personal",
    "IA",
    "productividad",
  ],
  authors: [{ name: "Agustín" }],
  openGraph: {
    title: "Habituo",
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
