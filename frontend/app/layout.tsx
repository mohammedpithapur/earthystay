import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
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
    <html lang="en">
      <body style={{ backgroundColor: 'var(--color-bg-page)', margin: 0, overflowX: 'hidden' }}>
        <Navbar />
        <main style={{ paddingTop: '72px', minHeight: '100vh' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}