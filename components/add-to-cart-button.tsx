'use client'

import { useCart } from '@/lib/cart-context'
import { useState } from 'react'
import Link from 'next/link'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    slug: string
    base_price: number
    is_customizable: boolean
    product_images?: {
      image_url: string
      sort_order: number
    }[]
  }
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const coverImage = product.product_images?.find(
    (img) => img.sort_order === 0
  ) || product.product_images?.[0]

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      price: product.base_price,
      imageUrl: coverImage?.image_url || '',
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleAddToCart}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
          added
            ? 'bg-green-600 text-white'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {added ? '✓ Added to Cart!' : 'Add to Cart'}
      </button>

      {product.is_customizable && (
        <Link
          href={`/products/${product.slug}/customize`}
          className="block w-full py-4 border-2 border-black text-black rounded-lg hover:bg-gray-50 font-semibold text-lg text-center"
        >
          Customize This Product
        </Link>
      )}
    </div>
  )
}
