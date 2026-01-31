'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { usePathname } from 'next/navigation' // 1. Import this hook

export default function Navbar() {
  const { itemCount } = useCart()
  const pathname = usePathname() // 2. Get the current URL path

  // 3. HIDE NAVBAR IF ON ADMIN PAGES
  // This prevents the "Double Header" issue
  if (pathname && pathname.startsWith('/admin')) {
    return null
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-black">
            PrintLabs
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-black font-medium">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-black font-medium">
              Products
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-black font-medium">
              Categories
            </Link>
            <Link href="/custom" className="text-gray-700 hover:text-black font-medium">
              Custom Order
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-black font-medium">
              About
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link
              href="/cart"
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Cart ({itemCount})</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}