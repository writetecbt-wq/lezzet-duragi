import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lezzet Durağı",
    template: "%s | Lezzet Durağı",
  },
  description:
    "QR kodunuzu okutun, menüyü keşfedin ve kolayca sipariş verin.",
  keywords: ["restoran", "menü", "sipariş", "QR kod"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={geist.variable}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
