import type { Metadata } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { EventProvider } from '@/lib/event-context'
import { QueryProvider } from '@/lib/query-client'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" })

export const metadata: Metadata = {
  title: 'EventFlow - Gestion de Eventos',
  description: 'Plataforma moderna de gestion de eventos. Descubre, organiza y gestiona eventos de forma intuitiva.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        <QueryProvider>
          <EventProvider>
            {children}
            <Toaster />
          </EventProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
