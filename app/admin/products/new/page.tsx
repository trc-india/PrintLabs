'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>(['']) // Start with 1 empty field
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

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    setFormData({ ...formData, name, slug })
  }

  // Handle image URL changes
  const handleImageChange = (index: number, value: string) => {
    const newImageUrls = [...imageUrls]
    newImageUrls[index] = value
    setImageUrls(newImageUrls)
  }

  // Add new image URL field
  const addImageField = () => {
    setImageUrls([...imageUrls, ''])
  }

  // Remove image URL field
  const removeImageField = (index: number) => {
    if (imageUrls.length > 1) {
      const newImageUrls = imageUrls.filter((_, i) => i !== index)
      setImageUrls(newImageUrls)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Filter out empty image URLs
    const validImages = imageUrls.filter(url => url.trim() !== '')

    if (validImages.length === 0) {
      setError('Please add at least one product image')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          base_price: parseFloat(formData.base_price),
          images: validImages, // Send image URLs array
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin/products')
        router.refresh()
      } else {
        setError(data.error || 'Failed to create product')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">PrintLabs Admin</h1>
            <div className="flex gap-4">
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-black">
                Dashboard
              </Link>
              <Link href="/admin/products" className="text-black font-semibold">
                Products
              </Link>
              <Link href="/admin/orders" className="text-gray-700 hover:text-black">
                Orders
              </Link>
              <Link href="/admin/categories" className="text-gray-700 hover:text-black">
                Categories
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/admin/products" className="text-gray-600 hover:text-black">
            ← Back to Products
          </Link>
          <h2 className="text-2xl font-bold mt-4">Add New Product</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="e.g., Custom Wooden Keychain"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="custom-wooden-keychain"
            />
            <p className="mt-1 text-sm text-gray-500">
              URL-friendly version (auto-generated from name)
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images *
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Add image URLs (first image will be the cover image)
            </p>
            
            <div className="space-y-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder={index === 0 ? "https://example.com/cover-image.jpg (Cover)" : "https://example.com/image.jpg"}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  {index === 0 ? (
                    <span className="px-3 py-2 bg-blue-100 text-blue-800 text-sm rounded-md">
                      Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addImageField}
              className="mt-3 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              + Add Another Image
            </button>

            <p className="mt-2 text-xs text-gray-500">
              Tip: Upload images to ImgBB, Cloudinary, or your hosting and paste the URLs here
            </p>
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="299"
            />
            <p className="mt-1 text-sm text-gray-500">
              Starting price without customization
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Describe your product features, materials, size, etc."
            />
          </div>

          {/* Production Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Production Time (hours)
            </label>
            <input
              type="number"
              min="1"
              value={formData.production_time_hours}
              onChange={(e) => setFormData({ ...formData, production_time_hours: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Time needed to produce this item
            </p>
          </div>

          {/* Customizable Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_customizable"
              checked={formData.is_customizable}
              onChange={(e) => setFormData({ ...formData, is_customizable: e.target.checked })}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor="is_customizable" className="ml-2 block text-sm text-gray-700">
              Allow customization (text/image engraving)
            </label>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="active">Active (visible to customers)</option>
              <option value="draft">Draft (hidden)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <Link
              href="/admin/products"
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
