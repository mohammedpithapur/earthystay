import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Providers from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Earthy Stays | Earthy Property Stays',
  description: 'Discover and book unique earthy properties across India',
  icons: {
    icon: '/Untitled_design-removebg-preview.png',
    shortcut: '/Untitled_design-removebg-preview.png',
    apple: '/Untitled_design-removebg-preview.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ backgroundColor: 'var(--color-bg-page)', margin: 0, overflowX: 'hidden' }}>
        <Providers>
          <Navbar />
          <main style={{ paddingTop: '72px', minHeight: '100vh' }}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}