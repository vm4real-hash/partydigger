import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PartyDigger — La plateforme des artistes',
  description: 'Connecte les artistes musicaux avec les bars, salles de concert, organisateurs et festivals. Toulouse et partout en France.',
  keywords: ['artistes', 'concerts', 'bars', 'toulouse', 'musique', 'événements', 'booking'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PartyDigger',
  },
  openGraph: {
    title: 'PartyDigger',
    description: 'La plateforme des artistes pour décrocher des dates.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#7c3aff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-dvh flex flex-col">
        <ToastProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  )
}
