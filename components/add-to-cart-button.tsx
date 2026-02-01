'use client'

import { useCart } from '@/lib/cart-context'
import { useState } from 'react'

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
  customization?: any 
  disabled?: boolean
  // NEW: Allow overriding price and quantity from the Builder
  price?: number 
  quantity?: number
}

export default function AddToCartButton({ 
  product, 
  customization, 
  disabled = false,
  price, // Received calculated price
  quantity = 1 // Received calculated quantity
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const coverImage = product.product_images?.find(
    (img) => img.sort_order === 0
  ) || product.product_images?.[0]

  const handleAddToCart = () => {
    if (disabled) return

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      // Use the calculated price if provided, otherwise base price
      price: price || product.base_price, 
      imageUrl: coverImage?.image_url || '',
      customization: customization || null,
      quantity: quantity // Use the specific quantity
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleAddToCart}
        disabled={disabled}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
          added
            ? 'bg-green-600 text-white'
            : disabled 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {added ? 'Added to Cart! ✓' : `Add to Cart - ₹${(price || product.base_price) * quantity}`}
      </button>
    </div>
  )
}