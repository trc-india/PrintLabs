import { supabaseAdmin } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CategoriesPage() {
  // Fetch all categories
  const { data: categories, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Categories</h2>
            <p className="text-gray-600">Manage product categories</p>
          </div>
          <Link
            href="/admin/categories/new"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            + Add Category
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            Error loading categories: {error.message}
          </div>
        )}

        {categories && categories.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No categories yet</p>
            <Link
              href="/admin/categories/new"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Create Your First Category
            </Link>
          </div>
        )}

        {categories && categories.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sort Order
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          category.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.sort_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="text-black hover:text-gray-700 mr-4"
                      >
                        Edit
                      </Link>
                      <button className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
