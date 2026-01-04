import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/src/i18n";

import NavBarComponent from "@/src/common/NavBar/NavBarComponent";
import ThemeRegistry from "@/src/common/ThemeRegistry";
import NextAuthSessionProvider from "@/src/app/providers/SessionProvider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <body
        className={`${plexSans.variable} ${plexMono.variable} antialiased h-screen flex flex-col`}
      >
        <ThemeRegistry>
          <NextAuthSessionProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <NavBarComponent />
              <main className="flex-1 overflow-auto font-sans">{children}</main>
            </NextIntlClientProvider>
          </NextAuthSessionProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
