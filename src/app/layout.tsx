import type React from "react";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import ChatBot from "@/components/chatbot";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AgroWin",
  description: "Aplikasi Pertanian Cerdas Berbasis Kecerdasan Buatan",
  manifest: "/manifest.json",
  themeColor: "#008000",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-512x512.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${poppins.className} antialiased`}>
        <Header />
        {children}
        <ChatBot />
        <Footer />
      </body>
    </html>
  );
}
