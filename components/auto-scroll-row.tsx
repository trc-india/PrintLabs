'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface AutoScrollRowProps {
  products: any[]
  delay?: number // The setting from Admin (e.g., 3000ms)
}

export default function AutoScrollRow({ products, delay = 3000 }: AutoScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const autoScroll = () => {
      if (isPaused) return

      const { scrollLeft, scrollWidth, clientWidth } = container
      const maxScroll = scrollWidth - clientWidth
      const itemWidth = 220 // Approx width of one card + gap

      // If we reached the end, snap back to start. Otherwise, scroll one item.
      if (scrollLeft >= maxScroll - 10) { // -10 buffer
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: itemWidth, behavior: 'smooth' })
      }
    }

    const intervalId = setInterval(autoScroll, delay)
    return () => clearInterval(intervalId)
  }, [delay, isPaused])

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)} // Pause on mobile touch
    >
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
      >
        {products.map((product) => {
            const img = product.product_images?.[0]?.image_url
            return (
                <Link key={product.id} href={`/products/${product.slug}`} className="w-[160px] sm:w-[220px] flex-shrink-0 group block">
                    <div className="aspect-square relative bg-gray-50 rounded-xl overflow-hidden mb-3 border border-transparent group-hover:border-gray-200 transition">
                        {img ? (
                            <Image 
                                src={img} 
                                alt={product.name} 
                                fill 
                                className="object-cover group-hover:scale-105 transition duration-300" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                        )}
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm truncate group-hover:text-black">{product.name}</h3>
                    <p className="font-bold text-gray-900 text-sm">₹{product.base_price}</p>
                </Link>
            )
        })}
      </div>
    </div>
  )
}