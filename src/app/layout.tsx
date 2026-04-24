import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeRegistry from '../theme/ThemeRegistry';
import { SocketProvider } from '@/providers/SocketProvider';

export const metadata: Metadata = {
  title: {
    default: 'NightQuizz',
    template: '%s | NightQuizz',
  },
  description: 'La plateforme ultime pour créer, animer et participer à des quiz interactifs en direct.',
  keywords: ['quiz', 'live quiz', 'interactive', 'game', 'trivia', 'nightquizz', 'multiplayer'],
  authors: [{ name: 'NightQuizz Team' }],
  creator: 'NightQuizz',
  publisher: 'NightQuizz',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://nightquizz.com',
    siteName: 'NightQuizz',
    title: 'NightQuizz - Créez et participez à des quiz en direct',
    description: 'La plateforme ultime pour créer, animer et participer à des quiz interactifs en direct.',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'NightQuizz Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NightQuizz - Live Interactive Quizzes',
    description: 'La plateforme ultime pour créer et participer à des quiz en direct.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeRegistry>
            <SocketProvider>
              {children}
            </SocketProvider>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
