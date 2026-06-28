import type { Metadata } from "next";
import { Inter, Barlow_Semi_Condensed } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Carrosserie Pro — Grossiste peinture & consommables auto",
  description:
    "Vente en gros de peintures, vernis, abrasifs et consommables pour carrosseries et garages professionnels. Tarifs pro, livraison 24-72h.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
