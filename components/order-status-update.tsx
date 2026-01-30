'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface OrderStatusUpdateProps {
  orderId: string
  currentStatus: string
}

export default function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('production_status', status)

      const response = await fetch(`/admin/orders/${orderId}/update-status`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✓ Status updated successfully!')
        router.refresh()
      } else {
        setMessage('✗ Failed to update status')
      }
    } catch (error) {
      setMessage('✗ An error occurred')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Update Production Status
      </label>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="pending">Pending</option>
            <option value="in_production">In Production</option>
            <option value="ready_to_ship">Ready to Ship</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
          <button
            type="submit"
            disabled={loading || status === currentStatus}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
        {message && (
          <p className={`text-sm ${message.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
