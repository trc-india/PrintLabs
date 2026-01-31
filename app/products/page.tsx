import { supabaseAdmin } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

interface SearchParams {
  category?: string
  search?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const categorySlug = params.category
  const searchQuery = params.search

  // Fetch categories for filter sidebar
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Build products query
  let productsQuery = supabaseAdmin
    .from('products')
    .select(`
      *,
      categories (
        name,
        slug
      ),
      product_images (
        image_url,
        sort_order
      )
    `)
    .eq('status', 'active')

  // Filter by category if selected
  if (categorySlug) {
    const category = categories?.find(c => c.slug === categorySlug)
    if (category) {
      productsQuery = productsQuery.eq('category_id', category.id)
    }
  }

  // Search filter
  if (searchQuery) {
    productsQuery = productsQuery.ilike('name', `%${searchQuery}%`)
  }

  const { data: products } = await productsQuery.order('created_at', { ascending: false })

  // Get selected category name for display
  const selectedCategory = categorySlug 
    ? categories?.find(c => c.slug === categorySlug)
    : null

  return (
    <div className="min-h-screen bg-white">

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar - Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white border rounded-lg p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Categories</h3>
              
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/products"
                    className={`block px-3 py-2 rounded hover:bg-gray-100 ${
                      !categorySlug ? 'bg-black text-white hover:bg-gray-800' : ''
                    }`}
                  >
                    All Products
                  </Link>
                </li>
                {categories?.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/products?category=${category.slug}`}
                      className={`block px-3 py-2 rounded hover:bg-gray-100 ${
                        categorySlug === category.slug 
                          ? 'bg-black text-white hover:bg-gray-800' 
                          : ''
                      }`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Search Box */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-bold text-lg mb-4">Search</h3>
                <form action="/products" method="get">
                  {categorySlug && (
                    <input type="hidden" name="category" value={categorySlug} />
                  )}
                  <input
                    type="text"
                    name="search"
                    defaultValue={searchQuery}
                    placeholder="Search products..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="submit"
                    className="w-full mt-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>
          </aside>

          {/* Main Content - Products Grid */}
          <main className="flex-1">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">
                {selectedCategory ? selectedCategory.name : 'All Products'}
              </h1>
              <p className="text-gray-600">
                {products?.length || 0} product{products?.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            {/* Products Grid */}
            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const coverImage = product.product_images?.find(
                    (img: any) => img.sort_order === 0
                  ) || product.product_images?.[0]

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group border rounded-lg overflow-hidden hover:shadow-lg transition"
                    >
                      {/* Product Image */}
                      <div className="aspect-square bg-gray-100 relative">
                        {coverImage ? (
                          <Image
                            src={coverImage.image_url}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            No image
                          </div>
                        )}
                        {product.is_customizable && (
                          <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Customizable
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4 bg-white">
                        <div className="text-xs text-gray-500 mb-1">
                          {product.categories?.name}
                        </div>
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-gray-600">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-black">
                            ₹{product.base_price}
                          </p>
                          <span className="text-xs text-gray-500">
                            {product.production_time_hours}h production
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg mb-2">No products found</p>
                <p className="text-gray-400 text-sm mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Check back later for new products'
                  }
                </p>
                <Link
                  href="/products"
                  className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  View All Products
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>

    </div>
  )
}
