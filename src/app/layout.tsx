import { StoreProvider } from "@/redux/store/StoreProvider";
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import PushNotificationLayout from "@/components/firebaseNotification/PushNotification";
import ScrollToTop from "@/components/ScrollToTop";
import { BookingDetailsProvider } from "@/contexts/BookingDetails";
import NavigationProgress from "@/components/NavigationProgress";
import DevServiceWorkerCleanup from "@/components/DevServiceWorkerCleanup";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_TITLE,
  description: process.env.NEXT_PUBLIC_DESCRIPTION,
  keywords: process.env.NEXT_PUBLIC_KEYWORDS,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: process.env.NEXT_PUBLIC_TITLE ?? "Pliiz Sunbed",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    title: process.env.NEXT_PUBLIC_TITLE,
    description: process.env.NEXT_PUBLIC_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: process.env.NEXT_PUBLIC_TITLE,
    description: process.env.NEXT_PUBLIC_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${outfit.variable} antialiased pointer-events-auto!`}
        suppressHydrationWarning
      >
        <StoreProvider>
          <BookingDetailsProvider>
            <DevServiceWorkerCleanup />
            <NavigationProgress />
            <ScrollToTop />
            <Toaster position="top-right"/>
            <Providers>
              <PushNotificationLayout>
                {children}
              </PushNotificationLayout>
            </Providers>
          </BookingDetailsProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
