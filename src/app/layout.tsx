import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Montserrat } from "next/font/google";
import TanstackQueryProvider from "@/components/TanstackQueryProvider";
import AppStructure from "@/components/AppStructure";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';

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

  return (
    <html lang={locale} className={`${montserrat.variable}`}>
      <body>
        <NextIntlClientProvider>
          <TanstackQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <AppStructure />
              <Toaster />
              {children}
            </ThemeProvider>
          </TanstackQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}