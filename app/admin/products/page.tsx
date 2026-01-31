'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js' // Standard client fix
import DeleteButton from '@/components/delete-button'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  slug: string
  base_price: number
  status: string
  category_id: string
  categories?: { name: string }
  product_images?: { image_url: string; sort_order: number }[]
}

// Initialize Client manually to avoid version conflicts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // --- QUICK EDIT STATE ---
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Product>>({})
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name),
          product_images (image_url, sort_order)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Start Editing
  const handleQuickEdit = (product: Product) => {
    setEditingId(product.id)
    setEditForm({
      name: product.name,
      base_price: product.base_price,
      status: product.status,
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSave = async (id: string) => {
    setSaveLoading(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (!res.ok) throw new Error('Failed to update')

      await fetchProducts() // Refresh data
      setEditingId(null)
      setEditForm({})
      router.refresh()
    } catch (error) {
      alert('Error updating product')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500">Manage your inventory ({products.length})</p>
          </div>
          <Link
            href="/admin/products/new"
            className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 font-medium shadow-sm"
          >
            + Add Product
          </Link>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow border">
            <p className="text-gray-500 mb-4">No products found</p>
            <Link href="/admin/products/new" className="text-blue-600 font-semibold hover:underline">
              Create your first product
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-sm overflow-hidden rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[35%]">Product Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">Price (₹)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-[20%]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const isEditing = editingId === product.id
                  // Robust image finder
                  const mainImage = product.product_images?.find((img: any) => img.sort_order === 0)?.image_url 
                                    || product.product_images?.[0]?.image_url

                  return (
                    <tr key={product.id} className={`transition-colors ${isEditing ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      
                      {/* 1. Name & Image */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 relative border rounded-lg bg-gray-100 overflow-hidden">
                            {mainImage ? (
                              <Image src={mainImage} alt={product.name} fill className="object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full text-xs text-gray-400">No Img</div>
                            )}
                          </div>
                          <div className="ml-4 flex-1">
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            ) : (
                                <div className="text-sm font-bold text-gray-900">{product.name}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Category */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.categories?.name || <span className="text-gray-400 italic">Uncategorized</span>}
                      </td>

                      {/* 3. Price */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                            <input 
                                type="number" 
                                className="w-24 border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                                value={editForm.base_price}
                                onChange={(e) => setEditForm({ ...editForm, base_price: Number(e.target.value) })}
                            />
                        ) : (
                            <div className="text-sm font-bold text-gray-900">₹{product.base_price}</div>
                        )}
                      </td>

                      {/* 4. Status */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                            <select
                                className="border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                        ) : (
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border uppercase tracking-wide ${
                                product.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                                product.status === 'draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {product.status}
                            </span>
                        )}
                      </td>

                      {/* 5. Actions */}
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        {isEditing ? (
                            <div className="flex flex-col gap-2 items-end">
                                <button 
                                    onClick={() => handleSave(product.id)}
                                    disabled={saveLoading}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 shadow-sm"
                                >
                                    {saveLoading ? 'Saving...' : 'Save'}
                                </button>
                                <button 
                                    onClick={handleCancel}
                                    className="text-gray-500 hover:text-gray-800 text-xs underline"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => handleQuickEdit(product)}
                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                    Quick Edit
                                </button>
                                <span className="text-gray-300">|</span>
                                <Link
                                    href={`/admin/products/${product.id}`}
                                    className="text-gray-600 hover:text-black"
                                >
                                    Full Edit
                                </Link>
                                <DeleteButton id={product.id} endpoint="products" />
                            </div>
                        )}
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}