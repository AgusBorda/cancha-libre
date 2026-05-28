import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CanchaLibre — Reservá tu cancha online",
  description:
    "La plataforma para reservar canchas de fútbol de barrio. Elegí cancha, horario y reservá en segundos.",
  keywords: ["cancha fútbol", "reservas", "fútbol 5", "fútbol 7", "turnos deportivos"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full bg-white text-gray-900 antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
