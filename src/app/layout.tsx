import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppBg, Footer, GoogleTagManager } from "@/components";
import OnchainProvider from "@/components/onchainconfig/provider";
import { AppContextProvider } from "@/context";

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
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        )}
        <OnchainProvider>
          <AppContextProvider>
            <main className="py-[124px] container mx-auto flex-1 max-md:px-[20px]">
              <AppBg />
              {children}
            </main>
            <Footer />
          </AppContextProvider>
        </OnchainProvider>
      </body>
    </html>
  );
}
