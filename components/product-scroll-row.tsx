'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function ProductScrollRow({ products }: { products: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // 1. Calculate how many "pages" of scroll we have
  const updatePages = () => {
    if (scrollRef.current) {
      const { clientWidth, scrollWidth } = scrollRef.current
      // If content fits perfectly, pages = 1. If wider, calculate ratio.
      const pages = Math.ceil(scrollWidth / clientWidth)
      setTotalPages(pages > 1 ? pages : 0)
    }
  }

  // 2. Track scroll position to update the active dot
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const newIndex = Math.round(scrollLeft / clientWidth)
      setActiveIndex(newIndex)
    }
  }

  // Initial calculation + Recalculate on window resize
  useEffect(() => {
    updatePages()
    window.addEventListener('resize', updatePages)
    return () => window.removeEventListener('resize', updatePages)
  }, [products])

  // 3. Scroll to specific page when dot is clicked
  const scrollToPage = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth
      scrollRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="relative">
      
      {/* SCROLL CONTAINER */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory"
      >
        {products.map((product) => {
            const img = product.product_images?.[0]?.image_url
            return (
                <Link 
                    key={product.id} 
                    href={`/products/${product.slug}`} 
                    className="w-[160px] sm:w-[220px] flex-shrink-0 snap-start group"
                >
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

      {/* PAGINATION DOTS (Only show if scrollable) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToPage(index)}
              className={`transition-all duration-300 rounded-full ${
                activeIndex === index 
                  ? 'w-6 h-2 bg-black'   // Active Dot (Wide)
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400' // Inactive Dot (Small)
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}