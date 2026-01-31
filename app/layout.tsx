import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import Navbar from '@/components/navbar' // Import Navbar
import Footer from '@/components/footer' // Import Footer

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PrintLabs',
  description: 'Custom 3D Printing & Laser Cutting Service',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <CartProvider>
          {/* Navbar sits at the top of every page */}
          <Navbar /> 
          
          {/* Main content changes per page */}
          <main className="min-h-screen">
            {children}
          </main>

          {/* Footer sits at the bottom of every page */}
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}