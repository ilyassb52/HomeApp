import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// Brief section 2: Outfit, weights 200 / 300 / 600 only.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["200", "300", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Magic Mirror",
  description: "Écran du miroir du foyer",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${outfit.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
