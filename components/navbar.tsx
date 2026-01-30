'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

export default function Navbar() {
  const { itemCount } = useCart()

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <Link
              href="/cart"
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Cart ({itemCount})</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
