'use client'

import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/navbar'

export default function CartPage() {
  const { items, itemCount, totalAmount, updateQuantity, removeItem } = useCart()

  // --- NEW: Helper to detect links vs text ---
  const renderCustomValue = (value: string) => {
    if (typeof value === 'string' && value.startsWith('http')) {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          View Uploaded File
        </a>
      )
    }
    return <span>{value}</span>
  }
  // -------------------------------------------

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-8">
            {items.map((item) => (
              <div key={item.cartItemId} className="flex gap-6 p-4 border rounded-lg bg-white shadow-sm">
                {/* Product Image */}
                <div className="w-24 h-24 relative flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                   {item.imageUrl ? (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.productName} 
                        fill 
                        className="object-cover"
                      />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">No Img</div>
                   )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold text-lg">
                      <Link href={`/products/${item.productSlug}`} className="hover:underline">
                        {item.productName}
                      </Link>
                    </h3>
                    <button 
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Customization Details (UPDATED) */}
                  {item.customization && Array.isArray(item.customization) && (
                    <div className="mb-3 space-y-1 bg-gray-50 p-2 rounded text-sm">
                       {item.customization.map((c: any, i: number) => (
                         <div key={i} className="flex flex-col sm:flex-row sm:gap-2 text-gray-600">
                            <span className="font-medium text-gray-900">{c.label}:</span>
                            {/* Use the new helper here */}
                            {renderCustomValue(c.value)}
                         </div>
                       ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center border rounded-md">
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >−</button>
                      <span className="px-3 py-1 font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >+</button>
                    </div>
                    <div className="font-bold text-lg">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg">₹{totalAmount}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-black text-white text-center py-4 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}