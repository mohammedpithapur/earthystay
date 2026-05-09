import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Earthy Stay | Luxury Property Stays',
  description: 'Discover and book unique luxury properties across India',
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