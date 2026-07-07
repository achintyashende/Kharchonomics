import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Kaash",
  description: "Track your expenses simply and effectively.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kaash"
  }
};

export const viewport: Viewport = {
  themeColor: "#282b2f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
};

import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { RecurringSyncer } from '@/components/providers/RecurringSyncer'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased max-w-md mx-auto bg-bg text-text shadow-xl h-screen h-[100dvh] overflow-hidden flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <RecurringSyncer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
