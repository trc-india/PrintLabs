import { supabaseAdmin } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/add-to-cart-button'
import CustomProductBuilder from '@/components/custom-product-builder'

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

  // --- LOGIC SWITCH ---
  // If product is customizable, delegate control to the Builder Component
  if (product.is_customizable) {
    return (
        <div className="min-h-screen bg-white">
            <CustomProductBuilder product={product} />
        </div>
    )
  }

  // --- STANDARD LAYOUT (For regular products) ---
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
              {sortedImages[0] ? (
                <Image
                  src={sortedImages[0].image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No image available
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {sortedImages.map((image: any, index: number) => (
                <div key={index} className="aspect-square relative bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={image.image_url}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-sm text-gray-500 mb-4">{product.categories?.name}</p>
              <p className="text-2xl font-bold text-gray-900">₹{product.base_price}</p>
            </div>

            <div className="prose prose-sm text-gray-600">
              <p>{product.description}</p>
            </div>

            <AddToCartButton product={product} />

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Production time: {product.production_time_hours} hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-bold mb-8">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((related) => {
                const image = related.product_images?.find((img: any) => img.sort_order === 0)
                return (
                  <Link key={related.id} href={`/products/${related.slug}`} className="group">
                    <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                      {image && (
                        <Image
                          src={image.image_url}
                          alt={related.name}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{related.name}</h3>
                    <p className="text-gray-600">₹{related.base_price}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}