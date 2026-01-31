'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  // Form State
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    base_price: '',
    is_customizable: true,
    production_time_hours: 24,
    status: 'active',
  })

  // Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Categories
        const catRes = await fetch('/api/categories')
        const catData = await catRes.json()
        setCategories(catData)

        // 2. Fetch Product Details
        const prodRes = await fetch(`/api/products/${id}`)
        if (!prodRes.ok) throw new Error('Product not found')
        const prodData = await prodRes.json()

        setFormData({
            name: prodData.name,
            slug: prodData.slug,
            category_id: prodData.category_id,
            description: prodData.description || '',
            base_price: prodData.base_price,
            is_customizable: prodData.is_customizable,
            production_time_hours: prodData.production_time_hours,
            status: prodData.status,
        })

        if (prodData.imageUrls && prodData.imageUrls.length > 0) {
            setImageUrls(prodData.imageUrls)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        alert('Failed to load product data')
        router.push('/admin/products')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        ...formData,
        imageUrls: imageUrls.filter(url => url.trim() !== '')
      }

      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to update')

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      alert('Error updating product')
    } finally {
      setSaving(false)
    }
  }

  // Helper for image inputs
  const updateUrl = (index: number, val: string) => {
    const newUrls = [...imageUrls]
    newUrls[index] = val
    setImageUrls(newUrls)
  }
  const addUrlField = () => setImageUrls([...imageUrls, ''])

  if (loading) return <div className="p-8">Loading product data...</div>

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium mb-1">Slug (URL friendly)</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({...formData, slug: e.target.value})}
            className="w-full border p-2 rounded bg-gray-50"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Category</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Price & Time */}
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium mb-1">Price (₹)</label>
            <input
                type="number"
                required
                value={formData.base_price}
                onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                className="w-full border p-2 rounded"
            />
            </div>
            <div>
            <label className="block text-sm font-medium mb-1">Production (Hours)</label>
            <input
                type="number"
                required
                value={formData.production_time_hours}
                onChange={(e) => setFormData({...formData, production_time_hours: Number(e.target.value)})}
                className="w-full border p-2 rounded"
            />
            </div>
        </div>

        {/* Customizable Checkbox */}
        <div className="flex items-center p-3 bg-gray-50 rounded border">
            <input
            type="checkbox"
            id="is_customizable"
            checked={formData.is_customizable}
            onChange={(e) => setFormData({ ...formData, is_customizable: e.target.checked })}
            className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
            />
            <label htmlFor="is_customizable" className="ml-2 block text-sm font-medium text-gray-900">
            Is Customizable? (Allows user uploads/text)
            </label>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full border p-2 rounded"
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Images */}
        <div>
            <label className="block text-sm font-medium mb-2">Image URLs</label>
            {imageUrls.map((url, i) => (
                <div key={i} className="flex gap-2 mb-2">
                    <input 
                        type="text" 
                        value={url}
                        onChange={(e) => updateUrl(i, e.target.value)}
                        placeholder="https://..."
                        className="flex-1 border p-2 rounded text-sm"
                    />
                </div>
            ))}
            <button type="button" onClick={addUrlField} className="text-sm text-blue-600 underline">
                + Add another image URL
            </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Product'}
          </button>
          <Link
            href="/admin/products"
            className="flex-1 bg-gray-200 text-center py-2 rounded hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}