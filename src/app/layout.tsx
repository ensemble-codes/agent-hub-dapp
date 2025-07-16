import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer, MobileFooter, MobileHeader, Wrapper } from "@/components";
import OnchainProvider from "@/components/onchainconfig/provider";
import { AppContextProvider } from "@/context/app";

import { XMTPProvider } from "@/context/XMTPContext";
import ErrorBoundary from "@/components/error-boundary";

// Initialize Sentry for all pages
import "@/instrumentation-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agent Hub",
  description: "Marketplace for Agents",
  icons: {
    icon: [
      {
        rel: "icon",
        url: "/assets/logo-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/assets/logo-icon.svg" />
        <link rel="icon" href="/assets/logo-icon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <ErrorBoundary>
          <OnchainProvider>
            <AppContextProvider>
              <XMTPProvider>
                <Wrapper>
                  <MobileHeader />
                  <main className="lg:py-[72px] py-[36px] container mx-auto flex-1 max-md:px-[20px]">
                    {children}
                  </main>
                  <Footer />
                  <MobileFooter />
                </Wrapper>
              </XMTPProvider>
            </AppContextProvider>
          </OnchainProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
