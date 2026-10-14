import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "./components/header";
import Footer from "./components/footer";
import SiteBanner from "./components/siteBanner";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HyperLane",
  description: "Shop thời trang nam nữ cao cấp tại Việt Nam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black">
        <ThemeProvider>
          <CartProvider>
            <ToastProvider>
              <Header />
              <SiteBanner />

              <main className="flex-1">
                {children}
              </main>

              <Footer />
            </ToastProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}