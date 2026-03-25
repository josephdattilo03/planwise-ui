import type { Metadata } from 'next';
import {
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from 'next/font/google';
import '../globals.css';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/src/i18n';

import NavBarComponent from '@/src/common/NavBar/NavBarComponent';
import AIChatBotGate from '@/src/common/AIChatBotGate';
import ThemeRegistry from '@/src/common/ThemeRegistry';
import { GoogleCalendarLoginSync } from '@/src/app/components/calendar/GoogleCalendarLoginSync';
import { CanvasLoginSync } from '@/src/app/components/canvas/CanvasLoginSync';
import { CanvasBriefingProvider } from '@/src/app/providers/CanvasBriefingProvider';
import NextAuthSessionProvider from '@/src/app/providers/SessionProvider';
import { ThemeProvider } from '@/src/common/ThemeProvider';
import { BoardsTagsProvider } from '@/src/app/providers/boardsTags/BoardsTagsContext';
import { WorkspaceProvider } from '@/src/app/providers/workspace/WorkspaceContext';
import { TaskDrawerProvider } from '@/src/app/providers/tasks/TaskDrawerContext';
import TaskDrawer from '@/src/app/components/tasks/TaskDrawer';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const plexSans = IBM_Plex_Sans({
  variable: '--font-plex-sans',
  subsets: ['latin'],
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
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
        <ThemeProvider>
          <ThemeRegistry>
            <NextAuthSessionProvider>
              <CanvasBriefingProvider>
                <GoogleCalendarLoginSync />
                <CanvasLoginSync />
                <NextIntlClientProvider locale={locale} messages={messages}>
                  <BoardsTagsProvider>
                    <TaskDrawerProvider>
                      <WorkspaceProvider>
                        <NavBarComponent />
                        <main className="flex-1 overflow-auto font-sans">
                          {children}
                        </main>
                        <TaskDrawer />
                        <AIChatBotGate />
                      </WorkspaceProvider>
                    </TaskDrawerProvider>
                  </BoardsTagsProvider>
                </NextIntlClientProvider>
              </CanvasBriefingProvider>
            </NextAuthSessionProvider>
          </ThemeRegistry>
        </ThemeProvider>
      </body>
    </html>
  );
}
