import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SiteNav } from "@/components/site-nav";
import { PrimaryColorProvider } from "@/components/primary-color-provider";
import { OverlaySettingsProvider } from "@/components/overlay/overlay-settings-provider";
import localFont from "next/font/local";
import { TooltipProvider } from "@/components/ui/tooltip"
import { OverlayPresetProvider } from "@/components/overlay/overlay-preset-provider"

const geistSans = localFont({
  src: "../public/fonts/geist/geist-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "../public/fonts/geist/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coopstream",
  description: "Coopstream : Streaming tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
    >
      <body 
      className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-background text-foreground`}>
        <ThemeProvider>
          <PrimaryColorProvider>
            <TooltipProvider>
            <OverlaySettingsProvider>
              <OverlayPresetProvider>
              <SiteNav />
              {children}
              <Toaster />
              </OverlayPresetProvider>
            </OverlaySettingsProvider>
            </TooltipProvider>
          </PrimaryColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
