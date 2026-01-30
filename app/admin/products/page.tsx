import { supabaseAdmin } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function ProductsPage() {
  // Fetch all products with their categories and images
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      categories (
        name
      ),
      product_images (
        image_url,
        sort_order
      )
    `)
    .order('created_at', { ascending: false })

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Products</h2>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            + Add Product
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            Error loading products: {error.message}
          </div>
        )}

        {products && products.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No products yet</p>
            <Link
              href="/admin/products/new"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Create Your First Product
            </Link>
          </div>
        )}

        {products && products.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  // Get cover image (first image with sort_order 0)
                  const coverImage = product.product_images?.find(
                    (img: any) => img.sort_order === 0
                  ) || product.product_images?.[0]

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Product Image Thumbnail */}
                          {coverImage ? (
                            <div className="relative w-12 h-12 flex-shrink-0">
                              <Image
                                src={coverImage.image_url}
                                alt={product.name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No img</span>
                            </div>
                          )}
                          {/* Product Name */}
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product.categories?.name || 'No category'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₹{product.base_price}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : product.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-black hover:text-gray-700 mr-4"
                        >
                          Edit
                        </Link>
                        <button className="text-red-600 hover:text-red-800">
                          Delete
                        </button>
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
