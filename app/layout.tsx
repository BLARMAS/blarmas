import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Blarmas", template: "%s · Blarmas" },
  description: "Gestione progetti per team e aziende",
  // iPhone: permette di aprire il sito installato a schermo intero, con il nome e l'icona giusti
  appleWebApp: { capable: true, title: "Blarmas", statusBarStyle: "black" },
  icons: { apple: "/icons/apple-icon.png" },
};

// Colore della barra del browser sul telefono (come la barra in alto del sito)
export const viewport: Viewport = { themeColor: "#11213f" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
