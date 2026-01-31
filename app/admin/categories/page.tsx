'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DeleteButton from '@/components/delete-button'

// Define the exact shape of our Category data
interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // --- QUICK EDIT STATE ---
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Category>>({})
  const [saveLoading, setSaveLoading] = useState(false)

  // 1. Fetch Categories on Mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      // Sort by sort_order locally for immediate display
      const sorted = data.sort((a: Category, b: Category) => a.sort_order - b.sort_order)
      setCategories(sorted)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // 2. Start Quick Edit
  const handleQuickEdit = (category: Category) => {
    setEditingId(category.id)
    // Populate form with current values
    setEditForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      sort_order: category.sort_order,
      is_active: category.is_active
    })
  }

  // 3. Cancel Edit
  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  // 4. Save Changes
  const handleSave = async (id: string) => {
    setSaveLoading(true)
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (!res.ok) throw new Error('Failed to update')
      
      // Refresh local data immediately
      await fetchCategories()
      setEditingId(null)
      setEditForm({})
      router.refresh() // Refresh server context if needed
    } catch (error) {
      alert('Error saving category')
      console.error(error)
    } finally {
      setSaveLoading(false)
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
              <Link href="/admin/products" className="text-gray-700 hover:text-black">
                Products
              </Link>
              <Link href="/admin/orders" className="text-gray-700 hover:text-black">
                Orders
              </Link>
              <Link href="/admin/categories" className="text-black font-semibold">
                Categories
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <Link
            href="/admin/categories/new"
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
          >
            Add New Category
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading categories...</div>
        ) : !categories || categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No categories found</p>
            <Link
              href="/admin/categories/new"
              className="text-black font-semibold hover:underline"
            >
              Create your first category
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Name / Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => {
                  const isEditing = editingId === category.id

                  return (
                    <tr key={category.id} className={isEditing ? "bg-blue-50" : ""}>
                      
                      {/* --- COL 1: Name & Slug --- */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              className="block w-full border border-gray-300 rounded px-2 py-1 text-sm font-medium"
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              placeholder="Category Name"
                            />
                            <input
                              type="text"
                              className="block w-full border border-gray-300 rounded px-2 py-1 text-xs bg-gray-50 text-gray-600"
                              value={editForm.slug}
                              onChange={(e) => setEditForm({...editForm, slug: e.target.value})}
                              placeholder="url-slug"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            <div className="text-xs text-gray-500">{category.slug}</div>
                          </div>
                        )}
                      </td>

                      {/* --- COL 2: Description --- */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                           <textarea
                              rows={2}
                              className="block w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                              placeholder="Description..."
                           />
                        ) : (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {category.description || '-'}
                          </div>
                        )}
                      </td>

                      {/* --- COL 3: Sort Order --- */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                           <input
                              type="number"
                              className="block w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                              value={editForm.sort_order}
                              onChange={(e) => setEditForm({...editForm, sort_order: Number(e.target.value)})}
                           />
                        ) : (
                          <div className="text-sm text-gray-500">{category.sort_order}</div>
                        )}
                      </td>

                      {/* --- COL 4: Status --- */}
                      <td className="px-6 py-4 whitespace-nowrap">
                         {isEditing ? (
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editForm.is_active}
                                onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                                className="h-4 w-4 text-black border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Active</span>
                            </div>
                         ) : (
                           <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              category.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                         )}
                      </td>

                      {/* --- COL 5: Actions --- */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isEditing ? (
                          <div className="flex flex-col gap-2 items-end">
                             <button
                               onClick={() => handleSave(category.id)}
                               disabled={saveLoading}
                               className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                             >
                               {saveLoading ? 'Saving...' : 'Save'}
                             </button>
                             <button
                               onClick={handleCancel}
                               className="text-gray-600 hover:text-gray-900 text-xs"
                             >
                               Cancel
                             </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-4">
                            <button
                              onClick={() => handleQuickEdit(category)}
                              className="text-blue-600 hover:text-blue-900 font-bold"
                            >
                              Quick Edit
                            </button>
                            <span className="text-gray-300">|</span>
                            <Link
                              href={`/admin/categories/${category.id}`}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Full Edit
                            </Link>
                            <DeleteButton id={category.id} endpoint="categories" />
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
      </main>
    </div>
  )
}