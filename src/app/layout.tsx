import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Montserrat } from "next/font/google";
import TanstackQueryProvider from "@/components/TanstackQueryProvider";
import AppStructure from "@/components/AppStructure";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { ChatBotProvider } from "@/context/ChatBotContext";
import { ChatBot } from "@/components/chatbot";
import { AppProvider } from "@/context/AppContext";
import { DemoDataProvider } from "@/context/DemoDataContext";
import { getCurrent } from "@/features/auth/queries";
import { cookies } from "next/headers";
import LandingRouteTransition from "@/features/landing/components/LandingRouteTransition";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Gestionate",
  description: "Gestiona y organiza todo tu trabajo en un solo lugar",
  icons: {
    icon: '/gestionate-logo.svg'
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const user = await getCurrent();
  const cookieStore = await cookies();

  const isDemo = cookieStore.get('isDemo')?.value === 'true';

  const app = (
    <ChatBotProvider>
      <AppStructure />
      <Toaster />
      <ChatBot />
      <LandingRouteTransition>{children}</LandingRouteTransition>
    </ChatBotProvider>
  );

  return (
    <html lang={locale} className={`${montserrat.variable}`}>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id={process.env.UMAMI_ID}
          strategy="beforeInteractive"
        />
      <body>
        <NextIntlClientProvider>
          <TanstackQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <AppProvider isDemo={isDemo} currentUser={user}>
                {isDemo ? (
                    <DemoDataProvider>
                      {app}
                    </DemoDataProvider>
                  ) : app
                }
              </AppProvider>
            </ThemeProvider>
          </TanstackQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}