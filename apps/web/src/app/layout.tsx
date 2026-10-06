import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AMar Fe / ToLove Faith | Flores & Regalos con Amor y Entrega en Tiempo Real",
  description: "Marketplace para envío de flores, regalos y dedicatorias con tracking GPS en tiempo real tipo Uber. Ciudad de México y cobertura nacional.",
  keywords: ["flores a domicilio", "regalos de amor", "entrega de rosas", "tracking en tiempo real flores", "AMar Fe", "ToLove Faith"],
  openGraph: {
    title: "AMar Fe / ToLove Faith",
    description: "Flores y detalles que tocan el alma con seguimiento en vivo.",
    type: "website",
  },
};

import { ThemeProvider } from "@/lib/theme-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
