import { supabaseAdmin } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic' 

export default async function HomePage() {
  // Fetch active categories
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Fetch active products
  const { data: products } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      product_images (
        image_url,
        sort_order
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-black">
              PrintLabs
            </Link>

            {/* Menu Items */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-black font-medium">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-black font-medium">
                Products
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-black font-medium">
                Categories
              </Link>
              <Link href="/custom" className="text-gray-700 hover:text-black font-medium">
                Custom Order
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-black font-medium">
                About
              </Link>
            </div>

            {/* Right Side - User & Cart */}
            <div className="flex items-center gap-4">
              {/* User Icon */}
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Cart Button */}
              <Link
                href="/cart"
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Cart (0)</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Banner - 728x90 Placeholder */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">Custom Laser Cutting & 3D Printing</h1>
            <p className="text-xl">Personalized Products | Fast Delivery | Premium Quality</p>
          </div>
        </div>
      </div>

      {/* Categories - Horizontal Row */}
      <section className="border-b bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Explore Categories</h2>
            <Link href="/categories" className="text-sm text-gray-600 hover:text-black">
              View All →
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2">
            {categories && categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="flex-shrink-0 px-6 py-3 bg-white border border-gray-300 rounded-full hover:border-black hover:bg-gray-50 transition font-medium"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Our Products</h2>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-gray-600">
                        {product.name}
                      </h3>
                      <p className="text-lg font-bold text-black">₹{product.base_price}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No products available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-3">PrintLabs</h3>
              <p className="text-gray-400 text-sm">
                Custom laser cutting and 3D printing services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/products" className="hover:text-white">All Products</Link></li>
                <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
                <li><Link href="/custom" className="hover:text-white">Custom Orders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
                <li><Link href="/admin" className="hover:text-white">Admin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Pune, Maharashtra</li>
                <li>info@printlabs.com</li>
                <li>+91-XXXXXXXXXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>&copy; 2026 PrintLabs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
