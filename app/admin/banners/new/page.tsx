'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewBannerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    sort_order: 0,
    is_active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to create banner')

      router.push('/admin/banners')
      router.refresh()
    } catch (error) {
      alert('Error creating banner')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Add New Banner</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        
        <div>
          <label className="block text-sm font-medium mb-1">Banner Title (Internal use)</label>
          <input
            type="text"
            required
            placeholder="e.g. Republic Day Sale"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            type="url"
            required
            placeholder="https://..."
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-black"
          />
          <p className="text-xs text-gray-500 mt-1">Recommended Size: 1200x400px or similar wide format.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target Link (Optional)</label>
          <input
            type="text"
            placeholder="/products/some-product"
            value={formData.link_url}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-black"
          />
          <p className="text-xs text-gray-500 mt-1">Where should the user go when clicking? (e.g. <code>/categories/gifts</code>)</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full border p-2 rounded"
                />
            </div>
            <div className="flex items-center pt-6">
                <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-black border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active (Show on Homepage)
                </label>
            </div>
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Create Banner'}
          </button>
          <Link
            href="/admin/banners"
            className="flex-1 bg-gray-100 text-gray-800 py-2 rounded text-center hover:bg-gray-200"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}