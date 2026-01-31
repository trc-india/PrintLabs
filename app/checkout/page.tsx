'use client'

import { useCart } from '@/lib/cart-context'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, itemCount, totalAmount, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('COD')

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_pincode: '',
  })

  // Redirect if cart is empty
  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link href="/products" className="text-blue-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const orderData = {
        ...formData,
        payment_method: paymentMethod,
        total_amount: totalAmount,
        items: items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          price_at_purchase: item.price,
          // CRITICAL: Passing the customization data here
          customization_details: item.customization || null
        }))
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to place order')
      }

      clearCart()
      router.push(`/order-success?id=${result.orderId}`)

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="space-y-8">
          {/* 1. Contact Info */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full border p-2 rounded"
                  value={formData.customer_name}
                  onChange={e => setFormData({...formData, customer_name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    required
                    type="email"
                    className="w-full border p-2 rounded"
                    value={formData.customer_email}
                    onChange={e => setFormData({...formData, customer_email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    required
                    type="tel"
                    className="w-full border p-2 rounded"
                    value={formData.customer_phone}
                    onChange={e => setFormData({...formData, customer_phone: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  required
                  rows={2}
                  className="w-full border p-2 rounded"
                  value={formData.shipping_address}
                  onChange={e => setFormData({...formData, shipping_address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    required
                    type="text"
                    className="w-full border p-2 rounded"
                    value={formData.shipping_city}
                    onChange={e => setFormData({...formData, shipping_city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    required
                    type="text"
                    className="w-full border p-2 rounded"
                    value={formData.shipping_state}
                    onChange={e => setFormData({...formData, shipping_state: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pincode</label>
                  <input
                    required
                    type="text"
                    className="w-full border p-2 rounded"
                    value={formData.shipping_pincode}
                    onChange={e => setFormData({...formData, shipping_pincode: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`flex-1 py-3 px-4 rounded border-2 font-medium ${
                  paymentMethod === 'COD'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                Cash on Delivery (COD)
              </button>
              <button
                type="button"
                disabled
                className="flex-1 py-3 px-4 rounded border-2 border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
              >
                Online Payment (Coming Soon)
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Placing Order...' : `Place Order (₹${totalAmount})`}
          </button>
        </form>
      </div>
    </div>
  )
}