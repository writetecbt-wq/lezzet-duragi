import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "L'Essence",
    template: "%s | L'Essence",
  },
  description:
    "QR kodunuzu okutun, gastronomi deneyimini keşfedin ve sipariş verin.",
  keywords: ["restoran", "fine dining", "menü", "sipariş", "QR kod"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#C5A059",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh antialiased bg-background text-on-surface">
        {children}
      </body>
    </html>
  );
}
