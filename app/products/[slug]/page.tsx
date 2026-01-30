import { supabaseAdmin } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/add-to-cart-button'
import Navbar from '@/components/navbar'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: product } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      categories (
        name,
        slug
      ),
      product_images (
        image_url,
        sort_order,
        alt_text
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!product) {
    notFound()
  }

  const sortedImages = product.product_images?.sort(
    (a: any, b: any) => a.sort_order - b.sort_order
  ) || []

  const { data: relatedProducts } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      product_images (
        image_url,
        sort_order
      )
    `)
    .eq('category_id', product.category_id)
    .eq('status', 'active')
    .neq('id', product.id)
    .limit(4)

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-black">Products</Link>
            <span>/</span>
            <Link 
              href={`/products?category=${product.categories?.slug}`}
              className="hover:text-black"
            >
              {product.categories?.name}
            </Link>
            <span>/</span>
            <span className="text-black">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left - Images */}
          <div>
            {sortedImages.length > 0 ? (
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  <Image
                    src={sortedImages[0].image_url}
                    alt={sortedImages[0].alt_text || product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {sortedImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {sortedImages.map((image: any, index: number) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer border-2 border-transparent hover:border-black"
                      >
                        <Image
                          src={image.image_url}
                          alt={image.alt_text || `${product.name} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {/* Right - Product Info */}
          <div>
            <Link
              href={`/products?category=${product.categories?.slug}`}
              className="inline-block text-sm text-blue-600 hover:underline mb-2"
            >
              {product.categories?.name}
            </Link>

            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold">₹{product.base_price}</span>
              <span className="text-gray-500">(Base Price)</span>
            </div>

            <div className="space-y-3 mb-6 pb-6 border-b">
              {product.is_customizable && (
                <div className="flex items-center gap-2 text-green-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Customization Available</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Production Time: {product.production_time_hours} hours</span>
              </div>
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Add to Cart Button Component */}
            <AddToCartButton product={product} />

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">What You Get:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ High-quality laser cutting/3D printing</li>
                <li>✓ Fast production and delivery</li>
                <li>✓ Premium materials</li>
                <li>✓ Precision craftsmanship</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const coverImage = relatedProduct.product_images?.find(
                  (img: any) => img.sort_order === 0
                ) || relatedProduct.product_images?.[0]

                return (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.slug}`}
                    className="group border rounded-lg overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="aspect-square bg-gray-100 relative">
                      {coverImage ? (
                        <Image
                          src={coverImage.image_url}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-white">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-lg font-bold">₹{relatedProduct.base_price}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

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
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Pune, Maharashtra</li>
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
