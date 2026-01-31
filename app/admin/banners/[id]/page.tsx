'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    sort_order: 0,
    is_active: true
  })

  useEffect(() => {
    // Ideally we use a direct GET /api/banners/[id], but finding from list is safer if endpoint missing
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        const banner = data.find((b: any) => b.id === id)
        if (banner) setFormData(banner)
        setLoading(false)
      })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    // NOTE: Ensure you have an API route that handles PUT at /api/banners/[id]
    // If you reused the Delete route file, update it to handle PUT as well.
    await fetch(`/api/banners/${id}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    
    router.push('/admin/banners')
    router.refresh()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Edit Banner</h1>
        <Link href="/admin/banners" className="text-gray-500 hover:text-black">Cancel</Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        
        {/* Active Toggle */}
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded border">
            <span className="font-bold">Banner Status</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">{formData.is_active ? 'Active' : 'Inactive'}</span>
            </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            type="url"
            required
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full border p-2 rounded"
          />
          {/* Preview */}
          {formData.image_url && (
            <div className="mt-2 relative w-full h-24 bg-gray-100 rounded overflow-hidden border">
                <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Link URL</label>
                <input
                    type="text"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full border p-2 rounded"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full border p-2 rounded"
                />
            </div>
        </div>

        <button
            type="submit"
            disabled={saving}
            className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 disabled:opacity-50 font-bold"
        >
            {saving ? 'Saving...' : 'Update Banner'}
        </button>
      </form>
    </div>
  )
}