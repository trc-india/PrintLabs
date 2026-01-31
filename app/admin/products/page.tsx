import { supabaseAdmin } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import DeleteButton from '@/components/delete-button'

export const dynamic = 'force-dynamic'

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <Link
            href="/admin/products/new"
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
          >
            Add New Product
          </Link>
        </div>

        {!products || products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No products found</p>
            <Link
              href="/admin/products/new"
              className="text-black font-semibold hover:underline"
            >
              Create your first product
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                    Price
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
                  const mainImage = product.product_images?.[0]?.image_url
                  return (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative">
                            {mainImage ? (
                              <Image
                                src={mainImage}
                                alt={product.name}
                                fill
                                className="object-cover rounded"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-500">No img</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product.categories?.name}
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
                          href={`/admin/products/${product.id}`}
                          className="text-black hover:text-gray-700 mr-4"
                        >
                          Edit
                        </Link>
                        <DeleteButton id={product.id} endpoint="products" />
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