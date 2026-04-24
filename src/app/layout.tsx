import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeRegistry from '../theme/ThemeRegistry';
import { SocketProvider } from '@/providers/SocketProvider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nightquizz.com'),
  title: {
    default: 'NightQuizz - Créez et participez à des quiz en direct',
    template: '%s | NightQuizz',
  },
  description: 'NightQuizz est la plateforme interactive ultime pour animer vos soirées. Créez des quiz personnalisés, invitez vos amis et jouez en temps réel depuis n\'importe quel appareil.',
  keywords: [
    'quiz en direct', 
    'quiz interactif', 
    'soirée quiz', 
    'trivia live', 
    'animation de groupe', 
    'jeu de quiz multi-joueurs',
    'créateur de quiz gratuit',
    'NightQuizz'
  ],
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
    title: 'NightQuizz - La plateforme ultime de quiz interactifs',
    description: 'Transformez vos soirées avec NightQuizz. Quiz en direct, interaction en temps réel et fun garanti.',
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
    description: 'Créez et participez à des quiz en direct avec vos amis.',
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
    <html lang="fr">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'NightQuizz',
              url: 'https://nightquizz.com',
              description: 'Plateforme interactive de quiz en direct pour animer vos soirées.',
              applicationCategory: 'GameApplication',
              genre: 'Quiz',
              operatingSystem: 'Web',
              author: {
                '@type': 'Organization',
                name: 'NightQuizz'
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR'
              },
            }),
          }}
        />
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
