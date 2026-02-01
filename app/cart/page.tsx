'use client'

import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/navbar'

export default function CartPage() {
  const { items, itemCount, totalAmount, updateQuantity, removeItem } = useCart()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Cart ({itemCount} items)</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
             <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
             <Link href="/products" className="text-blue-600 font-medium hover:underline">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.cartItemId} className="bg-white p-6 rounded-lg shadow flex gap-6">
                  
                  {/* Image */}
                  <div className="w-24 h-24 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                     {item.imageUrl ? (
                       <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                     )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <div>
                         <h3 className="font-semibold text-lg">{item.productName}</h3>
                         
                         {/* CUSTOMIZATION DISPLAY LOGIC */}
                         {item.customization && (
                           <div className="mt-2 text-sm bg-gray-50 p-2 rounded space-y-2">
                             
                             {/* CASE A: REPEATER (Array of items) */}
                             {Array.isArray(item.customization) ? (
                                item.customization.map((subItem: any, idx: number) => (
                                    <div key={idx} className="border-b border-gray-200 last:border-0 pb-1 last:pb-0 mb-1 last:mb-0">
                                        <span className="font-bold text-xs text-gray-400 uppercase block mb-1">Item #{idx + 1}</span>
                                        {Object.entries(subItem).map(([key, value]) => (
                                            <div key={key} className="flex gap-2 pl-2">
                                                <span className="font-medium text-gray-700">{key}:</span>
                                                {(typeof value === 'string' && value.startsWith('http')) ? (
                                                    <a href={value} target="_blank" className="text-blue-600 underline text-xs">View Upload</a>
                                                ) : (
                                                    <span className="text-gray-600">{String(value)}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))
                             ) : (
                                /* CASE B: STANDARD (Single Object) */
                                Object.entries(item.customization).map(([key, value]) => (
                                   <div key={key} className="flex gap-2">
                                     <span className="font-medium text-gray-700">{key}:</span>
                                     {(typeof value === 'string' && value.startsWith('http')) ? (
                                        <a href={value} target="_blank" className="text-blue-600 underline text-xs">View Upload</a>
                                     ) : (
                                        <span className="text-gray-600">{String(value)}</span>
                                     )}
                                   </div>
                                ))
                             )}
                           </div>
                         )}

                         <p className="text-gray-600 mt-1">₹{item.price}</p>
                       </div>
                       <button onClick={() => removeItem(item.cartItemId)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border rounded">
                        <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100">-</button>
                        <span className="px-3 py-1 font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100">+</button>
                      </div>
                      <div className="text-right flex-1">
                         <span className="font-bold">Total: ₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg h-fit sticky top-24 border">
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
        )}
      </div>
    </div>
  )
}