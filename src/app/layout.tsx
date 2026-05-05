import type { Metadata } from "next";
import { Inter, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "../component/SessionProvider";
import { AppShell } from "../component/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prompt Hub",
  description: "จัดการและแชร์ Prompt AI ของคุณในที่เดียว",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${mono.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
